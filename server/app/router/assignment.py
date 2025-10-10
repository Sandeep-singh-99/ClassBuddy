from fastapi import APIRouter, Depends, HTTPException, status, Form, Query
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.schemas.assignment import AssignmentQuestionResponse, AssignmentResponse, AssignmentBase
from app.models.assignment import Assignment, AssignmentQuestion, Submission
from app.models.auth import User
from app.schemas.auth import UserResponse
from app.models.auth import userRole
from app.dependencies.dependencies import get_db, get_current_user
from app.models.teacherInsight import TeacherInsight


router = APIRouter()

@router.post("/create-assignment", response_model=AssignmentBase)
async def create_assignment(assignment: Form = Depends(AssignmentBase), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="not authorized to create assignments")
    
    if current_user.role != userRole.TEACHER:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="only teachers can create assignments")

    if not assignment.title or not assignment.description or not assignment.due_date:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="missing required fields")
    
    teacher_group = db.query(TeacherInsight).filter(TeacherInsight.user_id == current_user.id).first()

    if not teacher_group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No group found for this teacher. Please create a group first.")

    new_assignment = Assignment(
        title=assignment.title,
        description=assignment.description,
        due_date=assignment.due_date,
        owner_id=current_user.id,
        group_id=teacher_group.id
    )

    db.add(new_assignment)
    db.commit()
    db.refresh(new_assignment)
    return new_assignment