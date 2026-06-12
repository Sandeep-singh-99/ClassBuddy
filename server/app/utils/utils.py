from datetime import datetime, timedelta, timezone
from jose import jwt
import bcrypt
from app.config.config import JWT_SECRET_KEY, ACCESS_TOKEN_EXPIRE_DAYS

# --- Password Hashing (Replacing Passlib) ---

def hash_password(password: str) -> str:
    """Hashes a plain-text password using native bcrypt."""
    # bcrypt requires bytes, so we encode the string
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain-text password against a hashed password."""
    try:
        password_bytes = plain_password.encode('utf-8')
        hashed_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(password_bytes, hashed_bytes)
    except Exception:
        # Catch-all for malformed hashes or type mismatches
        return False

# --- JWT Token Management ---

def create_access_token(data: dict):
    # Fixed: datetime.utcnow() is deprecated in newer Python. 
    # Using timezone-aware UTC datetime is the modern standard.
    expire = datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    
    # Create a copy so we don't accidentally mutate the passed-in dict elsewhere
    to_encode = data.copy()
    to_encode.update({"exp": expire})
    
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm="HS256")


def decode_access_token(token: str):
    return jwt.decode(token, JWT_SECRET_KEY, algorithms=["HS256"])