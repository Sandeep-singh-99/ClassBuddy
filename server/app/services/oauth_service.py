# from datetime import datetime, timedelta, timezone
# import hashlib
# import json
# import secrets
# import uuid
# from typing import Optional, List, Tuple
# from sqlalchemy.orm import Session
# from fastapi import HTTPException, status

# from app.models.oauth_client import OAuthClient, ClientType
# from app.models.oauth_authorization_code import OAuthAuthorizationCode
# from app.models.oauth_refresh_token import OAuthRefreshToken
# from app.models.auth import User
# from app.utils.pkce import verify_code_challenge
# from app.utils.jwt_oauth import create_oauth_access_token
# from app.utils.utils import hash_password, verify_password
# from app.config.config import (
#     OAUTH_WEB_CLIENT_ID,
#     OAUTH_WEB_REDIRECT_URI,
#     OAUTH_ANDROID_CLIENT_ID,
#     OAUTH_ANDROID_REDIRECT_URI,
#     ACCESS_TOKEN_EXPIRE_MINUTES,
#     REFRESH_TOKEN_EXPIRE_DAYS,
# )
# from app.core.logger import logger

# def _now_utc() -> datetime:
#     return datetime.now(timezone.utc).replace(tzinfo=None)

# class OAuthService:
#     @staticmethod
#     def get_or_create_default_clients(db: Session):
#         """Ensures the default Web and Android OAuth clients exist in the database."""
#         # 1. Web Client
#         web_client = db.query(OAuthClient).filter(OAuthClient.client_id == OAUTH_WEB_CLIENT_ID).first()
#         if not web_client:
#             web_client = OAuthClient(
#                 client_id=OAUTH_WEB_CLIENT_ID,
#                 client_name="ClassBuddy Web Client",
#                 client_type=ClientType.PUBLIC,
#                 redirect_uris=json.dumps([OAUTH_WEB_REDIRECT_URI, "http://localhost:5173/oauth/callback", "http://127.0.0.1:5173/oauth/callback"]),
#                 allowed_scopes="openid profile email",
#                 is_active=True,
#             )
#             db.add(web_client)

#         # 2. Android Client (Public client - no secret)
#         android_client = db.query(OAuthClient).filter(OAuthClient.client_id == OAUTH_ANDROID_CLIENT_ID).first()
#         if not android_client:
#             android_client = OAuthClient(
#                 client_id=OAUTH_ANDROID_CLIENT_ID,
#                 client_name="ClassBuddy Android Client",
#                 client_type=ClientType.PUBLIC,
#                 redirect_uris=json.dumps([OAUTH_ANDROID_REDIRECT_URI, "classbuddy://oauth/callback", "com.classbuddy.app://oauth/callback"]),
#                 allowed_scopes="openid profile email",
#                 is_active=True,
#             )
#             db.add(android_client)

#         db.commit()

#     @staticmethod
#     def _parse_redirect_uris(raw_uris: str) -> List[str]:
#         """Parses redirect URIs whether stored as JSON string or comma-separated string."""
#         if not raw_uris:
#             return []
#         try:
#             parsed = json.loads(raw_uris)
#             if isinstance(parsed, list):
#                 return parsed
#         except Exception:
#             pass
#         return [u.strip() for u in raw_uris.split(",") if u.strip()]

#     @staticmethod
#     def validate_client(db: Session, client_id: str, redirect_uri: str, response_type: Optional[str] = "code", scope: Optional[str] = None) -> OAuthClient:
#         """Validates client ID, active status, response type, redirect URI, and scopes."""
#         OAuthService.get_or_create_default_clients(db)
        
#         client = db.query(OAuthClient).filter(OAuthClient.client_id == client_id).first()
#         if not client or not client.is_active:
#             raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or inactive client_id")

#         if response_type and response_type != "code":
#             raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported response_type. Only 'code' is supported.")

#         allowed_uris = OAuthService._parse_redirect_uris(client.redirect_uris)
#         if redirect_uri not in allowed_uris:
#             logger.warning(f"Redirect URI mismatch for client {client_id}: {redirect_uri} not in {allowed_uris}")
#             raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid redirect_uri for this client")

#         if scope:
#             allowed_scopes_set = set(client.allowed_scopes.split())
#             requested_scopes_set = set(scope.split())
#             if not requested_scopes_set.issubset(allowed_scopes_set):
#                 raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Requested scope exceeds client allowed scopes")

