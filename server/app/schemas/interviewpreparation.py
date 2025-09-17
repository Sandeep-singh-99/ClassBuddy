from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from fastapi import UploadFile


class InterviewPreparationCreate(BaseModel):
    name: str = Field(..., examples="Technical Interview Prep")
    description: str = Field(..., examples="Preparation for technical interviews")
    questions: dict = Field(..., examples={"question1": "What is polymorphism?", "question2": "Explain OOP concepts."})
    

class InterviewPreparationResponse(BaseModel):
    id: str
    name: str
    description: str
    questions: dict
    score: int
    improvement: str
    user_id: str

    class Config:
        from_attributes = True