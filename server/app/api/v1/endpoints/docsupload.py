from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Request
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.schemas.docsupload import DocsUploadResponse, DocsBase
from app.models.docsupload import DocsUpload
from app.models.auth import User, group_members
from app.config.db import get_db
from app.dependencies.dependencies import get_current_user
from app.schemas.auth import userRole
from app.utils.cloudinary import upload_image, delete_image
from app.schemas.notes import TeacherNotesResponse
from app.models.notes import Note
from app.models.teacherInsight import TeacherInsight
from app.core.rate_limiter import limiter
from app.dependencies.require_active_subscription import check_active_subscription


from app.dependencies.require_teacher_group import require_teacher_group
from app.models.document_index import DocumentIndex
from app.services.document_qa import MAX_PDF_BYTES, queue_index

router = APIRouter()

@router.post("/", response_model=DocsBase)
@limiter.limit("10/minute")
def upload_doc(request: Request, filename: str = Form(...), file: UploadFile = File(...), db: Session = Depends(get_db), current_user: User = Depends(require_teacher_group)):
    teacher_group = db.query(TeacherInsight).filter(TeacherInsight.user_id == current_user.id).first()

    pdf_source = None
    if (file.filename or "").lower().endswith(".pdf") or file.content_type == "application/pdf":
        pdf_source = file.file.read(MAX_PDF_BYTES + 1)
        file.file.seek(0)
        if len(pdf_source) > MAX_PDF_BYTES:
            raise HTTPException(413, "PDFs for document Q&A must be 10 MB or smaller")
        if not pdf_source.startswith(b"%PDF-"):
            raise HTTPException(400, "This file is not a valid PDF")

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
    if pdf_source is not None:
        new_doc.qa_index = DocumentIndex(source_pdf=pdf_source, status="pending", page_count=0)
    db.commit()
    db.refresh(new_doc)
    if pdf_source is not None:
        queue_index(db, new_doc.qa_index)

    return new_doc


@router.get("/", response_model=List[DocsBase])
@limiter.limit("10/minute")
def get_my_docs(request: Request, db: Session = Depends(get_db), current_user: User = Depends(require_teacher_group)):
    docs = db.query(DocsUpload).filter(DocsUpload.owner_id == current_user.id).all()
    docs.sort(key=lambda x: x.updated_at, reverse=True)
    return docs


@router.get("/student", response_model=DocsUploadResponse, dependencies=[Depends(check_active_subscription)])
@limiter.limit("10/minute")
def get_teacher_notes_with_docs(request: Request, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
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
    docs_with_notes.sort(key=lambda x: x.updated_at, reverse=True)

    return {
        "count": len(docs_with_notes),
        "docsuploads": docs_with_notes
    }


@router.get("/{doc_id}", response_model=DocsBase)
@limiter.limit("10/minute")
def get_my_doc(request: Request, doc_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    
    docs = db.query(DocsUpload).filter(DocsUpload.id == doc_id).first()

    if not docs:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    # Owner teacher can always access
    if docs.owner_id == current_user.id:
        return docs

    # Verify group membership for students
    is_member = (
        db.query(group_members)
        .filter(
            group_members.c.group_id == docs.group_id,
            group_members.c.user_id == current_user.id,
        )
        .first()
        is not None
    )

    if not is_member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this document",
        )
    
    return docs


@router.delete("/{doc_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("10/minute")
def delete_doc(request: Request, doc_id: str, db: Session = Depends(get_db), current_user: User = Depends(require_teacher_group)):
    doc = db.query(DocsUpload).filter(DocsUpload.id == doc_id, DocsUpload.owner_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="You not authorized to delete this document")
    
    if doc.file_url_id:
        delete_image(doc.file_url_id)

    db.delete(doc)
    db.commit()