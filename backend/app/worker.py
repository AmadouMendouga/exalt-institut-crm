"""Optional Railway worker: set AUTOMATION_ENABLED=false on the web service."""
import logging
from apscheduler.schedulers.blocking import BlockingScheduler

from .automation import run_all_active_campaigns
from .database import SessionLocal


def sweep():
    with SessionLocal() as db:
        try:
            run_all_active_campaigns(db)
        except Exception:
            db.rollback()
            logging.exception('Automation sweep failed')


if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    scheduler = BlockingScheduler()
    scheduler.add_job(sweep, 'interval', minutes=30, max_instances=1, coalesce=True)
    sweep()
    scheduler.start()
