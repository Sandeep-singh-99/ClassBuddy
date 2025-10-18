from fastapi import APIRouter, Depends, status, Form, File, HTTPException
from sqlalchemy.orm import Session
from typing import TypedDict, Annotated, Dict, List
from app.schemas.studentInsight import StudentInsightResponse, StudentInsightCreate
from app.dependencies.dependencies import get_current_user
from app.config.db import get_db
from app.models.auth import User, userRole
from app.schemas.auth import UserResponse
from app.models.studentInsight import StudentInsight
from dotenv import load_dotenv
from langgraph.graph import add_messages, StateGraph, END
from langchain_tavily import TavilySearch
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
from app.dependencies.redis_client import get_redis_client
import json
from datetime import datetime


load_dotenv()


class State(TypedDict):
    industry: Annotated[list, add_messages]
    research: Annotated[list, add_messages]
    getIndustry: Annotated[list, add_messages]


search_tool = TavilySearch(max_results=2)

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash", temperature=0, response_format="json"
)


def tavily_search_node(state: State):
    topic = state["industry"][-1].content
    search_results = search_tool.invoke({"query": topic})

    if not search_results or "results" not in search_results:
        combined_results = "No search results found."
    else:
        combined_results = "\n".join(
            [
                f"- {item['title']}: {item['content']}"
                for item in search_results["results"]
            ]
        )

    return {
        "industry": state["industry"],
        "research": [HumanMessage(content=combined_results)],
        "getIndustry": state.get("getIndustry", []),
    }


def generate_industry_node(state: State):
    ind = state["industry"][-1].content
    res = (
        state["research"][-1].content
        if state["research"]
        else "No research data available."
    )

    prompt = (
        f"Analyze the current state of the {ind} industry and provide insights in ONLY the following JSON format:\n\n"
        f"Research:\n{res}\n\n"
        '{{"salary_range": [{{"role": "string", "min": "number", "max": "number", "median": "number", "location": "string"}}]}}'
        '{{"growth_rate": "number"}}'
        '{{"demand_level": "High" | "Medium" | "Low"}}'
        '{{"top_skills": ["string"]}}'
        '{{"market_outlook": "Positive" | "Neutral" | "Negative"}}'
        '{{"key_trends": ["string"]}}'
        '{{"recommend_skills": ["string"]}}'
        "\n\nIMPORTANT: Return only the JSON. No additional text, notes, or markdown formatting. "
        "Include at least 5 roles, 5 skills, and 5 key trends."
    )

    response = llm.invoke(prompt)

    if not response or not response.content:
        raise HTTPException(
            status_code=500, detail="Failed to generate industry insights."
        )

    raw_output = response.content.strip()

    return {
        "industry": state["industry"],
        "research": state["research"],
        "getIndustry": [HumanMessage(content=raw_output)],
    }


workflow = StateGraph(State)
workflow.add_node("tavily_search", tavily_search_node)
workflow.add_node("generate_industry", generate_industry_node)
workflow.set_entry_point("tavily_search")

workflow.add_edge("tavily_search", "generate_industry")
workflow.add_edge("generate_industry", END)

graph = workflow.compile()

router = APIRouter()


@router.post("/generate-industry-insight", response_model=StudentInsightResponse)
def generate_industry_insight(
    industry: str = Form(..., description="The industry to generate insights for."),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != userRole.STUDENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can generate industry insights.",
        )

    initial_state: State = {
        "industry": [HumanMessage(content=industry)],
        "research": [],
        "getIndustry": [],
    }

    result = graph.invoke(initial_state)

    if not result.get("getIndustry"):
        raise HTTPException(
            status_code=500, detail="Failed to generate industry insights."
        )

    insight_content = result["getIndustry"][-1].content

    try:
        insight_data = json.loads(insight_content)
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to parse industry insights JSON: {str(e)}"
        )

    try:
        new_insight = StudentInsight(
            industry=industry,
            salary_range=insight_data.get("salary_range", {}),
            growth_rate=insight_data.get("growth_rate", 0.0),
            demand_level=insight_data.get("demand_level", ""),
            top_skills=insight_data.get("top_skills", []),
            market_outlook=insight_data.get("market_outlook", ""),
            key_trends=insight_data.get("key_trends", []),
            recommend_skills=insight_data.get("recommend_skills", []),
            user_id=current_user.id,
        )
        db.add(new_insight)
        db.commit()
        db.refresh(new_insight)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Failed to save industry insights: {str(e)}"
        )

    return new_insight


@router.get("/my-insights", response_model=StudentInsightResponse)
def get_my_insights(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    redis_client = Depends(get_redis_client)
):
    if current_user.role != userRole.STUDENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access their industry insights.",
        )
    
    cache_key = f"student_insights:{current_user.id}"

    cached_data = redis_client.get(cache_key)
    if cached_data:
        return json.loads(cached_data)

    insights = (
        db.query(StudentInsight)
        .filter(StudentInsight.user_id == current_user.id)
        .first()
    )

    if not insights:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No industry insights found for the current user.",
        )
    
    insights_data = StudentInsightResponse.from_orm(insights).dict()
    if not insights_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No industry insights found for the current user.",
        )
    
    redis_client.set(cache_key, json.dumps(insights_data, default=str), ex=3600)  

    return insights_data
