from pydantic import BaseModel, Field
from typing import Optional, List

class AuthorizeQueryParam(BaseModel):
    response_type: str = Field(..., description="Must be 'code'")
    client_id: str
    redirect_uri: str
    scope: str = "openid profile email"
    state: Optional[str] = None
    code_challenge: str
    code_challenge_method: str = "S256"

class TokenRequest(BaseModel):
    grant_type: str = Field(..., description="'authorization_code' or 'refresh_token'")
    code: Optional[str] = None
    client_id: str
    redirect_uri: Optional[str] = None
    code_verifier: Optional[str] = None
    refresh_token: Optional[str] = None
    client_secret: Optional[str] = None

    @classmethod
    def as_form(
        cls,
        grant_type: str = Field(...),
        code: Optional[str] = None,
        client_id: Optional[str] = None,
        redirect_uri: Optional[str] = None,
        code_verifier: Optional[str] = None,
        refresh_token: Optional[str] = None,
        client_secret: Optional[str] = None,
    ):
        return cls(
            grant_type=grant_type,
            code=code,
            client_id=client_id or "",
            redirect_uri=redirect_uri,
            code_verifier=code_verifier,
            refresh_token=refresh_token,
            client_secret=client_secret,
        )

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "Bearer"
    expires_in: int
    refresh_token: str
    scope: str

class UserInfoResponse(BaseModel):
    sub: str
    name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    image_url: Optional[str] = None

class RevokeTokenRequest(BaseModel):
    token: str
    token_type_hint: Optional[str] = None
    client_id: Optional[str] = None
    client_secret: Optional[str] = None

class OAuthClientCreate(BaseModel):
    client_id: str
    client_name: str
    client_type: str = "public"
    client_secret: Optional[str] = None
    redirect_uris: List[str]
    allowed_scopes: str = "openid profile email"