#         return client

#     @staticmethod
#     def create_authorization_code(
#         db: Session,
#         user_id: str,
#         client_id: str,
#         redirect_uri: str,
#         scope: str,
#         code_challenge: str,
#         code_challenge_method: str = "S256"
#     ) -> str:
#         """Generates and stores a single-use authorization code (hashed in DB)."""
#         raw_code = secrets.token_urlsafe(32)
#         code_hash = hashlib.sha256(raw_code.encode("utf-8")).hexdigest()
#         expires_at = _now_utc() + timedelta(minutes=10)

#         auth_code_record = OAuthAuthorizationCode(
#             code_hash=code_hash,
#             client_id=client_id,
#             user_id=user_id,
#             redirect_uri=redirect_uri,
#             scope=scope,
#             code_challenge=code_challenge,
#             code_challenge_method=code_challenge_method,
#             expires_at=expires_at,
#             used=False
#         )

#         db.add(auth_code_record)
#         db.commit()

#         return raw_code

#     @staticmethod
#     def exchange_authorization_code(
#         db: Session,
#         code: str,
#         client_id: str,
#         redirect_uri: str,
#         code_verifier: str,
#         client_secret: Optional[str] = None
#     ) -> dict:
#         """
#         Exchanges an authorization code and PKCE verifier for access + refresh tokens.
#         Includes single-use and code replay enforcement.
#         """
#         code_hash = hashlib.sha256(code.encode("utf-8")).hexdigest()
#         code_record = db.query(OAuthAuthorizationCode).filter(OAuthAuthorizationCode.code_hash == code_hash).first()

#         if not code_record:
#             raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid authorization code")

#         # Code Replay Protection
#         if code_record.used:
#             logger.error(f"SECURITY ALERT: Authorization code reuse attempt for code ID {code_record.id}")
#             raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Authorization code has already been used")

#         # Expiry check
#         if code_record.expires_at < _now_utc():
#             raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Authorization code has expired")

#         # Client and Redirect URI binding checks
#         if code_record.client_id != client_id:
#             raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Client ID mismatch")

#         if code_record.redirect_uri != redirect_uri:
#             raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Redirect URI mismatch")

#         # Confidential Client Secret Check
#         client = db.query(OAuthClient).filter(OAuthClient.client_id == client_id).first()
#         if client and client.client_type == ClientType.CONFIDENTIAL:
#             if not client_secret or not client.client_secret_hash or not verify_password(client_secret, client.client_secret_hash):
#                 raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid client secret")

#         # PKCE Verification
#         if not code_verifier:
#             raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="code_verifier is required for PKCE")

#         if not verify_code_challenge(code_verifier, code_record.code_challenge, code_record.code_challenge_method):
#             raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid code_verifier")

#         # Mark code as used immediately
#         code_record.used = True

#         # Generate JWT Access Token using User.id as sub
#         access_token = create_oauth_access_token(
#             user_id=code_record.user_id,
#             client_id=client_id,
#             scope=code_record.scope
#         )

#         # Generate opaque Refresh Token and store hash with new family_id
#         raw_refresh_token = secrets.token_urlsafe(48)
#         refresh_token_hash = hashlib.sha256(raw_refresh_token.encode("utf-8")).hexdigest()
#         family_id = str(uuid.uuid4())
#         refresh_expires_at = _now_utc() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)

#         db_refresh_token = OAuthRefreshToken(
#             token_hash=refresh_token_hash,
#             user_id=code_record.user_id,
#             client_id=client_id,
#             scope=code_record.scope,
#             family_id=family_id,
#             expires_at=refresh_expires_at,
#         )

#         db.add(db_refresh_token)
#         db.commit()

#         return {
#             "access_token": access_token,
#             "token_type": "Bearer",
#             "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
#             "refresh_token": raw_refresh_token,
#             "scope": code_record.scope
#         }

#     @staticmethod
#     def exchange_refresh_token(
#         db: Session,
#         refresh_token: str,
#         client_id: str,
#         client_secret: Optional[str] = None
#     ) -> dict:
#         """
#         Rotates refresh token and issues new access token.
#         Detects token reuse: if a revoked or replaced refresh token is presented,
#         revokes the entire token family!
#         """
#         token_hash = hashlib.sha256(refresh_token.encode("utf-8")).hexdigest()
#         token_record = db.query(OAuthRefreshToken).filter(OAuthRefreshToken.token_hash == token_hash).first()

