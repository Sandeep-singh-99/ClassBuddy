from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from app.config.db import get_db
from app.dependencies.dependencies import get_current_user
from app.models.student_subscription import StudentSubscription
from app.models.auth import User
from app.schemas.auth import userRole

def check_active_subscription(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="You are not logged in"
        )

    if not current_user.role == userRole.STUDENT:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="You are not a student"
        )

    subscription = (
        db.query(StudentSubscription)
        .filter(
            StudentSubscription.user_id == current_user.id,
            StudentSubscription.is_active == True,
            StudentSubscription.valid_till >= datetime.utcnow()
        )
        .first()
    )

    # 🔥 THIS LINE IS CRITICAL
    if subscription is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You need an active subscription to access this feature"
        )

    return subscription
