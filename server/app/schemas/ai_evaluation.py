from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, RootModel, StrictInt, StringConstraints, model_validator


class AssignmentAnswers(RootModel[dict[str, Annotated[str, StringConstraints(max_length=5000)]]]):
    @model_validator(mode="after")
    def limit_answers(self):
        if not self.root or len(self.root) > 50 or sum(map(len, self.root.values())) > 50_000:
            raise ValueError("Submit between 1 and 50 answers, with at most 50,000 characters total")
        return self


class EvaluationQuestion(BaseModel):
    id: StrictInt
    type: Literal["theory", "coding"]
    question: str = Field(min_length=1, max_length=10_000)


class QuestionGrade(BaseModel):
    model_config = ConfigDict(extra="forbid")
    id: StrictInt
    marks: Annotated[StrictInt, Field(ge=0, le=5)]


class GradeEvaluation(BaseModel):
    model_config = ConfigDict(extra="forbid")
    grades: list[QuestionGrade] = Field(min_length=1, max_length=50)
    final_feedback: str = Field(min_length=1, max_length=4000)
