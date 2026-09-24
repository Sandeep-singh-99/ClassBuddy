from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from typing import Optional
from app.config.db import get_db
from app.config.config import ACCESS_TOKEN_COOKIE_NAME
from app.models.auth import User
from app.utils.jwt_oauth import decode_oauth_access_token

def extract_token_from_request(request: Request) -> Optional[str]:
    """
    Extracts access token from Authorization Bearer header first (for Android),
    then falls back to access_token HttpOnly cookie (for Web).
    """
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header[7:].strip()
        if token:
            return token

    # Fallback to HttpOnly cookie for Web
    return request.cookies.get(ACCESS_TOKEN_COOKIE_NAME)

def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    """
    Centralized user authentication dependency for both Web and Android.
    Extracts Bearer token or cookie, validates OAuth JWT, verifies user by ID (or email fallback).
    """
    token = extract_token_from_request(request)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"}
        )

    try:
        payload = decode_oauth_access_token(token)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"}
        )

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"}
        )

    sub = payload.get("sub")
    if not sub:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing subject claim",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # Search user by ID first (standard OAuth sub), fallback to email (legacy support)
    user = db.query(User).filter(User.id == sub).first()
    if not user:
        user = db.query(User).filter(User.email == sub).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"}
        )

    return user

def get_optional_current_user(request: Request, db: Session = Depends(get_db)) -> Optional[User]:
    """
    Optional authentication dependency. Returns User if valid token present, otherwise None.
    """
    try:
        return get_current_user(request, db)
    except HTTPException:
        return None