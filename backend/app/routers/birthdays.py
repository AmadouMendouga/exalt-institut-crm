from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models
from ..database import get_db
from ..schemas import (
    BirthdaySubmissionCreate,
    BirthdaySubmissionOut,
    BirthdaySubmissionStatusResult,
    BirthdaySubmissionStatusUpdate,
)
from ..security import get_current_user

router = APIRouter(prefix="/api/birthday-submissions", tags=["birthday-submissions"])


def _initials(name: str) -> str:
    parts = name.strip().split()
    if len(parts) > 1:
        return (parts[0][0] + parts[-1][0]).upper()
    return name.strip()[:2].upper()


def _avatar_bg(gender: str) -> str:
    if gender == "F":
        return "bg-rose-100 dark:bg-rose-800 text-rose-800 dark:text-rose-100"
    return "bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100"


@router.post("", response_model=BirthdaySubmissionOut, status_code=201)
def create_birthday_submission(payload: BirthdaySubmissionCreate, db: Session = Depends(get_db)):
    """Public endpoint: a client submits their birthday (day+month, no year) from the /anniversaire page."""
    gender = payload.gender if payload.gender in ("F", "M") else "F"
    submission = models.BirthdaySubmission(
        name=payload.name,
        phone=payload.phone,
        birth_date=payload.birth_date,
        gender=gender,
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    return submission


@router.get("", response_model=list[BirthdaySubmissionOut], dependencies=[Depends(get_current_user)])
def list_birthday_submissions(db: Session = Depends(get_db)):
    return db.query(models.BirthdaySubmission).order_by(models.BirthdaySubmission.created_at.desc()).all()


@router.patch("/{submission_id}/status", response_model=BirthdaySubmissionStatusResult, dependencies=[Depends(get_current_user)])
def update_birthday_submission_status(submission_id: str, payload: BirthdaySubmissionStatusUpdate, db: Session = Depends(get_db)):
    submission = db.query(models.BirthdaySubmission).filter(models.BirthdaySubmission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Birthday submission not found")
    if payload.status not in ("Pending", "Approved", "Rejected"):
        raise HTTPException(status_code=422, detail="Invalid status")

    client = None
    if payload.status == "Approved" and submission.status != "Approved":
        # Un client existant (même numéro) reçoit juste sa date de naissance ;
        # sinon on crée une fiche minimale, avec les mêmes valeurs par défaut
        # que la création manuelle depuis AddClientModal (prefix/statut/canal...).
        client = db.query(models.Client).filter(models.Client.phone == submission.phone).first()
        if client:
            client.birth_date = submission.birth_date
        else:
            today = datetime.now(timezone.utc).date().isoformat()
            client = models.Client(
                name=submission.name,
                prefix="Mme." if submission.gender == "F" else "M.",
                gender=submission.gender,
                initials=_initials(submission.name),
                email="",
                phone=submission.phone,
                last_service="",
                last_service_date="",
                raw_date="",
                status="Follow-up Needed",
                suggested_upsell="Soin Protecteur",
                preferred_channel="WhatsApp",
                avatar_bg=_avatar_bg(submission.gender),
                birth_date=submission.birth_date,
                marketing_opt_in=False,
            )
            db.add(client)
            db.flush()  # attribue client.id avant de l'utiliser ci-dessous
        submission.client_id = client.id

    submission.status = payload.status
    db.commit()
    db.refresh(submission)
    if client is not None:
        db.refresh(client)
    return {"submission": submission, "client": client}


@router.delete("/{submission_id}", status_code=204, dependencies=[Depends(get_current_user)])
def delete_birthday_submission(submission_id: str, db: Session = Depends(get_db)):
    submission = db.query(models.BirthdaySubmission).filter(models.BirthdaySubmission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Birthday submission not found")
    db.delete(submission)
    db.commit()
