import json
import re
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage
from dotenv import load_dotenv
from app.ai.industry_agent.state import IndustryState

load_dotenv()

# Using Groq AI ChatGroq model
llm = ChatGroq(model="groq/compound", temperature=0.3)


async def analyzer_node(state: IndustryState) -> dict:
    """
    Industry Analyzer Node: Synthesizes research data into a structured
    industry insights JSON schema using Groq AI.
    """
    industry_name = state.get("industry", "")
    research_data = state.get("research", "")

    prompt = f"""
You are an expert Industry Analyst and Data Scientist.

Using the following market research data:
{research_data}

Analyze the "{industry_name}" industry and return ONLY a raw JSON object matching this EXACT database schema:

IMPORTANT RULES:
1. Every single field MUST be populated with realistic, non-null values.
2. `salary_range` MUST be a list of objects containing `role` (str), `min` (number), `max` (number), `median` (number), `location` (str).
3. `growth_rate` MUST be a positive number representing estimated percentage annual growth (e.g. 12.5). Do NOT include % symbol.
4. `demand_level` MUST be one of: "High", "Medium", or "Low".
5. `top_skills`, `key_trends`, and `recommend_skills` MUST be non-empty lists of strings.
6. `market_outlook` MUST be a detailed descriptive string explaining future growth drivers.

JSON Structure:
{{
  "salary_range": [
    {{
      "role": "Role Title",
      "min": 60000,
      "max": 140000,
      "median": 95000,
      "location": "Global / Remote"
    }}
  ],
  "growth_rate": 10.5,
  "demand_level": "High",
  "top_skills": ["Skill 1", "Skill 2", "Skill 3"],
  "market_outlook": "Comprehensive market outlook summary for this industry.",
  "key_trends": ["Trend 1", "Trend 2", "Trend 3"],
  "recommend_skills": ["Recommended Skill 1", "Recommended Skill 2"]
}}

Return ONLY valid raw JSON without markdown wrapping (` ```json `).
"""

    response = await llm.ainvoke([HumanMessage(content=prompt)])
    content = response.content.strip()

    # Clean markdown block markers if present
    clean_content = content.replace("```json", "").replace("```", "").strip()

    parsed_json = None
    try:
        json_match = re.search(r"\{.*\}", clean_content, re.DOTALL)
        if json_match:
            parsed_json = json.loads(json_match.group())
    except Exception as e:
        print(f"Analyzer JSON parse error: {e}")

    return {
        "insight_data": parsed_json,
    }
