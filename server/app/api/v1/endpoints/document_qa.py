import asyncio
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.config.db import get_db
from app.core.logger import logger
from app.core.rate_limiter import limiter, ai_rate_limit_key
from app.dependencies.dependencies import get_current_user
from app.dependencies.require_teacher_group import require_teacher_group
from app.models.auth import User, userRole
from app.models.docsupload import DocsUpload
from app.models.document_index import DocumentIndex
from app.models.student_subscription import StudentSubscription
from app.models.teacherInsight import TeacherInsight
from app.schemas.document_qa import AnswerOut, ClassroomOut, IndexedDocumentOut, QuestionRequest
from app.services.document_qa import generate_answer, queue_index, require_classroom, retrieve_chunks

router = APIRouter()


@router.get("/groups", response_model=list[ClassroomOut])
def list_classrooms(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    query = db.query(TeacherInsight)
    if user.role == userRole.TEACHER:
        query = query.filter(TeacherInsight.user_id == user.id)
        paid_groups = set()
    else:
        query = query.filter(TeacherInsight.members.any(User.id == user.id))
        paid_groups = {row[0] for row in db.query(StudentSubscription.group_id).filter(
            StudentSubscription.user_id == user.id,
            StudentSubscription.is_active.is_(True),
            StudentSubscription.valid_till > datetime.utcnow(),
        ).all()}
    return [ClassroomOut(id=group.id, name=group.group_name, can_ask=user.role == userRole.TEACHER or group.id in paid_groups)
            for group in query.order_by(TeacherInsight.group_name).all()]


@router.get("/groups/{group_id}/documents", response_model=list[IndexedDocumentOut])
def list_documents(group_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_classroom(db, group_id, user, require_paid=True)
    rows = db.query(DocsUpload, DocumentIndex).outerjoin(
        DocumentIndex, DocumentIndex.document_id == DocsUpload.id,
    ).filter(DocsUpload.group_id == group_id).order_by(DocsUpload.created_at.desc()).all()
    return [IndexedDocumentOut(
        id=doc.id, title=doc.filename, status=index.status if index else "unsupported",
        page_count=index.page_count if index else 0, error=index.error if index else None,
    ) for doc, index in rows]


@router.post("/documents/{document_id}/retry", response_model=IndexedDocumentOut)
@limiter.limit("5/minute", key_func=ai_rate_limit_key)
def retry_index(request: Request, document_id: str, db: Session = Depends(get_db), user: User = Depends(require_teacher_group)):
    document = db.query(DocsUpload).filter(DocsUpload.id == document_id, DocsUpload.owner_id == user.id).first()
    if not document:
        raise HTTPException(404, "Document not found")
    index = db.query(DocumentIndex).filter_by(document_id=document_id).populate_existing().with_for_update().first()
    if not index or not index.source_pdf:
        raise HTTPException(409, "Re-upload this document as a text-based PDF to index it")
    index.status, index.error = "pending", None
    db.commit()
    queue_index(db, index)
    return IndexedDocumentOut(id=document.id, title=document.filename, status=index.status, page_count=index.page_count, error=index.error)


@router.post("/groups/{group_id}/ask", response_model=AnswerOut)
@limiter.limit("10/minute", key_func=ai_rate_limit_key)
async def ask_question(request: Request, group_id: str, data: QuestionRequest,
                       db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_classroom(db, group_id, user, require_paid=True)
    chunks = retrieve_chunks(db, group_id, data.question)
    # Only plain data crosses the LLM call; release the read transaction first.
    db.close()
    try:
        async with asyncio.timeout(50):
            return await generate_answer(data.question, chunks)
    except Exception:
        logger.warning("Document Q&A generation failed for classroom %s", group_id)
        raise HTTPException(503, "The answer service is unavailable. Please try again shortly.")
