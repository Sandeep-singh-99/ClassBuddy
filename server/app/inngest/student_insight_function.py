# import json
# from datetime import datetime
# from sqlalchemy.orm import Session
# from inngest import Step
# from app.core.inngest import inngest_client
# from app.config.db import SessionLocal
# from app.models.studentInsight import StudentInsight
# from app.dependencies.redis_client import get_redis_client
# from langchain_core.messages import HumanMessage
# from app.ai.industry_graph import industry_graph
# import inngest


# @inngest_client.create_function(
#     fn_id="generate-student-industry-insight",
#     trigger={"event": "student/industry.generate"},
# )
# def generate_student_insight(ctx: inngest.Context, step: inngest.Step):
#     data = ctx.event.data
#     industry = data["industry"]
#     user_id = data["user_id"]

#     db: Session = SessionLocal()
#     redis = get_redis_client()

#     try:
#         state = {
#             "industry": [HumanMessage(content=industry)],
#             "research": [],
#             "getIndustry": [],
#         }

#         result = industry_graph.invoke(state)
#         insight_data = json.loads(result["getIndustry"][-1].content)

#         insight = (
#             db.query(StudentInsight)
#             .filter(
#                 StudentInsight.user_id == user_id,
#                 StudentInsight.industry == industry,
#             )
#             .first()
#         )

#         if insight:
#             insight.salary_range = insight_data["salary_range"]
#             insight.growth_rate = insight_data["growth_rate"]
#             insight.demand_level = insight_data["demand_level"]
#             insight.top_skills = insight_data["top_skills"]
#             insight.market_outlook = insight_data["market_outlook"]
#             insight.key_trends = insight_data["key_trends"]
#             insight.recommend_skills = insight_data["recommend_skills"]
#             insight.updated_at = datetime.utcnow()
#         else:
#             insight = StudentInsight(
#                 user_id=user_id,
#                 industry=industry,
#                 **insight_data,
#             )
#             db.add(insight)

#         db.commit()

#         redis.delete(f"student_insights:{user_id}")

#         return {"status": "success"}

#     finally:
#         db.close()



import json
from datetime import datetime
from sqlalchemy.orm import Session
import inngest
from app.core.inngest import inngest_client
from app.config.db import SessionLocal
from app.models.studentInsight import StudentInsight
from app.dependencies.redis_client import get_redis_client
from langchain_core.messages import HumanMessage
from app.ai.industry_graph import industry_graph

@inngest_client.create_function(
    fn_id="generate-student-industry-insight",
    trigger=inngest.TriggerEvent(event="student/industry.generate"),
)
async def generate_student_insight(ctx: inngest.Context, step: inngest.Step):
    data = ctx.event.data
    industry = data["industry"]
    user_id = data["user_id"]

    # 1. Run the AI Graph
    async def run_ai_research():
        state = {
            "industry": [HumanMessage(content=industry)],
            "research": [],
            "getIndustry": [],
        }
        result = industry_graph.invoke(state)
        return json.loads(result["getIndustry"][-1].content)

    insight_data = await step.run("ai-industry-research", run_ai_research)

    # 2. Update the Database
    async def sync_to_db():
        db: Session = SessionLocal()
        try:
            insight = db.query(StudentInsight).filter(
                StudentInsight.user_id == user_id,
                StudentInsight.industry == industry,
            ).first()

            if insight:
                for key, value in insight_data.items():
                    setattr(insight, key, value)
                insight.updated_at = datetime.utcnow()
            else:
                insight = StudentInsight(
                    user_id=user_id,
                    industry=industry,
                    **insight_data,
                )
                db.add(insight)
            db.commit()
            return True
        finally:
            db.close()

    await step.run("update-database", sync_to_db)

    # 3. Cache Invalidation
    async def clear_cache():
        redis = get_redis_client()
        redis.delete(f"student_insights:{user_id}")
    
    await step.run("clear-redis-cache", clear_cache)

    return {"status": "success", "user_id": user_id}