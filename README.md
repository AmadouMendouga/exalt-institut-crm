# Service CRM

## Fiabilité et déploiement — septembre 2026

Les canaux non configurés ne sont plus simulés comme des envois réussis :
Email retourne une erreur explicite et SMS nécessite une passerelle configurée.
Un succès SMS signifie seulement « accepté par la passerelle », sans preuve de
réception. WhatsApp reste une action manuelle à confirmer dans WhatsApp.
Les compteurs historiques sont conservés, mais peuvent inclure des simulations ;
les ouvertures et conversions non mesurées sont masquées dans Analytics.

Le journal d'automatisation renseigne désormais `dispatched_at`, obligatoire
depuis la migration initiale. Les déclenchements concurrents sont sérialisés
par PostgreSQL. Les anniversaires sont limités à leur fenêtre locale UTC+1.
Une erreur SMS ne consomme plus définitivement l'occurrence.

Railway : garder le Dockerfile existant, qui applique les migrations avant le
démarrage. La nouvelle migration ajoute uniquement une table de limitation de
débit (10 POST/minute/IP/route pour connexion et formulaires publics).
Vérifier la configuration des proxies de confiance d'Uvicorn : ne pas accepter
les en-têtes forwarded d'une origine non fiable. La limite repose sur l'adresse
ASGI obtenue après cette configuration.

Variables : `PUBLIC_APP_URL=https://exalt-beauty.up.railway.app`,
`AUTOMATION_ENABLED=true` par défaut. Pour un worker Railway séparé, définir
`AUTOMATION_ENABLED=false` sur le service web et lancer `python -m app.worker`
dans `/app/backend` sur le worker, après migration. Les deux partagent la base.
Le worker est optionnel : le comportement d'un service unique reste supporté.

Validation : `npm run lint`, `npm run build`, puis depuis `backend`,
`python -m pytest tests -q` (installer pytest et httpx). GitHub Actions teste
aussi les migrations sur PostgreSQL et les réservations concurrentes.
Ne jamais utiliser la base de production comme `TEST_DATABASE_URL`.

Limites restantes : pas de réception SMS vérifiée, ni d'envoi email ou WhatsApp
Business automatique. Une panne après acceptation SMS mais avant commit peut
encore produire un doublon ; une outbox et l'idempotence fournisseur sont
nécessaires pour aller plus loin. Les anciennes statistiques ne permettent pas
de reconstituer les réceptions réelles. Les rôles, paiements/factures, ressources
du planning, pagination serveur et sauvegardes restent des chantiers distincts.
Ne pas fusionner avant succès des contrôles CI et sauvegarde Railway vérifiée.

Les paragraphes historiques ci-dessous décrivant les simulations ou statistiques
de démonstration sont remplacés par les règles de cette section.

Plateforme CRM marketing bilingue (Français / Anglais) pour le suivi client, les relances automatisées et les campagnes ciblées.

Application React (Vite) + API FastAPI (Python) + PostgreSQL (via SQLAlchemy/Alembic), avec authentification par session et envoi de relances via WhatsApp (liens `wa.me`).

## Prérequis

- Node.js 22+
- Python 3.12+
- Docker (pour lancer une base PostgreSQL locale) — ou une base PostgreSQL déjà accessible

## Démarrage local

1. Copier `.env.example` en `.env` et ajuster les valeurs si besoin (au minimum changer `JWT_SECRET` et `ADMIN_PASSWORD`).

2. Démarrer PostgreSQL en local :

   ```bash
   docker compose up -d
   ```

3. Installer les dépendances front-end :

   ```bash
   npm install
   ```

4. Créer et activer un environnement virtuel Python, puis installer les dépendances du backend :

   ```bash
   python -m venv backend/.venv
   # Windows :
   backend\.venv\Scripts\activate
   # macOS / Linux :
   source backend/.venv/bin/activate

   pip install -r backend/requirements.txt
   ```

5. Créer les tables et les données de démonstration (depuis le même terminal, venv activé) :

   ```bash
   cd backend
   alembic upgrade head
   python -m app.seed
   cd ..
   ```

6. Lancer l'application (front + API en parallèle, toujours avec le venv activé dans ce terminal) :

   ```bash
   npm run dev
   ```

7. Ouvrir l'URL affichée par Vite (`http://127.0.0.1:3000` ou le port suivant si occupé) et se connecter avec `ADMIN_EMAIL` / `ADMIN_PASSWORD` (voir `.env`).

## Scripts

