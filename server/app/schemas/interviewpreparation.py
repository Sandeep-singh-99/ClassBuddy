from pydantic import BaseModel, Field
from typing import Dict

class InterviewPreparationCreate(BaseModel):
    name: str = Field(..., examples=["Technical Interview Prep"])
    description: str = Field(..., examples=["Preparation for technical interviews"])
   

class InterviewPrepSubmit(BaseModel):
    id: str
    score: int
    user_answers: dict

    class Config:
        from_attributes = True

class InterviewPreparationResponse(BaseModel):
    id: str
    name: str
    description: str
    questions: dict
    score: int
    user_answers: dict
    user_id: str

    class Config:
        from_attributes = True