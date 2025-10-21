from fastapi import APIRouter, Depends, HTTPException, status, Form, Query
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.schemas.assignment import (
    AssignmentQuestionResponse,
    AssignmentResponse,
    AssignmentBase,
    AssignmentQuestionCreate,
)
from app.models.assignment import Assignment, AssignmentQuestion, Submission
from app.models.auth import User, group_members
from app.schemas.auth import UserResponse
from app.models.auth import userRole
from app.dependencies.dependencies import get_db, get_current_user
from app.models.teacherInsight import TeacherInsight
from sqlalchemy.orm import joinedload


router = APIRouter()


@router.post("/create-assignment", response_model=AssignmentBase)
async def create_assignment(
    title: str = Form(...),
    description: str = Form(...),
    due_date: datetime = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="not authorized to create assignments",
        )

    if current_user.role != userRole.TEACHER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="only teachers can create assignments",
        )

    if not title or not description or not due_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="missing required fields"
        )

    teacher_group = (
        db.query(TeacherInsight)
        .filter(TeacherInsight.user_id == current_user.id)
        .first()
    )

    if not teacher_group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No group found for this teacher. Please create a group first.",
        )

    new_assignment = Assignment(
        title=title,
        description=description,
        due_date=due_date,
        owner_id=current_user.id,
        group_id=teacher_group.id,
    )

    db.add(new_assignment)
    db.commit()
    db.refresh(new_assignment)
    return new_assignment


@router.get("/assignments", response_model=List[AssignmentBase])
async def get_assignments(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="not authorized to view assignments",
        )

    if current_user.role == userRole.TEACHER:
        assignments = (
            db.query(Assignment).filter(Assignment.owner_id == current_user.id).all()
        )
    else:
        assignments = (
            db.query(Assignment)
            .join(TeacherInsight, Assignment.group_id == TeacherInsight.id)
            .join(group_members, TeacherInsight.id == group_members.c.group_id)
            .filter(group_members.c.user_id == current_user.id)
            .options(joinedload(Assignment.group))
            .all()
        )

        assignments.sort(key=lambda x: x.created_at, reverse=True)

    return assignments


@router.get(
    "/get-assignment-viewById/{assignment_id}", response_model=AssignmentResponse
)
async def get_assignment(
    assignment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="not authorized to view assignment",
        )

    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()

    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="assignment not found"
        )
    
    if current_user.role != userRole.TEACHER and assignment.due_date < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The due date for this assignment has passed.",
        )
    
    # TEACHER: can only view their own assignments
    if current_user.role == userRole.TEACHER and assignment.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="not authorized to view this assignment",
        )
    
    # STUDENT: can only view assignments in groups they belong to
    if current_user.role == userRole.STUDENT:
        # Check if student is part of the assignment's group

        member_exists = (
            db.query(group_members)
            .filter(
                group_members.c.group_id == assignment.group_id,
                group_members.c.user_id == current_user.id,
            ).first()
        )

        if not member_exists:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="not authorized to view this assignment",
            )

    return assignment


@router.delete("/delete-assignment/{assignment_id}", response_model=AssignmentResponse)
async def delete_assignment(
    assignment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user or current_user.role != userRole.TEACHER:
        raise HTTPException(
            status_code=403, detail="Only teachers can delete assignments"
        )

    assignment = (
        db.query(Assignment)
        .options(joinedload(Assignment.questions), joinedload(Assignment.submissions))
        .filter(Assignment.id == assignment_id, Assignment.owner_id == current_user.id)
        .first()
    )

    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    db.delete(assignment)
    db.commit()

    return assignment
