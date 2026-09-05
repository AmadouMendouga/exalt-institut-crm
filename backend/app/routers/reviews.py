from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models
from ..database import get_db
from ..schemas import ReviewCreate, ReviewOut
from ..security import get_current_user

router = APIRouter(prefix="/api/reviews", tags=["reviews"])


@router.post("", response_model=ReviewOut, status_code=201)
def submit_review(payload: ReviewCreate, db: Session = Depends(get_db)):
    """Public endpoint: a client leaves a review from the shared /avis page (no login)."""
    if not 1 <= payload.rating <= 5:
        raise HTTPException(status_code=422, detail="rating must be between 1 and 5")
    client_id = payload.client_id
    if client_id and not db.query(models.Client).filter(models.Client.id == client_id).first():
        client_id = None
    review = models.Review(rating=payload.rating, comment=payload.comment, client_id=client_id)
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


@router.get("", response_model=list[ReviewOut], dependencies=[Depends(get_current_user)])
def list_reviews(db: Session = Depends(get_db)):
    return db.query(models.Review).order_by(models.Review.created_at.desc()).all()


@router.delete("/{review_id}", status_code=204, dependencies=[Depends(get_current_user)])
def delete_review(review_id: str, db: Session = Depends(get_db)):
    review = db.query(models.Review).filter(models.Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    db.delete(review)
    db.commit()
