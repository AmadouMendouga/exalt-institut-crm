"""Envoi réel de SMS via SMS Gateway for Android (Cloud API, api.sms-gate.app).

Nécessite un téléphone Android avec l'appli "SMS Gateway" enregistrée en mode
Cloud, et sa carte SIM avec un forfait SMS actif. SMS_GATEWAY_LOGIN /
SMS_GATEWAY_PASSWORD sont les identifiants générés par cette appli.

Tant que ces variables ne sont pas configurées, l'envoi reste simulé (aucun
appel réseau, comportement identique à avant) — c'est le cas par défaut.
"""

import base64
import json
import urllib.error
import urllib.request

from .config import settings

API_URL = "https://api.sms-gate.app/3rdparty/v1/message"


def is_configured() -> bool:
    return bool(settings.sms_gateway_login and settings.sms_gateway_password)


def send_sms(phone: str, message: str) -> bool:
    """Tente un envoi réel via la passerelle. Retourne True si acceptée (statut 2xx)."""

    if not is_configured():
        return False

    digits = "".join(ch for ch in phone if ch.isdigit() or ch == "+")
    credentials = f"{settings.sms_gateway_login}:{settings.sms_gateway_password}".encode()
    # Le téléphone a deux SIM ; seule la SIM 1 (Orange, forfait Pulse/SMS illimité)
    # délivre réellement les messages. La SIM 2 échoue systématiquement
    # (RESULT_ERROR_GENERIC_FAILURE) — confirmé en testant les deux explicitement.
    body = json.dumps({"message": message, "phoneNumbers": [digits], "simNumber": 1}).encode()

    request = urllib.request.Request(
        API_URL,
        data=body,
        method="POST",
        headers={
            "Content-Type": "application/json",
            "Authorization": "Basic " + base64.b64encode(credentials).decode(),
            # Cloudflare (devant api.sms-gate.app) bloque le User-Agent par défaut
            # de urllib ("Python-urllib/x.y") comme trafic de bot (403/1010).
            "User-Agent": "curl/8.4.0",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            ok = 200 <= response.status < 300
            if not ok:
                print(f"[sms] unexpected status={response.status} body={response.read()}")
            return ok
    except urllib.error.HTTPError as e:
        print(f"[sms] HTTPError status={e.code} body={e.read()}")
        return False
    except urllib.error.URLError as e:
        print(f"[sms] URLError reason={e.reason}")
        return False
