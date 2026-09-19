from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, sms
from ..database import get_db
from ..schemas import RelanceSendRequest, RelanceSendResponse
from ..security import get_current_user

router = APIRouter(prefix="/api/relances", tags=["relances"], dependencies=[Depends(get_current_user)])

MONTHS_FR = ["JANV", "FÉVR", "MARS", "AVR", "MAI", "JUIN", "JUIL", "AOÛT", "SEPT", "OCT", "NOV", "DÉC"]
MONTHS_EN = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]


def build_date_group(language: str, now: datetime) -> str:
    day = now.day
    if language == "fr":
        return f"AUJOURD'HUI, {day} {MONTHS_FR[now.month - 1]}"
    return f"TODAY, {MONTHS_EN[now.month - 1]} {day}"


@router.post("/send", response_model=RelanceSendResponse, status_code=201)
def send_relance(payload: RelanceSendRequest, db: Session = Depends(get_db)):
    client = db.query(models.Client).filter(models.Client.id == payload.client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    if payload.channel not in ("WhatsApp", "SMS", "Email"):
        raise HTTPException(status_code=422, detail="Invalid channel")
    if payload.channel == "Email":
        raise HTTPException(status_code=409, detail="Aucun fournisseur email connecté : aucun message envoyé.")
    if payload.channel == "SMS" and not sms.is_configured():
        raise HTTPException(status_code=409, detail="Passerelle SMS non configurée : aucun message envoyé.")
    if not client.marketing_opt_in:
        raise HTTPException(status_code=409, detail="Le consentement marketing de ce client est désactivé.")

    lang = "en" if payload.language == "en" else "fr"
    now = datetime.now(timezone.utc)

    client.status = "Up to date"

    draft = None
    if payload.timeline_item_id:
        draft = (
            db.query(models.TimelineItem)
            .filter(
                models.TimelineItem.id == payload.timeline_item_id,
                models.TimelineItem.client_id == client.id,
            )
            .with_for_update()
            .first()
        )
        if not draft:
            raise HTTPException(status_code=404, detail="Timeline item not found")
        if draft.status != "Drafts":
            raise HTTPException(status_code=409, detail="Cette relance a déjà été traitée.")

    if payload.channel == "SMS" and not sms.send_sms(client.phone, payload.message):
        raise HTTPException(status_code=502, detail="SMS gateway error")

    if draft:
        # Finalisation d'un brouillon généré par une automatisation (ex. relance
        # WhatsApp en attente d'un envoi manuel) : on met à jour la même ligne au
        # lieu d'en créer une nouvelle, et on comptabilise l'envoi sur sa campagne.
        draft.date_group = build_date_group(lang, now)
        draft.time = "À l'instant" if lang == "fr" else "Just now"
        draft.description = f"{payload.message[:75]}..."
        draft.channel = payload.channel
        draft.status = "Past 7 Days"
        draft.scheduled_at = now
        if draft.campaign_id:
            campaign = (
                db.query(models.AutomationCampaign)
                .filter(models.AutomationCampaign.id == draft.campaign_id)
                .first()
            )
            if campaign:
                stats = dict(campaign.stats or {})
                stats["sent"] = stats.get("sent", 0) + 1
                campaign.stats = stats
        timeline_item = draft
    else:
        timeline_item = models.TimelineItem(
            date_group=build_date_group(lang, now),
            time="À l'instant" if lang == "fr" else "Just now",
            title=(
                f"Relance Post-Service ({client.last_service})"
                if lang == "fr"
                else f"Post-Service Follow-up ({client.last_service})"
            ),
            description=f"{payload.message[:75]}...",
            target_client=client.name,
            channel=payload.channel,
            status="Past 7 Days",
            scheduled_at=now,
            client_id=client.id,
        )
        db.add(timeline_item)

    db.commit()
    db.refresh(client)
    db.refresh(timeline_item)

    return {"client": client, "timeline_item": timeline_item}