- `npm run dev` — lance le client Vite et l'API FastAPI (`uvicorn --reload`) en parallèle
- `npm run build` — build de production du front-end (dossier `dist/`)
- `npm start` — lance l'API en mode production (sert aussi les fichiers du build)
- `npm run lint` — vérification TypeScript
- `cd backend && alembic revision --autogenerate -m "message"` — génère une nouvelle migration après modification de `backend/app/models.py`
- `cd backend && alembic upgrade head` — applique les migrations
- `cd backend && python -m app.seed` — crée le compte admin et les données de démonstration (idempotent)

## Moteur d'automatisation

Chaque campagne active (`backend/app/automation.py`) est réellement évaluée toutes les 30 minutes par un scheduler intégré (APScheduler, démarré avec l'API) : il détermine quels clients sont dus selon le déclencheur (après une prestation, inactivité, nouveau client, anniversaire) et le délai configuré, en respectant le consentement marketing de chaque client (`marketingOptIn`) et sans jamais relancer deux fois le même événement (`campaign_dispatch_log`). Le bouton "Lancer test" d'une automatisation déclenche cette même logique immédiatement.

- **WhatsApp** ne peut être envoyé que depuis un geste utilisateur dans le navigateur (lien `wa.me`) : une correspondance WhatsApp crée un brouillon dans l'onglet "Brouillons" du Planning, à ouvrir et valider manuellement (la relance pré-remplie s'ouvre alors dans la modale de relance rapide).
- **SMS** est réellement envoyé si une passerelle est configurée (voir "Passerelle SMS" ci-dessous) ; sinon, comme **Email** (aucun fournisseur connecté), la correspondance est simplement journalisée comme un envoi simulé (statut client et planning mis à jour).

## WhatsApp (wa.me)

Cliquer sur "Envoyer" avec le canal WhatsApp (relance manuelle ou finalisation d'un brouillon) ouvre `https://wa.me/<numéro>` dans un nouvel onglet avec le message pré-rempli, prêt à être envoyé depuis WhatsApp Web ou l'application.

## Passerelle SMS (gratuite, via un téléphone Android)

Aucun frais d'API : les SMS partent via un téléphone Android existant et son forfait SMS, grâce à l'appli [SMS Gateway for Android](https://sms-gate.app/) en mode Cloud (`backend/app/sms.py`, Cloud API `api.sms-gate.app`).

1. Installer l'appli "SMS Gateway for Android" sur un téléphone avec une carte SIM ayant un forfait SMS actif.
2. Dans l'appli, activer le mode Cloud et noter le login / mot de passe générés (ou les définir manuellement selon la version).
3. Garder le téléphone allumé, chargé et connecté à internet.
4. Définir les variables d'environnement du backend (`.env` en local, variables du service sur Railway en production) :

   ```
   SMS_GATEWAY_LOGIN="..."
   SMS_GATEWAY_PASSWORD="..."
   ```

5. Redémarrer l'API (ou redéployer). Tant que ces deux variables ne sont pas définies, l'envoi SMS reste simulé — aucun changement de comportement.

## Déploiement (Railway)

L'application est packagée pour tourner comme un service unique (API + fichiers statiques du front) avec le `Dockerfile` fourni.

1. Créer un compte Railway (si ce n'est pas déjà fait) et installer la CLI (`npm i -g @railway/cli` ou voir la doc Railway).
2. Depuis la racine du projet : `railway login` (ouvre le navigateur pour l'authentification).
3. `railway init` pour créer un nouveau projet, puis ajouter un plugin PostgreSQL depuis le dashboard Railway (fournit automatiquement la variable `DATABASE_URL`).
4. Définir les variables d'environnement du service : `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` (`DATABASE_URL` est injectée automatiquement par le plugin Postgres, `ENVIRONMENT=production` est déjà fixé dans le Dockerfile).
5. `railway up` pour build et déployer via le `Dockerfile`. Le conteneur applique automatiquement les migrations au démarrage (`alembic upgrade head`).
6. Lancer une fois la commande de seed pour créer le compte admin et les données de démo :

   ```bash
   railway run python -m app.seed
   ```

7. Se connecter à l'URL fournie par Railway avec `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

## Hors périmètre actuel

- Auto-inscription / gestion multi-utilisateurs (un seul compte admin ; en créer d'autres se fait via le script de seed ou directement en base)
- Intégration IA (aucune dépendance IA n'est utilisée)
- Envoi réel d'email (aucun fournisseur connecté, reste simulé). SMS peut être réel si une passerelle Android est configurée (voir "Passerelle SMS"), sinon reste simulé comme l'email.
