from fastapi import APIRouter, Depends, HTTPException, status, Form
from sqlalchemy.orm import Session, joinedload
from app.config.db import get_db
from app.models.auth import User, userRole
from app.dependencies.dependencies import get_current_user
from app.models.teacherInsight import TeacherInsight
from app.schemas.teacherInsight import TeacherInsightCreate, TeacherInsightResponse, TeacherInsightBase, JoinGroupRequest
from app.schemas.auth import UserResponse

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

    # Fetch ORM user from DB to ensure it's attached to the active session
    orm_user = db.query(User).filter(User.id == current_user.id).first()
    if not orm_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found in database.")

    # Only students can join groups
    if orm_user.role != userRole.STUDENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can join groups."
        )

    # Find the group
    group = (
        db.query(TeacherInsight)
        .options(joinedload(TeacherInsight.members))  
        .filter(TeacherInsight.id == request.group_id)
        .first()
    )
    if not group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found.")

    # Check if already a member
    if any(member.id == orm_user.id for member in group.members):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already in group."
        )

    # Add user to group
    group.members.append(orm_user)
    db.add(group)  # Explicitly add to session
    db.commit()
    db.refresh(group)

    return group



@router.get("/joined-or-not/{group_id}")
def check_if_user_joined_group(
    group_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Ensure the user is authenticated
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required."
        )
    
    if current_user.role != userRole.STUDENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can check group membership."
        )

    # Find the group
    group = db.query(TeacherInsight).filter(TeacherInsight.id == group_id).first()
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found."
        )

    # Check if user is in the group's members
    is_member = current_user in group.members

    return {"group_id": group_id, "joined": is_member}


@router.get("/view-students", response_model=list[TeacherInsightResponse])
def view_students_in_teacher_groups(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Ensure the user is authenticated
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required."
        )

    # Only teachers can view students in their groups
    if current_user.role != userRole.TEACHER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers can view students in their groups."
        )

    #  Fetch only groups owned by this teacher
    groups = (
        db.query(TeacherInsight)
        .filter(TeacherInsight.user_id == current_user.id)
        .all()
    )

    if not groups:
        return []  

    result = []
    for group in groups:
        # Convert owner (teacher) ORM object to Pydantic
        owner_data = UserResponse.from_orm(group.owner)

        # Only include students (filter members by role)
        student_members = [
            UserResponse.from_orm(member)
            for member in group.members
            if member.role == userRole.STUDENT
        ]

        group_data = TeacherInsightResponse(
            id=str(group.id),
            group_name=group.group_name,
            group_des=group.group_des,
            image_url=group.image_url,
            created_at=group.created_at,
            updated_at=group.updated_at,
            owner=owner_data,
            members=student_members,
            students_count=len(student_members)  
        )
        result.append(group_data)

    return result

