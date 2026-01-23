from app.core.inngest import inngest
from app.config.db import SessionLocal
from app.models.studentInsight import StudentInsight
import inngest as inngest_lib


@inngest.create_function(
    fn_id="cron-update-student-insights",
    trigger={"cron": "0 9 * * 0"},  # Sunday 9 AM UTC
)
async def cron_update_student_insights(ctx, step: inngest_lib.Step):
    def fetch():
        db = SessionLocal()
        try:
            return (
                db.query(StudentInsight.user_id, StudentInsight.industry)
                .distinct()
                .all()
            )
        finally:
            db.close()

    records = await step.run("fetch-users", fetch)

    if not records:
        return {"status": "empty"}

    events = [
        {
            "name": "student/industry.generate",
            "data": {"user_id": r.user_id, "industry": r.industry},
        }
        for r in records
    ]

    await step.send_event("fanout", events)

    return {"status": "triggered", "count": len(events)}
