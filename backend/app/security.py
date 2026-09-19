from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import Depends, HTTPException, Request
from sqlalchemy.orm import Session
from .database import get_db
from .models import User

from .config import settings

AUTH_COOKIE_NAME = "crm_token"
JWT_ALGORITHM = "HS256"
TOKEN_TTL = timedelta(days=7)

COOKIE_KWARGS = {
    "httponly": True,
    "samesite": "lax",
    "secure": settings.environment == "production",
    "max_age": int(TOKEN_TTL.total_seconds()),
    "path": "/",
}


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except ValueError:
        return False


def sign_token(payload: dict) -> str:
    to_encode = {**payload, "exp": datetime.now(timezone.utc) + TOKEN_TTL}
    return jwt.encode(to_encode, settings.jwt_secret, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    return jwt.decode(token, settings.jwt_secret, algorithms=[JWT_ALGORITHM])


def get_current_user(request: Request, db: Session = Depends(get_db)) -> dict:
    token = request.cookies.get(AUTH_COOKIE_NAME)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = decode_token(token)
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    user = db.get(User, payload.get("id")) if payload.get("id") else None
    if user is None:
        raise HTTPException(status_code=401, detail="Session no longer valid")
    return {"id": user.id, "email": user.email, "name": user.name}
