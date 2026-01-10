from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class TeacherPlanResponse(BaseModel):
    id: str
    group_id: str
    group_name: str
    plan_name: str
    amount: int
    validity_days: int
    created_at: datetime

    class Config:
        from_attributes = True


class UpdatePlanSchema(BaseModel):
    plan_name: Optional[str] = None
    amount: Optional[int] = None
    validity_days: Optional[int] = None