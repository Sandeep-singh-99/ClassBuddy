from sqlalchemy.orm import Session
from fastapi import HTTPException, UploadFile
from app.models.auth import User
from app.utils.utils import hash_password, verify_password, create_access_token
from app.utils.cloudinary import upload_image, delete_image

class AuthService:
    @staticmethod
    def register_user(db: Session, full_name: str, email: str, password: str, role: str, image: UploadFile = None) -> tuple[User, str]:
        # Check existing user
        if db.query(User).filter(User.email == email).first():
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Hash password
        hashed_password = hash_password(password)

        # Handle Image upload
        image_url, image_url_id = None, None
        if image:
            result = upload_image(image.file, folder="Classbuddy")
            image_url, image_url_id = result['url'], result['public_id']

        # Create User
        db_user = User(
            full_name=full_name,
            email=email,
            role=role,
            hashed_password=hashed_password,
            image_url=image_url,
            image_url_id=image_url_id
        )

        db.add(db_user)

        try:
            db.commit()
            db.refresh(db_user)
        except Exception:
            db.rollback()
            if image_url_id:
                delete_image(image_url_id)
            raise HTTPException(status_code=500, detail="Registration failed due to a server error. Please try again.")
        
        # Generate token
        access_token = create_access_token({"sub": db_user.email})
        return db_user, access_token
    
    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> tuple[User, str]:
        db_user = db.query(User).filter(User.email == email).first()
        
        if not db_user or not verify_password(password, db_user.hashed_password):
            raise HTTPException(status_code=400, detail="Invalid credentials")

        access_token = create_access_token({"sub": db_user.email})
        return db_user, access_token