#         if not token_record:
#             raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid refresh token")

#         # TOKEN REUSE DETECTION
#         if token_record.revoked_at is not None or token_record.replaced_by is not None:
#             logger.error(f"SECURITY REVOCATION: Refresh token reuse detected for family {token_record.family_id}")
#             # Revoke all tokens in family
#             db.query(OAuthRefreshToken).filter(
#                 OAuthRefreshToken.family_id == token_record.family_id,
#                 OAuthRefreshToken.revoked_at.is_(None)
#             ).update({"revoked_at": _now_utc()}, synchronize_session=False)
#             db.commit()
#             raise HTTPException(
#                 status_code=status.HTTP_401_UNAUTHORIZED,
#                 detail="Security revocation triggered: Refresh token reuse detected. Please log in again."
#             )

#         if token_record.expires_at < _now_utc():
#             raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Expired refresh token")

#         if token_record.client_id != client_id:
#             raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Client ID mismatch")

#         # Confidential Client verification
#         client = db.query(OAuthClient).filter(OAuthClient.client_id == client_id).first()
#         if client and client.client_type == ClientType.CONFIDENTIAL:
#             if not client_secret or not client.client_secret_hash or not verify_password(client_secret, client.client_secret_hash):
#                 raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid client secret")

#         # Mark current token as revoked
#         token_record.revoked_at = _now_utc()

#         # Issue new access token
#         access_token = create_oauth_access_token(
#             user_id=token_record.user_id,
#             client_id=client_id,
#             scope=token_record.scope
#         )

#         # Issue new refresh token in SAME family
#         new_raw_refresh_token = secrets.token_urlsafe(48)
#         new_refresh_token_hash = hashlib.sha256(new_raw_refresh_token.encode("utf-8")).hexdigest()
#         refresh_expires_at = _now_utc() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)

#         new_refresh_token_record = OAuthRefreshToken(
#             token_hash=new_refresh_token_hash,
#             user_id=token_record.user_id,
#             client_id=client_id,
#             scope=token_record.scope,
#             family_id=token_record.family_id,
#             expires_at=refresh_expires_at,
#         )

#         db.add(new_refresh_token_record)
#         db.flush()

#         token_record.replaced_by = new_refresh_token_record.id
#         db.commit()

#         return {
#             "access_token": access_token,
#             "token_type": "Bearer",
#             "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
#             "refresh_token": new_raw_refresh_token,
#             "scope": token_record.scope
#         }

#     @staticmethod
#     def revoke_token(db: Session, token: str, client_id: Optional[str] = None) -> bool:
#         """Revokes a refresh token by hashing it and setting revoked_at."""
#         token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()
#         token_record = db.query(OAuthRefreshToken).filter(OAuthRefreshToken.token_hash == token_hash).first()
#         if token_record and token_record.revoked_at is None:
#             token_record.revoked_at = _now_utc()
#             db.commit()
#             return True
#         return False





from datetime import datetime, timedelta, timezone
import hashlib
import json
import secrets
import uuid
from typing import Optional, List

from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.oauth_client import OAuthClient, ClientType
from app.models.oauth_authorization_code import OAuthAuthorizationCode
from app.models.oauth_refresh_token import OAuthRefreshToken
from app.models.auth import User

from app.utils.pkce import verify_code_challenge
from app.utils.jwt_oauth import create_oauth_access_token
from app.utils.utils import verify_password

from app.config.config import (
    OAUTH_WEB_CLIENT_ID,
    OAUTH_WEB_REDIRECT_URI,
    OAUTH_ANDROID_CLIENT_ID,
    OAUTH_ANDROID_REDIRECT_URI,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    REFRESH_TOKEN_EXPIRE_DAYS,
)

from app.core.logger import logger


def _now_utc() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


