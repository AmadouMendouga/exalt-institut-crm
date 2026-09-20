from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import MagicMock

import pytest
from fastapi import HTTPException
from pydantic import ValidationError

from app import automation, models
from app.schemas import BirthdaySubmissionCreate, AvailabilityRuleUpdate, RelanceSendRequest
from app.routers.relances import send_relance


def matches(birthday, instant, delay=0):
    client = SimpleNamespace(id='client', birth_date=birthday)
    db = MagicMock()
    db.query.return_value.filter.return_value.all.side_effect = [[client], []]
    campaign = SimpleNamespace(id='campaign', action_event='Birthday', delay_time=delay, delay_unit='Days')
    return automation.find_due_matches(db, campaign, datetime.fromisoformat(instant))


@pytest.mark.parametrize('birthday,instant,delay,expected', [
    ('09-19', '2026-09-19T12:00:00+00:00', 0, 'birthday:2026'),
    ('09-19', '2026-09-20T12:00:00+00:00', 0, None),
    ('09-20', '2026-09-19T23:30:00+00:00', 0, 'birthday:2026'),
    ('02-29', '2027-02-28T12:00:00+00:00', 0, 'birthday:2027'),
    ('01-01', '2026-12-31T12:00:00+00:00', 1, 'birthday:2027'),
    ('13-40', '2026-09-19T12:00:00+00:00', 0, None),
])
def test_birthday_window(birthday, instant, delay, expected):
    result = matches(birthday, instant, delay)
    assert [key for _, key in result] == ([expected] if expected else [])


def test_invalid_birthday_rejected():
    with pytest.raises(ValidationError):
        BirthdaySubmissionCreate(name='Alice', phone='+237699123456', birth_date='02-31')


def test_opening_hours_rejected():
    with pytest.raises(ValidationError):
        AvailabilityRuleUpdate(weekday=1, is_closed=False, open_minutes=1000, close_minutes=500)


@pytest.mark.parametrize('channel', ['Email', 'SMS'])
def test_unconfigured_manual_channel_never_marks_client_sent(channel):
    db = MagicMock()
    client = SimpleNamespace(marketing_opt_in=True, status='Follow-up Needed')
    db.query.return_value.filter.return_value.first.return_value = client
    with pytest.raises(HTTPException) as error:
        send_relance(RelanceSendRequest(client_id='client', channel=channel, message='Hello'), db)
    assert error.value.status_code == 409
    assert client.status == 'Follow-up Needed'
    db.commit.assert_not_called()


def test_dispatch_log_maps_required_migration_column():
    assert 'dispatched_at' in models.CampaignDispatchLog.__table__.columns
    assert models.CampaignDispatchLog.__table__.c.dispatched_at.default is not None


def test_failed_sms_occurrence_remains_retryable(monkeypatch):
    db = MagicMock()
    campaign = SimpleNamespace(id='campaign', channel='SMS', message_body='Hello', stats={'sent': 0})
    client = SimpleNamespace(phone='+237699123456')
    monkeypatch.setattr(automation, 'find_due_matches', lambda *args: [(client, 'registration')])
    monkeypatch.setattr(automation, 'render_message', lambda *args: 'Hello')
    monkeypatch.setattr(automation.sms, 'is_configured', lambda: True)
    monkeypatch.setattr(automation.sms, 'send_sms', lambda *args: False)
    assert automation.dispatch_campaign(db, campaign) == []
    db.add.assert_not_called()
    assert campaign.stats['sent'] == 0
