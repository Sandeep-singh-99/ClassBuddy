from fastapi import APIRouter, Depends, HTTPException, status, Form, Request
from sqlalchemy.orm import Session
from app.config.db import get_db
from app.models.auth import User, userRole
from app.models.teacherInsight import TeacherInsight
from app.schemas.auth import UserResponse
from app.schemas.teacherInsight import TeacherInsightResponse
from app.dependencies.dependencies import get_current_user
from app.dependencies.require_teacher_group import require_teacher_group
from app.schemas.notes import NotesCreate, NotesResponse, EditNotes, NoteBaseResponse, TeacherNotesResponse
from app.models.notes import Note
from datetime import datetime
from app.core.rate_limiter import limiter
from app.dependencies.require_active_subscription import check_active_subscription
from app.services.notes_service import NotesService


router = APIRouter()

@router.post("/", response_model=NotesResponse)
@limiter.limit("10/minute")
def create_note(
    request: Request,
    note_data: NotesCreate, # Pydantic takes over parsing a pure JSON body
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher_group)
):
    return NotesService.create_note(db, current_user, note_data)



@router.get("/", response_model=TeacherNotesResponse)
@limiter.limit("10/minute")
def get_teacher_notes(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher_group)
):
    return NotesService.get_teacher_notes(db, current_user)


@router.get("/student", response_model=TeacherNotesResponse, dependencies=[Depends(check_active_subscription)])
@limiter.limit("10/minute")
def get_group_notes_for_student(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
        
    # Router does nothing but pass state to the service
    return NotesService.get_student_notes(db, current_user)





@router.get("/{note_id}", response_model=NotesResponse)
@limiter.limit("10/minute")
def get_note_by_id(
    request: Request, 
    note_id: str, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    return NotesService.get_note_by_id(db, note_id)





@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("10/minute")
def delete_note(
    request: Request, 
    note_id: str, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_teacher_group)
):
    NotesService.delete_note(db, current_user, note_id)
    return  # 204 No Content shouldn't return a body



@router.put("/{note_id}", response_model=NotesResponse)
@limiter.limit("10/minute")
def edit_note(
    request: Request,
    note_id: str,
    note_data: EditNotes,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_teacher_group)
):
    return NotesService.edit_note(db, current_user, note_id, note_data)
