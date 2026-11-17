from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Create sync engine
engine_kwargs = {"echo": False, "future": True, "pool_pre_ping": True}
if DATABASE_URL and not DATABASE_URL.startswith("sqlite"):
    engine_kwargs.update({"pool_recycle": 1800, "pool_size": 5, "max_overflow": 10})
engine = create_engine(DATABASE_URL, **engine_kwargs)

# Create session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base for models
Base = declarative_base()

# Dependency for FastAPI routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
