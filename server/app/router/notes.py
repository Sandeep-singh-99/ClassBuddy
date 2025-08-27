from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.models.note import Note, NoteType
from app.models.auth import User, userRole
from app.schemas.note import NoteCreate, NoteResponse
from app.dependencies.dependencies import get_db, get_current_user
import cloudinary.uploader

router = APIRouter(prefix="/notes", tags=["Notes"])


@router.post("/", response_model=NoteResponse)
async def create_note(
    title: str = Form(...),
    type: NoteType = Form(...),
    content: str = Form(None),
    file: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # ✅ Only TEACHERS can create notes
    if current_user.role != userRole.TEACHER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers can create notes",
        )

    pdf_url, pdf_url_id = None, None

    # If note type is PDF, upload file to Cloudinary
    if type == NoteType.PDF:
        if not file:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="PDF file is required for PDF notes",
            )
        result = cloudinary.uploader.upload(file.file, resource_type="auto")
        pdf_url = result.get("secure_url")
        pdf_url_id = result.get("public_id")

    # If note type is RICH_TEXT, content must be provided
    if type == NoteType.RICH_TEXT:
        if not content:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Content is required for rich text notes",
            )

    new_note = Note(
        title=title,
        type=type,
        content=content,
        pdf_url=pdf_url,
        pdf_url_id=pdf_url_id,
        owner_id=current_user.id,
    )

    db.add(new_note)
    db.commit()
    db.refresh(new_note)

    return new_note
