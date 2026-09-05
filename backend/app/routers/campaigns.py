from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models
from ..automation import dispatch_campaign
from ..database import get_db
from ..schemas import CampaignCreate, CampaignOut, CampaignTriggerResponse, CampaignUpdate
from ..security import get_current_user

router = APIRouter(prefix="/api/campaigns", tags=["campaigns"], dependencies=[Depends(get_current_user)])


@router.get("", response_model=list[CampaignOut])
def list_campaigns(db: Session = Depends(get_db)):
    return db.query(models.AutomationCampaign).order_by(models.AutomationCampaign.created_at.desc()).all()


@router.post("", response_model=CampaignOut, status_code=201)
def create_campaign(payload: CampaignCreate, db: Session = Depends(get_db)):
    campaign = models.AutomationCampaign(**payload.model_dump())
    db.add(campaign)
    db.commit()
    db.refresh(campaign)
    return campaign


@router.put("/{campaign_id}", response_model=CampaignOut)
def update_campaign(campaign_id: str, payload: CampaignUpdate, db: Session = Depends(get_db)):
    campaign = db.query(models.AutomationCampaign).filter(models.AutomationCampaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    for field, value in payload.model_dump().items():
        setattr(campaign, field, value)
    db.commit()
    db.refresh(campaign)
    return campaign


@router.post("/{campaign_id}/trigger", response_model=CampaignTriggerResponse)
def trigger_campaign(campaign_id: str, db: Session = Depends(get_db)):
    campaign = db.query(models.AutomationCampaign).filter(models.AutomationCampaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    created_items = dispatch_campaign(db, campaign)
    db.refresh(campaign)
    return {"matched": len(created_items), "created": created_items, "campaign": campaign}
