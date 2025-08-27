from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.router.auth import router as auth_router
from app.router.chat_with_pdf import router as chat_with_pdf
from app.router.group import router as group_router
from app.router.comment import router as comment_router
from app.router.notes import router as notes_router
from app.config.db import Base, engine
from app.models import auth, group

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


Base.metadata.create_all(bind=engine)
app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(chat_with_pdf, prefix="/pdf", tags=["PDF Chat"])
app.include_router(group_router, prefix="/groups", tags=["groups"])
app.include_router(comment_router, prefix="/comments", tags=["Comments"])
app.include_router(notes_router, prefix="/notes", tags=["Notes"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the ClassBuddy API"}
