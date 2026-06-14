from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from app.models.auth import userRole
from fastapi import Form

class UserCreate(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    role: Optional[userRole] = userRole.STUDENT
    password: str = Field(..., min_length=6)

    @classmethod
    def as_form(
        cls,
        full_name: str = Form(..., min_length=1, max_length=100),
        email: EmailStr = Form(...),
        password: str = Form(..., min_length=6),
        role: userRole = Form(userRole.STUDENT)
    ):
        """ Dependency to parse form data into pydantic model. """
        return cls(full_name=full_name, email=email, password=password, role=role)


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)


class UserResponse(BaseModel):
    id: str
    full_name: str
    email: EmailStr
    role: userRole
    image_url: str | None = None

    class Config:
        from_attributes = True


class MessageResponse(BaseModel):
    message: str
