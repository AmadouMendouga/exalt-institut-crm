from datetime import date as date_cls
from datetime import datetime, time

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text

from .. import availability, models
from ..database import get_db
from ..schemas import (
    AppointmentCreate,
    AppointmentOut,
    AppointmentStatusUpdate,
    AvailabilityRuleOut,
    AvailabilityRuleUpdate,
    PublicServiceOut,
)
from ..security import get_current_user

router = APIRouter(tags=["appointments"])

VALID_STATUSES = {"Pending", "Confirmed", "Declined", "Completed", "Cancelled"}


@router.get("/api/public/services", response_model=list[PublicServiceOut])
def list_public_services(db: Session = Depends(get_db)):
    """Public catalogue endpoint for the /rdv booking page (no login required)."""
    return db.query(models.Service).order_by(models.Service.category, models.Service.name).all()


@router.get("/api/public/slots")
def list_public_slots(date: str, service_count: int = Query(default=1, ge=1, le=20), db: Session = Depends(get_db)):
    """Public endpoint: available time slots for a given day, sized to the cart (service_count soins)."""
    try:
        target_date = date_cls.fromisoformat(date)
    except ValueError:
        raise HTTPException(status_code=422, detail="Invalid date")
    if target_date < availability.now_local().date():
        return {"slots": []}
    duration = availability.DEFAULT_DURATION_MINUTES * max(1, service_count)
    slots = availability.compute_available_slots(db, target_date, duration)
    return {"slots": slots}


@router.post("/api/appointments", response_model=AppointmentOut, status_code=201)
def create_appointment(payload: AppointmentCreate, db: Session = Depends(get_db)):
    """Public endpoint: a client requests an appointment slot (a cart of soins) from the /rdv page."""
    if not payload.service_ids:
        raise HTTPException(status_code=422, detail="Aucun soin sélectionné")
    services = db.query(models.Service).filter(models.Service.id.in_(payload.service_ids)).all()
    services_by_id = {s.id: s for s in services}
    ordered_services = [services_by_id[sid] for sid in payload.service_ids if sid in services_by_id]
    if not ordered_services or len(ordered_services) != len(payload.service_ids) or len(set(payload.service_ids)) != len(payload.service_ids):
        raise HTTPException(status_code=422, detail="Service not found")

    try:
        target_date = date_cls.fromisoformat(payload.date)
        target_time = time.fromisoformat(payload.time)
    except ValueError:
        raise HTTPException(status_code=422, detail="Invalid date or time")

    starts_at = datetime.combine(target_date, target_time)
    if starts_at < availability.now_local():
        raise HTTPException(status_code=422, detail="Ce créneau est déjà passé")

    duration = availability.DEFAULT_DURATION_MINUTES * len(ordered_services)
    availability.ensure_default_rules(db)
    # All booking/status writers take this transaction lock before checking slots.
    db.execute(text("SELECT pg_advisory_xact_lock(78342109)"))
    still_free = payload.time in availability.compute_available_slots(db, target_date, duration)
    if not still_free:
        raise HTTPException(status_code=409, detail="Ce créneau vient d'être pris, choisissez-en un autre")

    client_id = payload.client_id
    if client_id and not db.query(models.Client).filter(models.Client.id == client_id).first():
        client_id = None

    appointment = models.Appointment(
        client_name=payload.client_name,
        client_phone=payload.client_phone,
        client_id=client_id,
        note=payload.note,
        services=[{"id": s.id, "name": s.name} for s in ordered_services],
        starts_at=starts_at,
        duration_minutes=duration,
        status="Pending",
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return appointment


@router.get("/api/appointments", response_model=list[AppointmentOut], dependencies=[Depends(get_current_user)])
def list_appointments(db: Session = Depends(get_db)):
    return db.query(models.Appointment).order_by(models.Appointment.starts_at.desc()).all()


@router.patch(
    "/api/appointments/{appointment_id}/status",
    response_model=AppointmentOut,
    dependencies=[Depends(get_current_user)],
)
def update_appointment_status(appointment_id: str, payload: AppointmentStatusUpdate, db: Session = Depends(get_db)):
    if payload.status not in VALID_STATUSES:
        raise HTTPException(status_code=422, detail="Invalid status")
    availability.ensure_default_rules(db)
    db.execute(text("SELECT pg_advisory_xact_lock(78342109)"))
    appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    if payload.status in {"Pending", "Confirmed"} and appointment.status not in {"Pending", "Confirmed"}:
        slots = availability.compute_available_slots(db, appointment.starts_at.date(), appointment.duration_minutes)
        if appointment.starts_at.strftime("%H:%M") not in slots:
            raise HTTPException(status_code=409, detail="Ce créneau n'est plus disponible.")
    appointment.status = payload.status
    db.commit()
    db.refresh(appointment)
    return appointment


@router.delete("/api/appointments/{appointment_id}", status_code=204, dependencies=[Depends(get_current_user)])
def delete_appointment(appointment_id: str, db: Session = Depends(get_db)):
    appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    db.delete(appointment)
    db.commit()


@router.get("/api/availability", response_model=list[AvailabilityRuleOut], dependencies=[Depends(get_current_user)])
def get_availability(db: Session = Depends(get_db)):
    return availability.get_weekly_rules(db)


@router.put("/api/availability", response_model=list[AvailabilityRuleOut], dependencies=[Depends(get_current_user)])
def update_availability(payload: list[AvailabilityRuleUpdate], db: Session = Depends(get_db)):
    rules = {r.weekday: r for r in availability.get_weekly_rules(db)}
    for item in payload:
        rule = rules.get(item.weekday)
        if not rule:
            continue
        rule.is_closed = item.is_closed
        rule.open_minutes = item.open_minutes
        rule.close_minutes = item.close_minutes
    db.commit()
    return availability.get_weekly_rules(db)
