from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List
from typing import Dict, Any
from datetime import datetime
from app.schemas.assignment import AssignmentQuestionResponse
from app.models.assignment import Assignment, AssignmentQuestion
from app.models.auth import User, userRole
from app.dependencies.dependencies import get_db, get_current_user
from dotenv import load_dotenv
import json
from app.core.rate_limiter import limiter
from app.core.inngest import inngest_client
import inngest

load_dotenv()




# --------------------------
# FastAPI Router
# --------------------------
router = APIRouter()


@router.post(
    "/generate-question/{assignment_id}"
)
@limiter.limit("10/minute")
async def generate_question(
    request: Request,
    assignment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate structured assignment questions (JSON format)."""

    if not current_user or current_user.role != userRole.TEACHER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers can generate questions.",
        )

    assignment = (
        db.query(Assignment)
        .filter(Assignment.id == assignment_id, Assignment.owner_id == current_user.id)
        .first()
    )
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found."
        )

    # Prevent duplicate generation
    existing = (
        db.query(AssignmentQuestion)
        .filter(AssignmentQuestion.assignment_id == assignment_id)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Questions already generated for this assignment.",
        )

    if not assignment.description:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Assignment description is empty.",
        )

    try:
        # Prevent starting again if already generating
        if assignment.is_generating:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Questions are already being generated for this assignment.",
            )

        assignment.is_generating = True
        db.commit()
        db.refresh(assignment)

        # Trigger Inngest Event
        await inngest_client.send(
            inngest.Event(
                name="assignment/question.generate",
                data={
                    "assignment_id": assignment.id,
                    "description": assignment.description,
                },
            )
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error starting background job: {str(e)}",
        )

    return {"message": "Assignment question generation started in the background.", "assignment_id": assignment.id}
