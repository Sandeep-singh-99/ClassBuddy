from typing import TypedDict, Optional, Dict, Any


class PlannerOutput(TypedDict):
    need_research: bool
    difficulty: str
    target_audience: str
    include_examples: bool
    include_quiz: bool
    search_query: str
    plan_summary: str


class EvaluationOutput(TypedDict):
    is_good: bool
    score: int
    feedback: str


class NotesState(TypedDict):
    topic: str
    plan: Optional[Dict[str, Any]]
    research: str
    notes: str
    evaluation: Optional[Dict[str, Any]]
    iteration: int
    max_iterations: int
    final_notes: str
