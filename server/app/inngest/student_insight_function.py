from inngest import Step
from sqlalchemy.orm import Session
from app.core.inngest import inngest
from app.config.db import SessionLocal
from app.models.studentInsight import StudentInsight
from app.dependencies.redis_client import get_redis_client
from langchain_core.messages import HumanMessage
import json
from datetime import datetime

from app.router.studentInsight import graph


@inngest.create_function(
    fn_id="generate-student-industry-insight",
    trigger={"event": "student/industry.generate"},
)
def generate_industry_insight_fn(ctx, step: Step):
    event = ctx.event.data
    industry = event["industry"]
    user_id = event["user_id"]

    db: Session = SessionLocal()
    redis_client = get_redis_client()

    try:
        initial_state = {
            "industry": [HumanMessage(content=industry)],
            "research": [],
            "getIndustry": [],
        }

        result = graph.invoke(initial_state)

        insight_content = result["getIndustry"][-1].content
        insight_data = json.loads(insight_content)

        insight = StudentInsight(
            industry=industry,
            salary_range=insight_data.get("salary_range", {}),
            growth_rate=insight_data.get("growth_rate", 0),
            demand_level=insight_data.get("demand_level", ""),
            top_skills=insight_data.get("top_skills", []),
            market_outlook=insight_data.get("market_outlook", ""),
            key_trends=insight_data.get("key_trends", []),
            recommend_skills=insight_data.get("recommend_skills", []),
            user_id=user_id,
            created_at=datetime.utcnow(),
        )

        db.add(insight)
        db.commit()
        db.refresh(insight)

        cache_key = f"student_insights:{user_id}"
        redis_client.set(
            cache_key,
            json.dumps(insight.__dict__, default=str),
            ex=3600,
        )

        return {"status": "success"}

    except Exception as e:
        db.rollback()
        raise e

    finally:
        db.close()
