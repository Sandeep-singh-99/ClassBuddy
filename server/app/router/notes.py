from fastapi import APIRouter, Depends, HTTPException, status, Form
from sqlalchemy.orm import Session
from app.config.db import get_db
from app.models.auth import User, userRole
from app.dependencies.dependencies import get_current_user
from app.schemas.notes import NotesCreate, NotesResponse, EditNotes, NoteBaseResponse, TeacherNotesResponse
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


@router.get("/teacher-get-notes", response_model=TeacherNotesResponse)
def get_teacher_notes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Ensure only teachers can access
    if current_user.role != userRole.TEACHER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view notes"
        )
    
    # Fetch teacher's notes
    teacher_notes = db.query(Note).filter(Note.owner_id == current_user.id).all()

    return {
        "count": len(teacher_notes), 
        "notes": teacher_notes      
    }


@router.get("/{note_id}", response_model=NotesResponse)
def get_note_by_id(note_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    
    note = db.query(Note).filter(Note.id == note_id).first()

    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    
    return note