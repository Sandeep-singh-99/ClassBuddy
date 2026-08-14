import os
from dotenv import load_dotenv

load_dotenv()

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "super-secret-default-key-change-in-prod")

ACCESS_TOKEN_EXPIRE_DAYS = int(os.getenv("ACCESS_TOKEN_EXPIRE_DAYS", "15"))
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "15"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "30"))

OAUTH_ISSUER = os.getenv("OAUTH_ISSUER", os.getenv("JWT_ISSUER", "classbuddy"))

# RSA keys for asymmetric JWT signing (optional, falls back to HS256 if not provided)
JWT_PRIVATE_KEY = os.getenv("JWT_PRIVATE_KEY")
JWT_PUBLIC_KEY = os.getenv("JWT_PUBLIC_KEY")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "RS256" if (JWT_PRIVATE_KEY and JWT_PUBLIC_KEY) else "HS256")

# OAuth Client configuration defaults
OAUTH_WEB_CLIENT_ID = os.getenv("OAUTH_WEB_CLIENT_ID", "classbuddy-web")
OAUTH_WEB_REDIRECT_URI = os.getenv("OAUTH_WEB_REDIRECT_URI", "http://localhost:5173/oauth/callback")

OAUTH_ANDROID_CLIENT_ID = os.getenv("OAUTH_ANDROID_CLIENT_ID", "classbuddy-android")
OAUTH_ANDROID_REDIRECT_URI = os.getenv("OAUTH_ANDROID_REDIRECT_URI", "classbuddy://oauth/callback")

OAUTH_ALLOWED_SCOPES = os.getenv("OAUTH_ALLOWED_SCOPES", "openid,profile,email").split(",")

# Cookie Configuration Defaults
COOKIE_SECURE = os.getenv("COOKIE_SECURE", "False").lower() in ("true", "1", "yes")
COOKIE_SAMESITE = os.getenv("COOKIE_SAMESITE", "lax")
COOKIE_DOMAIN = os.getenv("COOKIE_DOMAIN")
COOKIE_PATH = os.getenv("COOKIE_PATH", "/")
ACCESS_TOKEN_COOKIE_NAME = os.getenv("ACCESS_TOKEN_COOKIE_NAME", "access_token")
REFRESH_TOKEN_COOKIE_NAME = os.getenv("REFRESH_TOKEN_COOKIE_NAME", "refresh_token")

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")