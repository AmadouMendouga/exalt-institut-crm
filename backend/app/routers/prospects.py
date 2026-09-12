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

    sent: list[models.Prospect] = []
    failed: list[dict] = []
    for item in payload.items:
        prospect = db.query(models.Prospect).filter(models.Prospect.id == item.id).first()
        if not prospect:
            failed.append({"id": item.id, "name": "?", "reason": "not_found"})
            continue
        if sms.send_sms(prospect.phone, item.message):
            prospect.status = "contacted"
            prospect.last_relance_at = datetime.now(timezone.utc)
            sent.append(prospect)
        else:
            failed.append({"id": prospect.id, "name": prospect.name, "reason": "gateway_error"})

    db.commit()
    for prospect in sent:
        db.refresh(prospect)
    return {"sent": sent, "failed": failed}


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
    elif payload.status == "new":
        # Repasser en "à relancer" repart de zéro : sinon la prochaine relance
        # basculerait par erreur sur le modèle "déjà contacté".
        prospect.last_relance_at = None
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
    if not sms.send_sms(prospect.phone, payload.message):
        raise HTTPException(status_code=502, detail="SMS gateway error")
    prospect.status = "contacted"
    prospect.last_relance_at = datetime.now(timezone.utc)
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
