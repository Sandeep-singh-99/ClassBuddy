from fastapi import APIRouter, Depends, HTTPException, status, Form, Query
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.schemas.assignment import (
    AssignmentQuestionResponse,
    AssignmentResponse,
    AssignmentBase,
)
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


class State(TypedDict):
    des: Annotated[list, add_messages]
    research: Annotated[list, add_messages]
    question: Annotated[list, add_messages]


search_tool = TavilySearch(max_results=2)
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0)


def tavily_search_node(state: State):
    topic = state["des"][-1].content
    search_results = search_tool.invoke({"query": topic})

    if not search_results or "results" not in search_results:
        combined_results = "No search results found."
    else:
        combined_results = "\n".join(
            [
                f"- {item['title']}: {item['content']}"
                for item in search_results["results"]
            ]
        )

    return {
        "des": state["des"],
        "research": [HumanMessage(content=combined_results)],
        "question": state.get("question", []),
    }


def generate_question_node(state: State):
    des = state["des"][-1].content
    res = (
        state["research"][-1].content
        if state["research"]
        else "No research data available."
    )

    prompt = (
        f"You are an expert at creating assignment questions for students.\n"
        f"Generate 10 questions based on the following assignment description and research data.\n\n"
        f"Assignment Description: {des}\n"
        f"Research Data: {res}\n"
        f"Some the questions must be pure theory, some must be coding questions.\n"
        f"Format is markdown with code blocks for coding questions.\n"
    )

    response = llm.invoke(prompt)

    return {
        "des": state["des"],
        "research": state["research"],
        "question": [HumanMessage(content=response.content)],
    }


workflow = StateGraph(State)

workflow.add_node("tavily_search", tavily_search_node)
workflow.add_node("generate_question", generate_question_node)

workflow.set_entry_point("tavily_search")
workflow.add_edge("tavily_search", "generate_question")
workflow.add_edge("generate_question", END)

graph = workflow.compile()


router = APIRouter()


@router.post(
    "/generate-question/{assignment_id}", response_model=AssignmentQuestionResponse
)
async def generate_question(
    assignment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="not authorized to generate questions",
        )
    
    if current_user.role != userRole.TEACHER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="only teachers can generate questions",
        )

    assignment = (
        db.query(Assignment)
        .filter(Assignment.id == assignment_id, Assignment.owner_id == current_user.id)
        .first()
    )
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found"
        )
    
    assignment_ques = db.query(AssignmentQuestion).filter(AssignmentQuestion.assignment_id == assignment_id).first()
    if assignment_ques:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question already generated for this assignment",
        )


    question_description = assignment.description
    if not question_description:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Assignment description is empty",
        )

    try:
        results = graph.invoke(
            {
                "des": [HumanMessage(content=question_description)],
                "research": [],
                "question": [],
            }
        )

        generated_question = (
            results["question"][-1].content
            if hasattr(results["question"][-1], "content")
            else str(results["question"][-1])
        )

        question = AssignmentQuestion(
            assignment_id=assignment.id, question_text=generated_question
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating question: {str(e)}",
        )

    db.add(question)
    db.commit()
    db.refresh(question)

    return question
