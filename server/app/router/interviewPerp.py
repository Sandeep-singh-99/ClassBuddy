from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import TypedDict, Annotated, Dict, List
from app.schemas.interviewpreparation import (
    InterviewPreparationCreate,
    InterviewPreparationResponse,
    InterviewPrepSubmit,
    InterviewResponse,
    InterviewPreparationCreateResponse,
    InterviewPreparationAsyncResponse,
)
from app.dependencies.dependencies import get_current_user
from app.config.db import get_db
from app.models.auth import User, userRole
from dotenv import load_dotenv
from app.core.inngest import inngest_client
import inngest
from app.models.InterviewPreparation import InterviewPrep
import uuid
from datetime import datetime
import json
from app.dependencies.redis_client import get_redis_client
from fastapi.encoders import jsonable_encoder
from app.core.rate_limiter import limiter


# ---- FastAPI Router ----
router = APIRouter()


@router.post("/create-interview-prep", response_model=InterviewPreparationAsyncResponse)
@limiter.limit("10/minute")
async def create_interview_prep(
    request: Request,
    interview_prep: InterviewPreparationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != userRole.STUDENT:
        raise HTTPException(
            status_code=403,
            detail="Only students can create interview preparation entries.",
        )

    # Create initial record
    new_entry = InterviewPrep(
        name=interview_prep.name,
        description=interview_prep.description,
        user_id=current_user.id,
        questions=[],
    )
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)

    # Trigger Inngest Event
    await inngest_client.send(
        inngest.Event(
            name="interview/prep.create",
            data={
                "interview_prep_id": new_entry.id,
                "description": interview_prep.description,
                "user_id": current_user.id,
            },
        )
    )

    return {
        "id": new_entry.id,
        "name": new_entry.name,
        "description": new_entry.description,
        "message": "Interview preparation started. Check back shortly.",
    }

@router.get("/get-interview-question/{id}")
@limiter.limit("10/minute")
async def get_interview_question(
    id: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != userRole.STUDENT:
        raise HTTPException(
            status_code=403,
            detail="Only students can view interview questions.",
        )

    # Find the existing record by ID
    query = (
        db.query(InterviewPrep)
        .filter(
            InterviewPrep.id == id,
            InterviewPrep.user_id == current_user.id,
        )
        .first()
    )

    if not query:
        raise HTTPException(status_code=404, detail="Interview preparation not found.")

    return {
        "id": query.id,
        "name": query.name,
        "description": query.description,
        "questions": query.questions,
    }

@router.post("/submit-quiz")
@limiter.limit("10/minute")
async def submit_quiz(
    request: Request,
    submission: InterviewPrepSubmit,
    redis_client=Depends(get_redis_client),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != userRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can submit quizzes.")

    # Find the existing record by ID
    query = (
        db.query(InterviewPrep)
        .filter(
            InterviewPrep.id == submission.id,
            InterviewPrep.user_id == current_user.id,
        )
        .first()
    )

    if not query:
        raise HTTPException(status_code=404, detail="Interview preparation not found.")

    # Invalidate cache
    cache_key = f"interview_preps:{current_user.id}"
    redis_client.delete(cache_key)

    query.score = submission.score
    query.user_answers = submission.user_answers
    query.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(query)

    return {
        "message": "Quiz submitted successfully",
        "quiz_id": query.id,
        "score": query.score,
    }

@router.get("/get-interview-preps", response_model=List[InterviewResponse])
@limiter.limit("10/minute")
def get_interview_preps(
    request: Request,
    db: Session = Depends(get_db),
    redis_client = Depends(get_redis_client),
    current_user: User = Depends(get_current_user)
):
    # Role check
    if current_user.role != userRole.STUDENT:
        raise HTTPException(
            status_code=403, 
            detail="Only students can view their interview preparations."
        )

    # Create unique cache key per user
    cache_key = f"interview_preps:{current_user.id}"

    # Try fetching from Redis
    cached_data = redis_client.get(cache_key)
    if cached_data:
        data = json.loads(cached_data)
        if isinstance(data, list) and all(isinstance(item, dict) for item in data):
            return [InterviewResponse(**d) for d in data]
        # If corrupted cache, delete it
        redis_client.delete(cache_key)

    # Fetch from DB
    interview_preps = (
        db.query(InterviewPrep)
        .filter(InterviewPrep.user_id == current_user.id)
        .all()
    )

    # Encode and cache result for 2 minutes
    encoded_data = jsonable_encoder(interview_preps)
    redis_client.set(cache_key, json.dumps(encoded_data))

    return interview_preps
