from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class NotesCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    content: str = Field(..., min_length=1)


class NoteBaseResponse(BaseModel):
    id: str
    title: str
    content: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TeacherNotesResponse(BaseModel):
    count: int
    notes: list[NoteBaseResponse]

    class Config:
        from_attributes = True

class NotesResponse(BaseModel):
    id: str
    title: str
    content: str
    created_at: datetime
    updated_at: datetime
    owner_id: str

    class Config:
        from_attributes = True

class EditNotes(BaseModel):
    id: str
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    content: Optional[str] = Field(None, min_length=1)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        from_attributes = True