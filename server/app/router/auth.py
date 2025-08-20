from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from app.config.db import get_db
from app.schemas.auth import UserCreate, UserLogin, UserResponse, UserOut
from app.models.auth import User
from app.utils.utils import hash_password, verify_password, create_access_token
from app.dependencies.dependencies import get_current_user

router = APIRouter()

# Register
@router.post("/register", response_model=UserResponse)
def register(response: Response, user: UserCreate, db: Session = Depends(get_db)):
    # Check if email exists
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hash password
    hashed_password = hash_password(user.password)

    # Create user
    db_user = User(
        full_name=user.full_name,
        email=user.email,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Generate JWT
    access_token = create_access_token({"sub": db_user.email})

    # Set HttpOnly cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=60*60*24*15,  # 15 days
        secure=True,
        samesite="none"
    )
    print("Registered user:",db_user)
    return db_user


# Login
@router.post("/login")
def login(response: Response, user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()

    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    # Generate JWT
    access_token = create_access_token({"sub": db_user.email})

    # Set HttpOnly cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=60*60*24*15,
        secure=True,
        samesite="none"
    )

    return {"message": "User logged in successfully"}


@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/logout", response_model=UserOut)
def logout(response: Response, current_user: User = Depends(get_current_user)):
    response.delete_cookie("access_token")
    return current_user