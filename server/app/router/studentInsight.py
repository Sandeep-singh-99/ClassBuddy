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

# from langchain_tavily import TavilySearch
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
from app.dependencies.redis_client import get_redis_client
import json
from datetime import datetime
from app.core.inngest import inngest_client
from inngest import Event

load_dotenv()

router = APIRouter()


@router.post("/generate-industry-insight")
async def generate_industry_insight(
    industry: str = Form(...),
    current_user=Depends(get_current_user),
):
    if current_user.role != userRole.STUDENT:
        raise HTTPException(403, "Only students allowed")

    await inngest_client.send(
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


@router.get("/my-insights", response_model=StudentInsightResponse)
def get_my_insights(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    redis_client=Depends(get_redis_client),
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
