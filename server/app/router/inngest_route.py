from inngest.fastapi import serve
from app.core.inngest import inngest
from app.inngest.student_insight_event import generate_student_insight
from app.inngest.cron_student_insight import cron_update_student_insights

inngest_api = serve(
    inngest,
    functions=[
        generate_student_insight,
        cron_update_student_insights,
    ],
)
