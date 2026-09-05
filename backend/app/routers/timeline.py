from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models
from ..database import get_db
from ..schemas import TimelineItemOut
from ..security import get_current_user

router = APIRouter(prefix="/api/timeline", tags=["timeline"], dependencies=[Depends(get_current_user)])


@router.get("", response_model=list[TimelineItemOut])
def list_timeline(db: Session = Depends(get_db)):
    return db.query(models.TimelineItem).order_by(models.TimelineItem.created_at.desc()).all()
