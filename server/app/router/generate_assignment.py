from fastapi import APIRouter, Depends, HTTPException, status, Form, Query
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.schemas.assignment import AssignmentQuestionResponse, AssignmentResponse, AssignmentBase
from app.models.assignment import Assignment, AssignmentQuestion, Submission
from app.models.auth import User
from app.schemas.auth import UserResponse
from app.models.auth import userRole
from app.dependencies.dependencies import get_db, get_current_user
from app.models.teacherInsight import TeacherInsight
from dotenv import load_dotenv
from langchain_tavily import TavilySearch
from fastapi.responses import JSONResponse
from typing import TypedDict, Annotated
from langgraph.graph import add_messages, StateGraph, END
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
import json

load_dotenv()


router = APIRouter()


@router.post("/generate-question/{assignment_id}", response_model=AssignmentQuestionResponse)
async def generate_question(assignment_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="not authorized to generate questions")

    assignment = db.query(Assignment).filter(Assignment.id == assignment_id, Assignment.owner_id == current_user.id).first()
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")

    # Logic to generate a question for the assignment
    question = AssignmentQuestion(
        assignment_id=assignment.id,
        question_text={"question": "What is the capital of France?", "options": ["Paris", "London", "Berlin"]},
    )

    db.add(question)
    db.commit()
    db.refresh(question)

    return question