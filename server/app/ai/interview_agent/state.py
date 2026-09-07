from typing import TypedDict, List, Optional, Dict, Any

class InterviewState(TypedDict, total=False):
    """
    State object for the Interview Preparation AI Agent.
    """
    description: str
    plan: Dict[str, Any]
    research: str
    quiz: List[Dict[str, Any]]
    raw_quiz_output: str
    evaluation: Dict[str, Any]
    iteration: int
    max_iterations: int
