from datetime import datetime

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

CamelModel = ConfigDict(alias_generator=to_camel, populate_by_name=True, from_attributes=True)


class LoginRequest(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    model_config = CamelModel

    id: str
    email: str
    name: str


class ClientBase(BaseModel):
    model_config = CamelModel

    name: str
    prefix: str
    gender: str
    initials: str
    email: str
    phone: str
    last_service: str
    last_service_date: str
    raw_date: str
    status: str
    suggested_upsell: str
    preferred_channel: str
    total_visits: int = 1
    total_spent: int = 0
    avatar_bg: str | None = None
    notes: str | None = None
    birth_date: str | None = None
    marketing_opt_in: bool = True
    next_reminder_date: str | None = None
    next_reminder_note: str | None = None


class ClientCreate(ClientBase):
    pass


class ClientUpdate(ClientBase):
    pass


class ClientStatusUpdate(BaseModel):
    model_config = CamelModel

    status: str


class ClientOptInUpdate(BaseModel):
    model_config = CamelModel

    marketing_opt_in: bool


class ClientReminderUpdate(BaseModel):
    model_config = CamelModel

    next_reminder_date: str | None = None
    next_reminder_note: str | None = None


class ClientOut(ClientBase):
    id: str
    created_at: datetime
    updated_at: datetime


class ServiceBase(BaseModel):
    model_config = CamelModel

    name: str
    category: str
    price: int = 0
    image_url: str | None = None


class ServiceCreate(ServiceBase):
    pass


class ServiceUpdate(ServiceBase):
    pass


class ServiceOut(ServiceBase):
    id: str
    created_at: datetime
    updated_at: datetime


class CampaignBase(BaseModel):
    model_config = CamelModel

    name: str
    category: str
    action_event: str
    delay_time: int
    delay_unit: str
    channel: str
    subject_line: str
    message_body: str
    cta_text: str
    cta_url: str
    status: str = "active"
    target_audience: str
    last_triggered: str | None = None
    stats: dict = {"sent": 0, "opened": 0, "clicked": 0, "converted": 0}


class CampaignCreate(CampaignBase):
    pass


class CampaignUpdate(CampaignBase):
    pass


class CampaignOut(CampaignBase):
    id: str
    created_at: datetime
    updated_at: datetime


class TimelineItemOut(BaseModel):
    model_config = CamelModel

    id: str
    date_group: str
    time: str
    title: str
    description: str
    target_client: str
    channel: str
    status: str
    scheduled_at: datetime
    created_at: datetime
    campaign_id: str | None = None
    client_id: str | None = None


class RelanceSendRequest(BaseModel):
    model_config = CamelModel

    client_id: str
    channel: str
    message: str
    language: str = "fr"
    timeline_item_id: str | None = None


class CampaignTriggerResponse(BaseModel):
    model_config = CamelModel

    matched: int
    created: list[TimelineItemOut]
    campaign: CampaignOut


class RelanceSendResponse(BaseModel):
    client: ClientOut
    timeline_item: TimelineItemOut

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class ReviewCreate(BaseModel):
    model_config = CamelModel

    rating: int
    comment: str | None = None
    client_id: str | None = None


class ReviewOut(BaseModel):
    model_config = CamelModel

    id: str
    rating: int
    comment: str | None
    client_id: str | None
    client_name: str | None = None
    created_at: datetime


class PublicServiceOut(BaseModel):
    model_config = CamelModel

    id: str
    name: str
    category: str
    price: int
    image_url: str | None = None


class AvailabilityRuleOut(BaseModel):
    model_config = CamelModel

    weekday: int
    is_closed: bool
    open_minutes: int
    close_minutes: int


class AvailabilityRuleUpdate(BaseModel):
    model_config = CamelModel

    weekday: int
    is_closed: bool
    open_minutes: int
    close_minutes: int


class AppointmentServiceItem(BaseModel):
    model_config = CamelModel

    id: str
    name: str


class AppointmentCreate(BaseModel):
    model_config = CamelModel

    client_name: str
    client_phone: str
    client_id: str | None = None
    service_ids: list[str]
    date: str  # "YYYY-MM-DD"
    time: str  # "HH:MM"
    note: str | None = None


class AppointmentOut(BaseModel):
    model_config = CamelModel

    id: str
    client_name: str
    client_phone: str
    client_id: str | None
    note: str | None
    services: list[AppointmentServiceItem]
    starts_at: datetime
    duration_minutes: int
    status: str
    created_at: datetime


class AppointmentStatusUpdate(BaseModel):
    model_config = CamelModel

    status: str


class ProspectBase(BaseModel):
    model_config = CamelModel

    name: str
    phone: str
    prospected_date: str
    source: str | None = None
    wave: str | None = None
    civility: str | None = None
    notes: str | None = None


class ProspectCreate(ProspectBase):
    pass


class ProspectUpdate(ProspectBase):
    pass


class ProspectStatusUpdate(BaseModel):
    model_config = CamelModel

    status: str
    # Renseigné quand status == "contacted" par un envoi WhatsApp (pas d'appel
    # serveur pour ce canal, donc c'est le frontend qui déclare le canal utilisé).
    channel: str | None = None


class ProspectSmsRequest(BaseModel):
    model_config = CamelModel

    message: str


class ProspectBulkSmsItem(BaseModel):
    model_config = CamelModel

    id: str
    message: str


class ProspectBulkSmsRequest(BaseModel):
    model_config = CamelModel

    items: list[ProspectBulkSmsItem]


class ProspectOut(ProspectBase):
    id: str
    status: str
    last_relance_at: datetime | None = None
    last_relance_channel: str | None = None
    last_relance_status: str | None = None
    converted_client_id: str | None = None
    created_at: datetime
    updated_at: datetime


class ProspectBulkSmsResult(BaseModel):
    model_config = CamelModel

    prospect: ProspectOut
    ok: bool
    reason: str | None = None


class ProspectBulkSmsResponse(BaseModel):
    model_config = CamelModel

    results: list[ProspectBulkSmsResult]


class ProspectBulkItem(BaseModel):
    model_config = CamelModel

    name: str
    phone: str
    prospected_date: str
    source: str | None = None
    wave: str | None = None
    civility: str | None = None
    notes: str | None = None


class ProspectBulkCreate(BaseModel):
    model_config = CamelModel

    items: list[ProspectBulkItem]


class CampaignMediaOut(BaseModel):
    model_config = CamelModel

    kind: str
    content_type: str
    filename: str
    updated_at: datetime


class ProspectConvertedUpdate(BaseModel):
    model_config = CamelModel

    client_id: str


class BirthdaySubmissionCreate(BaseModel):
    model_config = CamelModel

    name: str
    phone: str
    birth_date: str  # "MM-DD"
    gender: str = "F"  # "F" ou "M"


class BirthdaySubmissionOut(BaseModel):
    model_config = CamelModel

    id: str
    name: str
    phone: str
    birth_date: str
    gender: str
    status: str
    client_id: str | None
    created_at: datetime


class BirthdaySubmissionStatusUpdate(BaseModel):
    model_config = CamelModel

    status: str


class BirthdaySubmissionStatusResult(BaseModel):
    submission: BirthdaySubmissionOut
    client: ClientOut | None = None

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
