from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Header,
    UploadFile,
    File,
    Form,
    status,
)
from sqlalchemy.orm import Session
from app.config.db import get_db
from app.schemas.auth import UserResponse, UserOut
from app.models.auth import User
from app.utils.utils import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
)
from app.utils.cloudinary import upload_image

router = APIRouter()


def get_current_user_mobile(
    authorization: str = Header(None), db: Session = Depends(get_db)
):
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authentication scheme")
    except ValueError:
        raise HTTPException(
            status_code=401, detail="Invalid authorization header format"
        )

    try:
        payload = decode_access_token(token)
        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


@router.post("/register")
async def register(
    full_name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    role: str = Form("student"),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
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
        image_url_id=image_url_id,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # create JWT
    access_token = create_access_token({"sub": db_user.email})

    return {"user": db_user, "access_token": access_token, "token_type": "bearer"}


@router.post("/login")
def login(
    email: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)
):
    db_user = db.query(User).filter(User.email == email).first()
    if not db_user or not verify_password(password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    access_token = create_access_token({"sub": db_user.email})

    return {
        "message": "User logged in successfully",
        "access_token": access_token,
        "token_type": "bearer",
        "user": db_user,
    }


@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user_mobile)):
    return current_user


@router.post("/logout")
def logout(current_user: User = Depends(get_current_user_mobile)):
    return {"message": "Successfully logged out"}
