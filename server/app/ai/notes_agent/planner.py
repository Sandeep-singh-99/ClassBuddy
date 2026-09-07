import json
import re
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from dotenv import load_dotenv
from app.ai.notes_agent.state import NotesState

load_dotenv()

llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.2)


async def planner_node(state: NotesState) -> dict:
    """
    Planner Node: Analyzes the topic, plans study notes structure,
    and decides if web research is required.
    """
    topic = state.get("topic", "")

    prompt = f"""
You are an expert AI Curriculum Planner.
Analyze the following lesson/study topic provided by a teacher:

Topic: "{topic}"

Determine the optimal structure for comprehensive study notes and evaluate whether external web research is needed.

Respond with ONLY a raw JSON object matching this exact structure:
{{
  "need_research": true or false,
  "difficulty": "Beginner" | "Intermediate" | "Advanced",
  "target_audience": "Students",
  "include_examples": true,
  "include_quiz": true,
  "search_query": "Optimized Tavily search query string",
  "plan_summary": "Short 1-2 sentence overview of the note generation strategy"
}}

Rules:
1. Set "need_research" to true if the topic involves specific frameworks, recent technologies, current events, official documentation, or detailed technical specifications.
2. Provide a clear "search_query" formatted for web search engines.
3. Return ONLY valid JSON with no markdown wrapping or extra commentary.
"""

    response = await llm.ainvoke([HumanMessage(content=prompt)])
    content = response.content.strip()

    # Extract JSON safely
    plan_data = {
        "need_research": True,
        "difficulty": "Intermediate",
        "target_audience": "Students",
        "include_examples": True,
        "include_quiz": True,
        "search_query": topic,
        "plan_summary": f"Comprehensive guide on {topic}",
    }

    try:
        json_match = re.search(r"\{.*\}", content, re.DOTALL)
        if json_match:
            parsed = json.loads(json_match.group())
            plan_data.update(parsed)
    except Exception as e:
        print(f"Planner JSON parse error: {e}")

    return {
        "plan": plan_data,
    }
