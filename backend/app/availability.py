"""Calcul des créneaux disponibles pour la prise de rendez-vous publique (/rdv).

Les horaires (AvailabilityRule) et les rendez-vous existants sont exprimés en
heure locale (Cameroun, UTC+1) sans fuseau explicite, pour rester simples à
comparer entre eux — l'institut et sa clientèle sont tous dans le même fuseau.
"""

from datetime import date, datetime, timedelta, timezone

from sqlalchemy.orm import Session

from . import models

DEFAULT_DURATION_MINUTES = 45
SLOT_STEP_MINUTES = 30
LOCAL_TZ = timezone(timedelta(hours=1))

_DEFAULT_RULES = [
    # lundi(0) à samedi(5) : 9h-19h ; dimanche(6) : fermé
    {"weekday": d, "is_closed": d == 6, "open_minutes": 9 * 60, "close_minutes": 19 * 60}
    for d in range(7)
]


def now_local() -> datetime:
    return datetime.now(LOCAL_TZ).replace(tzinfo=None)


def ensure_default_rules(db: Session) -> None:
    if db.query(models.AvailabilityRule).count() == 0:
        for rule in _DEFAULT_RULES:
            db.add(models.AvailabilityRule(**rule))
        db.commit()


def get_weekly_rules(db: Session) -> list[models.AvailabilityRule]:
    ensure_default_rules(db)
    return db.query(models.AvailabilityRule).order_by(models.AvailabilityRule.weekday).all()


def compute_available_slots(db: Session, target_date: date, duration_minutes: int) -> list[str]:
    rules = {r.weekday: r for r in get_weekly_rules(db)}
    rule = rules.get(target_date.weekday())
    if not rule or rule.is_closed:
        return []

    day_start = datetime.combine(target_date, datetime.min.time())
    candidates = []
    minutes = rule.open_minutes
    while minutes + duration_minutes <= rule.close_minutes:
        candidates.append(day_start + timedelta(minutes=minutes))
        minutes += SLOT_STEP_MINUTES

    now = now_local()
    if target_date == now.date():
        candidates = [c for c in candidates if c > now]

    existing = (
        db.query(models.Appointment)
        .filter(
            models.Appointment.status.in_(["Pending", "Confirmed"]),
            models.Appointment.starts_at >= day_start,
            models.Appointment.starts_at < day_start + timedelta(days=1),
        )
        .all()
    )
    busy = [(a.starts_at, a.starts_at + timedelta(minutes=a.duration_minutes)) for a in existing]

    free = []
    for c in candidates:
        c_end = c + timedelta(minutes=duration_minutes)
        if not any(c < b_end and c_end > b_start for b_start, b_end in busy):
            free.append(c)

    return [slot.strftime("%H:%M") for slot in free]
