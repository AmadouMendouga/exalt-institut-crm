from fastapi import APIRouter, Depends, HTTPException, Response, UploadFile
from sqlalchemy.orm import Session

from .. import models
from ..database import get_db
from ..schemas import CampaignMediaOut
from ..security import get_current_user

router = APIRouter(prefix="/api/campaign-media", tags=["campaign-media"], dependencies=[Depends(get_current_user)])

MAX_SIZES = {"photo": 8 * 1024 * 1024, "video": 30 * 1024 * 1024}
EXPECTED_PREFIX = {"photo": "image/", "video": "video/"}


def _validate_kind(kind: str) -> None:
    if kind not in MAX_SIZES:
        raise HTTPException(status_code=404, detail="Unknown media kind")


@router.get("", response_model=list[CampaignMediaOut])
def list_campaign_media(db: Session = Depends(get_db)):
    return db.query(models.CampaignMedia).all()


@router.post("/{kind}", response_model=CampaignMediaOut, status_code=201)
async def upload_campaign_media(kind: str, file: UploadFile, db: Session = Depends(get_db)):
    _validate_kind(kind)
    content_type = file.content_type or ""
    if not content_type.startswith(EXPECTED_PREFIX[kind]):
        raise HTTPException(status_code=422, detail=f"File must be a {kind}")
    data = await file.read(MAX_SIZES[kind] + 1)
    if len(data) > MAX_SIZES[kind]:
        raise HTTPException(status_code=413, detail="File too large")

    existing = db.query(models.CampaignMedia).filter(models.CampaignMedia.kind == kind).first()
    if existing:
        existing.data = data
        existing.content_type = content_type
        existing.filename = file.filename or kind
        media = existing
    else:
        media = models.CampaignMedia(kind=kind, data=data, content_type=content_type, filename=file.filename or kind)
        db.add(media)
    db.commit()
    db.refresh(media)
    return media


@router.get("/{kind}/file")
def get_campaign_media_file(kind: str, db: Session = Depends(get_db)):
    _validate_kind(kind)
    media = db.query(models.CampaignMedia).filter(models.CampaignMedia.kind == kind).first()
    if not media:
        raise HTTPException(status_code=404, detail="No media set for this kind")
    return Response(
        content=media.data,
        media_type=media.content_type,
        headers={"Content-Disposition": f'attachment; filename="{media.filename}"'},
    )


@router.delete("/{kind}", status_code=204)
def delete_campaign_media(kind: str, db: Session = Depends(get_db)):
    _validate_kind(kind)
    media = db.query(models.CampaignMedia).filter(models.CampaignMedia.kind == kind).first()
    if media:
        db.delete(media)
        db.commit()
