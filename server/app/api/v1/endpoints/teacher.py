from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.config.db import get_db
from app.models.auth import User
from app.models.teacherInsight import TeacherInsight
from app.dependencies.dependencies import get_current_user
from app.core.rate_limiter import limiter

router = APIRouter()

@router.get("/group-status")
@limiter.limit("30/minute")
def get_teacher_group_status(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns teacher group status: whether teacher has at least 1 group and group_count.
    Only accessible by users with 'teacher' role.
    """
    role_val = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)
    if role_val != "teacher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers can access group status."
        )

    group_count = db.query(TeacherInsight.id).filter(TeacherInsight.user_id == current_user.id).count()
    has_group = group_count > 0

    return {
        "has_group": has_group,
        "group_count": group_count
    }
