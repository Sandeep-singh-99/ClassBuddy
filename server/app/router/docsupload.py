from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.schemas.docsupload import DocsUploadResponse, DocsBase
from app.models.docsupload import DocsUpload
from app.models.auth import User
from app.config.db import get_db
from app.dependencies.dependencies import get_current_user
from app.schemas.auth import userRole
from app.utils.cloudinary import upload_image, delete_image
from app.schemas.notes import TeacherNotesResponse
from app.models.notes import Note
from app.models.teacherInsight import TeacherInsight


router = APIRouter()

@router.post("/upload-doc", response_model=DocsBase)
def upload_doc(filename: str = Form(...), file: UploadFile = File(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != userRole.TEACHER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to upload documents"
        )
    
    teacher_group = db.query(TeacherInsight).filter(TeacherInsight.user_id == current_user.id).first()

    if not teacher_group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No group found for this teacher. Please create a group first."
        )
    
    file_url, file_url_id = None, None
    if file:
        result = upload_image(file.file, folder="ClassBuddy")
        file_url, file_url_id = result["url"], result["public_id"]

    new_doc = DocsUpload(
        filename=filename,
        file_url=file_url,
        file_url_id=file_url_id,
        owner_id=current_user.id,
        group_id=teacher_group.id
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)

    return new_doc


@router.get("/my-docs", response_model=List[DocsUploadResponse])
def get_my_docs(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    docs = db.query(DocsUpload).filter(DocsUpload.owner_id == current_user.id).all()
    return docs

@router.get("/my-docs/{doc_id}", response_model=DocsUploadResponse)
def get_my_doc(doc_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    doc = db.query(DocsUpload).filter(DocsUpload.id == doc_id, DocsUpload.owner_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    return doc


@router.get("/teacher-notes-with-docs", response_model=DocsUploadResponse)
def get_teacher_notes_with_docs(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    
    if current_user.role != userRole.STUDENT:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this resource")
    
    docs = db.query(User).options(joinedload(User.groups)).filter(User.id == current_user.id).first()

    if not docs:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No documents found")
    
    if len(docs.groups) == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No groups found for the user")
    
    group_ids = [group.id for group in docs.groups]

    docs_with_notes = db.query(DocsUpload).filter(DocsUpload.group_id.in_(group_ids)).all()

    return {
        "count": len(docs_with_notes),
        "docsuploads": docs_with_notes
    }