from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.api.v1.api import app_router
from app.api.v1.endpoints.inngest_route import router as inngest_router

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

from fastapi.responses import JSONResponse
from app.dependencies.require_teacher_group import TeacherGroupRequiredException

app.state.limiter = rate_limiter.limiter
app.add_exception_handler(RateLimitExceeded, rate_limiter.rate_limit_exceeded_handler)

@app.exception_handler(TeacherGroupRequiredException)
async def teacher_group_required_handler(request, exc: TeacherGroupRequiredException):
    return JSONResponse(
        status_code=403,
        content={
            "detail": exc.detail,
            "code": "TEACHER_GROUP_REQUIRED"
        }
    )


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


app.include_router(app_router, prefix='/api/v1', tags=['Web Route'])


# Mount Inngest separately
app.include_router(inngest_router, tags=['Inngest'])
