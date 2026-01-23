from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.router.auth import router as auth_router
from app.router.chat_with_pdf import router as chat_with_pdf
from app.router.teacherInsight import router as teacher_insight_router
from app.router.group import router as group_router
from app.router.generate_notes import router as generate_notes_router
from app.router.notes import router as notes_router
from app.router.interviewPerp import router as interview_prep_router
from app.router.docsupload import router as docsupload_router
from app.router.studentInsight import router as student_insight_router
from app.router.assignment import router as assignment_router
from app.router.generate_assignment import router as generate_assignment_router
from app.router.ai_evaluator import router as ai_evaluator_router
from app.router.submission import router as submission_router
from app.router.groupMessage import router as group_message_router
from app.router.subscription import router as subscription_router

from app.mobile.router.auth import router as mobile_auth_router
from app.mobile.router.ai_evaluator import router as mobile_ai_evaluator_router
from app.mobile.router.assignment import router as mobile_assignment_router
from app.mobile.router.chat_with_pdf import router as mobile_chat_with_pdf_router
from app.mobile.router.docsupload import router as mobile_docsupload_router
from app.mobile.router.generate_assignment import (
    router as mobile_generate_assignment_router,
)
from app.mobile.router.generate_notes import router as mobile_generate_notes_router
from app.mobile.router.group import router as mobile_group_router
from app.mobile.router.interviewPerp import router as mobile_interview_prep_router
from app.mobile.router.notes import router as mobile_notes_router
from app.mobile.router.studentInsight import router as mobile_student_insight_router
from app.mobile.router.submission import router as mobile_submission_router
from app.mobile.router.teacherInsight import router as mobile_teacher_insight_router
from app.mobile.router.groupMessage import router as mobile_group_message_router
from app.mobile.router.subscription import router as mobile_subscription_router
from app.utils.socket_manager import manager
from app.config.db import Base, engine
from app.models import auth, notes, teacherInsight
from dotenv import load_dotenv
import os

from slowapi.errors import RateLimitExceeded
from app.core.rate_limiter import limiter, rate_limit_exceeded_handler


load_dotenv()

app = FastAPI()

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)

origins = os.getenv("CORS_ORIGINS", "").split(",")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Base.metadata.create_all(bind=engine)


@app.on_event("startup")
async def on_startup():
    print("Creating database tables (if not exist)...")
    Base.metadata.create_all(bind=engine)
    await manager.start_listener()


@app.on_event("shutdown")
async def on_shutdown():
    await manager.stop_listener()


from app.router.inngest_route import router as inngest_router

app.include_router(inngest_router, prefix="/api")


app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(chat_with_pdf, prefix="/pdf", tags=["PDF Chat"])
app.include_router(
    teacher_insight_router, prefix="/insights", tags=["Teacher Insights"]
)
app.include_router(group_router, prefix="/groups", tags=["Groups"])
app.include_router(generate_notes_router, prefix="/notes", tags=["Generate Notes"])
app.include_router(notes_router, prefix="/notes", tags=["Notes"])
app.include_router(
    student_insight_router, prefix="/student-insight", tags=["Student Insights"]
)
app.include_router(
    interview_prep_router, prefix="/interview-prep", tags=["Interview Preparation"]
)
app.include_router(docsupload_router, prefix="/docs", tags=["Document Upload"])
app.include_router(assignment_router, prefix="/assignments", tags=["Assignments"])
app.include_router(
    generate_assignment_router, prefix="/assignments", tags=["Generate Assignment"]
)
app.include_router(ai_evaluator_router, prefix="/ai-evaluator", tags=["AI Evaluator"])
app.include_router(submission_router, prefix="/submissions", tags=["Submissions"])
app.include_router(
    group_message_router, prefix="/group-messages", tags=["Group Messages"]
)
app.include_router(subscription_router, prefix="/subscription", tags=["Subscription"])


# Mobile APIs
app.include_router(mobile_auth_router, prefix="/mobile/auth", tags=["Mobile Auth"])
app.include_router(
    mobile_ai_evaluator_router,
    prefix="/mobile/ai-evaluator",
    tags=["Mobile AI Evaluator"],
)
app.include_router(
    mobile_assignment_router, prefix="/mobile/assignments", tags=["Mobile Assignments"]
)
app.include_router(
    mobile_chat_with_pdf_router, prefix="/mobile/pdf", tags=["Mobile PDF Chat"]
)
app.include_router(
    mobile_docsupload_router, prefix="/mobile/docs", tags=["Mobile Document Upload"]
)
app.include_router(
    mobile_generate_assignment_router,
    prefix="/mobile/assignments",
    tags=["Mobile Generate Assignment"],
)
app.include_router(
    mobile_generate_notes_router, prefix="/mobile/notes", tags=["Mobile Generate Notes"]
)
app.include_router(mobile_group_router, prefix="/mobile/groups", tags=["Mobile Groups"])
app.include_router(
    mobile_interview_prep_router,
    prefix="/mobile/interview-prep",
    tags=["Mobile Interview Preparation"],
)
app.include_router(mobile_notes_router, prefix="/mobile/notes", tags=["Mobile Notes"])
app.include_router(
    mobile_student_insight_router,
    prefix="/mobile/student-insight",
    tags=["Mobile Student Insights"],
)
app.include_router(
    mobile_submission_router, prefix="/mobile/submissions", tags=["Mobile Submissions"]
)
app.include_router(
    mobile_teacher_insight_router,
    prefix="/mobile/insights",
    tags=["Mobile Teacher Insights"],
)
app.include_router(
    mobile_group_message_router,
    prefix="/mobile/group-messages",
    tags=["Mobile Group Messages"],
)
app.include_router(
    mobile_subscription_router,
    prefix="/mobile/subscription",
    tags=["Mobile Subscription"],
)


@app.get("/")
def read_root():
    return {"message": "Welcome to the ClassBuddy API"}
