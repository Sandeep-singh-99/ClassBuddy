from fastapi import APIRouter, Depends, HTTPException, status, Form
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.schemas.assignment import AssignmentQuestionResponse, AssignmentResponse, AssignmentBase
from app.models.assignment import Assignment, AssignmentQuestion, Submission
from app.models.auth import User
from app.schemas.auth import UserResponse
from app.models.auth import userRole
from app.dependencies.dependencies import get_db, get_current_user

router = APIRouter()

@router.post("/create-assignment", response_model=AssignmentBase)
async def create_assignment(assignment: Form = Depends(AssignmentBase), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="not authorized to create assignments")
    
    if current_user.role != userRole.TEACHER:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="only teachers can create assignments") 