from fastapi import APIRouter, Depends, HTTPException, Request
import asyncio
from sqlalchemy.orm import Session
from typing import List
from app.schemas.interviewpreparation import (
    InterviewPreparationCreate,
    InterviewPrepSubmit,
    InterviewResponse,
    InterviewPreparationAsyncResponse,
    InterviewQuizResponse, QuizReview, QuizSubmissionResult, PublicQuestion, Question, parse_stored_answers,
)
from app.dependencies.dependencies import get_current_user
from app.config.db import get_db
from app.models.auth import User, userRole
from app.core.inngest import inngest_client
import inngest
from app.models.InterviewPreparation import InterviewPrep, Status

from datetime import datetime
import json
from app.dependencies.redis_client import get_redis_client
from pydantic import TypeAdapter, ValidationError
from app.core.rate_limiter import limiter


# ---- FastAPI Router ----
router = APIRouter()


@router.post("/", response_model=InterviewPreparationAsyncResponse)
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
        status=Status.GENERATING,
    )
    db.add(new_entry)
    db.flush()
    entry_id = new_entry.id
    db.commit()
    bind = db.get_bind()
    db.close()

    # Trigger Inngest Event
    try:
        async with asyncio.timeout(15):
            await inngest_client.send(inngest.Event(
                name="interview/prep.create",
                data={"interview_prep_id": entry_id, "description": interview_prep.description},
            ))
    except (Exception, asyncio.CancelledError) as error:
        with Session(bind=bind) as session:
            session.query(InterviewPrep).filter_by(id=entry_id).update({"status": Status.ERROR})
            session.commit()
        if isinstance(error, asyncio.CancelledError):
            raise
        raise HTTPException(503, "Could not queue quiz generation. Please create it again.")

    return {
        "id": entry_id,
        "name": interview_prep.name,
        "description": interview_prep.description,
        "status": Status.GENERATING,
        "message": "Interview preparation started. Check back shortly.",
    }


@router.get("/{id}/result", response_model=QuizReview)
def get_quiz_result(id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    quiz = db.query(InterviewPrep).filter(InterviewPrep.id == id, InterviewPrep.user_id == current_user.id).first()
    if current_user.role != userRole.STUDENT or not quiz:
        raise HTTPException(404, "Quiz result not found.")
    if quiz.submitted_at is None and not parse_stored_answers(quiz.user_answers):
        raise HTTPException(409, "Submit the quiz before viewing its answers.")
    try:
        return QuizReview.model_validate(quiz)
    except ValidationError:
        raise HTTPException(409, "Stored quiz results are invalid. Please create a new quiz.")


@router.get("/{id}", response_model=InterviewQuizResponse)
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
        "questions": [PublicQuestion.model_validate(q).model_dump() for q in (query.questions or [])],
        "status": query.status,
        "score": query.score,
        "submitted_at": query.submitted_at or (query.updated_at if parse_stored_answers(query.user_answers) else None),
    }


@router.post("/submit-quiz", response_model=QuizSubmissionResult)
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
        .with_for_update()
        .first()
    )

    if not query:
        raise HTTPException(status_code=404, detail="Interview preparation not found.")

    if query.status != Status.COMPLETED or not query.questions:
        raise HTTPException(status_code=400, detail="Quiz is not ready for submission.")
    if query.submitted_at is not None or parse_stored_answers(query.user_answers):
        raise HTTPException(409, "This quiz has already been submitted.")
    try:
        questions = TypeAdapter(list[Question]).validate_python(query.questions)
    except ValidationError:
        raise HTTPException(409, "Stored quiz questions are invalid. Please create a new quiz.")

    correct_answers = 0
    for index, question in enumerate(questions):
        answer = submission.user_answers.get(str(index))
        if answer in question.options and (
            answer == question.answer
            or answer.partition(". ")[0] == question.answer
        ):
            correct_answers += 1

    # Invalidate cache
    cache_key = f"interview_preps:{current_user.id}"
    redis_client.delete(cache_key)

    query.score = round(correct_answers / len(query.questions) * 100)
    query.user_answers = submission.user_answers
    query.updated_at = datetime.utcnow()
    query.submitted_at = datetime.utcnow()

    db.commit()
    db.refresh(query)

    return {
        "message": "Quiz submitted successfully",
        "quiz_id": query.id,
        "score": query.score,
        "id": query.id,
        "name": query.name,
        "questions": [question.model_dump() for question in questions],
        "user_answers": query.user_answers,
    }


@router.get("/", response_model=List[InterviewResponse])
@limiter.limit("10/minute")
def get_interview_preps(
    request: Request,
    db: Session = Depends(get_db),
    redis_client=Depends(get_redis_client),
    current_user: User = Depends(get_current_user),
):
    # Role check
    if current_user.role != userRole.STUDENT:
        raise HTTPException(
            status_code=403,
            detail="Only students can view their interview preparations.",
        )

    # Create unique cache key per user
    cache_key = f"interview_preps:{current_user.id}"

    # Try fetching from Redis
    cached_data = redis_client.get(cache_key)
    if cached_data:
        try:
            data = json.loads(cached_data)
            if isinstance(data, list) and all(isinstance(item, dict) for item in data):
                return [InterviewResponse(**d) for d in data]
        except Exception:
            # If corrupted cache or schema mismatch, delete it
            redis_client.delete(cache_key)

    # Fetch from DB
    interview_preps = (
        db.query(InterviewPrep).filter(InterviewPrep.user_id == current_user.id).all()
    )

    # Encode and cache result for 2 minutes
    encoded_data = [InterviewResponse.model_validate(prep).model_dump(mode="json") for prep in interview_preps]
    redis_client.set(cache_key, json.dumps(encoded_data))

    return encoded_data


@router.delete("/{id}")
@limiter.limit("10/minute")
async def delete_interview_prep(
    id: str,
    request: Request,
    redis_client=Depends(get_redis_client),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != userRole.STUDENT:
        raise HTTPException(
            status_code=403,
            detail="Only students can delete interview preparation entries.",
        )

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

    db.delete(query)
    db.commit()

    # Invalidate cache
    cache_key = f"interview_preps:{current_user.id}"
    redis_client.delete(cache_key)

    return {"message": "Quiz deleted successfully", "id": id}

