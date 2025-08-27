from pydantic import BaseModel
from typing import Optional
from datetime import datetime



class NoteBase(BaseModel):
    title: str
    content: Optional[str] = None
    pdf_url: Optional[str] = None
    pdf_url_id: Optional[str] = None


class NoteCreate(NoteBase):
    pass


class NoteResponse(NoteBase):
    id: str
    owner_id: str
    created_at: datetime

    class Config:
        from_attributes = True
