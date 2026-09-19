import uuid
from datetime import datetime, timezone

from sqlalchemy import BigInteger, ForeignKey, LargeBinary, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


def _uuid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


class RequestRateLimit(Base):
    __tablename__ = 'request_rate_limits'
    key: Mapped[str] = mapped_column(String(64), primary_key=True)
    bucket: Mapped[int] = mapped_column(BigInteger, primary_key=True, index=True)
    count: Mapped[int] = mapped_column()


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String)
    name: Mapped[str] = mapped_column(String)
    created_at: Mapped[datetime] = mapped_column(default=_now)


class Client(Base):
    __tablename__ = "clients"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String)
    prefix: Mapped[str] = mapped_column(String)
    gender: Mapped[str] = mapped_column(String)
    initials: Mapped[str] = mapped_column(String)
    email: Mapped[str] = mapped_column(String)
    phone: Mapped[str] = mapped_column(String)
    last_service: Mapped[str] = mapped_column(String)
    last_service_date: Mapped[str] = mapped_column(String)
    raw_date: Mapped[str] = mapped_column(String)
    status: Mapped[str] = mapped_column(String)
    suggested_upsell: Mapped[str] = mapped_column(String)
    preferred_channel: Mapped[str] = mapped_column(String)
    total_visits: Mapped[int] = mapped_column(default=0)
    total_spent: Mapped[int] = mapped_column(default=0)
    avatar_bg: Mapped[str | None] = mapped_column(String, nullable=True)
    notes: Mapped[str | None] = mapped_column(String, nullable=True)
    birth_date: Mapped[str | None] = mapped_column(String, nullable=True)
    marketing_opt_in: Mapped[bool] = mapped_column(default=True)
    next_reminder_date: Mapped[str | None] = mapped_column(String, nullable=True)
    next_reminder_note: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=_now)
    updated_at: Mapped[datetime] = mapped_column(default=_now, onupdate=_now)

    timeline_items: Mapped[list["TimelineItem"]] = relationship(back_populates="client")


class Service(Base):
    __tablename__ = "services"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String)
    category: Mapped[str] = mapped_column(String)
    price: Mapped[int] = mapped_column(default=0)
    image_url: Mapped[str | None] = mapped_column(String, nullable=True)
    # Photo hébergée directement en base (uploadée depuis l'app) : bytes bruts + type MIME.
    image_data: Mapped[bytes | None] = mapped_column(LargeBinary, nullable=True)
    image_content_type: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=_now)
    updated_at: Mapped[datetime] = mapped_column(default=_now, onupdate=_now)


class AutomationCampaign(Base):
    __tablename__ = "automation_campaigns"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String)
    category: Mapped[str] = mapped_column(String)
    action_event: Mapped[str] = mapped_column(String)
    delay_time: Mapped[int] = mapped_column()
    delay_unit: Mapped[str] = mapped_column(String)
    channel: Mapped[str] = mapped_column(String)
    subject_line: Mapped[str] = mapped_column(String)
    message_body: Mapped[str] = mapped_column(String)
    cta_text: Mapped[str] = mapped_column(String)
    cta_url: Mapped[str] = mapped_column(String)
    status: Mapped[str] = mapped_column(String)
    target_audience: Mapped[str] = mapped_column(String)
    last_triggered: Mapped[str | None] = mapped_column(String, nullable=True)
    stats: Mapped[dict] = mapped_column(JSONB)
    created_at: Mapped[datetime] = mapped_column(default=_now)
    updated_at: Mapped[datetime] = mapped_column(default=_now, onupdate=_now)

    timeline_items: Mapped[list["TimelineItem"]] = relationship(back_populates="campaign")


class TimelineItem(Base):
    __tablename__ = "timeline_items"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    date_group: Mapped[str] = mapped_column(String)
    time: Mapped[str] = mapped_column(String)
    title: Mapped[str] = mapped_column(String)
    description: Mapped[str] = mapped_column(String)
    target_client: Mapped[str] = mapped_column(String)
    channel: Mapped[str] = mapped_column(String)
    status: Mapped[str] = mapped_column(String)
    scheduled_at: Mapped[datetime] = mapped_column(default=_now)
    created_at: Mapped[datetime] = mapped_column(default=_now)

    campaign_id: Mapped[str | None] = mapped_column(ForeignKey("automation_campaigns.id"), nullable=True)
    campaign: Mapped[AutomationCampaign | None] = relationship(back_populates="timeline_items")

    client_id: Mapped[str | None] = mapped_column(ForeignKey("clients.id"), nullable=True)
    client: Mapped[Client | None] = relationship(back_populates="timeline_items")


class CampaignDispatchLog(Base):
    """Idempotency ledger: one row per (campagne, client, occurrence) réellement traitée.

    period_key encode l'occurrence (ex. la date du dernier service, l'année pour un
    anniversaire) afin qu'une automatisation puisse se redéclencher légitimement plus
    tard (nouvelle prestation, année suivante) sans jamais relancer deux fois pour le
    même événement.
    """

    __tablename__ = "campaign_dispatch_log"
    __table_args__ = (
        UniqueConstraint("campaign_id", "client_id", "period_key", name="uq_campaign_client_period"),
    )

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    campaign_id: Mapped[str] = mapped_column(ForeignKey("automation_campaigns.id"))
    client_id: Mapped[str] = mapped_column(ForeignKey("clients.id"))
    period_key: Mapped[str] = mapped_column(String)
    dispatched_at: Mapped[datetime] = mapped_column(default=_now)


