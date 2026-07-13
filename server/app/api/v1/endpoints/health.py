from fastapi import APIRouter
from sqlalchemy import text

from app.config.db import SessionLocal

router = APIRouter()

@router.get("/health", tags=["Health"])
async def health_check():
    db = None

    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))

        return {
            "status": "healthy",
            "database": "connected"
        }

    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }

    finally:
        if db:
            db.close()