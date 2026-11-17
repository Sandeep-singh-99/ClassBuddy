import re
from pydantic import ValidationError
from app.ai.interview_agent.state import InterviewState
from app.schemas.interviewpreparation import QuizPayload


async def evaluator_node(state: InterviewState) -> dict:
    raw = state.get("raw_quiz_output", "").replace("```json", "").replace("```", "").strip()
    try:
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        quiz = QuizPayload.model_validate_json(match.group() if match else raw)
    except (ValidationError, ValueError):
        return {"quiz": [], "evaluation": {"is_valid": False, "reason": "Return exactly five valid questions; each answer must identify a distinct stored option."}}
    return {"quiz": [q.model_dump() for q in quiz.questions], "evaluation": {"is_valid": True, "reason": "Quiz validation passed."}}
