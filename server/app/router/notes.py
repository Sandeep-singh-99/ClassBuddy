from fastapi import APIRouter, Depends, HTTPException, status, Form
from sqlalchemy.orm import Session
from app.config.db import get_db
from app.models.auth import User, userRole
from app.dependencies.dependencies import get_current_user
from app.schemas.notes import NotesCreate, NotesResponse, EditNotes
from app.models.notes import Note


router = APIRouter()

@router.post("/create-note", response_model=NotesResponse)
def create_note(title: str = Form(...), content: str = Form(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != userRole.TEACHER:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to create notes")
    
    new_note = Note(title=title, content=content, owner_id=current_user.id)
    db.add(new_note)
    db.commit()
    db.refresh(new_note)

    return new_note