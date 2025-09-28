from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.schemas.auth import UserResponse

class NotesCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    content: str = Field(..., min_length=1)


class NoteBaseResponse(BaseModel):
    id: str
    title: str
    content: str
    created_at: datetime
    updated_at: datetime
    owner: UserResponse

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
    owner: UserResponse

    class Config:
        from_attributes = True

class EditNotes(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    content: Optional[str] = Field(None, min_length=1)

    class Config:
        from_attributes = True