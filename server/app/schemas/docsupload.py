from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from fastapi import UploadFile


class DocsUploadBase(BaseModel):
    pass

class DocsBase(BaseModel):
    id: str
    filename: str
    file_url: str

    class Config:
        from_attributes = True

class DocsUploadResponse(BaseModel):
    count: int
    docsuploads: list[DocsBase]

    class Config:
        from_attributes = True
