import json
from datetime import datetime
from sqlalchemy.orm import Session
from inngest import Step
from app.core.inngest import inngest
from app.config.db import SessionLocal
from app.models.studentInsight import StudentInsight
from app.dependencies.redis_client import get_redis_client
from langchain_core.messages import HumanMessage
from app.ai.industry_graph import industry_graph


@inngest.create_function(
    fn_id="generate-student-industry-insight",
    trigger={"event": "student/industry.generate"},
)
def generate_student_insight(ctx, step: Step):
    data = ctx.event.data
    industry = data["industry"]
    user_id = data["user_id"]

    db: Session = SessionLocal()
    redis = get_redis_client()

    try:
        state = {
            "industry": [HumanMessage(content=industry)],
            "research": [],
            "getIndustry": [],
        }

        result = industry_graph.invoke(state)
        insight_data = json.loads(result["getIndustry"][-1].content)

        insight = (
            db.query(StudentInsight)
            .filter(
                StudentInsight.user_id == user_id,
                StudentInsight.industry == industry,
            )
            .first()
        )

        if insight:
            insight.salary_range = insight_data["salary_range"]
            insight.growth_rate = insight_data["growth_rate"]
            insight.demand_level = insight_data["demand_level"]
            insight.top_skills = insight_data["top_skills"]
            insight.market_outlook = insight_data["market_outlook"]
            insight.key_trends = insight_data["key_trends"]
            insight.recommend_skills = insight_data["recommend_skills"]
            insight.updated_at = datetime.utcnow()
        else:
            insight = StudentInsight(
                user_id=user_id,
                industry=industry,
                **insight_data,
            )
            db.add(insight)

        db.commit()

        redis.delete(f"student_insights:{user_id}")

        return {"status": "success"}

    finally:
        db.close()
