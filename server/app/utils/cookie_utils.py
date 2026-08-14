from fastapi import Response
from typing import Optional
from app.config.config import (
    ACCESS_TOKEN_COOKIE_NAME,
    REFRESH_TOKEN_COOKIE_NAME,
    COOKIE_SECURE,
    COOKIE_SAMESITE,
    COOKIE_DOMAIN,
    COOKIE_PATH,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    REFRESH_TOKEN_EXPIRE_DAYS,
)

def set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    """Sets HttpOnly Secure access and refresh token cookies on the response."""
    response.set_cookie(
        key=ACCESS_TOKEN_COOKIE_NAME,
        value=access_token,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        domain=COOKIE_DOMAIN,
        path=COOKIE_PATH,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    response.set_cookie(
        key=REFRESH_TOKEN_COOKIE_NAME,
        value=refresh_token,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        domain=COOKIE_DOMAIN,
        path=COOKIE_PATH,
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600,
    )

def clear_auth_cookies(response: Response) -> None:
    """Deletes HttpOnly access and refresh token cookies from the response."""
    response.delete_cookie(
        key=ACCESS_TOKEN_COOKIE_NAME,
        domain=COOKIE_DOMAIN,
        path=COOKIE_PATH,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        httponly=True,
    )
    response.delete_cookie(
        key=REFRESH_TOKEN_COOKIE_NAME,
        domain=COOKIE_DOMAIN,
        path=COOKIE_PATH,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        httponly=True,
    )
