import json
import re
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage
from dotenv import load_dotenv
from app.ai.industry_agent.state import IndustryState

load_dotenv()

# Using Groq AI ChatGroq model
llm = ChatGroq(model="groq/compound", temperature=0.2)


async def improver_node(state: IndustryState) -> dict:
    """
    Improver Node: Refines and repairs the industry insight JSON object
    if schema validation fails.
    """
    industry_name = state.get("industry", "")
    current_data = state.get("insight_data")
    evaluation = state.get("evaluation") or {}
    feedback = evaluation.get("feedback", "Ensure all fields are populated correctly.")
    iteration = state.get("iteration", 0)

    prompt = f"""
You are an expert Data Remediation Engineer.

The generated JSON insight for "{industry_name}" failed validation.

## Validation Errors:
{feedback}

## Original JSON Attempt:
{json.dumps(current_data, indent=2) if current_data else "None"}

Please fix all schema errors and return ONLY a clean, valid raw JSON object matching:
{{
   "salary_range": [{{"role": "string", "min": number, "max": number, "median": number, "location": "string"}}],
   "growth_rate": number,
   "demand_level": "High" | "Medium" | "Low",
   "top_skills": ["string"],
   "market_outlook": "string",
   "key_trends": ["string"],
   "recommend_skills": ["string"]
}}

Return ONLY valid raw JSON with no markdown block wrappers.
"""

    response = await llm.ainvoke([HumanMessage(content=prompt)])
    content = response.content.strip().replace("```json", "").replace("```", "").strip()

    parsed_json = None
    try:
        json_match = re.search(r"\{.*\}", content, re.DOTALL)
        if json_match:
            parsed_json = json.loads(json_match.group())
    except Exception as e:
        print(f"Improver JSON parse error: {e}")

    return {
        "insight_data": parsed_json,
        "iteration": iteration + 1,
    }
