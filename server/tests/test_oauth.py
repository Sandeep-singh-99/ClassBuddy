import pytest
import secrets
from fastapi import HTTPException
from app.utils.pkce import generate_pkce_challenge, verify_code_challenge
from app.services.oauth_service import OAuthService
from app.utils.jwt_oauth import decode_oauth_access_token
from app.models.oauth_client import OAuthClient, ClientType
from app.models.oauth_authorization_code import OAuthAuthorizationCode
from app.models.oauth_refresh_token import OAuthRefreshToken
from app.services.oauth_service import _now_utc
from sqlalchemy import event
from sqlalchemy.dialects import postgresql
from datetime import timedelta
import hashlib


def test_pkce_challenge_generation_and_verification():
    """Verify RFC 7636 PKCE S256 challenge generation and constant-time verification."""
    verifier = secrets.token_urlsafe(64)
    challenge = generate_pkce_challenge(verifier)

    # Valid verifier must verify successfully
    assert verify_code_challenge(verifier, challenge, "S256") is True

    # Tampered verifier must fail
    assert verify_code_challenge(verifier + "tampered", challenge, "S256") is False

    # Empty verifier or challenge must fail
    assert verify_code_challenge("", challenge, "S256") is False
    assert verify_code_challenge(verifier, "", "S256") is False

    # Unsupported method must fail
    assert verify_code_challenge(verifier, challenge, "plain") is False


def test_oauth_authorization_code_exchange(db_session, student_user):
    """Test full PKCE OAuth authorization code issuance and successful token exchange."""
    client_id = "test-client-id"
    redirect_uri = "http://localhost:5173/oauth/callback"

    client = OAuthClient(
        client_id=client_id,
        client_name="Test Web App",
        client_type=ClientType.PUBLIC,
        redirect_uris=f'["{redirect_uri}"]',
        allowed_scopes="openid profile email",
        is_active=True,
    )
    db_session.add(client)
    db_session.commit()

    verifier = secrets.token_urlsafe(48)
    challenge = generate_pkce_challenge(verifier)

    # 1. Issue code
    raw_code = OAuthService.create_authorization_code(
        db=db_session,
        user_id=student_user.id,
        client_id=client_id,
        redirect_uri=redirect_uri,
        scope="openid profile",
        code_challenge=challenge,
        code_challenge_method="S256",
    )
    assert raw_code is not None and len(raw_code) > 20

    # 2. Exchange code with valid verifier
    token_response = OAuthService.exchange_authorization_code(
        db=db_session,
        code=raw_code,
        client_id=client_id,
        redirect_uri=redirect_uri,
        code_verifier=verifier,
    )

    assert "access_token" in token_response
    assert "refresh_token" in token_response
    assert token_response["token_type"] == "Bearer"
    assert token_response["scope"] == "openid profile"

    # Decode and verify claims in generated JWT
    decoded_claims = decode_oauth_access_token(token_response["access_token"])
    assert decoded_claims["sub"] == student_user.id
    assert decoded_claims["client_id"] == client_id


def test_oauth_authorization_code_replay_prevention(db_session, student_user):
    """Exchanging an already used authorization code must fail with HTTP 400."""
    client_id = "test-replay-client"
    redirect_uri = "http://localhost:5173/oauth/callback"

    client = OAuthClient(
        client_id=client_id,
        client_name="Replay Test Client",
        client_type=ClientType.PUBLIC,
        redirect_uris=f'["{redirect_uri}"]',
        allowed_scopes="openid",
        is_active=True,
    )
    db_session.add(client)
    db_session.commit()

    verifier = secrets.token_urlsafe(48)
    challenge = generate_pkce_challenge(verifier)

    code = OAuthService.create_authorization_code(
        db=db_session,
        user_id=student_user.id,
        client_id=client_id,
        redirect_uri=redirect_uri,
        scope="openid",
        code_challenge=challenge,
    )

    # First exchange succeeds
    OAuthService.exchange_authorization_code(
        db=db_session,
        code=code,
        client_id=client_id,
        redirect_uri=redirect_uri,
        code_verifier=verifier,
    )

    # Second exchange attempt (replay attack) must raise 400
    with pytest.raises(HTTPException) as exc_info:
        OAuthService.exchange_authorization_code(
            db=db_session,
            code=code,
            client_id=client_id,
            redirect_uri=redirect_uri,
            code_verifier=verifier,
        )
    assert exc_info.value.status_code == 400
    assert "already been used" in exc_info.value.detail


