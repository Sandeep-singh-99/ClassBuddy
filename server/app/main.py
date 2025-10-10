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
from app.config.db import Base, engine
from app.models import auth, notes, teacherInsight

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
           "http://localhost:5173",
           "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Base.metadata.create_all(bind=engine)

@app.on_event("startup")
def on_startup():
    print("Creating database tables (if not exist)...")
    Base.metadata.create_all(bind=engine)

app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(chat_with_pdf, prefix="/pdf", tags=["PDF Chat"])
app.include_router(teacher_insight_router, prefix="/insights", tags=["Teacher Insights"])
app.include_router(group_router, prefix="/groups", tags=["Groups"])
app.include_router(generate_notes_router, prefix="/notes", tags=["Generate Notes"])
app.include_router(notes_router, prefix="/notes", tags=["Notes"])
app.include_router(student_insight_router, prefix="/student-insight", tags=["Student Insights"])
app.include_router(interview_prep_router, prefix="/interview-prep", tags=["Interview Preparation"])
app.include_router(docsupload_router, prefix="/docs", tags=["Document Upload"])
app.include_router(assignment_router, prefix="/assignments", tags=["Assignments"])
app.include_router(generate_assignment_router, prefix="/assignments", tags=["Generate Assignment"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the ClassBuddy API"}