class OAuthService:

    @staticmethod
    def get_or_create_default_clients(db: Session):
        """
        Ensure default OAuth clients exist and their environment-configured
        redirect URIs are synchronized with the database.
        """

        # =========================================================
        # Web Client
        # =========================================================

        web_redirect_uris = list(
            dict.fromkeys(
                [
                    OAUTH_WEB_REDIRECT_URI,
                    "http://localhost:5173/oauth/callback",
                    "http://127.0.0.1:5173/oauth/callback",
                ]
            )
        )

        web_client = (
            db.query(OAuthClient)
            .filter(
                OAuthClient.client_id == OAUTH_WEB_CLIENT_ID
            )
            .first()
        )

        if not web_client:
            web_client = OAuthClient(
                client_id=OAUTH_WEB_CLIENT_ID,
                client_name="ClassBuddy Web Client",
                client_type=ClientType.PUBLIC,
                redirect_uris=json.dumps(web_redirect_uris),
                allowed_scopes="openid profile email",
                is_active=True,
            )

            db.add(web_client)

        else:
            existing_uris = OAuthService._parse_redirect_uris(
                web_client.redirect_uris
            )

            merged_uris = list(
                dict.fromkeys(
                    existing_uris + web_redirect_uris
                )
            )

            if merged_uris != existing_uris:
                web_client.redirect_uris = json.dumps(
                    merged_uris
                )

        # =========================================================
        # Android Client
        # =========================================================

        android_redirect_uris = list(
            dict.fromkeys(
                [
                    OAUTH_ANDROID_REDIRECT_URI,
                    "classbuddy://oauth/callback",
                    "com.classbuddy.app://oauth/callback",
                ]
            )
        )

        android_client = (
            db.query(OAuthClient)
            .filter(
                OAuthClient.client_id == OAUTH_ANDROID_CLIENT_ID
            )
            .first()
        )

        if not android_client:
            android_client = OAuthClient(
                client_id=OAUTH_ANDROID_CLIENT_ID,
                client_name="ClassBuddy Android Client",
                client_type=ClientType.PUBLIC,
                redirect_uris=json.dumps(
                    android_redirect_uris
                ),
                allowed_scopes="openid profile email",
                is_active=True,
            )

            db.add(android_client)

        else:
            existing_uris = OAuthService._parse_redirect_uris(
                android_client.redirect_uris
            )

            merged_uris = list(
                dict.fromkeys(
                    existing_uris + android_redirect_uris
                )
            )

            if merged_uris != existing_uris:
                android_client.redirect_uris = json.dumps(
                    merged_uris
                )

        db.commit()

    # =============================================================
    # Parse Redirect URIs
    # =============================================================

    @staticmethod
    def _parse_redirect_uris(
        raw_uris: str,
    ) -> List[str]:
        """
        Parse redirect URIs whether stored as JSON
        string or comma-separated string.
        """

        if not raw_uris:
            return []

        try:
            parsed = json.loads(raw_uris)

            if isinstance(parsed, list):
                return parsed

        except Exception:
            pass

        return [
            uri.strip()
            for uri in raw_uris.split(",")
            if uri.strip()
        ]

    # =============================================================
    # Validate OAuth Client
    # =============================================================

    @staticmethod
    def validate_client(
        db: Session,
        client_id: str,
        redirect_uri: str,
        response_type: Optional[str] = "code",
        scope: Optional[str] = None,
    ) -> OAuthClient:
        """
        Validate OAuth client ID, active status, response type,
        redirect URI, and requested scopes.
        """

        # Make sure default clients exist/sync with environment
        OAuthService.get_or_create_default_clients(db)

        client = (
            db.query(OAuthClient)
            .filter(
                OAuthClient.client_id == client_id
            )
            .first()
        )

        if not client or not client.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or inactive client_id",
            )

        # ---------------------------------------------------------
        # Response Type
        # ---------------------------------------------------------

        if response_type and response_type != "code":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Unsupported response_type. "
                    "Only 'code' is supported."
                ),
            )

        # ---------------------------------------------------------
        # Redirect URI
        # ---------------------------------------------------------

        allowed_uris = OAuthService._parse_redirect_uris(
            client.redirect_uris
        )

        if redirect_uri not in allowed_uris:
            logger.warning(
                f"Redirect URI mismatch for client "
                f"{client_id}: {redirect_uri} "
                f"not in {allowed_uris}"
            )

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid redirect_uri for this client",
            )

        # ---------------------------------------------------------
        # Scope
        # ---------------------------------------------------------

        if scope:
            allowed_scopes_set = set(
                client.allowed_scopes.split()
            )

            requested_scopes_set = set(
                scope.split()
            )

            if not requested_scopes_set.issubset(
                allowed_scopes_set
            ):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        "Requested scope exceeds "
                        "client allowed scopes"
                    ),
                )

        return client

    # =============================================================
    # Create Authorization Code
    # =============================================================

    @staticmethod
    def create_authorization_code(
        db: Session,
        user_id: str,
        client_id: str,
        redirect_uri: str,
        scope: str,
        code_challenge: str,
        code_challenge_method: str = "S256",
    ) -> str:
        """
        Generate and store a single-use authorization code.
        Only the SHA256 hash is stored in the database.
        """

        raw_code = secrets.token_urlsafe(32)

        code_hash = hashlib.sha256(
            raw_code.encode("utf-8")
        ).hexdigest()

        expires_at = (
            _now_utc() + timedelta(minutes=10)
        )

        auth_code_record = OAuthAuthorizationCode(
            code_hash=code_hash,
            client_id=client_id,
            user_id=user_id,
            redirect_uri=redirect_uri,
            scope=scope,
            code_challenge=code_challenge,
            code_challenge_method=code_challenge_method,
            expires_at=expires_at,
            used=False,
        )

        db.add(auth_code_record)
        db.commit()

        return raw_code

    # =============================================================
    # Exchange Authorization Code
    # =============================================================

    @staticmethod
    def exchange_authorization_code(
        db: Session,
        code: str,
        client_id: str,
        redirect_uri: str,
        code_verifier: str,
        client_secret: Optional[str] = None,
    ) -> dict:
        """
        Exchange authorization code + PKCE verifier
        for access and refresh tokens.
        """

        code_hash = hashlib.sha256(
            code.encode("utf-8")
        ).hexdigest()

        code_record = (
            db.query(OAuthAuthorizationCode)
            .filter(
                OAuthAuthorizationCode.code_hash
                == code_hash
            )
            .first()
        )

        if not code_record:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid authorization code",
            )

        # ---------------------------------------------------------
        # Code Replay Protection
        # ---------------------------------------------------------

        if code_record.used:
            logger.error(
                "SECURITY ALERT: Authorization code "
                f"reuse attempt for code ID "
                f"{code_record.id}"
            )

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Authorization code has already been used",
            )

        # ---------------------------------------------------------
        # Expiration
        # ---------------------------------------------------------

        if code_record.expires_at < _now_utc():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Authorization code has expired",
            )

        # ---------------------------------------------------------
        # Client Binding
        # ---------------------------------------------------------

        if code_record.client_id != client_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Client ID mismatch",
            )

        # ---------------------------------------------------------
        # Redirect URI Binding
        # ---------------------------------------------------------

        if code_record.redirect_uri != redirect_uri:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Redirect URI mismatch",
            )

        # ---------------------------------------------------------
        # Confidential Client Secret
        # ---------------------------------------------------------

        client = (
            db.query(OAuthClient)
            .filter(
                OAuthClient.client_id == client_id
            )
            .first()
        )

        if (
            client
            and client.client_type
            == ClientType.CONFIDENTIAL
        ):
            if (
                not client_secret
                or not client.client_secret_hash
                or not verify_password(
                    client_secret,
                    client.client_secret_hash,
                )
            ):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid client secret",
                )

        # ---------------------------------------------------------
        # PKCE Verification
        # ---------------------------------------------------------

        if not code_verifier:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="code_verifier is required for PKCE",
            )

        if not verify_code_challenge(
            code_verifier,
            code_record.code_challenge,
            code_record.code_challenge_method,
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid code_verifier",
            )

        # ---------------------------------------------------------
        # Mark Authorization Code as Used
        # ---------------------------------------------------------

        code_record.used = True

        # ---------------------------------------------------------
        # Create Access Token
        # ---------------------------------------------------------

        access_token = create_oauth_access_token(
            user_id=code_record.user_id,
            client_id=client_id,
            scope=code_record.scope,
        )

        # ---------------------------------------------------------
        # Create Refresh Token
        # ---------------------------------------------------------

        raw_refresh_token = secrets.token_urlsafe(48)

        refresh_token_hash = hashlib.sha256(
            raw_refresh_token.encode("utf-8")
        ).hexdigest()

        family_id = str(uuid.uuid4())

        refresh_expires_at = (
            _now_utc()
            + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        )

        db_refresh_token = OAuthRefreshToken(
            token_hash=refresh_token_hash,
            user_id=code_record.user_id,
            client_id=client_id,
            scope=code_record.scope,
            family_id=family_id,
            expires_at=refresh_expires_at,
        )

        db.add(db_refresh_token)
        db.commit()

        return {
            "access_token": access_token,
            "token_type": "Bearer",
            "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "refresh_token": raw_refresh_token,
            "scope": code_record.scope,
        }

    # =============================================================
    # Exchange Refresh Token
    # =============================================================

    @staticmethod
    def exchange_refresh_token(
        db: Session,
        refresh_token: str,
        client_id: str,
        client_secret: Optional[str] = None,
    ) -> dict:
        """
        Rotate refresh token and issue a new access token.

        Detects refresh token reuse and revokes
        the entire token family.
        """

        token_hash = hashlib.sha256(
            refresh_token.encode("utf-8")
        ).hexdigest()

        token_record = (
            db.query(OAuthRefreshToken)
            .filter(
                OAuthRefreshToken.token_hash
                == token_hash
            )
            .first()
        )

        if not token_record:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid refresh token",
            )

        # ---------------------------------------------------------
        # Refresh Token Reuse Detection
        # ---------------------------------------------------------

        if (
            token_record.revoked_at is not None
            or token_record.replaced_by is not None
        ):
            logger.error(
                "SECURITY REVOCATION: Refresh token "
                f"reuse detected for family "
                f"{token_record.family_id}"
            )

            db.query(OAuthRefreshToken).filter(
                OAuthRefreshToken.family_id
                == token_record.family_id,
                OAuthRefreshToken.revoked_at.is_(None),
            ).update(
                {
                    "revoked_at": _now_utc()
                },
                synchronize_session=False,
            )

            db.commit()

            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=(
                    "Security revocation triggered: "
                    "Refresh token reuse detected. "
                    "Please log in again."
                ),
            )

        # ---------------------------------------------------------
        # Expiration
        # ---------------------------------------------------------

        if token_record.expires_at < _now_utc():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Expired refresh token",
            )

        # ---------------------------------------------------------
        # Client Binding
        # ---------------------------------------------------------

        if token_record.client_id != client_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Client ID mismatch",
            )

        # ---------------------------------------------------------
        # Confidential Client
        # ---------------------------------------------------------

        client = (
            db.query(OAuthClient)
            .filter(
                OAuthClient.client_id == client_id
            )
            .first()
        )

        if (
            client
            and client.client_type
            == ClientType.CONFIDENTIAL
        ):
            if (
                not client_secret
                or not client.client_secret_hash
                or not verify_password(
                    client_secret,
                    client.client_secret_hash,
                )
            ):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid client secret",
                )

        # ---------------------------------------------------------
        # Revoke Current Refresh Token
        # ---------------------------------------------------------

        token_record.revoked_at = _now_utc()

        # ---------------------------------------------------------
        # New Access Token
        # ---------------------------------------------------------

        access_token = create_oauth_access_token(
            user_id=token_record.user_id,
            client_id=client_id,
            scope=token_record.scope,
        )

        # ---------------------------------------------------------
        # New Refresh Token
        # ---------------------------------------------------------

        new_raw_refresh_token = secrets.token_urlsafe(48)

        new_refresh_token_hash = hashlib.sha256(
            new_raw_refresh_token.encode("utf-8")
        ).hexdigest()

        refresh_expires_at = (
            _now_utc()
            + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        )

        new_refresh_token_record = OAuthRefreshToken(
            token_hash=new_refresh_token_hash,
            user_id=token_record.user_id,
            client_id=client_id,
            scope=token_record.scope,
            family_id=token_record.family_id,
            expires_at=refresh_expires_at,
        )

        db.add(new_refresh_token_record)
        db.flush()

        token_record.replaced_by = (
            new_refresh_token_record.id
        )

        db.commit()

        return {
            "access_token": access_token,
            "token_type": "Bearer",
            "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "refresh_token": new_raw_refresh_token,
            "scope": token_record.scope,
        }

    # =============================================================
    # Revoke Token
    # =============================================================

    @staticmethod
    def revoke_token(
        db: Session,
        token: str,
        client_id: Optional[str] = None,
    ) -> bool:
        """
        Revoke a refresh token by hashing it
        and setting revoked_at.
        """

        token_hash = hashlib.sha256(
            token.encode("utf-8")
        ).hexdigest()

        token_record = (
            db.query(OAuthRefreshToken)
            .filter(
                OAuthRefreshToken.token_hash
                == token_hash
            )
            .first()
        )

        if (
            token_record
            and token_record.revoked_at is None
        ):
            token_record.revoked_at = _now_utc()
            db.commit()

            return True

        return False