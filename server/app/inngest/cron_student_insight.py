import logging
from app.core.inngest import inngest
from app.config.db import SessionLocal
from app.models.studentInsight import StudentInsight
import inngest as inngest_lib


@inngest.create_function(
    fn_id="cron-update-student-insights",
    trigger={"cron": "0 9 * * 0"},  # Every Sunday at 9 AM UTC
)
async def cron_update_student_insights(ctx, step: inngest_lib.Step):
    """
    Cron job to update industry insights for all students every Sunday.
    """

    def fetch_insights():
        db = SessionLocal()
        try:
            # Query unique user_id and industry combinations
            # We fetch all insights, but we'll use a set to keep unique pairs
            insights = (
                db.query(StudentInsight.user_id, StudentInsight.industry)
                .distinct()
                .all()
            )
            return [{"user_id": i.user_id, "industry": i.industry} for i in insights]
        finally:
            db.close()

    insights_to_update = await step.run("fetch_unique_insights", fetch_insights)

    if not insights_to_update:
        return {"status": "no_insights_to_update"}

    # Prepare events to send
    events = [
        {
            "name": "student/industry.generate",
            "data": {
                "user_id": item["user_id"],
                "industry": item["industry"],
            },
        }
        for item in insights_to_update
    ]

    # Batch send events
    await step.send_event("trigger-insight-updates", events)

    return {"status": "success", "count": len(events)}
