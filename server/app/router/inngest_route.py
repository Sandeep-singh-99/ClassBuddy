from fastapi import APIRouter
from app.core.inngest import inngest
from app.inngest.student_insight_function import generate_student_insight
from app.inngest.cron_student_insight import cron_update_student_insights

router = APIRouter()

from fastapi import Request


@router.api_route("/inngest", methods=["GET", "POST", "PUT"])
async def inngest_handler(request: Request):
    return await inngest.serve(
        request,
        functions=[
            generate_student_insight,
            cron_update_student_insights,
        ],
    )