def test_oauth_authorization_code_invalid_verifier(db_session, student_user):
    """Exchanging an authorization code with an invalid PKCE verifier must raise HTTP 400."""
    client_id = "test-pkce-client"
    redirect_uri = "http://localhost:5173/oauth/callback"

    client = OAuthClient(
        client_id=client_id,
        client_name="PKCE Test Client",
        client_type=ClientType.PUBLIC,
        redirect_uris=f'["{redirect_uri}"]',
        allowed_scopes="openid",
        is_active=True,
    )
    db_session.add(client)
    db_session.commit()

    verifier = secrets.token_urlsafe(48)
    challenge = generate_pkce_challenge(verifier)

    code = OAuthService.create_authorization_code(
        db=db_session,
        user_id=student_user.id,
        client_id=client_id,
        redirect_uri=redirect_uri,
        scope="openid",
        code_challenge=challenge,
    )

    # Exchanging with wrong verifier fails
    with pytest.raises(HTTPException) as exc_info:
        OAuthService.exchange_authorization_code(
            db=db_session,
            code=code,
            client_id=client_id,
            redirect_uri=redirect_uri,
            code_verifier="wrong_verifier_string_that_does_not_match_challenge",
        )
    assert exc_info.value.status_code == 400
    assert "Invalid code_verifier" in exc_info.value.detail


def test_oauth_token_revocation_and_reuse_detection(db_session, student_user):
    """Test explicit refresh token revocation and detection of revoked token reuse."""
    client_id = "test-revoke-client"
    redirect_uri = "http://localhost:5173/oauth/callback"

    client = OAuthClient(
        client_id=client_id,
        client_name="Revoke Test Client",
        client_type=ClientType.PUBLIC,
        redirect_uris=f'["{redirect_uri}"]',
        allowed_scopes="openid",
        is_active=True,
    )
    db_session.add(client)
    db_session.commit()

    verifier = secrets.token_urlsafe(48)
    challenge = generate_pkce_challenge(verifier)

    code = OAuthService.create_authorization_code(
        db=db_session,
        user_id=student_user.id,
        client_id=client_id,
        redirect_uri=redirect_uri,
        scope="openid",
        code_challenge=challenge,
    )

    tokens = OAuthService.exchange_authorization_code(
        db=db_session,
        code=code,
        client_id=client_id,
        redirect_uri=redirect_uri,
        code_verifier=verifier,
    )
    refresh_token = tokens["refresh_token"]

    # 1. Explicit revocation succeeds
    revoked = OAuthService.revoke_token(db=db_session, token=refresh_token)
    assert revoked is True

    # 2. Revoking an already revoked token returns False
    second_revoke = OAuthService.revoke_token(db=db_session, token=refresh_token)
    assert second_revoke is False

    # 3. Presenting revoked refresh token triggers token family revocation and raises 401
    with pytest.raises(HTTPException) as exc_info:
        OAuthService.exchange_refresh_token(
            db=db_session,
            refresh_token=refresh_token,
            client_id=client_id,
        )
    assert exc_info.value.status_code == 401
    assert "Refresh token reuse detected" in exc_info.value.detail


@pytest.mark.parametrize("credential_type", ["code", "refresh"])
def test_exchange_locks_and_refreshes_cached_credentials(
    db_session, student_user, credential_type
):
    """A previously loaded credential must not hide consumption in the database."""
    raw = secrets.token_urlsafe(48)
    verifier = secrets.token_urlsafe(48)
    common = {
        "user_id": student_user.id,
        "client_id": "lock-test-client",
        "scope": "openid",
        "expires_at": _now_utc() + timedelta(minutes=10),
    }
    if credential_type == "code":
        model = OAuthAuthorizationCode
        record = model(
            **common,
            code_hash=hashlib.sha256(raw.encode()).hexdigest(),
            redirect_uri="http://localhost/callback",
            code_challenge=generate_pkce_challenge(verifier),
            code_challenge_method="S256",
            used=False,
        )
        consumed = {"used": True}
    else:
        model = OAuthRefreshToken
        record = model(
            **common,
            token_hash=hashlib.sha256(raw.encode()).hexdigest(),
            family_id="lock-test-family",
        )
        consumed = {"revoked_at": _now_utc()}

    db_session.add(record)
    db_session.commit()
    record_id = record.id
    # Change the database without updating the cached object, as another request would.
    db_session.query(model).filter(model.id == record_id).update(
        consumed, synchronize_session=False
    )
    if credential_type == "code":
        assert record.used is False
    else:
        assert record.revoked_at is None

    statements = []

    def capture_query(state):
        if state.is_select:
            statements.append(str(state.statement.compile(dialect=postgresql.dialect())))

    event.listen(db_session, "do_orm_execute", capture_query)
    try:
        with pytest.raises(HTTPException) as exc_info:
            if credential_type == "code":
                OAuthService.exchange_authorization_code(
                    db_session, raw, common["client_id"], "http://localhost/callback", verifier
                )
            else:
                OAuthService.exchange_refresh_token(db_session, raw, common["client_id"])
    finally:
        event.remove(db_session, "do_orm_execute", capture_query)

    assert "FOR UPDATE" in statements[0]
    assert exc_info.value.status_code == (400 if credential_type == "code" else 401)
    assert db_session.query(OAuthRefreshToken).count() == (0 if credential_type == "code" else 1)
