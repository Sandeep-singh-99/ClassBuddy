import pytest
from app.utils.pkce import generate_pkce_challenge
from app.utils.utils import hash_password
from app.models.auth import User, userRole

def test_web_oauth_flow_cookies(client, db_session):
    """
    Tests complete OAuth2 PKCE flow for WEB client:
    - Token endpoint sets HttpOnly cookies
    - Userinfo endpoint authenticates via HttpOnly cookie
    - Refresh token grant reads refresh token from cookie and updates cookies
    - Revoke endpoint revokes refresh token and deletes cookies
    """
    # 1. Create a test user
    test_user = User(
        full_name="Web OAuth User",
        email="web_oauth@example.com",
        hashed_password=hash_password("webpassword123"),
        role=userRole.STUDENT
    )
    db_session.add(test_user)
    db_session.commit()

    code_verifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"
    code_challenge = generate_pkce_challenge(code_verifier)
    client_id = "classbuddy-web"
    redirect_uri = "http://localhost:5173/oauth/callback"

    # 2. Authenticate user during authorization step
    login_resp = client.post(
        "/api/v1/oauth/authorize/login",
        data={
            "email": "web_oauth@example.com",
            "password": "webpassword123",
            "client_id": client_id,
            "redirect_uri": redirect_uri,
            "code_challenge": code_challenge,
            "code_challenge_method": "S256",
            "scope": "openid profile email",
            "state": "web_test_state"
        }
    )
    assert login_resp.status_code == 200
    res_data = login_resp.json()
    assert "code" in res_data
    auth_code = res_data["code"]

    # 3. Exchange Authorization Code for Tokens
    token_resp = client.post(
        "/api/v1/oauth/token",
        data={
            "grant_type": "authorization_code",
            "code": auth_code,
            "client_id": client_id,
            "redirect_uri": redirect_uri,
            "code_verifier": code_verifier
        }
    )
    assert token_resp.status_code == 200
    # Verify HttpOnly cookies set on response
    assert "access_token" in token_resp.cookies
    assert "refresh_token" in token_resp.cookies

    access_token_cookie = token_resp.cookies["access_token"]
    refresh_token_cookie = token_resp.cookies["refresh_token"]
    assert access_token_cookie is not None
    assert refresh_token_cookie is not None

    # 4. Access protected /userinfo endpoint using Cookie (no Bearer header)
    client.cookies = token_resp.cookies
    userinfo_resp = client.get("/api/v1/oauth/userinfo")
    assert userinfo_resp.status_code == 200
    userinfo = userinfo_resp.json()
    assert userinfo["sub"] == str(test_user.id)
    assert userinfo["email"] == "web_oauth@example.com"

    # 5. Refresh token using cookie
    refresh_resp = client.post(
        "/api/v1/oauth/token",
        data={
            "grant_type": "refresh_token",
            "client_id": client_id
        }
    )
    assert refresh_resp.status_code == 200
    assert "access_token" in refresh_resp.cookies
    assert "refresh_token" in refresh_resp.cookies
    assert refresh_resp.cookies["access_token"] != access_token_cookie

    # 6. Revoke token and clear cookies
    client.cookies = refresh_resp.cookies
    revoke_resp = client.post(
        "/api/v1/oauth/revoke",
        data={"client_id": client_id}
    )
    assert revoke_resp.status_code == 200
    assert revoke_resp.json()["message"] == "Token revoked successfully"

