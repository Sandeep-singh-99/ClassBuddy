from pydantic import BaseModel, Field
from typing import Dict

class InterviewPreparationCreate(BaseModel):
    name: str = Field(..., examples=["Technical Interview Prep"])
    description: str = Field(..., examples=["Preparation for technical interviews"])
    # questions: Dict[str, str] = Field(
    #     ..., 
    #     examples=[{"question1": "What is polymorphism?", "question2": "Explain OOP concepts."}]
    # )
    

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