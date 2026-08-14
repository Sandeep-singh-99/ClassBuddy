from datetime import datetime, timedelta, timezone
import uuid
import jwt
from app.config.config import (
    JWT_SECRET_KEY,
    JWT_PRIVATE_KEY,
    JWT_PUBLIC_KEY,
    JWT_ALGORITHM,
    OAUTH_ISSUER,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)

def create_oauth_access_token(user_id: str, client_id: str, scope: str) -> str:
    """
    Creates a signed OAuth2 JWT access token.
    Claims: sub (User.id), client_id, scope, token_type ('access'), iss, iat, exp, jti
    """
    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    payload = {
        "sub": str(user_id),
        "client_id": client_id,
        "scope": scope,
        "token_type": "access",
        "iss": OAUTH_ISSUER,
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
        "jti": str(uuid.uuid4()),
    }

    if JWT_ALGORITHM == "RS256" and JWT_PRIVATE_KEY:
        return jwt.encode(payload, JWT_PRIVATE_KEY, algorithm="RS256")
    else:
        return jwt.encode(payload, JWT_SECRET_KEY, algorithm="HS256")

def decode_oauth_access_token(token: str) -> dict:
    """
    Decodes and validates an OAuth2 JWT access token.
    Verifies expiration, issuer, and signature.
    """
    key = JWT_PUBLIC_KEY if (JWT_ALGORITHM == "RS256" and JWT_PUBLIC_KEY) else JWT_SECRET_KEY
    algorithm = "RS256" if (JWT_ALGORITHM == "RS256" and JWT_PUBLIC_KEY) else "HS256"
    
    return jwt.decode(
        token,
        key,
        algorithms=[algorithm],
        issuer=OAUTH_ISSUER,
        options={"verify_signature": True, "verify_exp": True, "verify_iss": True}
    )
