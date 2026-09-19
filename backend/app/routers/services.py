from fastapi import APIRouter, Depends, HTTPException, UploadFile
from fastapi.responses import Response
from sqlalchemy.orm import Session

from .. import models
from ..database import get_db
from ..schemas import ServiceCreate, ServiceOut, ServiceUpdate
from ..security import get_current_user

router = APIRouter(prefix="/api/services", tags=["services"], dependencies=[Depends(get_current_user)])
# Endpoint séparé, sans dépendance d'authentification : la photo doit rester
# consultable depuis la page publique /rdv, où le visiteur n'est pas connecté.
public_router = APIRouter(prefix="/api/services", tags=["services"])

MAX_IMAGE_BYTES = 5 * 1024 * 1024


@router.get("", response_model=list[ServiceOut])
def list_services(db: Session = Depends(get_db)):
    return db.query(models.Service).order_by(models.Service.category, models.Service.name).all()


@router.post("", response_model=ServiceOut, status_code=201)
def create_service(payload: ServiceCreate, db: Session = Depends(get_db)):
    service = models.Service(**payload.model_dump())
    db.add(service)
    db.commit()
    db.refresh(service)
    return service


@router.put("/{service_id}", response_model=ServiceOut)
def update_service(service_id: str, payload: ServiceUpdate, db: Session = Depends(get_db)):
    service = db.query(models.Service).filter(models.Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    for field, value in payload.model_dump().items():
        setattr(service, field, value)
    db.commit()
    db.refresh(service)
    return service


@router.delete("/{service_id}", status_code=204)
def delete_service(service_id: str, db: Session = Depends(get_db)):
    service = db.query(models.Service).filter(models.Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    db.delete(service)
    db.commit()


@router.post("/{service_id}/image", response_model=ServiceOut)
async def upload_service_image(service_id: str, file: UploadFile, db: Session = Depends(get_db)):
    service = db.query(models.Service).filter(models.Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    if not (file.content_type or "").startswith("image/"):
        raise HTTPException(status_code=422, detail="Le fichier doit être une image")
    data = await file.read(MAX_IMAGE_BYTES + 1)
    if len(data) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=422, detail="Image trop volumineuse (5 Mo max)")
    service.image_data = data
    service.image_content_type = file.content_type
    service.image_url = f"/api/services/{service.id}/image"
    db.commit()
    db.refresh(service)
    return service


@public_router.get("/{service_id}/image")
def get_service_image(service_id: str, db: Session = Depends(get_db)):
    service = db.query(models.Service).filter(models.Service.id == service_id).first()
    if not service or not service.image_data:
        raise HTTPException(status_code=404, detail="Image not found")
    return Response(content=service.image_data, media_type=service.image_content_type or "image/jpeg")
