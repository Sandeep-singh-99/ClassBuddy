from fastapi import APIRouter
from app.core.inngest import inngest
from app.inngest.student_insight_function import generate_student_insight
from app.inngest.cron_student_insight import cron_update_student_insights

router = APIRouter()

@router.post("/inngest")
async def inngest_handler(request: dict):
    return await inngest.serve(
        request,
        functions=[
            generate_student_insight,
            cron_update_student_insights,
        ],
    )
