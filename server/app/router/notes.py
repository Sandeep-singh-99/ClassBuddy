from fastapi import APIRouter, Depends, HTTPException, status, Form
from app.dependencies.dependencies import get_current_user
from app.models.auth import User, userRole
from app.config.db import get_db
from typing import TypedDict, Annotated, Optional
from dotenv import load_dotenv

router = APIRouter()

@router.post("/notes-generates", status_code=status.HTTP_201_CREATED)
def generate_notes(title: str = Form(...), current_user: User = Depends(get_current_user)):
    if not title.strip():
        raise HTTPException(status_code=400, detail="Title cannot be empty")
    
    if not current_user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    if current_user.role != userRole.TEACHER:
        raise HTTPException(status_code=403, detail="Forbidden: Only teachers can generate notes")
    
    