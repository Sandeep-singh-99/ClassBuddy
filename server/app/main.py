from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.router import (
    auth,
    chat_with_pdf,
    teacherInsight,
    group,
    generate_notes,
    notes,
    interviewPerp,
    docsupload,
    studentInsight,
    assignment,
    generate_assignment,
    ai_evaluator,
    submission,
    groupMessage,
    subscription,
    inngest_route,
)

from app.mobile.router import (
    auth as mobile_auth,
    ai_evaluator as mobile_ai_evaluator,
    assignment as mobile_assignment,
    chat_with_pdf as mobile_chat_with_pdf,
    docsupload as mobile_docsupload,
    generate_assignment as mobile_generate_assignment,
    generate_notes as mobile_generate_notes,
    group as mobile_group,
    interviewPerp as mobile_interview_prep,
    notes as mobile_notes,
    studentInsight as mobile_student_insight,
    submission as mobile_submission,
    teacherInsight as mobile_teacher_insight,
    groupMessage as mobile_group_message,
    subscription as mobile_subscription,
)
from app.utils import socket_manager
from app.config import db
from app.models import (
    auth as auth_model,
    notes as notes_model,
    teacherInsight as teacher_insight_model,
)
from dotenv import load_dotenv
import os

from slowapi.errors import RateLimitExceeded
from app.core import rate_limiter

load_dotenv()

app = FastAPI()

app.state.limiter = rate_limiter.limiter
app.add_exception_handler(RateLimitExceeded, rate_limiter.rate_limit_exceeded_handler)

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
    db.Base.metadata.create_all(bind=db.engine)
    await socket_manager.manager.start_listener()


@app.on_event("shutdown")
async def on_shutdown():
    await socket_manager.manager.stop_listener()


app.include_router(inngest_route.router)


app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(chat_with_pdf.router, prefix="/pdf", tags=["PDF Chat"])
app.include_router(teacherInsight.router, prefix="/insights", tags=["Teacher Insights"])
app.include_router(group.router, prefix="/groups", tags=["Groups"])
app.include_router(generate_notes.router, prefix="/notes", tags=["Generate Notes"])
app.include_router(notes.router, prefix="/notes", tags=["Notes"])
app.include_router(
    studentInsight.router, prefix="/student-insight", tags=["Student Insights"]
)
app.include_router(
    interviewPerp.router, prefix="/interview-prep", tags=["Interview Preparation"]
)
app.include_router(docsupload.router, prefix="/docs", tags=["Document Upload"])
app.include_router(assignment.router, prefix="/assignments", tags=["Assignments"])
app.include_router(
    generate_assignment.router, prefix="/assignments", tags=["Generate Assignment"]
)
app.include_router(ai_evaluator.router, prefix="/ai-evaluator", tags=["AI Evaluator"])
app.include_router(submission.router, prefix="/submissions", tags=["Submissions"])
app.include_router(
    groupMessage.router, prefix="/group-messages", tags=["Group Messages"]
)
app.include_router(subscription.router, prefix="/subscription", tags=["Subscription"])


# Mobile APIs
app.include_router(mobile_auth.router, prefix="/mobile/auth", tags=["Mobile Auth"])
app.include_router(
    mobile_ai_evaluator.router,
    prefix="/mobile/ai-evaluator",
    tags=["Mobile AI Evaluator"],
)
app.include_router(
    mobile_assignment.router, prefix="/mobile/assignments", tags=["Mobile Assignments"]
)
app.include_router(
    mobile_chat_with_pdf.router, prefix="/mobile/pdf", tags=["Mobile PDF Chat"]
)
app.include_router(
    mobile_docsupload.router, prefix="/mobile/docs", tags=["Mobile Document Upload"]
)
app.include_router(
    mobile_generate_assignment.router,
    prefix="/mobile/assignments",
    tags=["Mobile Generate Assignment"],
)
app.include_router(
    mobile_generate_notes.router, prefix="/mobile/notes", tags=["Mobile Generate Notes"]
)
app.include_router(mobile_group.router, prefix="/mobile/groups", tags=["Mobile Groups"])
app.include_router(
    mobile_interview_prep.router,
    prefix="/mobile/interview-prep",
    tags=["Mobile Interview Preparation"],
)
app.include_router(mobile_notes.router, prefix="/mobile/notes", tags=["Mobile Notes"])
app.include_router(
    mobile_student_insight.router,
    prefix="/mobile/student-insight",
    tags=["Mobile Student Insights"],
)
app.include_router(
    mobile_submission.router, prefix="/mobile/submissions", tags=["Mobile Submissions"]
)
app.include_router(
    mobile_teacher_insight.router,
    prefix="/mobile/insights",
    tags=["Mobile Teacher Insights"],
)
app.include_router(
    mobile_group_message.router,
    prefix="/mobile/group-messages",
    tags=["Mobile Group Messages"],
)
app.include_router(
    mobile_subscription.router,
    prefix="/mobile/subscription",
    tags=["Mobile Subscription"],
)


@app.get("/")
def read_root():
    return {"message": "Welcome to the ClassBuddy API"}
