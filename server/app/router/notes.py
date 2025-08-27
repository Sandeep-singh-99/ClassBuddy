from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.config.db import get_db
from app.models.note import Note
from app.models.auth import User, userRole
from app.schemas.note import NoteResponse
from app.utils.cloudinary import upload_image
from app.dependencies.dependencies import get_current_user


router = APIRouter()

@router.post("/create-notes", response_model=NoteResponse)
def create_note(
    title: str = Form(...),
    content: str = Form(None),
    file: str = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    if current_user.role != userRole.TEACHER:
        raise HTTPException(status_code=403, detail="Only teachers can create notes")

    pdf_url, pdf_url_id = None, None
    if file:
        result = upload_image(file, folder="ClassBuddy/Notes")
        pdf_url, pdf_url_id = result["url"], result["public_id"]

    new_note = Note(
        title=title,
        content=content,
        pdf_url=pdf_url,
        pdf_url_id=pdf_url_id,
        owner_id=current_user.id
    )

    db.add(new_note)
    db.commit()
    db.refresh(new_note)

    return new_note   # ✅ works if Config.from_attributes / orm_mode is set
