"""Runs against a disposable PostgreSQL database migrated by CI."""
import os
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from uuid import uuid4

import pytest
from fastapi import HTTPException
from sqlalchemy import text

from app.database import SessionLocal
from app import models, availability
from app.routers.appointments import create_appointment
from app.schemas import AppointmentCreate
from app.protection import count_attempt

pytestmark = pytest.mark.skipif(not os.getenv('TEST_DATABASE_URL'), reason='Disposable PostgreSQL required')


def test_shared_rate_counter_is_atomic():
    import time
    key = uuid4().hex
    bucket = int(time.time()) // 60
    with ThreadPoolExecutor(max_workers=4) as pool:
        counts = list(pool.map(lambda _: count_attempt(key, bucket), range(4)))
    assert sorted(counts) == [1, 2, 3, 4]


def test_dispatch_insert_matches_migrations():
    with SessionLocal() as db:
        # Compare the required DB columns with those mapped by the ORM.
        rows = db.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='campaign_dispatch_log' AND is_nullable='NO' AND column_default IS NULL")).scalars().all()
        assert rows
        assert set(rows) <= set(models.CampaignDispatchLog.__table__.columns.keys())


def test_concurrent_booking_has_one_winner(monkeypatch):
    monkeypatch.setattr(availability, 'now_local', lambda: datetime(2030, 1, 1))
    service_id = str(uuid4())
    with SessionLocal() as db:
        availability.ensure_default_rules(db)
        db.add(models.Service(id=service_id, name='Test', category='Test', price=100))
        db.commit()

    def reserve(_):
        with SessionLocal() as db:
            try:
                create_appointment(AppointmentCreate(client_name='Test', client_phone='+237699123456', service_ids=[service_id], date='2030-01-07', time='10:00'), db)
                return 201
            except HTTPException as error:
                return error.status_code

    with ThreadPoolExecutor(max_workers=2) as pool:
        assert sorted(pool.map(reserve, range(2))) == [201, 409]
