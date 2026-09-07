import json
from langchain_core.messages import HumanMessage
from app.ai.industry_agent.state import IndustryState


async def finalizer_node(state: IndustryState) -> dict:
    """
    Finalizer Node: Serializes final approved insight data into getIndustry HumanMessage list
    for backward compatibility with legacy API and background task callers.
    """
    insight_data = state.get("insight_data") or {}

    # Ensure getIndustry is populated with JSON content message
    json_str = json.dumps(insight_data)

    return {
        "getIndustry": [HumanMessage(content=json_str)],
    }
