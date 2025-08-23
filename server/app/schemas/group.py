from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# ========== User Schema (nested use inside Group) ==========
class UserOut(BaseModel):
    id: str
    full_name: str
    email: str
    role: str

    class Config:
        orm_mode = True


# ========== Group Base ==========
class GroupBase(BaseModel):
    group_name: str
    description: Optional[str] = None


# ========== Create Group ==========
class GroupCreate(GroupBase):
    pass


# ========== Update Group ==========
class GroupUpdate(BaseModel):
    group_name: Optional[str] = None
    description: Optional[str] = None


# ========== Group Response ==========
class GroupResponse(GroupBase):
    id: str
    group_name: str
    description: str
    created_by: str
    created_at: datetime
    updated_at: datetime

    teacher: Optional[UserOut] = None
    members: List[UserOut] = []

    class Config:
        orm_mode = True
