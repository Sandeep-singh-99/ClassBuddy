from fastapi import APIRouter, Depends, status, Form, HTTPException, Request
import asyncio
from app.core.rate_limiter import limiter, ai_rate_limit_key
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from app.schemas import studentInsight as student_insight_schema
from app.dependencies import dependencies
from app.config import db
from app.models import User, userRole, StudentInsight
from dotenv import load_dotenv
from langchain_core.messages import HumanMessage
from app.ai.industry_graph import industry_graph
from app.dependencies import redis_client
import json
from datetime import datetime

load_dotenv()

router = APIRouter()


@router.post("/", response_model=student_insight_schema.StudentInsightResponse)
@limiter.limit("5/minute", key_func=ai_rate_limit_key)
async def generate_industry_insight(
    request: Request,
    industry: str = Form(..., max_length=200),
    current_user: User = Depends(dependencies.get_current_user),
    db_session: Session = Depends(db.get_db),
    redis=Depends(redis_client.get_redis_client),
):
    if current_user.role != userRole.STUDENT:
        raise HTTPException(403, "Only students allowed")

    clean_industry = industry.strip()
    if not clean_industry:
        raise HTTPException(400, "Industry field cannot be empty.")
    if len(clean_industry) > 200:
        raise HTTPException(400, "Industry field cannot exceed 200 characters.")
    user_id = current_user.id
    db_session.close()

    # 1. Run AI industry graph directly to generate real response synchronously
    try:
        state = {"industry": [HumanMessage(content=clean_industry)]}
        async with asyncio.timeout(120):
            result = await industry_graph.ainvoke(state)
        content = result["getIndustry"][-1].content
        insight_data = student_insight_schema.StudentInsightBase.model_validate_json(content).model_dump()
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail="Industry insights are unavailable. Please retry shortly.",
        )

    # 2. Check if insight record already exists for this user and industry
    existing_insight = (
        db_session.query(StudentInsight)
        .filter(
            StudentInsight.user_id == user_id,
            StudentInsight.industry == clean_industry,
        )
        .first()
    )

    if existing_insight:
        # Update existing
        for key, value in insight_data.items():
            setattr(existing_insight, key, value)
        existing_insight.updated_at = datetime.utcnow()
        db_session.commit()
        db_session.refresh(existing_insight)
        target_insight = existing_insight
    else:
        # Create new
        target_insight = StudentInsight(
            user_id=user_id,
            industry=clean_industry,
            **insight_data,
        )
        db_session.add(target_insight)
        db_session.commit()
        db_session.refresh(target_insight)

    # Clear Redis cache
    cache_key = f"student_insights:{user_id}"
    try:
        redis.delete(cache_key)
    except Exception as e:
        print(f"Redis delete warning: {e}")

    return target_insight


@router.get(
    "/", response_model=List[student_insight_schema.StudentInsightResponse]
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

    try:
        cached_data = redis.get(cache_key)
        if cached_data:
            return json.loads(cached_data)
    except Exception as e:
        print(f"Redis get warning: {e}")

    insights = (
        db_session.query(StudentInsight)
        .options(joinedload(StudentInsight.owner))
        .filter(StudentInsight.user_id == current_user.id)
        .order_by(StudentInsight.updated_at.desc())
        .all()
    )

    if not insights:
        return []

    insights_data = [
        student_insight_schema.StudentInsightResponse.from_orm(item).dict()
        for item in insights
    ]

    try:
        redis.set(cache_key, json.dumps(insights_data, default=str), ex=3600)
    except Exception as e:
        print(f"Redis set warning: {e}")

    return insights_data

