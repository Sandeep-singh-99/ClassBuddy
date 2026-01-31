import json
import os
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
    # Trigger on manual event OR every Sunday at midnight
    trigger=[
        inngest.TriggerEvent(event="student/industry.generate"),
        inngest.TriggerCron(cron="0 0 * * 0") 
    ],
)
async def generate_student_insight(ctx: inngest.Context):
    step = ctx.step
    
    # 1. Determine which users to process
    if ctx.event.name == "student/industry.generate":
        # Single user manual request
        user_tasks = [{
            "user_id": ctx.event.data["user_id"], 
            "industry": ctx.event.data["industry"]
        }]
    else:
        # Sunday Cron: Fetch all users who already have insights to refresh them
        def fetch_all_targets():
            with SessionLocal() as db:
                results = db.query(StudentInsight.user_id, StudentInsight.industry).all()
                return [{"user_id": str(r.user_id), "industry": r.industry} for r in results]
        
        user_tasks = await step.run("fetch-refresh-targets", fetch_all_targets)

    # 2. Loop through tasks (Fan-out pattern is better for scale, but this works for starters)
    for task in user_tasks:
        current_user_id = task["user_id"]
        current_industry = task["industry"]

        # AI Research Step
        async def run_ai():
            state = {"industry": [HumanMessage(content=current_industry)]}
            # Use ainvoke for async Gemini calls
            result = await industry_graph.ainvoke(state)
            content = result["getIndustry"][-1].content
            return json.loads(content)

        # Unique step ID per user to avoid Inngest memoization conflicts
        insight_data = await step.run(f"ai-research-{current_user_id}", run_ai)

        # Database Sync Step
        def sync_to_db():
            with SessionLocal() as db:
                insight = (
                    db.query(StudentInsight)
                    .filter(
                        StudentInsight.user_id == current_user_id, 
                        StudentInsight.industry == current_industry
                    )
                    .first()
                )

                if insight:
                    # Update existing
                    for key, value in insight_data.items():
                        if hasattr(insight, key):
                            setattr(insight, key, value)
                    insight.updated_at = datetime.utcnow()
                else:
                    # Create new
                    insight = StudentInsight(
                        user_id=current_user_id, 
                        industry=current_industry, 
                        **insight_data
                    )
                    db.add(insight)
                
                db.commit()
                return True

        await step.run(f"db-sync-{current_user_id}", sync_to_db)

        # Cache Clear Step
        await step.run(
            f"clear-cache-{current_user_id}", 
            lambda: get_redis_client().delete(f"student_insights:{current_user_id}")
        )

    return {"status": "success", "count": len(user_tasks)}