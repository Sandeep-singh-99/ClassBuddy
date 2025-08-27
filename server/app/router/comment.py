from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.models.comment import Comment
from app.models.auth import User, userRole
from app.schemas.comment import CommentCreate, CommentResponse
from app.dependencies.dependencies import get_db, get_current_user

router = APIRouter()


@router.post("/create-comment", response_model=CommentResponse)
def create_comment(
    comment: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Only STUDENTS can comment
    if current_user.role != userRole.STUDENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can write comments",
        )

    new_comment = Comment(
        content=comment.content,
        owner_id=current_user.id,
        note_id=comment.note_id,
    )

    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)

    return new_comment
