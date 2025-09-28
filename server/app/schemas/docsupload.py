from pydantic import BaseModel, EmailStr, Field
from app.schemas.auth import UserResponse
from datetime import datetime


class DocsUploadBase(BaseModel):
    pass

class DocsBase(BaseModel):
    id: str
    filename: str
    file_url: str
    owner: UserResponse
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DocsUploadResponse(BaseModel):
    count: int
    docsuploads: list[DocsBase]

    class Config:
        from_attributes = True
