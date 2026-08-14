from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.config.db import get_db
from app.models.auth import User
from app.models.teacherInsight import TeacherInsight
from app.dependencies.dependencies import get_current_user

class TeacherGroupRequiredException(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Teacher must create a group before accessing this feature."
        )

def require_teacher_group(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Ensures current user is authenticated, has the 'teacher' role,
    and has created at least one group in TeacherInsight.
    Raises 403 with TEACHER_GROUP_REQUIRED code if no group exists.
    """
    role_val = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)
    if role_val != "teacher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers can access this feature."
        )

    has_group = db.query(TeacherInsight.id).filter(TeacherInsight.user_id == current_user.id).first() is not None
    if not has_group:
        raise TeacherGroupRequiredException()

    return current_user
