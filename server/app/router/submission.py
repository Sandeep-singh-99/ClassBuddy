from fastapi import APIRouter, Depends, HTTPException, status, Form, Query
from sqlalchemy.orm import Session , joinedload
from typing import List
from datetime import datetime
from app.models.assignment import Assignment, AssignmentQuestion, Submission
from app.models.auth import User, group_members
from app.schemas.auth import UserResponse
from app.models.auth import userRole
from app.dependencies.dependencies import get_db, get_current_user
from sqlalchemy import func

router = APIRouter()

@router.get("/student-view/{assignment_id}")
async def get_submissions(assignment_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != userRole.STUDENT:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view submissions")
    
    submissions = db.query(Submission).filter(Submission.assignment_id == assignment_id, Submission.student_id == current_user.id).all()

    if not submissions:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No submissions found for this assignment")
    
    return {"submissions": submissions}



@router.get("/assignment-stats/{assignment_id}")
async def assignment_stats(
    assignment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Only teachers can view
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    # Get the assignment and its group
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")

    group = assignment.group
    if not group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found for this assignment")

    total_students = len(group.members)

    # Count students who submitted
    students_completed = db.query(Submission).filter(
        Submission.assignment_id == assignment_id
    ).count()

    return {
        "assignment_id": assignment_id,
        "group_id": group.id,
        "total_students": total_students,
        "students_completed": students_completed
    }


@router.get("/assignment-marks/{assignment_id}")
async def get_assignment_marks(
    assignment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Only teachers or authorized users
    if not current_user or current_user.role != userRole.TEACHER:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    # Fetch assignment
    assignment = (
        db.query(Assignment)
        .options(joinedload(Assignment.group))
        .filter(Assignment.id == assignment_id)
        .first()
    )
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")

    group = assignment.group
    if not group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found")

    # Fetch only submissions for this assignment
    submissions = (
        db.query(Submission)
        .join(User, Submission.student_id == User.id)
        .filter(Submission.assignment_id == assignment_id)
        .options(joinedload(Submission.student))
        .all()
    )

    # Prepare response
    result = [
        {
            "student_id": submission.student.id,
            "student_name": submission.student.full_name,
            "student_email": submission.student.email,
            "student_image_url": submission.student.image_url,
            "submitted": True,
            "grade": submission.grade,
            "feedback": submission.feedback,
        }
        for submission in submissions
    ]

    return {
        "assignment_id": assignment_id,
        "group_id": group.id,
        "students": result,
    }


@router.get("/total-submissions")
async def total_submissions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user or current_user.role != userRole.TEACHER:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    assignments = (
        db.query(Assignment)
        .filter(Assignment.owner_id == current_user.id)
        .all()
    )

    assignment_ids = [assignment.id for assignment in assignments]

    total_submissions = (
        db.query(Submission)
        .filter(Submission.assignment_id.in_(assignment_ids))
        .count()
    )

    return {
        "teacher_id": current_user.id,
        "total_submissions": total_submissions,
    }


@router.get("/student-submissions-stats")
async def student_submissions_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user or current_user.role != userRole.STUDENT:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    submissions = (
        db.query(Submission)
        .filter(Submission.student_id == current_user.id)
        .order_by(Submission.submitted_at.asc())
        .all()
    )

    if not submissions:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No submissions found for this student")
    
    completion_stats = (
        db.query(func.date(Submission.submitted_at).label("date"),
                 func.count(Submission.id).label("count"))
        .filter(Submission.student_id == current_user.id)
        .group_by(func.date(Submission.submitted_at))
        .order_by(func.date(Submission.submitted_at).asc())
        .all()
    )

    completion_over_time = [
        {"date": str(record.date), "count": record.count} for record in completion_stats
    ]

    return {
        "student_id": current_user.id,
        "total_submissions": len(submissions),
        "completion_over_time": completion_over_time
    }