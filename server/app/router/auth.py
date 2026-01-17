from fastapi import APIRouter, Depends, HTTPException, Response, UploadFile, File, Form, status, Request
from sqlalchemy.orm import Session, joinedload
from app.config.db import get_db
from app.schemas.auth import UserCreate, UserLogin, UserResponse, UserOut, userRole
from app.models.auth import User
from app.models.notes import Note
from app.models.teacherInsight import TeacherInsight
from app.schemas.notes import NotesResponse, NoteBaseResponse, TeacherNotesResponse
from app.schemas.teacherInsight import TeacherInsightResponse, TeacherInsightBase
from app.utils.utils import hash_password, verify_password, create_access_token
from app.dependencies.dependencies import get_current_user
from app.utils.cloudinary import upload_image, delete_image
from app.core.rate_limiter import limiter
from app.dependencies.require_active_subscription import check_active_subscription


router = APIRouter()

@router.post("/register", response_model=UserResponse)
@limiter.limit("10/minute")
async def register(
    request: Request,
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


@router.post("/login")
@limiter.limit("10/minute")
def login(
    request: Request,
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
@limiter.limit("10/minute")
def read_users_me(request: Request, current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/logout", response_model=UserOut)
@limiter.limit("10/minute")
def logout(request: Request, response: Response, current_user: User = Depends(get_current_user)):
    # response.delete_cookie("access_token")
    response.delete_cookie(
           key="access_token",
           httponly=True,
           secure=True,      
           samesite="none"   
    )
    return current_user


@router.get("/student/notes", response_model=TeacherNotesResponse, dependencies=[Depends(check_active_subscription)])
@limiter.limit("10/minute")
def get_group_notes_for_student(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Ensure only authenticated users can access
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    if current_user.role != userRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can view notes")

    # Fetch student with their groups
    student = db.query(User).options(joinedload(User.groups)).filter(User.id == current_user.id).first()

    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    if len(student.groups) == 0:
        raise HTTPException(status_code=400, detail="You haven't joined any groups")

    # Get all group IDs the student is part of
    group_ids = [group.id for group in student.groups]

    # Fetch all notes for those groups
    notes = db.query(Note).filter(Note.group_id.in_(group_ids)).all()

    if not notes:
        raise HTTPException(status_code=404, detail="Teacher has not uploaded any notes")

    return {
        "count": len(notes),
        "notes": notes
    }