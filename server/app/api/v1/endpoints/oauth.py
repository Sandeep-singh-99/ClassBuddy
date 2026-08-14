from fastapi import APIRouter, Depends, HTTPException, Request, Response, status, Form
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from typing import Optional
from urllib.parse import urlencode

from app.config.db import get_db
from app.config.config import OAUTH_WEB_CLIENT_ID, REFRESH_TOKEN_COOKIE_NAME
from app.core.rate_limiter import limiter
from app.models.auth import User
from app.schemas.oauth import (
    TokenRequest,
    TokenResponse,
    UserInfoResponse,
    RevokeTokenRequest,
)
from app.services.auth_service import AuthService
from app.services.oauth_service import OAuthService
from app.dependencies.dependencies import get_current_user, get_optional_current_user
from app.utils.cookie_utils import set_auth_cookies, clear_auth_cookies

router = APIRouter()

@router.get("/authorize")
@limiter.limit("20/minute")
def authorize(
    request: Request,
    response_type: str,
    client_id: str,
    redirect_uri: str,
    code_challenge: str,
    code_challenge_method: str = "S256",
    scope: str = "openid profile email",
    state: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """
    OAuth2 Authorization Endpoint.
    Validates client, redirect URI, scope, and S256 PKCE parameters.
    If authenticated, returns 302 redirect with authorization code.
    If unauthenticated, returns JSON with login_required status and OAuth context.
    """
    # 1. Validate PKCE method
    if code_challenge_method.upper() != "S256":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="code_challenge_method must be S256"
        )

    # 2. Validate client and redirect URI
    client = OAuthService.validate_client(
        db=db,
        client_id=client_id,
        redirect_uri=redirect_uri,
        response_type=response_type,
        scope=scope
    )

    # 3. If user is authenticated, issue code and redirect
    if current_user:
        auth_code = OAuthService.create_authorization_code(
            db=db,
            user_id=current_user.id,
            client_id=client_id,
            redirect_uri=redirect_uri,
            scope=scope,
            code_challenge=code_challenge,
            code_challenge_method=code_challenge_method
        )

        params = {"code": auth_code}
        if state:
            params["state"] = state

        redirect_url = f"{redirect_uri}?{urlencode(params)}"
        return RedirectResponse(url=redirect_url, status_code=status.HTTP_307_TEMPORARY_REDIRECT)

    # 4. If unauthenticated, return auth requirement status with context
    return {
        "status": "login_required",
        "client_name": client.client_name,
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "scope": scope,
        "state": state,
        "code_challenge": code_challenge,
        "code_challenge_method": code_challenge_method
    }

@router.post("/authorize/login")
@limiter.limit("10/minute")
def authorize_login(
    request: Request,
    response: Response,
    email: str = Form(...),
    password: str = Form(...),
    client_id: str = Form(...),
    redirect_uri: str = Form(...),
    code_challenge: str = Form(...),
    code_challenge_method: str = Form("S256"),
    scope: str = Form("openid profile email"),
    state: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Authenticates user with ClassBuddy email + password during OAuth authorization,
    and returns authorization code redirect URL.
    """
    if code_challenge_method.upper() != "S256":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="code_challenge_method must be S256"
        )

    # Validate Client
    OAuthService.validate_client(db, client_id, redirect_uri, "code", scope)

    # Authenticate user with existing email/password logic
    db_user = AuthService.authenticate_user(db, email, password)

    # Create authorization code
    auth_code = OAuthService.create_authorization_code(
        db=db,
        user_id=db_user.id,
        client_id=client_id,
        redirect_uri=redirect_uri,
        scope=scope,
        code_challenge=code_challenge,
        code_challenge_method=code_challenge_method
    )

    params = {"code": auth_code}
    if state:
        params["state"] = state

    redirect_url = f"{redirect_uri}?{urlencode(params)}"
    return {
        "redirect_url": redirect_url,
        "code": auth_code,
        "state": state
    }

@router.post("/token", response_model=TokenResponse)
@limiter.limit("20/minute")
async def token(
    request: Request,
    response: Response,
    grant_type: str = Form(...),
    code: Optional[str] = Form(None),
    client_id: str = Form(...),
    redirect_uri: Optional[str] = Form(None),
    code_verifier: Optional[str] = Form(None),
    refresh_token: Optional[str] = Form(None),
    client_secret: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    OAuth2 Token Endpoint.
    Supports authorization_code (with mandatory PKCE S256) and refresh_token (with automatic rotation and reuse detection).
    Sets HttpOnly cookies for Web clients and returns JSON tokens for Android clients.
    """
    token_data = None

    if grant_type == "authorization_code":
        if not code or not redirect_uri or not code_verifier:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="code, redirect_uri, and code_verifier are required for authorization_code grant"
            )
        token_data = OAuthService.exchange_authorization_code(
            db=db,
            code=code,
            client_id=client_id,
            redirect_uri=redirect_uri,
            code_verifier=code_verifier,
            client_secret=client_secret
        )

    elif grant_type == "refresh_token":
        effective_refresh_token = refresh_token or request.cookies.get(REFRESH_TOKEN_COOKIE_NAME)
        if not effective_refresh_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="refresh_token is required for refresh_token grant"
            )
        token_data = OAuthService.exchange_refresh_token(
            db=db,
            refresh_token=effective_refresh_token,
            client_id=client_id,
            client_secret=client_secret
        )

    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported grant_type"
        )

    # For Web clients, set HttpOnly Secure cookies
    if client_id == OAUTH_WEB_CLIENT_ID or client_id == "classbuddy-web":
        set_auth_cookies(
            response=response,
            access_token=token_data["access_token"],
            refresh_token=token_data["refresh_token"]
        )

    return TokenResponse(
        access_token=token_data["access_token"],
        token_type=token_data["token_type"],
        expires_in=token_data["expires_in"],
        refresh_token=token_data["refresh_token"],
        scope=token_data["scope"]
    )

@router.get("/userinfo", response_model=UserInfoResponse)
@limiter.limit("20/minute")
def userinfo(
    request: Request,
    current_user: User = Depends(get_current_user)
):
    """
    OAuth2 UserInfo Endpoint.
    Returns authenticated user profile information based on granted scopes.
    """
    return UserInfoResponse(
        sub=str(current_user.id),
        name=current_user.full_name,
        email=current_user.email,
        role=current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role),
        image_url=current_user.image_url
    )

@router.post("/revoke")
@limiter.limit("20/minute")
def revoke(
    request: Request,
    response: Response,
    token: Optional[str] = Form(None),
    token_type_hint: Optional[str] = Form(None),
    client_id: Optional[str] = Form(None),
    client_secret: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    OAuth2 Token Revocation Endpoint (RFC 7009).
    Revokes refresh tokens and clears HttpOnly cookies.
    """
    effective_token = token or request.cookies.get(REFRESH_TOKEN_COOKIE_NAME)
    if effective_token:
        OAuthService.revoke_token(db, effective_token, client_id)

    clear_auth_cookies(response)
    return {"message": "Token revoked successfully"}

