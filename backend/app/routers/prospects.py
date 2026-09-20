from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, sms
from ..database import get_db
from ..schemas import (
    ProspectBulkCreate,
    ProspectBulkSmsRequest,
    ProspectBulkSmsResponse,
    ProspectConvertedUpdate,
    ProspectCreate,
    ProspectOut,
    ProspectSmsRequest,
    ProspectStatusUpdate,
    ProspectUpdate,
)
from ..security import get_current_user

router = APIRouter(prefix="/api/prospects", tags=["prospects"], dependencies=[Depends(get_current_user)])


@router.get("", response_model=list[ProspectOut])
def list_prospects(db: Session = Depends(get_db)):
    return db.query(models.Prospect).order_by(models.Prospect.created_at.desc()).all()


@router.post("", response_model=ProspectOut, status_code=201)
def create_prospect(payload: ProspectCreate, db: Session = Depends(get_db)):
    prospect = models.Prospect(**payload.model_dump())
    db.add(prospect)
    db.commit()
    db.refresh(prospect)
    return prospect


@router.post("/bulk", response_model=list[ProspectOut], status_code=201)
def bulk_create_prospects(payload: ProspectBulkCreate, db: Session = Depends(get_db)):
    """Import groupé (ex. depuis un tableau de prospection papier/PDF)."""
    created = [models.Prospect(**item.model_dump()) for item in payload.items]
    db.add_all(created)
    db.commit()
    for prospect in created:
        db.refresh(prospect)
    return created


@router.post("/bulk/send-sms", response_model=ProspectBulkSmsResponse)
def bulk_send_prospect_sms(payload: ProspectBulkSmsRequest, db: Session = Depends(get_db)):
    """Envoi SMS groupé, entièrement côté serveur : pas de validation manuelle
    prospect par prospect (contrairement à WhatsApp, qui l'exige)."""
    if not sms.is_configured():
        raise HTTPException(status_code=400, detail="SMS gateway not configured")

    results = []
    touched: list[models.Prospect] = []
    for item in payload.items:
        prospect = db.query(models.Prospect).filter(models.Prospect.id == item.id).first()
        if not prospect:
            continue
        message_id = sms.send_sms(prospect.phone, item.message)
        ok = bool(message_id)
        prospect.last_relance_channel = "SMS"
        prospect.last_relance_status = "sent" if ok else "failed"
        prospect.last_relance_at = datetime.now(timezone.utc)
        prospect.gateway_message_id = message_id
        prospect.delivery_detail = None
        if ok:
            prospect.status = "contacted"
        touched.append(prospect)
        results.append({"prospect": prospect, "ok": ok, "reason": None if ok else "gateway_error"})

    db.commit()
    for prospect in touched:
        db.refresh(prospect)
    return {"results": results}


@router.patch("/{prospect_id}", response_model=ProspectOut)
def update_prospect(prospect_id: str, payload: ProspectUpdate, db: Session = Depends(get_db)):
    prospect = db.query(models.Prospect).filter(models.Prospect.id == prospect_id).first()
    if not prospect:
        raise HTTPException(status_code=404, detail="Prospect not found")
    for key, value in payload.model_dump().items():
        setattr(prospect, key, value)
    db.commit()
    db.refresh(prospect)
    return prospect


@router.patch("/{prospect_id}/status", response_model=ProspectOut)
def update_prospect_status(prospect_id: str, payload: ProspectStatusUpdate, db: Session = Depends(get_db)):
    prospect = db.query(models.Prospect).filter(models.Prospect.id == prospect_id).first()
    if not prospect:
        raise HTTPException(status_code=404, detail="Prospect not found")
    prospect.status = payload.status
    if payload.status == "contacted":
        prospect.last_relance_at = datetime.now(timezone.utc)
        if payload.channel:
            prospect.last_relance_channel = payload.channel
            prospect.last_relance_status = "sent"
    elif payload.status == "new":
        # Repasser en "à relancer" repart de zéro : sinon la prochaine relance
        # basculerait par erreur sur le modèle "déjà contacté".
        prospect.last_relance_at = None
        prospect.last_relance_channel = None
        prospect.last_relance_status = None
    db.commit()
    db.refresh(prospect)
    return prospect


@router.post("/{prospect_id}/send-sms", response_model=ProspectOut)
def send_prospect_sms(prospect_id: str, payload: ProspectSmsRequest, db: Session = Depends(get_db)):
    prospect = db.query(models.Prospect).filter(models.Prospect.id == prospect_id).first()
    if not prospect:
        raise HTTPException(status_code=404, detail="Prospect not found")
    if not sms.is_configured():
        raise HTTPException(status_code=400, detail="SMS gateway not configured")

    message_id = sms.send_sms(prospect.phone, payload.message)
    ok = bool(message_id)
    prospect.last_relance_channel = "SMS"
    prospect.last_relance_status = "sent" if ok else "failed"
    prospect.last_relance_at = datetime.now(timezone.utc)
    prospect.gateway_message_id = message_id
    prospect.delivery_detail = None
    if ok:
        prospect.status = "contacted"
    db.commit()
    db.refresh(prospect)
    return prospect


@router.patch("/{prospect_id}/converted", response_model=ProspectOut)
def mark_prospect_converted(prospect_id: str, payload: ProspectConvertedUpdate, db: Session = Depends(get_db)):
    prospect = db.query(models.Prospect).filter(models.Prospect.id == prospect_id).first()
    if not prospect:
        raise HTTPException(status_code=404, detail="Prospect not found")
    if not db.query(models.Client).filter(models.Client.id == payload.client_id).first():
        raise HTTPException(status_code=404, detail="Client not found")
    prospect.status = "converted"
    prospect.converted_client_id = payload.client_id
    db.commit()
    db.refresh(prospect)
    return prospect


@router.delete("/{prospect_id}", status_code=204)
def delete_prospect(prospect_id: str, db: Session = Depends(get_db)):
    prospect = db.query(models.Prospect).filter(models.Prospect.id == prospect_id).first()
    if not prospect:
        raise HTTPException(status_code=404, detail="Prospect not found")
    db.delete(prospect)
    db.commit()
