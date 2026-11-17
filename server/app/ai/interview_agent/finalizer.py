import json
from langchain_core.messages import HumanMessage
from app.ai.interview_agent.state import InterviewState
from app.schemas.interviewpreparation import QuizPayload


async def finalizer_node(state: InterviewState) -> dict:
    if not (state.get("evaluation") or {}).get("is_valid", False):
        raise ValueError("Quiz failed validation after repair attempts")
    payload = QuizPayload(questions=state.get("quiz", []))
    return {"quiz": [HumanMessage(content=json.dumps(payload.model_dump()))]}
