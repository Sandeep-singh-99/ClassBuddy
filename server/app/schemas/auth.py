from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from fastapi import UploadFile
from app.models.auth import userRole

class UserCreate(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    image_url: UploadFile
    role: Optional[userRole] = userRole.STUDENT
    industry: str = Field(..., min_length=1, max_length=100)
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)


class UserResponse(BaseModel):
    id: str
    full_name: str
    email: EmailStr
    role: userRole
    industry: str
    image_url: str | None = None

    class Config:
        from_attributes = True


class UserOut(BaseModel):
    id: str
    full_name: str
    email: EmailStr

    class Config:
        from_attributes = True
