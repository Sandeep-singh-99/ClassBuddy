from pydantic import ValidationError
from app.ai.industry_agent.state import IndustryState
from app.schemas.studentInsight import StudentInsightBase


async def evaluator_node(state: IndustryState) -> dict:
    try:
        StudentInsightBase.model_validate(state.get("insight_data"))
    except ValidationError:
        return {"evaluation": {"is_valid": False, "feedback": "Return only the required report fields with valid salary ranges, finite growth, and non-empty skill/trend lists."}}
    return {"evaluation": {"is_valid": True, "feedback": "Schema validation passed."}}
