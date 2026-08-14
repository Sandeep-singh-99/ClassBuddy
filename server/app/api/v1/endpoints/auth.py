from fastapi import APIRouter, Depends, UploadFile, File, Request
from sqlalchemy.orm import Session
from app.config.db import get_db
from app.schemas.auth import UserCreate, UserResponse
from app.core.rate_limiter import limiter
from app.services.auth_service import AuthService


router = APIRouter()


@router.post("/register", response_model=UserResponse)
@limiter.limit("10/minute")
async def register(
    request: Request,
    user_data: UserCreate = Depends(UserCreate.as_form),
    image: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    """
    Registers a new ClassBuddy user.
    Does NOT issue access tokens. After registration, the user must authenticate via OAuth2.
    """
    db_user = AuthService.register_user(
        db=db,
        full_name=user_data.full_name, 
        email=user_data.email, 
        password=user_data.password, 
        role=user_data.role, 
        image=image
    )
    return db_user

