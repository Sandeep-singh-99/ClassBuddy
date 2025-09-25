from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from fastapi import UploadFile


class DocsUploadBase(BaseModel):
    pass

class DocsUploadResponse(BaseModel):
    # id: Optional[str]
    filename: str
    file_url: str

    class Config:
        from_attributes = True
