from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.config.db import get_db
from app.models.auth import User
from app.dependencies.dependencies import get_current_user
from app.models.teacherInsight import TeacherInsight
from app.schemas.teacherInsight import TeacherInsightCreate, TeacherInsightResponse, TeacherInsightBase, JoinGroupRequest

router = APIRouter()

@router.post("/join", response_model=TeacherInsightResponse)
def join_group(request: JoinGroupRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required.")
    
    groups = db.query(TeacherInsight).filter(TeacherInsight.id == request.group_id).first()
    if not groups:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found.")
    

    if not current_user or current_user.role != "student":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only students can join groups.")
    
    user = db.query(User).filter(User.id == request.user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    
    if user in groups.members:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User already a member of the group.")

    groups.members.append(current_user)
    db.commit()
    db.refresh(groups)
    return groups