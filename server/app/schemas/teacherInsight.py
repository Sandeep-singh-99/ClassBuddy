from pydantic import BaseModel, Field
from typing import List
from datetime import datetime
from typing import Optional
from app.schemas.auth import UserResponse


class TeacherInsightBase(BaseModel):
    group_name: str = Field(..., example="Math Group")
    group_des: str = Field(..., example="A group for math enthusiasts")
    image_url: str = Field(..., example="http://example.com/image.png")


class TeacherInsightCreate(TeacherInsightBase):
    pass

class TeacherInsightResponse(TeacherInsightBase):
    id: str
    created_at: datetime
    updated_at: datetime

    owner: UserResponse
    members: List[UserResponse] = []

    students_count: int = 0

    class Config:
        from_attributes = True


class JoinGroupRequest(BaseModel):
    # user_id: Optional[str]  # student who is joining
    group_id: str  # group to join