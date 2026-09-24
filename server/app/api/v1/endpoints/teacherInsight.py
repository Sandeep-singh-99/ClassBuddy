from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.config.db import get_db
from app.models.auth import User, userRole
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

    # Only return groups created by teachers who have explicitly created a TeacherInsight record
    insights = (
        db.query(TeacherInsight)
        .join(User, TeacherInsight.user_id == User.id)
        .all()
    )

    if not insights:
        return []

    insights.sort(key=lambda x: x.created_at, reverse=True)

    result = []
    for insight in insights:
        owner_data = UserResponse.from_orm(insight.owner)
        student_members = [
            UserResponse.from_orm(member)
            for member in (insight.members or [])
            if hasattr(member, "role") and (
                member.role == userRole.STUDENT or str(member.role) == "student"
            )
        ]

        insight_response = TeacherInsightResponse(
            id=str(insight.id),
            group_name=insight.group_name,
            group_des=insight.group_des,
            image_url=insight.image_url or "",
            created_at=insight.created_at,
            updated_at=insight.updated_at,
            owner=owner_data,
            members=student_members,
            students_count=len(student_members),
        )
        result.append(insight_response)

    return result