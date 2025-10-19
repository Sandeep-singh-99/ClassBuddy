from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import TypedDict, Annotated, Dict, List
from app.schemas.interviewpreparation import InterviewPreparationCreate, InterviewPreparationResponse, InterviewPrepSubmit, InterviewResponse, InterviewPreparationCreateResponse
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
from app.dependencies.redis_client import get_redis_client
from fastapi.encoders import jsonable_encoder

load_dotenv()

# ---- LangGraph State ----
class State(TypedDict):
    description: Annotated[list, add_messages]
    research: Annotated[list, add_messages]
    quiz: Annotated[list, add_messages]

# ---- Tools & LLM ----
search_tool = TavilySearch(max_results=2)
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
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
        f"Generate 2 interview questions based on the following job description and research data.\n\n"
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

@router.post("/create-interview-prep", response_model=InterviewPreparationCreateResponse)
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

    return {
        "name": interview_prep.name,
        "description": interview_prep.description,
        "questions": quiz_json["questions"], 
    }

    


@router.post("/submit-quiz")
async def submit_quiz(submission: InterviewPreparationResponse, redis_client = Depends(get_redis_client), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != userRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can submit quizzes.")
    
    query = db.query(InterviewPrep).filter(InterviewPrep.user_id == current_user.id, InterviewPrep.name == submission.name).first()
    if query:
        raise HTTPException(status_code=400, detail="Quiz with this name already submitted.")

    # Invalidate cache
    cache_key = f"interview_preps:{current_user.id}"
    redis_client.delete(cache_key)

    new_entry = InterviewPrep(
        name=submission.name,
        description=submission.description,
        questions=[q.dict() for q in submission.questions],
        score=submission.score,
        user_answers=submission.user_answers,
        user_id=current_user.id
    )

    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)

    return {
        "message": "Quiz submitted successfully",
        "quiz_id": new_entry.id,
        "score": new_entry.score,
        "user_answers": new_entry.user_answers,
    }




# @router.get("/get-interview-preps", response_model=List[InterviewResponse])
# def get_interview_preps(
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
#     if current_user.role != userRole.STUDENT:
#         raise HTTPException(status_code=403, detail="Only students can view their interview preparations.")

    
#     interview_preps = db.query(InterviewPrep).filter(InterviewPrep.user_id == current_user.id).all()

#     return interview_preps



@router.get("/get-interview-preps", response_model=List[InterviewResponse])
def get_interview_preps(
    db: Session = Depends(get_db),
    redis_client = Depends(get_redis_client),
    current_user: User = Depends(get_current_user)
):
    # Role check
    if current_user.role != userRole.STUDENT:
        raise HTTPException(
            status_code=403, 
            detail="Only students can view their interview preparations."
        )

    # Create unique cache key per user
    cache_key = f"interview_preps:{current_user.id}"

    # Try fetching from Redis
    cached_data = redis_client.get(cache_key)
    if cached_data:
        data = json.loads(cached_data)
        if isinstance(data, list) and all(isinstance(item, dict) for item in data):
            return [InterviewResponse(**d) for d in data]
        # If corrupted cache, delete it
        redis_client.delete(cache_key)

    # Fetch from DB
    interview_preps = (
        db.query(InterviewPrep)
        .filter(InterviewPrep.user_id == current_user.id)
        .all()
    )

    # Encode and cache result for 2 minutes
    encoded_data = jsonable_encoder(interview_preps)
    redis_client.set(cache_key, json.dumps(encoded_data))

    return interview_preps