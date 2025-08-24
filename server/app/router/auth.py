from fastapi import APIRouter, Depends, HTTPException, Response, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.config.db import get_db
from app.schemas.auth import UserCreate, UserLogin, UserResponse, UserOut
from app.models.auth import User
from app.utils.utils import hash_password, verify_password, create_access_token
from app.dependencies.dependencies import get_current_user
from app.utils.cloudinary import upload_image, delete_image

router = APIRouter()

# # Register
# @router.post("/register", response_model=UserResponse)
# def register(response: Response, user: UserCreate = Depends(), db: Session = Depends(get_db)):
#     # Check if email exists
#     existing_user = db.query(User).filter(User.email == user.email).first()
#     if existing_user:
#         raise HTTPException(status_code=400, detail="Email already registered")

#     # Hash password
#     hashed_password = hash_password(user.password)

#     # image_url, image_url_id = None, None
#     if user.image_url:
#         result = upload_image(user.image_url, folder="users")

#     # Create user
#     db_user = User(
#         full_name=user.full_name,
#         email=user.email,
#         role=user.role,
#         hashed_password=hashed_password,
#         image_url=result["url"],
#         image_url_id=result["public_id"], 
#     )
#     db.add(db_user)
#     db.commit()
#     db.refresh(db_user)

#     # Generate JWT
#     access_token = create_access_token({"sub": db_user.email})

#     # Set HttpOnly cookie
#     response.set_cookie(
#         key="access_token",
#         value=access_token,
#         httponly=True,
#         max_age=60*60*24*15,  # 15 days
#         secure=True,
#         samesite="none"
#     )
#     print("Registered user:",db_user)
#     return db_user



@router.post("/register", response_model=UserResponse)
async def register(
    response: Response,
    full_name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    role: str = Form("student"),
    image: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    # check email
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # hash password
    hashed_password = hash_password(password)

    # upload image
    image_url, image_url_id = None, None
    if image:
        result = upload_image(image.file, folder="ClassBuddy")
        image_url, image_url_id = result["url"], result["public_id"]

    # create user
    db_user = User(
        full_name=full_name,
        email=email,
        role=role,
        hashed_password=hashed_password,
        image_url=image_url,
        image_url_id=image_url_id
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # create JWT
    access_token = create_access_token({"sub": db_user.email})

    # set cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=60*60*24*15,
        secure=True,
        samesite="none"
    )
    return db_user

# Login
# @router.post("/login")
# def login(response: Response, user: UserLogin, db: Session = Depends(get_db)):
#     db_user = db.query(User).filter(User.email == user.email).first()

#     if not db_user or not verify_password(user.password, db_user.hashed_password):
#         raise HTTPException(status_code=400, detail="Invalid credentials")

#     # Generate JWT
#     access_token = create_access_token({"sub": db_user.email})

#     # Set HttpOnly cookie
#     response.set_cookie(
#         key="access_token",
#         value=access_token,
#         httponly=True,
#         max_age=60*60*24*15,
#         secure=True,
#         samesite="none"
#     )

#     return {"message": "User logged in successfully"}

@router.post("/login")
def login(
    response: Response,
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    db_user = db.query(User).filter(User.email == email).first()
    if not db_user or not verify_password(password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    access_token = create_access_token({"sub": db_user.email})

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=60*60*24*15,
        secure=True,  # dev
        samesite="none"
    )

    return {"message": "User logged in successfully"}


@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/logout", response_model=UserOut)
def logout(response: Response, current_user: User = Depends(get_current_user)):
    # response.delete_cookie("access_token")
    response.delete_cookie(
           key="access_token",
           httponly=True,
           secure=True,      # must match login
           samesite="none"   # must match login
    )
    return current_user