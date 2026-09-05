"""Moteur d'exécution des automatisations (relances programmées).

Contrairement à un simple configurateur de modèles, ce module détermine
réellement quels clients sont dus pour une campagne donnée (`find_due_matches`)
et déclenche l'action (`dispatch_campaign`) :
- WhatsApp ne peut être envoyé que depuis un geste utilisateur dans le
  navigateur (lien `wa.me`), donc une correspondance WhatsApp devient un
  brouillon ("Drafts") que le personnel finalise depuis l'écran Planning.
- SMS est réellement envoyé si une passerelle est configurée (voir sms.py) ;
  sinon, comme Email (aucun fournisseur connecté, voir README), la
  correspondance est simplement journalisée comme un envoi simulé — au même
  titre que le fait déjà l'envoi manuel d'une relance sur ces canaux.

La déduplication passe par `CampaignDispatchLog` : chaque occurrence réelle
(ex. une prestation précise, l'anniversaire d'une année donnée) n'est traitée
qu'une seule fois par campagne et par client, tout en autorisant un nouveau
déclenchement légitime plus tard (nouvelle prestation, année suivante).
"""

import re
from datetime import date, datetime, timedelta, timezone

from sqlalchemy.orm import Session

from . import models, sms
from .routers.relances import build_date_group

_PLACEHOLDERS = {
    "[Nom]": lambda c: c.name,
    "[Name]": lambda c: c.name,
    "[Prestation]": lambda c: c.last_service,
    "[Service]": lambda c: c.last_service,
    "[Prestation Précédente]": lambda c: c.last_service,
    "[Nouvelle Prestation]": lambda c: c.suggested_upsell,
    "[Suggested Service]": lambda c: c.suggested_upsell,
    "[Date]": lambda c: c.last_service_date,
}

# Cameroun (UTC+1, sans heure d'été) : les campagnes visent surtout une
# clientèle locale, donc la salutation doit refléter l'heure là-bas plutôt
# que l'heure serveur (UTC sur Railway).
_LOCAL_TZ = timezone(timedelta(hours=1))


def _time_based_greeting(hour: int, french: bool) -> str:
    if 5 <= hour < 12:
        return "Bonjour" if french else "Good morning"
    if 12 <= hour < 18:
        return "Bon après-midi" if french else "Good afternoon"
    return "Bonsoir" if french else "Good evening"


def render_message(template: str, client: models.Client) -> str:
    rendered = template.replace("Mme/M.", client.prefix or "Mme/M.")
    hour = datetime.now(_LOCAL_TZ).hour
    rendered = re.sub(r"\bBonjour\b", _time_based_greeting(hour, french=True), rendered)
    rendered = re.sub(r"\bHello\b", _time_based_greeting(hour, french=False), rendered)
    for placeholder, resolver in _PLACEHOLDERS.items():
        rendered = rendered.replace(placeholder, resolver(client) or "")
    rendered = rendered.replace(
        "https://exalt-beauty.up.railway.app/avis",
        f"https://exalt-beauty.up.railway.app/avis?client={client.id}",
    )
    return rendered


def _delay_to_timedelta(delay_time: int, delay_unit: str) -> timedelta:
    unit = (delay_unit or "Days").strip().lower()
    if unit.startswith("hour"):
        return timedelta(hours=delay_time)
    if unit.startswith("week"):
        return timedelta(weeks=delay_time)
    return timedelta(days=delay_time)


def _parse_iso_date(value: str | None) -> date | None:
    if not value:
        return None
    try:
        return date.fromisoformat(value)
    except ValueError:
        return None


def _parse_birth_month_day(value: str | None) -> tuple[int, int] | None:
    """La date de naissance ne porte volontairement pas d'année (non demandée,
    non utile pour une relance annuelle) : elle est stockée en "MM-DD". Les
    anciennes valeurs complètes "YYYY-MM-DD" restent lisibles."""

    if not value:
        return None
    parts = value.split("-")
    try:
        if len(parts) == 3:
            return int(parts[1]), int(parts[2])
        if len(parts) == 2:
            return int(parts[0]), int(parts[1])
    except ValueError:
        return None
    return None


