from pydantic import BaseModel, EmailStr, Field

class UserCreate(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)


class UserResponse(BaseModel):
    id: str
    full_name: str
    email: EmailStr


class UserOut(BaseModel):
    id: str
    full_name: str
    email: EmailStr

    class Config:
        from_attributes = True
