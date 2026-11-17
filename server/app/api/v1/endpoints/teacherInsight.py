from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy import func, select
from sqlalchemy.orm import Session, contains_eager
from app.config.db import get_db
from app.models.auth import User, userRole, group_members
from app.dependencies.dependencies import get_current_user
from app.models.teacherInsight import TeacherInsight
from app.schemas.teacherInsight import TeacherInsightCreate, TeacherInsightResponse, TeacherInsightBase
from app.schemas.auth import UserResponse
from app.utils.cloudinary import upload_image, delete_image

router = APIRouter()


@router.post("/", response_model=TeacherInsightResponse)
def create_teacher_insight(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    group_name: str = Form(...),
    group_des: str = Form(...),
    image: UploadFile = File(None),
):
    role_val = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)
    if not current_user or role_val != "teacher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers can create insights.",
        )

    # Check if teacher has already created a group
    existing_group = (
        db.query(TeacherInsight)
        .filter(TeacherInsight.user_id == current_user.id)
        .first()
    )
    if existing_group:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already created a group. Only one group per teacher is allowed.",
        )

    image_url, image_url_id = None, None
    if image:
        result = upload_image(image.file, folder="ClassBuddy")
        image_url = result["url"]
        image_url_id = result["public_id"]

    new_insight = TeacherInsight(
        group_name=group_name,
        group_des=group_des,
        user_id=current_user.id,
        image_url=image_url,
        image_url_id=image_url_id,
    )

    db.add(new_insight)
    db.commit()
    db.refresh(new_insight)

    owner_data = UserResponse.from_orm(new_insight.owner)
    return TeacherInsightResponse(
        id=str(new_insight.id),
        group_name=new_insight.group_name,
        group_des=new_insight.group_des,
        image_url=new_insight.image_url or "",
        created_at=new_insight.created_at,
        updated_at=new_insight.updated_at,
        owner=owner_data,
        members=[],
        students_count=0,
    )


@router.get("/", response_model=list[TeacherInsightResponse])
def get_teacher_insights(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )

    students_count = (
        select(func.count())
        .select_from(group_members.join(User, group_members.c.user_id == User.id))
        .where(
            group_members.c.group_id == TeacherInsight.id,
            User.role == userRole.STUDENT,
        )
        .correlate(TeacherInsight)
        .scalar_subquery()
    )
    insights = (
        db.query(TeacherInsight, students_count)
        .join(User, TeacherInsight.user_id == User.id)
        .options(contains_eager(TeacherInsight.owner))
        .order_by(TeacherInsight.created_at.desc())
        .all()
    )

    if not insights:
        return []

    result = []
    for insight, count in insights:
        owner_data = UserResponse.from_orm(insight.owner)

        insight_response = TeacherInsightResponse(
            id=str(insight.id),
            group_name=insight.group_name,
            group_des=insight.group_des,
            image_url=insight.image_url or "",
            created_at=insight.created_at,
            updated_at=insight.updated_at,
            owner=owner_data,
            students_count=count,
        )
        result.append(insight_response)

    return result
