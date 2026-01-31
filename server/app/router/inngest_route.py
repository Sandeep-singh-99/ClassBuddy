from fastapi import APIRouter
from app.core.inngest import inngest_client
from app.inngest.student_insight_function import generate_student_insight
from app.inngest.cron_student_insight import cron_update_student_insights
import inngest.fast_api

router = APIRouter()

inngest.fast_api.serve(
    app=router,
    client=inngest_client,
    functions=[
        generate_student_insight,
    ],
    serve_path="/api/inngest",
)
