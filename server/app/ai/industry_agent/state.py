from typing import TypedDict, Optional, Dict, Any, List
from langchain_core.messages import HumanMessage


class IndustryState(TypedDict):
    industry: str
    plan: Optional[Dict[str, Any]]
    research: str
    insight_data: Optional[Dict[str, Any]]
    evaluation: Optional[Dict[str, Any]]
    iteration: int
    max_iterations: int
    getIndustry: List[HumanMessage]
