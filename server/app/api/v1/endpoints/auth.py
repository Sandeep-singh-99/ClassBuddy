from fastapi import APIRouter, Depends, HTTPException, Response, UploadFile, File, Form, status, Request
from sqlalchemy.orm import Session, joinedload
from app.config.db import get_db
from app.schemas.auth import UserCreate, UserLogin, UserResponse, MessageResponse
from app.models.auth import User
from app.dependencies.dependencies import get_current_user
from app.core.rate_limiter import limiter
from app.services.auth_service import AuthService


router = APIRouter()

# @router.post("/register", response_model=UserResponse)
# @limiter.limit("10/minute")
# async def register(
#     request: Request,
#     response: Response,
#     full_name: str = Form(...),
#     email: str = Form(...),
#     password: str = Form(...),
#     role: str = Form("student"),
#     image: UploadFile = File(None),
#     db: Session = Depends(get_db)
# ):
#     # check email
#     existing_user = db.query(User).filter(User.email == email).first()
#     if existing_user:
#         raise HTTPException(status_code=400, detail="Email already registered")

#     # hash password
#     hashed_password = hash_password(password)

#     # upload image
#     image_url, image_url_id = None, None
#     if image:
#         result = upload_image(image.file, folder="ClassBuddy")
#         image_url, image_url_id = result["url"], result["public_id"]

#     # create user
#     db_user = User(
#         full_name=full_name,
#         email=email,
#         role=role,
#         hashed_password=hashed_password,
#         image_url=image_url,
#         image_url_id=image_url_id
#     )
#     db.add(db_user)

#     try:
#         db.commit()
#         db.refresh(db_user)
#     except Exception as e:
#         db.rollback()

#         if image_url_id:
#             delete_image(image_url_id)

#         raise HTTPException(status_code=500, detail="Registration failed due to a server error. Please try again.")

#     # create JWT
#     access_token = create_access_token({"sub": db_user.email})

#     # set cookie
#     response.set_cookie(
#         key="access_token",
#         value=access_token,
#         httponly=True,
#         max_age=60*60*24*15,
#         secure=True,
#         samesite="none"
#     )
#     return db_user


@router.post("/register", response_model=UserResponse)
@limiter.limit("10/minute")
async def register(request: Request, response: Response, user_data: UserCreate = Depends(UserCreate.as_form), image: UploadFile = File(None), db: Session = Depends(get_db)):
    db_user, access_token = AuthService.register_user(
        db=db,
        full_name=user_data.full_name, 
        email=user_data.email, 
        password=user_data.password, 
        role=user_data.role, 
        image=image
    )

    response.set_cookie(
        key="access_token", value=access_token, httponly=True,
        max_age=60*60*24*15, secure=True, samesite="none"
    )
    return db_user


@router.post("/login", response_model=MessageResponse)
@limiter.limit("10/minute")
def login(
    request: Request,
    response: Response,
    credentials: UserLogin, 
    db: Session = Depends(get_db)
):
    _, access_token = AuthService.authenticate_user(
        db, credentials.email, credentials.password
    )

    response.set_cookie(
        key="access_token", value=access_token, httponly=True,
        max_age=60*60*24*15, secure=True, samesite="none"
    )
    return MessageResponse(message="User logged in successfully")


@router.get("/me", response_model=UserResponse)
@limiter.limit("10/minute")
def read_users_me(request: Request, current_user: User = Depends(get_current_user)):
    return current_user



@router.post("/logout", response_model=MessageResponse)
@limiter.limit("10/minute")
def logout(
    request: Request, 
    response: Response, 
    current_user: User = Depends(get_current_user)
):
    response.delete_cookie(
        key="access_token", httponly=True, secure=True, samesite="none"
    )
    return MessageResponse(message="Successfully logged out")
