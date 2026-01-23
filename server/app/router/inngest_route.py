from inngest.fastapi import serve
from app.core.inngest import inngest
from app.inngest.student_insight_function import generate_industry_insight_fn
from app.inngest.cron_student_insight import cron_update_student_insights

# Serve Inngest functions
inngest_api = serve(
    inngest,
    functions=[
        generate_industry_insight_fn,
        cron_update_student_insights,
    ],
)
