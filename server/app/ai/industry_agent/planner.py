import json
import re
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage
from dotenv import load_dotenv
from app.ai.industry_agent.state import IndustryState

load_dotenv()

# Using Groq AI ChatGroq model
llm = ChatGroq(model="groq/compound", temperature=0.2)


def extract_industry_name(raw_industry) -> str:
    """Extract clean string title from string or message list."""
    if isinstance(raw_industry, list) and len(raw_industry) > 0:
        last = raw_industry[-1]
        if hasattr(last, "content"):
            return str(last.content)
        return str(last)
    return str(raw_industry)


async def planner_node(state: IndustryState) -> dict:
    """
    Planner Node: Analyzes target industry and formulates optimal search queries
    for salary data, market outlook, key trends, and required skills.
    """
    raw_ind = state.get("industry", "")
    industry_name = extract_industry_name(raw_ind)

    prompt = f"""
You are an expert AI Career & Industry Strategist.
Analyze the target industry: "{industry_name}"

Formulate search parameters to retrieve up-to-date career insights, average salaries, market demand, top technical skills, and emerging industry trends.

Respond with ONLY a raw JSON object matching this structure:
{{
  "search_query": "Optimized Tavily search query string",
  "key_roles": ["Role 1", "Role 2", "Role 3"],
  "focus_areas": ["salary ranges", "growth percentage", "in-demand skills", "future outlook"]
}}

Return ONLY valid JSON with no markdown syntax wrapping.
"""

    response = await llm.ainvoke([HumanMessage(content=prompt)])
    content = response.content.strip()

    plan_data = {
        "search_query": f"latest industry trends salary growth rate for {industry_name}",
        "key_roles": [f"Senior {industry_name} Specialist", f"{industry_name} Engineer", f"Lead {industry_name} Analyst"],
        "focus_areas": ["salaries", "skills", "demand"],
    }

    try:
        json_match = re.search(r"\{.*\}", content, re.DOTALL)
        if json_match:
            parsed = json.loads(json_match.group())
            plan_data.update(parsed)
    except Exception as e:
        print(f"Industry Planner JSON parse error: {e}")

    return {
        "industry": industry_name,
        "plan": plan_data,
    }
