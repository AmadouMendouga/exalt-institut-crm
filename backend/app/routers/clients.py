from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models
from ..database import get_db
from ..schemas import (
    ClientCreate,
    ClientOptInUpdate,
    ClientOut,
    ClientReminderUpdate,
    ClientStatusUpdate,
    ClientUpdate,
)
from ..security import get_current_user

router = APIRouter(prefix="/api/clients", tags=["clients"], dependencies=[Depends(get_current_user)])


@router.get("", response_model=list[ClientOut])
def list_clients(db: Session = Depends(get_db)):
    return db.query(models.Client).order_by(models.Client.created_at.desc()).all()


@router.post("", response_model=ClientOut, status_code=201)
def create_client(payload: ClientCreate, db: Session = Depends(get_db)):
    client = models.Client(**payload.model_dump())
    db.add(client)
    db.commit()
    db.refresh(client)
    return client


@router.put("/{client_id}", response_model=ClientOut)
def update_client(client_id: str, payload: ClientUpdate, db: Session = Depends(get_db)):
    client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    for field, value in payload.model_dump().items():
        setattr(client, field, value)
    db.commit()
    db.refresh(client)
    return client


@router.patch("/{client_id}/status", response_model=ClientOut)
def update_client_status(client_id: str, payload: ClientStatusUpdate, db: Session = Depends(get_db)):
    client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    client.status = payload.status
    db.commit()
    db.refresh(client)
    return client


@router.patch("/{client_id}/marketing-opt-in", response_model=ClientOut)
def update_client_marketing_opt_in(client_id: str, payload: ClientOptInUpdate, db: Session = Depends(get_db)):
    client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    client.marketing_opt_in = payload.marketing_opt_in
    db.commit()
    db.refresh(client)
    return client


@router.patch("/{client_id}/reminder", response_model=ClientOut)
def update_client_reminder(client_id: str, payload: ClientReminderUpdate, db: Session = Depends(get_db)):
    client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    client.next_reminder_date = payload.next_reminder_date
    client.next_reminder_note = payload.next_reminder_note
    db.commit()
    db.refresh(client)
    return client
