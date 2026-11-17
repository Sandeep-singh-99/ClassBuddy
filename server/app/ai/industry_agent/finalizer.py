import json
from langchain_core.messages import HumanMessage
from app.ai.industry_agent.state import IndustryState
from app.schemas.studentInsight import StudentInsightBase


async def finalizer_node(state: IndustryState) -> dict:
    if not (state.get("evaluation") or {}).get("is_valid", False):
        raise ValueError("Industry report failed validation after repair attempts")
    data = StudentInsightBase.model_validate(state.get("insight_data"))
    return {"getIndustry": [HumanMessage(content=json.dumps(data.model_dump()))]}
