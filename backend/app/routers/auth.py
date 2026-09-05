from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from .. import models
from ..database import get_db
from ..schemas import LoginRequest, UserOut
from ..security import AUTH_COOKIE_NAME, COOKIE_KWARGS, get_current_user, sign_token, verify_password

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=UserOut)
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email.lower().strip()).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token_payload = {"id": user.id, "email": user.email, "name": user.name}
    token = sign_token(token_payload)
    response.set_cookie(AUTH_COOKIE_NAME, token, **COOKIE_KWARGS)
    return token_payload


@router.post("/logout", status_code=204)
def logout(response: Response):
    response.delete_cookie(AUTH_COOKIE_NAME, path="/")
    return None


@router.get("/me", response_model=UserOut)
def me(current_user: dict = Depends(get_current_user)):
    return current_user
