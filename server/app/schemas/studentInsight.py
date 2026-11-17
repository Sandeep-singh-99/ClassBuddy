from datetime import datetime
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, model_validator
from app.schemas.auth import UserResponse

Text = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=4000)]


class StudentInsightCreate(BaseModel):
    industry: str = Field(min_length=1, max_length=200)


class SalaryRange(BaseModel):
    model_config = ConfigDict(extra="forbid")
    role: Text
    min: int = Field(ge=0)
    max: int = Field(ge=0)
    median: int = Field(ge=0)
    location: Text

    @model_validator(mode="after")
    def ordered_salary(self):
        if not self.min <= self.median <= self.max:
            raise ValueError("Salary must satisfy min <= median <= max")
        return self


class StudentInsightBase(BaseModel):
    model_config = ConfigDict(extra="forbid")
    salary_range: list[SalaryRange] = Field(min_length=1, max_length=20)
    growth_rate: float = Field(allow_inf_nan=False)
    demand_level: Literal["High", "Medium", "Low"]
    top_skills: list[Text] = Field(min_length=1, max_length=30)
    market_outlook: Text
    key_trends: list[Text] = Field(min_length=1, max_length=30)
    recommend_skills: list[Text] = Field(min_length=1, max_length=30)


class StudentInsightResponse(StudentInsightBase):
    model_config = ConfigDict(from_attributes=True, extra="forbid")
    id: str
    created_at: datetime
    updated_at: datetime
    owner: UserResponse | None
