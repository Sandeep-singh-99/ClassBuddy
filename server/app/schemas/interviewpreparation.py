from pydantic import BaseModel, Field
from typing import Dict, Union, Optional, List
from datetime import datetime

class Question(BaseModel):
    question: str
    options: List[str]
    answer: str
    explanation: str

class InterviewPreparationCreate(BaseModel):
    name: str = Field(..., examples=["Technical Interview Prep"])
    description: str = Field(..., examples=["Preparation for technical interviews"])


class InterviewPreparationCreateResponse(BaseModel):
    name: str = Field(..., examples=["Technical Interview Prep"])
    description: str = Field(..., examples=["Preparation for technical interviews"])
    questions: List[Question]

class InterviewPrepSubmit(BaseModel):
    id: str
    score: int
    user_answers: dict

    class Config:
        from_attributes = True

class InterviewPreparationResponse(BaseModel):
    name: str
    description: str
    questions: List[Question]
    score: int
    user_answers: Dict[Union[int, str], str]
    user_id: Optional[str] = None

    class Config:
        from_attributes = True


class InterviewResponse(BaseModel):
    id: str
    name: str
    description: str
    questions: List[Dict]
    score: int
    user_answers: Union[Dict[str, str], str] = {}
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True