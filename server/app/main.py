from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
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

from app.mobile.api.v1.api import app_router

from app.router import health

from app.utils import socket_manager

from app.dependencies.request_logger import log_requests

from dotenv import load_dotenv
import os

from slowapi.errors import RateLimitExceeded
from app.core import rate_limiter

from app.core.logger import logger

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting ClassBuddy API")

    try:
        await socket_manager.manager.start_listener()
        logger.info("Socket listener started")
    except Exception:
        logger.exception("Failed to start socket listener")
        raise

    yield

    logger.info("Shutting down ClassBuddy API")

    try:
        await socket_manager.manager.stop_listener()
        logger.info("Socket listener stopped")
    except Exception:
        logger.exception("Failed to stop socket listener")

app = FastAPI(
    title="ClassBuddy API",
    version="1.0.0",
    lifespan=lifespan,
)

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

app.middleware("http")(log_requests)


@app.get("/", tags=["Root"])
async def read_root():
    return {
        "message": "Welcome to the ClassBuddy API"
    }


app.include_router(inngest_route.router)

app.include_router(health.router)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(chat_with_pdf.router, prefix="/api/v1/pdf", tags=["PDF Chat"])
app.include_router(teacherInsight.router, prefix="/api/v1/insights", tags=["Teacher Insights"])
app.include_router(group.router, prefix="/api/v1/groups", tags=["Groups"])
app.include_router(generate_notes.router, prefix="/api/v1/notes", tags=["Generate Notes"])
app.include_router(notes.router, prefix="/api/v1/notes", tags=["Notes"])
app.include_router(
    studentInsight.router, prefix="/api/v1/student-insight", tags=["Student Insights"]
)
app.include_router(
    interviewPerp.router, prefix="/api/v1/interview-prep", tags=["Interview Preparation"]
)
app.include_router(docsupload.router, prefix="/api/v1/docs", tags=["Document Upload"])
app.include_router(assignment.router, prefix="/api/v1/assignments", tags=["Assignments"])
app.include_router(
    generate_assignment.router, prefix="/api/v1/assignments", tags=["Generate Assignment"]
)
app.include_router(ai_evaluator.router, prefix="/api/v1/ai-evaluator", tags=["AI Evaluator"])
app.include_router(submission.router, prefix="/api/v1/submissions", tags=["Submissions"])
app.include_router(
    groupMessage.router, prefix="/api/v1/group-messages", tags=["Group Messages"]
)
app.include_router(subscription.router, prefix="/api/v1/subscription", tags=["Subscription"])


# Mobile APIs
app.include_router(app_router, prefix="/api/v1/mobile", tags=['Mobile Route'])

