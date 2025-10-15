from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.schemas.assignment import AssignmentQuestionResponse
from app.models.assignment import Assignment, AssignmentQuestion
from app.models.auth import User, userRole
from app.dependencies.dependencies import get_db, get_current_user
from dotenv import load_dotenv
from langchain_tavily import TavilySearch
from fastapi.responses import JSONResponse
from typing import TypedDict, Annotated
from langgraph.graph import add_messages, StateGraph, END
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
import json
import re

load_dotenv()


# --------------------------
# Graph State Definition
# --------------------------
class State(TypedDict):
    des: Annotated[list, add_messages]
    research: Annotated[list, add_messages]
    question: Annotated[list, add_messages]


# --------------------------
# Initialize Tools
# --------------------------
search_tool = TavilySearch(max_results=2)
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0)


# --------------------------
# Search Node
# --------------------------
def tavily_search_node(state: State):
    topic = state["des"][-1].content
    search_results = search_tool.invoke({"query": topic})

    combined_results = (
        "\n".join(
            [
                f"- {item['title']}: {item['content']}"
                for item in search_results["results"]
            ]
        )
        if search_results and "results" in search_results
        else "No search results found."
    )

    return {
        "des": state["des"],
        "research": [HumanMessage(content=combined_results)],
        "question": state.get("question", []),
    }


# --------------------------
# Question Generation Node
# --------------------------
def generate_question_node(state: State):
    des = state["des"][-1].content
    res = (
        state["research"][-1].content
        if state["research"]
        else "No research data available."
    )

    prompt = f"""
You are an expert at creating assignment questions for students.
Generate **3 questions** based on the assignment description and research data.
Some should be theoretical, some should be coding-based.
Use markdown for formatting, and include code blocks for coding questions.

Return output as a **valid JSON list**, where each item is:
{{
  "id": number,
  "type": "theory" | "coding",
  "question": "text in markdown"
}}

Assignment Description: {des}
Research Data: {res}
    """

    response = llm.invoke(prompt)

    # Try to extract JSON part safely
    try:
        json_match = re.search(r"\[.*\]", response.content, re.DOTALL)
        json_data = json.loads(json_match.group()) if json_match else []
    except Exception:
        json_data = [{"id": 1, "type": "theory", "question": response.content}]

    return {
        "des": state["des"],
        "research": state["research"],
        "question": [HumanMessage(content=json.dumps(json_data, indent=2))],
    }


# --------------------------
# Graph Workflow
# --------------------------
workflow = StateGraph(State)
workflow.add_node("tavily_search", tavily_search_node)
workflow.add_node("generate_question", generate_question_node)
workflow.set_entry_point("tavily_search")
workflow.add_edge("tavily_search", "generate_question")
workflow.add_edge("generate_question", END)
graph = workflow.compile()

# --------------------------
# FastAPI Router
# --------------------------
router = APIRouter()


@router.post(
    "/generate-question/{assignment_id}", response_model=AssignmentQuestionResponse
)
async def generate_question(
    assignment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate structured assignment questions (JSON format)."""

    if not current_user or current_user.role != userRole.TEACHER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers can generate questions.",
        )

    assignment = (
        db.query(Assignment)
        .filter(Assignment.id == assignment_id, Assignment.owner_id == current_user.id)
        .first()
    )
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found."
        )

    # Prevent duplicate generation
    existing = (
        db.query(AssignmentQuestion)
        .filter(AssignmentQuestion.assignment_id == assignment_id)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Questions already generated for this assignment.",
        )

    if not assignment.description:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Assignment description is empty.",
        )

    try:
        results = graph.invoke(
            {
                "des": [HumanMessage(content=assignment.description)],
                "research": [],
                "question": [],
            }
        )

        generated_content = results["question"][-1].content
        questions_json = json.loads(generated_content)

        question = AssignmentQuestion(
            assignment_id=assignment.id,
            question_text=json.dumps(questions_json, indent=2),
        )
        db.add(question)
        db.commit()
        db.refresh(question)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating questions: {str(e)}",
        )

    return question
