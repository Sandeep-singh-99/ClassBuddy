import asyncio
from datetime import datetime
import inngest
from app.core import inngest as core_inngest
from app.config import db
from app.models import StudentInsight
from app.dependencies import redis_client
from langchain_core.messages import HumanMessage
from app.ai import industry_graph
from app.schemas.studentInsight import StudentInsightBase


@core_inngest.inngest_client.create_function(
    fn_id="generate-student-industry-insight",
    # Trigger on manual event OR every Sunday at midnight
    trigger=[
        inngest.TriggerEvent(event="student/industry.generate"),
        inngest.TriggerCron(cron="0 0 * * 0"),
    ],
)
async def generate_student_insight(ctx: inngest.Context):
    step = ctx.step

    # 1. Determine which users to process
    if ctx.event.name == "student/industry.generate":
        # Single user manual request
        user_tasks = [
            {
                "user_id": ctx.event.data["user_id"],
                "industry": ctx.event.data["industry"],
            }
        ]
    else:
        # Sunday Cron: Fetch all users who already have insights to refresh them
        def fetch_all_targets():
            with db.SessionLocal() as session:
                results = session.query(
                    StudentInsight.user_id, StudentInsight.industry
                ).all()
                return [
                    {"user_id": str(r.user_id), "industry": r.industry} for r in results
                ]

        async def fetch_targets():
            return await asyncio.to_thread(fetch_all_targets)
        user_tasks = await step.run("fetch-refresh-targets", fetch_targets)

    # 2. Loop through tasks (Fan-out pattern is better for scale, but this works for starters)
    for task in user_tasks:
        current_user_id = task["user_id"]
        current_industry = task["industry"]

        # AI Research Step
        async def run_ai():
            state = {"industry": [HumanMessage(content=current_industry)]}
            # Use ainvoke for async Gemini calls
            async with asyncio.timeout(120):
                result = await industry_graph.industry_graph.ainvoke(state)
            content = result["getIndustry"][-1].content
            return StudentInsightBase.model_validate_json(content).model_dump()

        # Unique step ID per user to avoid Inngest memoization conflicts
        insight_data = await step.run(f"ai-research-{current_user_id}", run_ai)

        # Database Sync Step
        def sync_to_db():
            with db.SessionLocal() as session:
                insight = (
                    session.query(StudentInsight)
                    .filter(
                        StudentInsight.user_id == current_user_id,
                        StudentInsight.industry == current_industry,
                    )
                    .first()
                )

                if insight:
                    # Update existing
                    for key, value in insight_data.items():
                        setattr(insight, key, value)
                    insight.updated_at = datetime.utcnow()
                else:
                    # Create new
                    insight = StudentInsight(
                        user_id=current_user_id,
                        industry=current_industry,
                        **insight_data,
                    )
                    session.add(insight)

                session.commit()
                return True

        async def persist_insight():
            return await asyncio.to_thread(sync_to_db)
        await step.run(f"db-sync-{current_user_id}", persist_insight)

        # Cache Clear Step
        async def clear_cache():
            return await asyncio.to_thread(redis_client.get_redis_client().delete, f"student_insights:{current_user_id}")
        await step.run(f"clear-cache-{current_user_id}", clear_cache)

    return {"status": "success", "count": len(user_tasks)}
