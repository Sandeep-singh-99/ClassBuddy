from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
from app.schemas.docsupload import DocsUploadResponse, DocsUploadBase
from app.models.docsupload import DocsUpload
from app.models.auth import User
from app.config.db import get_db
from app.dependencies.dependencies import get_current_user
from app.schemas.auth import userRole
from app.utils.cloudinary import upload_image, delete_image

router = APIRouter()

@router.post("/upload-doc", response_model=DocsUploadResponse)
def upload_doc(filename: str = Form(...), file: UploadFile = File(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != userRole.TEACHER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to upload documents"
        )
    
    file_url, file_url_id = None, None
    if file:
        result = upload_image(file.file, folder="ClassBuddy")
        file_url, file_url_id = result["url"], result["public_id"]

    new_doc = DocsUpload(
        filename=filename,
        file_url=file_url,
        file_url_id=file_url_id,
        owner_id=current_user.id
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)

    return new_doc


@router.get("/my-docs", response_model=List[DocsUploadResponse])
def get_my_docs(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    docs = db.query(DocsUpload).filter(DocsUpload.owner_id == current_user.id).all()
    return docs

