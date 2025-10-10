from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional
from app.schemas.auth import UserResponse

# -----------------------------
# Question Schemas
# -----------------------------
class AssignmentQuestionBase(BaseModel):
    question_text: str = Field(..., example="Explain the concept of recursion.")


class AssignmentQuestionCreate(BaseModel):
    title: str = Field(..., example="Python Basics")
    description: str = Field(..., example="Complete the exercises on loops and functions.")
    due_date: datetime = Field(..., example="2025-10-20T18:30:00Z")


class AssignmentQuestionResponse(AssignmentQuestionBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  


# -----------------------------
# Assignment Schemas
# -----------------------------
class AssignmentBase(BaseModel):
    id: str = Field(..., example="assignment-uuid-here")
    title: str = Field(..., example="Python Basics")
    description: str = Field(..., example="Complete the exercises on loops and functions.")
    due_date: datetime = Field(..., example="2025-10-20T18:30:00Z")


class AssignmentCreate(AssignmentBase):
    questions: Optional[List[AssignmentQuestionCreate]] = []


class AssignmentResponse(AssignmentBase):
    id: str
    owner_id: str
    owner: UserResponse
    created_at: datetime
    updated_at: datetime
    questions: List[AssignmentQuestionResponse] = []

    class Config:
        from_attributes = True


class SubmissionBase(BaseModel):
    grade: Optional[int] = Field(None, example=85)
    feedback: Optional[str] = Field(None, example="Good understanding of recursion.")


class SubmissionCreate(BaseModel):
    assignment_id: str = Field(..., example="assignment-uuid-here")
    answers: str = Field(..., example="Recursion is a process where a function calls itself.")


class SubmissionResponse(SubmissionBase):
    id: str
    assignment_id: str
    student_id: str
    submitted_at: datetime

    class Config:
        from_attributes = True