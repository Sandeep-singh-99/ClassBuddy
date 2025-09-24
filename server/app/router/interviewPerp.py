from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import TypedDict, Annotated, Dict
from app.schemas.interviewpreparation import InterviewPreparationCreate, InterviewPreparationResponse
from app.dependencies.dependencies import get_current_user
from app.config.db import get_db
from app.models.auth import User, userRole
from dotenv import load_dotenv
from langgraph.graph import add_messages, StateGraph, END
from langchain_tavily import TavilySearch
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
import json
from app.models.InterviewPreparation import InterviewPrep

load_dotenv()

# ---- LangGraph State ----
class State(TypedDict):
    description: Annotated[list, add_messages]
    research: Annotated[list, add_messages]
    quiz: Annotated[list, add_messages]

# ---- Tools & LLM ----
search_tool = TavilySearch(max_results=2)
llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    temperature=0,
    response_format="json"  
)

# ---- Nodes ----
def tavily_search_node(state: State):
    topic = state["description"][-1].content
    search_results = search_tool.invoke({"query": topic})

    if not search_results or "results" not in search_results:
        combined_results = "No search results found."
    else:
        combined_results = "\n".join(
            [f"- {item['title']}: {item['content']}" for item in search_results["results"]]
        )

    return {
        "description": state["description"],
        "research": [HumanMessage(content=combined_results)],
        "quiz": state.get("quiz", []),
    }


def generate_quiz_node(state: State):
    des = state["description"][-1].content
    res = state["research"][-1].content if state["research"] else "No research data available."

    prompt = (
        f"Generate 10 interview questions based on the following job description and research data.\n\n"
        f"Job Description:\n{des}\n\n"
        f"Research:\n{res}\n\n"
        f"Each question must be multiple choice with 4 options (A, B, C, D).\n"
        f"Return ONLY valid JSON in this structure (no text outside JSON):\n\n"
        f'{{"questions": [{{"question": "string", "options": ["A","B","C","D"], "answer": "string", "explanation": "string"}}]}}'
    )

    response = llm.invoke(prompt)

    if not response or not response.content:
        raise HTTPException(status_code=500, detail="LLM returned empty response")

    raw_output = response.content.strip()

    # Strip markdown fences if Gemini wraps JSON in ```json ... ```
    if raw_output.startswith("```"):
        raw_output = raw_output.strip("`")
        # remove leading/trailing ```json or ``` 
        raw_output = raw_output.replace("json\n", "").replace("json", "").strip()

    try:
        quiz_json = json.loads(raw_output)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse quiz JSON: {str(e)} | Raw output: {raw_output}",
        )

    return {
        "description": state["description"],
        "research": state["research"],
        "quiz": [HumanMessage(content=json.dumps(quiz_json))],
    }


# ---- Graph ----
workflow = StateGraph(State)
workflow.add_node("tavily_search", tavily_search_node)
workflow.add_node("generate_quiz", generate_quiz_node)

workflow.set_entry_point("tavily_search")
workflow.add_edge("tavily_search", "generate_quiz")
workflow.add_edge("generate_quiz", END)

graph = workflow.compile()

# ---- FastAPI Router ----
router = APIRouter()

@router.post("/create-interview-prep", response_model=InterviewPreparationResponse)
def create_interview_prep(
    interview_prep: InterviewPreparationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != userRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can create interview preparation entries.")

    # Run LangGraph
    inputs = {"description": [HumanMessage(content=interview_prep.description)]}
    final_state = graph.invoke(inputs)

    # Extract quiz
    quiz_raw = final_state["quiz"][-1].content
    quiz_json = json.loads(quiz_raw)

    # Save to DB
    new_entry = InterviewPrep(
        user_id=current_user.id,
        name=interview_prep.name,
        description=interview_prep.description,
        questions=quiz_json
    )
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)

    return new_entry
