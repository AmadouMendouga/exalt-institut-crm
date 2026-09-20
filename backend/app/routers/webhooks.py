"""Réception des webhooks de SMS Gateway for Android (sms:sent / sms:delivered /
sms:failed) pour connaître le vrai statut de livraison d'un SMS après l'envoi.

Endpoint volontairement public (pas de Depends(get_current_user)) : c'est le
téléphone Android qui l'appelle, pas un utilisateur connecté au CRM. La
sécurité repose sur la vérification de signature HMAC décrite dans la doc
SMS Gate (Settings → Webhooks → Signing Key sur l'appli), pas sur un token de
session.

Voir https://docs.sms-gate.app/features/webhooks/#payload-signing
"""

import hashlib
import hmac
import logging
import time

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from .. import models
from ..config import settings
from ..database import get_db

router = APIRouter(prefix="/api/webhooks", tags=["webhooks"])
logger = logging.getLogger("app.webhooks")

# event -> (colonne de statut, valeur à stocker)
_STATUS_BY_EVENT = {
    "sms:sent": "sent",
    "sms:delivered": "delivered",
    "sms:failed": "failed",
    "sms:cancelled": "failed",
}


def _verify_signature(raw_body: bytes, signature: str | None, timestamp: str | None) -> bool:
    if not settings.sms_gateway_webhook_secret:
        # Pas de clé configurée : on ne peut pas vérifier. On log et on refuse,
        # plutôt que d'accepter des requêtes non authentifiées silencieusement.
        logger.warning("[webhooks] SMS_GATEWAY_WEBHOOK_SECRET absent : requête rejetée.")
        return False
    if not signature or not timestamp:
        return False
    try:
        # Anti-rejeu : timestamp doit être récent (±5 min), comme recommandé
        # par la doc SMS Gate.
        if abs(time.time() - float(timestamp)) > 300:
            return False
    except ValueError:
        return False

    expected = hmac.new(
        settings.sms_gateway_webhook_secret.encode(),
        raw_body + timestamp.encode(),
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, signature)


@router.post("/sms-gateway", include_in_schema=False)
async def sms_gateway_webhook(request: Request, db: Session = Depends(get_db)):
    raw_body = await request.body()
    signature = request.headers.get("X-Signature")
    timestamp = request.headers.get("X-Timestamp")

    if not _verify_signature(raw_body, signature, timestamp):
        raise HTTPException(status_code=401, detail="Invalid webhook signature")

    body = await request.json()
    event = body.get("event")
    payload = body.get("payload") or {}
    message_id = payload.get("messageId")
    status = _STATUS_BY_EVENT.get(event)

    if not message_id or not status:
        # Événement qu'on ne suit pas (ex. sms:received) : accusé de réception
        # quand même pour éviter que l'appli ne le retente indéfiniment.
        return {"ok": True, "ignored": True}

    detail = payload.get("reason") if event in ("sms:failed", "sms:cancelled") else None

    timeline_item = (
        db.query(models.TimelineItem)
        .filter(models.TimelineItem.gateway_message_id == message_id)
        .first()
    )
    if timeline_item:
        # Ne jamais rétrograder "delivered" vers "sent" si un sms:sent tardif
        # arrive après un sms:delivered déjà reçu.
        if not (status == "sent" and timeline_item.delivery_status == "delivered"):
            timeline_item.delivery_status = status
        timeline_item.delivery_detail = detail

    prospect = (
        db.query(models.Prospect)
        .filter(models.Prospect.gateway_message_id == message_id)
        .first()
    )
    if prospect:
        if not (status == "sent" and prospect.last_relance_status == "delivered"):
            prospect.last_relance_status = status
        prospect.delivery_detail = detail

    if timeline_item or prospect:
        db.commit()
    else:
        logger.info("[webhooks] Aucun enregistrement trouvé pour messageId=%s (event=%s)", message_id, event)

    return {"ok": True}
