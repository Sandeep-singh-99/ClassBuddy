from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    ai_evaluator,
    assignment,
    generate_assignment,
    generate_notes,
    group,
    groupMessage,
    teacherInsight,
    studentInsight,
    submission,
    subscription,
    # inngest_route,
    interviewPerp,
    docsupload,
    health,
    notes
)

app_router = APIRouter()

app_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app_router.include_router(
    ai_evaluator.router, prefix="/ai-evaluator", tags=["AI Evaluator"]
)
app_router.include_router(
    assignment.router, prefix="/assignments", tags=["Assignments"]
)
app_router.include_router(
    generate_assignment.router, prefix="/assignments", tags=["Generate Assignments"]
)
app_router.include_router(
    generate_notes.router, prefix="/notes", tags=["Generate Notes"]
)
app_router.include_router(group.router, prefix="/groups", tags=["Groups"])
app_router.include_router(
    groupMessage.router, prefix="/group-messages", tags=["Group Messages"]
)
app_router.include_router(
    teacherInsight.router, prefix="/insights", tags=["Techer Insights"]
)
app_router.include_router(
    studentInsight.router, prefix="/student-insight", tags=["Student Insights"]
)
app_router.include_router(
    submission.router, prefix="/submissions", tags=["Submissions"]
)
app_router.include_router(
    subscription.router, prefix="/subscription", tags=["subscription"]
)
# app_router.include_router(inngest_route.router, tags=["Inngest"])
app_router.include_router(
    interviewPerp.router, prefix="/interview-prep", tags=["Interview preparation"]
)
app_router.include_router(docsupload.router, prefix="/docs", tags=["Document Upload"])
app_router.include_router(health.router)
app_router.include_router(notes.router, prefix='/notes', tags=['Notes'])