def test_android_oauth_flow_json(client, db_session):
    """
    Tests complete OAuth2 PKCE flow for ANDROID public client:
    - Returns JSON access and refresh tokens
    - Authenticates userinfo with Authorization: Bearer <access_token>
    - Refreshes token via JSON refresh_token parameter
    """
    test_user = User(
        full_name="Android OAuth User",
        email="android_oauth@example.com",
        hashed_password=hash_password("androidpassword123"),
        role=userRole.STUDENT
    )
    db_session.add(test_user)
    db_session.commit()

    code_verifier = "eGjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXm"
    code_challenge = generate_pkce_challenge(code_verifier)
    client_id = "classbuddy-android"
    redirect_uri = "classbuddy://oauth/callback"

    # 1. Authorize Login
    login_resp = client.post(
        "/api/v1/oauth/authorize/login",
        data={
            "email": "android_oauth@example.com",
            "password": "androidpassword123",
            "client_id": client_id,
            "redirect_uri": redirect_uri,
            "code_challenge": code_challenge,
            "code_challenge_method": "S256",
            "scope": "openid profile email",
            "state": "android_state"
        }
    )
    assert login_resp.status_code == 200
    auth_code = login_resp.json()["code"]

    # 2. Token Exchange (Public client - no client secret)
    token_resp = client.post(
        "/api/v1/oauth/token",
        data={
            "grant_type": "authorization_code",
            "code": auth_code,
            "client_id": client_id,
            "redirect_uri": redirect_uri,
            "code_verifier": code_verifier
        }
    )
    assert token_resp.status_code == 200
    tokens = token_resp.json()
    assert "access_token" in tokens
    assert "refresh_token" in tokens
    assert tokens["token_type"] == "Bearer"

    access_token = tokens["access_token"]
    refresh_token = tokens["refresh_token"]

    # 3. Userinfo via Bearer header
    userinfo_resp = client.get(
        "/api/v1/oauth/userinfo",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    assert userinfo_resp.status_code == 200
    assert userinfo_resp.json()["sub"] == str(test_user.id)

    # 4. Refresh token via JSON param
    refresh_resp = client.post(
        "/api/v1/oauth/token",
        data={
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
            "client_id": client_id
        }
    )
    assert refresh_resp.status_code == 200
    new_tokens = refresh_resp.json()
    assert new_tokens["access_token"] != access_token
    assert new_tokens["refresh_token"] != refresh_token

def test_refresh_token_reuse_detection(client, db_session):
    """
    Tests security reuse detection:
    When an old refresh token is reused, the entire token family must be revoked.
    """
    test_user = User(
        full_name="Reuse Test User",
        email="reuse_test@example.com",
        hashed_password=hash_password("password123"),
        role=userRole.STUDENT
    )
    db_session.add(test_user)
    db_session.commit()

    code_verifier = "fGjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXn"
    code_challenge = generate_pkce_challenge(code_verifier)
    client_id = "classbuddy-web"
    redirect_uri = "http://localhost:5173/oauth/callback"

    # Login and token exchange
    login_resp = client.post(
        "/api/v1/oauth/authorize/login",
        data={
            "email": "reuse_test@example.com",
            "password": "password123",
            "client_id": client_id,
            "redirect_uri": redirect_uri,
            "code_challenge": code_challenge,
            "code_challenge_method": "S256",
            "scope": "openid profile email"
        }
    )
    auth_code = login_resp.json()["code"]

    token_resp = client.post(
        "/api/v1/oauth/token",
        data={
            "grant_type": "authorization_code",
            "code": auth_code,
            "client_id": client_id,
            "redirect_uri": redirect_uri,
            "code_verifier": code_verifier
        }
    )
    initial_refresh_token = token_resp.json()["refresh_token"]

    # First refresh (Valid)
    refresh_1 = client.post(
        "/api/v1/oauth/token",
        data={
            "grant_type": "refresh_token",
            "refresh_token": initial_refresh_token,
            "client_id": client_id
        }
    )
    assert refresh_1.status_code == 200
    new_refresh_token = refresh_1.json()["refresh_token"]

    # Re-use initial_refresh_token (MUST trigger family revocation)
    reuse_resp = client.post(
        "/api/v1/oauth/token",
        data={
            "grant_type": "refresh_token",
            "refresh_token": initial_refresh_token,
            "client_id": client_id
        }
    )
    assert reuse_resp.status_code == 401
    assert "Security revocation triggered" in reuse_resp.json()["detail"]

    # Verify that new_refresh_token is also revoked now
    revoked_resp = client.post(
        "/api/v1/oauth/token",
        data={
            "grant_type": "refresh_token",
            "refresh_token": new_refresh_token,
            "client_id": client_id
        }
    )
    assert revoked_resp.status_code == 401

def test_invalid_client_and_redirect_uri(client):
    # Invalid Client ID
    resp = client.get(
        "/api/v1/oauth/authorize",
        params={
            "response_type": "code",
            "client_id": "invalid-client",
            "redirect_uri": "http://localhost:5173/oauth/callback",
            "code_challenge": "somechallenge",
            "code_challenge_method": "S256"
        }
    )
    assert resp.status_code == 400

    # Invalid Redirect URI
    resp2 = client.get(
        "/api/v1/oauth/authorize",
        params={
            "response_type": "code",
            "client_id": "classbuddy-web",
            "redirect_uri": "http://evil-attacker.com/callback",
            "code_challenge": "somechallenge",
            "code_challenge_method": "S256"
        }
    )
    assert resp2.status_code == 400
