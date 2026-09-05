import logging
from pathlib import Path

from apscheduler.schedulers.background import BackgroundScheduler
from fastapi import FastAPI
from fastapi.responses import HTMLResponse, Response
from fastapi.staticfiles import StaticFiles
from starlette.types import Scope

from .automation import run_all_active_campaigns
from .birthday_page import BIRTHDAY_PAGE_HTML
from .config import ROOT_DIR, settings
from .database import SessionLocal
from .rdv_page import RDV_PAGE_HTML
from .review_page import REVIEW_PAGE_HTML
from .routers import appointments, auth, birthdays, campaigns, clients, relances, reviews, services, timeline

logger = logging.getLogger("app.automation")


class SPAStaticFiles(StaticFiles):
    """Sert le build React en évitant que Safari iOS ne reste bloqué sur une
    ancienne version : index.html (le point d'entrée qui référence le bundle
    JS courant) n'est jamais mis en cache, tandis que les fichiers dans
    /assets/ (noms hashés par Vite, changent à chaque build) restent en cache
    long terme sans perte de fraîcheur."""

    def file_response(self, full_path, stat_result, scope: Scope, status_code: int = 200) -> Response:
        response = super().file_response(full_path, stat_result, scope, status_code)
        path = str(full_path).replace("\\", "/")
        if "/assets/" in path:
            response.headers["cache-control"] = "public, max-age=31536000, immutable"
        else:
            response.headers["cache-control"] = "no-cache, no-store, must-revalidate"
        return response

app = FastAPI(title="Exalt Institut API")

app.include_router(auth.router)
app.include_router(clients.router)
app.include_router(campaigns.router)
app.include_router(timeline.router)
app.include_router(relances.router)
app.include_router(services.router)
app.include_router(services.public_router)
app.include_router(reviews.router)
app.include_router(appointments.router)
app.include_router(birthdays.router)


@app.get("/avis", response_class=HTMLResponse, include_in_schema=False)
def review_page() -> str:
    """Page publique (sans connexion) partagée par WhatsApp/SMS/Email pour recueillir un avis client."""
    return REVIEW_PAGE_HTML


@app.get("/rdv", response_class=HTMLResponse, include_in_schema=False)
def rdv_page() -> str:
    """Page publique (sans connexion) de prise de rendez-vous, partagée via les messages de relance."""
    return RDV_PAGE_HTML


@app.get("/anniversaire", response_class=HTMLResponse, include_in_schema=False)
def birthday_page() -> str:
    """Page publique (sans connexion) de collecte de la date d'anniversaire (jour+mois), à valider par l'institut."""
    return BIRTHDAY_PAGE_HTML


if settings.environment == "production":
    dist_dir = Path(ROOT_DIR) / "dist"
    app.mount("/", SPAStaticFiles(directory=dist_dir, html=True), name="static")

scheduler = BackgroundScheduler()


def _run_automation_sweep() -> None:
    db = SessionLocal()
    try:
        created = run_all_active_campaigns(db)
        if created:
            logger.info("Balayage des automatisations : %s relance(s) créée(s).", created)
    except Exception:
        logger.exception("Échec du balayage des automatisations.")
    finally:
        db.close()


@app.on_event("startup")
def start_scheduler() -> None:
    if not scheduler.running:
        scheduler.add_job(_run_automation_sweep, "interval", minutes=30, id="automation_sweep", replace_existing=True)
        scheduler.start()


@app.on_event("shutdown")
def stop_scheduler() -> None:
    if scheduler.running:
        scheduler.shutdown(wait=False)
