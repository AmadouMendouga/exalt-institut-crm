"""Shared PostgreSQL rate limits for public submissions and login attempts."""
import hashlib
import time

from fastapi import Request
from fastapi.responses import JSONResponse
from sqlalchemy import text
from starlette.concurrency import run_in_threadpool

from .database import SessionLocal

LIMITS = {
    '/api/auth/login': 10,
    '/api/reviews': 10,
    '/api/appointments': 10,
    '/api/birthday-submissions': 10,
    '/api/webhooks/sms-gateway': 120,
}


def count_attempt(key, bucket):
    with SessionLocal.begin() as db:
        db.execute(text('DELETE FROM request_rate_limits WHERE bucket < :cutoff'), {'cutoff': bucket - 2})
        return db.execute(text('''
            INSERT INTO request_rate_limits (key, bucket, count) VALUES (:key, :bucket, 1)
            ON CONFLICT (key, bucket) DO UPDATE SET count = request_rate_limits.count + 1
            RETURNING count
        '''), {'key': key, 'bucket': bucket}).scalar_one()


async def protect_requests(request: Request, call_next):
    limit = LIMITS.get(request.url.path.rstrip('/')) if request.method == 'POST' else None
    if limit:
        # Use the ASGI peer; trust forwarded headers only from Railway's proxy.
        peer = request.client.host if request.client else 'unknown'
        key = hashlib.sha256(f'{peer}:{request.url.path}'.encode()).hexdigest()
        bucket = int(time.time()) // 60
        count = await run_in_threadpool(count_attempt, key, bucket)
        if count > limit:
            return JSONResponse(status_code=429, content={'detail': 'Trop de tentatives. Réessayez dans une minute.'}, headers={'Retry-After': '60'})
    response = await call_next(request)
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    if request.url.path.startswith('/api/'):
        response.headers['Cache-Control'] = 'no-store'
    return response
