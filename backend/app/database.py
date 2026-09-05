from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from .config import settings


def _to_psycopg_url(url: str) -> str:
    # Accept the plain "postgresql://" scheme (e.g. as provided by Railway) and
    # route it through the psycopg3 driver we install, instead of psycopg2.
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+psycopg://", 1)
    return url


engine = create_engine(_to_psycopg_url(settings.database_url))
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
