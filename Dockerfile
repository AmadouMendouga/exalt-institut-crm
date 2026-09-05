# Stage 1: build the React front-end
FROM node:22-slim AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Python runtime serving the API + built front-end
FROM python:3.12-slim
WORKDIR /app

COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

COPY backend ./backend
COPY --from=frontend-builder /app/dist ./dist

ENV PYTHONUNBUFFERED=1
ENV ENVIRONMENT=production
EXPOSE 8787

WORKDIR /app/backend
CMD ["sh", "-c", "alembic upgrade head && python -m app.seed && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8787}"]
