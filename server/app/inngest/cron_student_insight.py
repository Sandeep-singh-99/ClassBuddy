# from app.core.inngest import inngest_client
# from app.config.db import SessionLocal
# from app.models.studentInsight import StudentInsight
# import inngest


# @inngest_client.create_function(
#     fn_id="cron-update-student-insights",
#     trigger={"cron": "0 9 * * 0"},  # Sunday 9 AM UTC
# )
# async def cron_update_student_insights(ctx, step: inngest.Step):
#     def fetch():
#         db = SessionLocal()
#         try:
#             return (
#                 db.query(StudentInsight.user_id, StudentInsight.industry)
#                 .distinct()
#                 .all()
#             )
#         finally:
#             db.close()

#     records = await step.run("fetch-users", fetch)

#     if not records:
#         return {"status": "empty"}

#     events = [
#         {
#             "name": "student/industry.generate",
#             "data": {"user_id": r.user_id, "industry": r.industry},
#         }
#         for r in records
#     ]

#     await step.send_event("fanout", events)

#     return {"status": "triggered", "count": len(events)}


from app.core.inngest import inngest_client
from app.config.db import SessionLocal
from app.models.studentInsight import StudentInsight
import inngest


@inngest_client.create_function(
    fn_id="cron-update-student-insights",
    trigger=[{"cron": "0 9 * * 0"}],  # Sunday 9 AM UTC
)
async def cron_update_student_insights(ctx: inngest.Context, step: inngest.Step):
    def fetch():
        db = SessionLocal()
        try:
            results = (
                db.query(StudentInsight.user_id, StudentInsight.industry)
                .distinct()
                .all()
            )
            # Convert to dicts so Inngest can serialize the step output to JSON
            return [{"user_id": r.user_id, "industry": r.industry} for r in results]
        finally:
            db.close()

    # The result of this is stored in Inngest's state
    records = await step.run("fetch-users", fetch)

    if not records:
        return {"status": "empty"}

    # Map records to Inngest events
    events = [
        inngest.Event(
            name="student/industry.generate",
            data={"user_id": r["user_id"], "industry": r["industry"]},
        )
        for r in records
    ]

    # Fan out: This triggers 'generate-student-industry-insight' for each event
    await step.send_event("fanout-to-workers", events)

    return {"status": "triggered", "count": len(events)}
