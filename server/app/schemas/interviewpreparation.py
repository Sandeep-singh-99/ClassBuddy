import json
from pydantic import BaseModel, Field, model_validator, BeforeValidator
from typing import Annotated
from typing import Dict, Union, Optional, List
from datetime import datetime


def parse_stored_answers(value):
    return json.loads(value) if isinstance(value, str) else value


StoredAnswers = Annotated[dict[str, str], BeforeValidator(parse_stored_answers)]


class PublicQuestion(BaseModel):
    question: str
    options: List[str]


class Question(PublicQuestion):
    answer: str
    explanation: str = ""

    @model_validator(mode="after")
    def valid_answer(self):
        if len(self.options) < 2 or not self.question.strip() or not self.answer.strip():
            raise ValueError("A question needs text, options, and an answer")
        if not all(option.strip() for option in self.options) or len(set(self.options)) != len(self.options):
            raise ValueError("Options must be distinct non-empty strings")
        if self.answer not in self.options and self.answer not in {option.partition(". ")[0] for option in self.options}:
            raise ValueError("The answer must identify a stored option")
        return self


class QuizPayload(BaseModel):
    questions: list[Question] = Field(min_length=5, max_length=5)

    @model_validator(mode="after")
    def require_explanations(self):
        if any(not question.explanation.strip() for question in self.questions):
            raise ValueError("Generated questions need explanations")
        return self


class InterviewPreparationCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, examples=["Technical Interview Prep"])
    description: str = Field(..., min_length=1, max_length=4000, examples=["Preparation for technical interviews"])


class InterviewPreparationCreateResponse(BaseModel):
    name: str = Field(..., examples=["Technical Interview Prep"])
    description: str = Field(..., examples=["Preparation for technical interviews"])
    questions: List[Question]


class InterviewPrepSubmit(BaseModel):
    id: str
    user_answers: dict[str, str] = Field(max_length=50)

    class Config:
        from_attributes = True


class InterviewPreparationResponse(BaseModel):
    name: str
    description: str
    questions: List[Question]
    score: int
    status: str = "completed"
    user_answers: Dict[Union[int, str], str]
    user_id: Optional[str] = None

    class Config:
        from_attributes = True


class InterviewResponse(BaseModel):
    id: str
    name: str
    description: str
    questions: Optional[List[PublicQuestion]] = None
    score: int
    status: str = "completed"
    user_answers: StoredAnswers = {}
    user_id: str
    created_at: datetime
    updated_at: datetime
    submitted_at: datetime | None = None

    class Config:
        from_attributes = True


class InterviewPreparationAsyncResponse(BaseModel):
    id: str
    name: str
    description: str
    questions: Optional[List[PublicQuestion]] = None
    status: str = "generating"
    message: str


class InterviewQuizResponse(BaseModel):
    id: str
    name: str
    description: str
    questions: list[PublicQuestion]
    status: str
    score: int
    submitted_at: datetime | None = None


class QuizReview(BaseModel):
    id: str
    name: str
    questions: list[Question]
    score: int
    user_answers: StoredAnswers

    class Config:
        from_attributes = True


class QuizSubmissionResult(QuizReview):
    message: str
    quiz_id: str
