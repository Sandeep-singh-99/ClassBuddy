from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from app.schemas.auth import UserResponse


class GroupMessageBase(BaseModel):
    message: str


class GroupMessageCreate(GroupMessageBase):
    group_id: str
    sender_id: str


class GroupMessageResponse(BaseModel):
    id: str
    group_id: str
    sender_id: str
    message: str
    created_at: datetime
    sender: UserResponse

    class Config:
        from_attributes = True


class GroupMessageListResponse(BaseModel):
    messages: list[GroupMessageResponse]

    class Config:
        from_attributes = True


class GroupResponse(BaseModel):
    id: str
    group_name: str
    group_des: Optional[str] = None
    image_url: Optional[str] = None
    owner: UserResponse

    class Config:
        from_attributes = True


class GroupListResponse(BaseModel):
    groups: List[GroupResponse]


class SendMessageRequest(BaseModel):
    group_id: Optional[str] = None
    message: str
