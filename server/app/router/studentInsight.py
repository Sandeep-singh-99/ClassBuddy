from fastapi import APIRouter, Depends, status, Form, File, HTTPException
from sqlalchemy.orm import Session
from typing import TypedDict, Annotated, Dict, List
from app.schemas import studentInsight as student_insight_schema, auth as auth_schema
from app.dependencies import dependencies
from app.config import db
from app.models import User, userRole, StudentInsight
from dotenv import load_dotenv
from langgraph.graph import add_messages, StateGraph, END

# from langchain_tavily import TavilySearch
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
from app.dependencies import redis_client
import json
from datetime import datetime
from app.core import inngest
from inngest import Event

load_dotenv()

router = APIRouter()


@router.post("/generate-industry-insight")
async def generate_industry_insight(
    industry: str = Form(...),
    current_user=Depends(dependencies.get_current_user),
    db_session: Session = Depends(db.get_db),
):
    if current_user.role != userRole.STUDENT:
        raise HTTPException(403, "Only students allowed")

    existing_insight = (
        db_session.query(StudentInsight)
        .filter(
            StudentInsight.user_id == current_user.id,
            StudentInsight.industry == industry,
        )
        .first()
    )

    if existing_insight:
        # Option A: Return a 400 error
        raise HTTPException(
            status_code=400,
            detail=f"Insights for {industry} already exist for this account.",
        )

    await inngest.inngest_client.send(
        [
            Event(
                name="student/industry.generate",
                data={
                    "industry": industry,
                    "user_id": str(current_user.id),
                },
            )
        ]
    )

    return {
        "status": "processing",
        "message": "Industry insight generation started",
    }


@router.get(
    "/my-insights", response_model=student_insight_schema.StudentInsightResponse
)
def get_my_insights(
    current_user: User = Depends(dependencies.get_current_user),
    db_session: Session = Depends(db.get_db),
    redis=Depends(redis_client.get_redis_client),
):
    if current_user.role != userRole.STUDENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access their industry insights.",
        )

    cache_key = f"student_insights:{current_user.id}"

    cached_data = redis.get(cache_key)
    if cached_data:
        return json.loads(cached_data)

    insights = (
        db_session.query(StudentInsight)
        .filter(StudentInsight.user_id == current_user.id)
        .first()
    )

    if not insights:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No industry insights found for the current user.",
        )

    insights_data = student_insight_schema.StudentInsightResponse.from_orm(
        insights
    ).dict()
    if not insights_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No industry insights found for the current user.",
        )

    redis.set(cache_key, json.dumps(insights_data, default=str), ex=3600)

    return insights_data
