from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.config.db import get_db
from app.models.auth import User
from app.dependencies.dependencies import get_current_user
from app.models.teacherInsight import TeacherInsight
from app.schemas.teacherInsight import TeacherInsightCreate, TeacherInsightResponse, TeacherInsightBase

router = APIRouter()

@router.post("/teacher-insights", response_model=TeacherInsightResponse)
def create_teacher_insight(db: Session = Depends(get_db), current_user: User = Depends(get_current_user), insight: TeacherInsightCreate = Depends()):
    if not current_user or current_user.role != "teacher":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only teachers can create insights.")
    
    new_insight = TeacherInsight(
        group_name=insight.group_name,
        group_des=insight.group_des,
        user_id=current_user.id
    )
    db.add(new_insight)
    db.commit()
    db.refresh(new_insight)
    return new_insight

@router.get("/teacher-insights", response_model=list[TeacherInsightResponse])
def get_teacher_insights(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Authentication required")
    
    insights = db.query(TeacherInsight).all()

    return insights