class Review(Base):
    """Avis client collecté depuis la page publique /avis partagée par WhatsApp/SMS/Email."""

    __tablename__ = "reviews"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    rating: Mapped[int] = mapped_column()
    comment: Mapped[str | None] = mapped_column(String, nullable=True)
    client_id: Mapped[str | None] = mapped_column(ForeignKey("clients.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=_now)

    client: Mapped[Client | None] = relationship()

    @property
    def client_name(self) -> str | None:
        return f"{self.client.prefix} {self.client.name}" if self.client else None


class Prospect(Base):
    """Contact prospecté (flyers, porte-à-porte...) pas encore client : suivi séparé
    des vrais clients tant qu'aucune prestation n'a été réalisée."""

    __tablename__ = "prospects"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String)
    phone: Mapped[str] = mapped_column(String)
    prospected_date: Mapped[str] = mapped_column(String)  # "YYYY-MM-DD"
    source: Mapped[str | None] = mapped_column(String, nullable=True)
    # Étiquette de lot d'import ("Vague 1", "Vague 2"...) choisie par l'institut à
    # chaque nouvel import, distincte de `source` (qui décrit la méthode de collecte).
    wave: Mapped[str | None] = mapped_column(String, nullable=True)
    # "M." / "Mme", laissé vide quand le genre n'est pas connu avec certitude (les
    # commerciaux ne le notent pas sur le terrain) — le message garde alors le
    # prénom seul plutôt que de risquer un mauvais accord.
    civility: Mapped[str | None] = mapped_column(String, nullable=True)
    notes: Mapped[str | None] = mapped_column(String, nullable=True)
    # new -> contacted -> converted, ou not_interested à tout moment
    status: Mapped[str] = mapped_column(String, default="new")
    last_relance_at: Mapped[datetime | None] = mapped_column(nullable=True)
    # Canal ("WhatsApp"/"SMS") et résultat ("sent"/"failed") de la dernière relance :
    # WhatsApp est toujours "sent" (pas de retour d'échec possible côté serveur),
    # SMS reflète le vrai statut renvoyé par la passerelle.
    last_relance_channel: Mapped[str | None] = mapped_column(String, nullable=True)
    last_relance_status: Mapped[str | None] = mapped_column(String, nullable=True)
    converted_client_id: Mapped[str | None] = mapped_column(ForeignKey("clients.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=_now)
    updated_at: Mapped[datetime] = mapped_column(default=_now, onupdate=_now)

    converted_client: Mapped[Client | None] = relationship()


class CampaignMedia(Base):
    """Photo ou vidéo de campagne (ex. photo de l'institut) qu'on veut pouvoir joindre
    à une relance. WhatsApp (wa.me) ne permet pas de pré-joindre un fichier via un
    lien : ce média reste téléchargeable pour un ajout manuel dans la conversation."""

    __tablename__ = "campaign_media"
    __table_args__ = (UniqueConstraint("kind", name="uq_campaign_media_kind"),)

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    kind: Mapped[str] = mapped_column(String)  # "photo" | "video"
    data: Mapped[bytes] = mapped_column(LargeBinary)
    content_type: Mapped[str] = mapped_column(String)
    filename: Mapped[str] = mapped_column(String)
    created_at: Mapped[datetime] = mapped_column(default=_now)
    updated_at: Mapped[datetime] = mapped_column(default=_now, onupdate=_now)


class AvailabilityRule(Base):
    """Horaires d'ouverture hebdomadaires servant à calculer les créneaux libres sur /rdv."""

    __tablename__ = "availability_rules"
    __table_args__ = (UniqueConstraint("weekday", name="uq_availability_weekday"),)

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    weekday: Mapped[int] = mapped_column()  # 0 = lundi ... 6 = dimanche
    is_closed: Mapped[bool] = mapped_column(default=False)
    open_minutes: Mapped[int] = mapped_column(default=9 * 60)  # minutes depuis minuit
    close_minutes: Mapped[int] = mapped_column(default=19 * 60)


class Appointment(Base):
    """Demande de rendez-vous soumise depuis la page publique /rdv (statut à confirmer par l'institut)."""

    __tablename__ = "appointments"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    client_name: Mapped[str] = mapped_column(String)
    client_phone: Mapped[str] = mapped_column(String)
    note: Mapped[str | None] = mapped_column(String, nullable=True)
    # Panier de soins figé au moment de la demande : liste de {"id": ..., "name": ...}.
    # Une copie figée reste correcte même si un soin est renommé/supprimé ensuite.
    services: Mapped[list] = mapped_column(JSONB)
    starts_at: Mapped[datetime] = mapped_column()  # heure locale (Cameroun), sans fuseau
    duration_minutes: Mapped[int] = mapped_column()
    status: Mapped[str] = mapped_column(String, default="Pending")
    client_id: Mapped[str | None] = mapped_column(ForeignKey("clients.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=_now)
    client: Mapped[Client | None] = relationship()


class BirthdaySubmission(Base):
    """Date d'anniversaire soumise depuis la page publique /anniversaire (à valider
    par l'institut avant d'être reportée sur la fiche client, Client.birth_date)."""

    __tablename__ = "birthday_submissions"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String)
    phone: Mapped[str] = mapped_column(String)
    birth_date: Mapped[str] = mapped_column(String)  # "MM-DD", même format que Client.birth_date
    gender: Mapped[str] = mapped_column(String, default="F")  # "F" ou "M", choisi sur la page publique
    status: Mapped[str] = mapped_column(String, default="Pending")
    client_id: Mapped[str | None] = mapped_column(ForeignKey("clients.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=_now)
    client: Mapped[Client | None] = relationship()