def find_due_matches(
    db: Session, campaign: models.AutomationCampaign, now: datetime | None = None
) -> list[tuple[models.Client, str]]:
    """Retourne les (client, period_key) dus pour cette campagne, non déjà traités."""

    now = now or datetime.now(timezone.utc)
    today = now.date()
    delta = _delay_to_timedelta(campaign.delay_time, campaign.delay_unit)

    clients = db.query(models.Client).filter(models.Client.marketing_opt_in.is_(True)).all()

    candidates: list[tuple[models.Client, str]] = []
    for client in clients:
        if campaign.action_event in ("After a Service", "Inactivity Period"):
            last_service = _parse_iso_date(client.raw_date)
            if not last_service:
                continue
            due_at = datetime.combine(last_service, datetime.min.time(), tzinfo=timezone.utc) + delta
            if due_at > now:
                continue
            candidates.append((client, f"service:{client.raw_date}"))

        elif campaign.action_event == "New Client Registration":
            due_at = client.created_at
            if due_at.tzinfo is None:
                due_at = due_at.replace(tzinfo=timezone.utc)
            due_at = due_at + delta
            if due_at > now:
                continue
            candidates.append((client, "registration"))

        elif campaign.action_event == "Birthday":
            month_day = _parse_birth_month_day(client.birth_date)
            if not month_day:
                continue
            month, day = month_day
            try:
                target_this_year = date(today.year, month, day)
            except ValueError:
                # 29 février sur une année non bissextile : on célèbre le 28 février.
                target_this_year = date(today.year, month, 28)
            send_date = target_this_year - delta
            if today < send_date:
                continue
            candidates.append((client, f"birthday:{today.year}"))

        # action_event inconnu (ex. valeur libre historique) : aucune correspondance,
        # plutôt qu'une erreur — une campagne mal configurée reste simplement inactive.

    if not candidates:
        return []

    already_dispatched = {
        (row.client_id, row.period_key)
        for row in db.query(models.CampaignDispatchLog)
        .filter(models.CampaignDispatchLog.campaign_id == campaign.id)
        .all()
    }
    return [(client, key) for client, key in candidates if (client.id, key) not in already_dispatched]


def dispatch_campaign(
    db: Session, campaign: models.AutomationCampaign, language: str = "fr", now: datetime | None = None
) -> list[models.TimelineItem]:
    """Exécute une campagne maintenant : matching réel + création des relances."""

    now = now or datetime.now(timezone.utc)
    matches = find_due_matches(db, campaign, now)
    if not matches:
        return []

    lang = "en" if language == "en" else "fr"
    created_items: list[models.TimelineItem] = []
    sent_count = 0

    for client, period_key in matches:
        message = render_message(campaign.message_body, client)
        is_whatsapp = campaign.channel == "WhatsApp"
        is_sms = campaign.channel == "SMS"

        # SMS : réellement envoyé si une passerelle est configurée (voir sms.py) ;
        # sinon comme Email, aucun fournisseur n'est branché, l'envoi est simulé.
        sms_dispatched = is_sms and sms.is_configured() and sms.send_sms(client.phone, message)
        sms_pending_real_send = is_sms and sms.is_configured() and not sms_dispatched

        item = models.TimelineItem(
            date_group=build_date_group(lang, now),
            time=now.strftime("%H:%M"),
            title=campaign.name,
            description=f"{message[:75]}...",
            target_client=client.name,
            channel=campaign.channel,
            status="Drafts" if is_whatsapp else "Upcoming",
            scheduled_at=now,
            campaign_id=campaign.id,
            client_id=client.id,
        )
        db.add(item)
        db.add(
            models.CampaignDispatchLog(campaign_id=campaign.id, client_id=client.id, period_key=period_key)
        )

        if not is_whatsapp and not sms_pending_real_send:
            # Email, ou SMS simulé/réellement envoyé avec succès.
            client.status = "Up to date"
            sent_count += 1

        created_items.append(item)

    stats = dict(campaign.stats or {})
    stats["sent"] = stats.get("sent", 0) + sent_count
    campaign.stats = stats
    campaign.last_triggered = now.isoformat()

    db.commit()
    for item in created_items:
        db.refresh(item)
    return created_items


def run_all_active_campaigns(db: Session, now: datetime | None = None) -> int:
    """Balayage périodique : exécute chaque campagne active. Retourne le nombre total de relances créées."""

    now = now or datetime.now(timezone.utc)
    total = 0
    campaigns = db.query(models.AutomationCampaign).filter(models.AutomationCampaign.status == "active").all()
    for campaign in campaigns:
        total += len(dispatch_campaign(db, campaign, now=now))
    return total
