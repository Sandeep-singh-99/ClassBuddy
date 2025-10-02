from pydantic import BaseModel, Field
from typing import List
from datetime import datetime
from typing import Optional
from app.schemas.auth import UserResponse

class StudentInsightBase(BaseModel):
    salary_range: dict = Field(..., example={"min": 50000, "max": 120000})
    growth_rate: float = Field(..., example=5.4)
    demand_level: str = Field(..., example="High")
    top_skills: List[str] = Field(..., example=["Python", "Data Analysis", "Machine Learning"])
    market_outlook: str = Field(..., example="The job market for data scientists is expected to grow significantly over the next decade.")
    key_trends: List[str] = Field(..., example=["Increased use of AI", "Big Data Analytics", "Cloud Computing"])
    recommend_skills: List[str] = Field(..., example=["Deep Learning", "Statistical Analysis", "Data Visualization"])


class StudentInsightResponse(StudentInsightBase):
    id: int
    created_at: datetime
    updated_at: datetime
    user: Optional[UserResponse]  

    class Config:
        from_attributes = True