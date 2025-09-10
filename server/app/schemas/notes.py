from pydantic import BaseModel, Field
from typing import Optional

class NotesCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    content: str = Field(..., min_length=1)


class NotesResponse(BaseModel):
    id: str
    title: str
    content: str
    created_at: str
    updated_at: str
    owner_id: str

    class Config:
        from_attributes = True

class EditNotes(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    content: Optional[str] = Field(None, min_length=1)