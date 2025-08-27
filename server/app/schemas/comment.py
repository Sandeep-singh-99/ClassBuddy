from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CommentBase(BaseModel):
    content: str
    note_id: Optional[str] = None


class CommentCreate(CommentBase):
    pass


class CommentResponse(CommentBase):
    id: str
    owner_id: str
    created_at: datetime

    class Config:
        from_attributes = True
