import asyncio
import inngest
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.config.db import get_db
from app.core.inngest import inngest_client
from app.core.rate_limiter import ai_rate_limit_key, limiter
from app.dependencies.require_teacher_group import require_teacher_group
from app.models.assignment import Assignment, AssignmentQuestion
from app.models.auth import User

router = APIRouter()


@router.post("/{assignment_id}")
@limiter.limit("10/minute", key_func=ai_rate_limit_key)
async def generate_question(request: Request, assignment_id: str, db: Session = Depends(get_db), current_user: User = Depends(require_teacher_group)):
    assignment = db.query(Assignment).filter_by(id=assignment_id, owner_id=current_user.id).first()
    if not assignment:
        raise HTTPException(404, "Assignment not found.")
    if db.query(AssignmentQuestion).filter_by(assignment_id=assignment_id).first():
        raise HTTPException(400, "Questions already generated for this assignment.")
    if not assignment.description or len(assignment.description) > 10_000:
        raise HTTPException(400, "Assignment description must contain 1 to 10,000 characters.")
    description = assignment.description
    claimed = db.query(Assignment).filter(
        Assignment.id == assignment_id, Assignment.owner_id == current_user.id,
        or_(Assignment.is_generating.is_(False), Assignment.is_generating.is_(None)),
    ).update({"is_generating": True}, synchronize_session=False)
    if not claimed:
        db.rollback()
        raise HTTPException(409, "Questions are already being generated.")
    db.commit()
    bind = db.get_bind()
    db.close()
    try:
        async with asyncio.timeout(15):
            await inngest_client.send(inngest.Event(
                name="assignment/question.generate", data={"assignment_id": assignment_id, "description": description},
            ))
    except (Exception, asyncio.CancelledError) as error:
        with Session(bind=bind) as session:
            session.query(Assignment).filter_by(id=assignment_id).update({"is_generating": False})
            session.commit()
        if isinstance(error, asyncio.CancelledError):
            raise
        raise HTTPException(503, "Could not queue question generation. Please retry.")
    return {"message": "Assignment question generation started in the background.", "assignment_id": assignment_id}
