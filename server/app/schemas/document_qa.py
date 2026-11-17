from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class ClassroomOut(BaseModel):
    id: str
    name: str
    can_ask: bool


class IndexedDocumentOut(BaseModel):
    id: str
    title: str
    status: Literal["pending", "ready", "error", "unsupported"]
    page_count: int
    error: str | None = None


class QuestionRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    question: str = Field(min_length=3, max_length=1000)


class Evidence(BaseModel):
    chunk_id: int
    quote: str = Field(min_length=1, max_length=600)


class GroundedAnswer(BaseModel):
    found: bool
    answer: str = Field(max_length=8000)
    evidence: list[Evidence] = Field(max_length=6)


class CitationOut(BaseModel):
    document_id: str
    title: str
    page: int
    quote: str


class AnswerOut(BaseModel):
    answer: str
    found: bool
    citations: list[CitationOut]
