from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status
from datetime import datetime, timezone
from app.models.auth import User
from app.schemas.auth import userRole
from app.models.notes import Note
from app.models.teacherInsight import TeacherInsight
from app.schemas.notes import NotesCreate, EditNotes


class NotesService:
    @staticmethod
    def create_note(db: Session, current_user: User, note_data: NotesCreate) -> Note:
        if current_user.role != userRole.TEACHER:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to create notes")

        teacher_group = db.query(TeacherInsight).filter(TeacherInsight.user_id == current_user.id).first()
        if not teacher_group:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No group found for this teacher. Please create a group first.")

        new_note = Note(
            title=note_data.title,
            content=note_data.content,
            owner_id=current_user.id,
            group_id=teacher_group.id  
        )
        db.add(new_note)
        db.commit()
        db.refresh(new_note)
        return new_note

    @staticmethod
    def get_teacher_notes(db: Session, current_user: User) -> dict:
        if current_user.role != userRole.TEACHER:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view notes")
        
        teacher_notes = db.query(Note).filter(Note.owner_id == current_user.id).order_by(Note.created_at.desc()).all()
        return {"count": len(teacher_notes), "notes": teacher_notes}

    @staticmethod
    def get_note_by_id(db: Session, note_id: str) -> Note:
        note = db.query(Note).filter(Note.id == note_id).first()
        if not note:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
        return note

    @staticmethod
    def edit_note(db: Session, current_user: User, note_id: str, note_data: EditNotes) -> Note:
        if current_user.role != userRole.TEACHER:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to edit notes")

        note = db.query(Note).filter(Note.id == note_id, Note.owner_id == current_user.id).first()
        if not note:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found or not owned by user")

        update_data = note_data.dict(exclude_unset=True)  
        for key, value in update_data.items():
            setattr(note, key, value)

        # Replace deprecated utcnow() with timezone-aware datetime
        note.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(note)
        return note

    @staticmethod
    def delete_note(db: Session, current_user: User, note_id: str):
        if current_user.role != userRole.TEACHER:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete notes")
        
        note = db.query(Note).filter(Note.id == note_id, Note.owner_id == current_user.id).first()
        if not note:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found or not owned by user")
        
        db.delete(note)
        db.commit()


    @staticmethod
    def get_student_notes(db: Session, current_user: User) -> dict:
        # 1. Enforce Role
        if current_user.role != userRole.STUDENT:
            raise HTTPException(status_code=403, detail="Only students can view notes")

        # 2. Fetch student and relationships
        student = db.query(User).options(joinedload(User.groups)).filter(User.id == current_user.id).first()

        if not student:
            raise HTTPException(status_code=404, detail="Student not found")

        if not student.groups:
            raise HTTPException(status_code=400, detail="You haven't joined any groups")

        # 3. Fetch Notes
        group_ids = [group.id for group in student.groups]
        notes = db.query(Note).filter(Note.group_id.in_(group_ids)).all()

        if not notes:
            raise HTTPException(status_code=404, detail="Teacher has not uploaded any notes")

        return {
            "count": len(notes),
            "notes": notes
        }