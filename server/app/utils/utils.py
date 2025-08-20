from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt
from app.config.config import JWT_SECRET_KEY, ACCESS_TOKEN_EXPIRE_DAYS

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    data.update({"exp": expire})
    return jwt.encode(data, JWT_SECRET_KEY, algorithm="HS256")


def decode_access_token(token: str):
    return jwt.decode(token, JWT_SECRET_KEY, algorithms=["HS256"])