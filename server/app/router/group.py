from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.config.db import get_db
from app.models.auth import User
from app.dependencies.dependencies import get_current_user
from app.models.teacherInsight import TeacherInsight
from app.schemas.teacherInsight import TeacherInsightCreate, TeacherInsightResponse, TeacherInsightBase, JoinGroupRequest

router = APIRouter()

@router.post("/join", response_model=TeacherInsightResponse)
def join_group(
    request: JoinGroupRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Ensure the user is authenticated
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required."
        )

    # Only students can join groups
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can join groups."
        )

    # Find the group
    group = db.query(TeacherInsight).filter(TeacherInsight.id == request.group_id).first()
    if not group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found.")

    # Check if already a member
    if current_user in group.members:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User already in group.")

    # Add user to group
    group.members.append(current_user)
    db.commit()
    db.refresh(group)

    return group
