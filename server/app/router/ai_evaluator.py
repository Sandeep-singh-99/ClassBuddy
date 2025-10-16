from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.models.assignment import Assignment, Submission
from app.models.auth import User, userRole
from app.dependencies.dependencies import get_db, get_current_user
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
import json
import logging
import re
from datetime import datetime

load_dotenv()

# ===== Logging =====
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ===== LLM Setup =====
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0.2,
    api_version="v1",
)

# ===== Helper =====
def clean_json_output(output: str):
    """Strip markdown/code fences from AI output."""
    return re.sub(r"^```[a-zA-Z]*\n?|```$", "", output.strip(), flags=re.MULTILINE).strip()


# ===== Router =====
router = APIRouter()

@router.post("/{assignment_id}/evaluate")
async def evaluate_answers(
    assignment_id: str,
    answers: dict[str, str],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Evaluate assignment answers and return a detailed JSON structure."""

    # --- 1️⃣ Authorization ---
    if current_user.role != userRole.STUDENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can submit answers."
        )

    # --- 2️⃣ Duplicate check ---
    if db.query(Submission).filter(
        Submission.student_id == current_user.id,
        Submission.assignment_id == assignment_id
    ).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already submitted this assignment."
        )

    # --- 3️⃣ Fetch assignment ---
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found.")
    if not assignment.questions:
        raise HTTPException(status_code=404, detail="No questions found in this assignment.")
    
    if assignment.due_date < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The due date for this assignment has passed.",
        )

    # --- 4️⃣ Parse stored questions (ensure it's a list of dicts) ---
    try:
        questions = (
            assignment.questions[0].question_text
            if isinstance(assignment.questions[0].question_text, list)
            else json.loads(assignment.questions[0].question_text)
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid question format in database.")

    # --- 5️⃣ Combine Q&A for AI evaluation ---
    qa_text = ""
    for q in questions:
        qid = str(q.get("id"))
        question = q.get("question", "")
        answer = answers.get(qid, "").strip()
        qa_text += f"Question: {question}\nAnswer: {answer}\n\n"

    # --- 6️⃣ Prompt for LLM ---
    prompt = f"""
You are an AI evaluator. Evaluate the student's assignment based on the questions and answers below.

{qa_text}

Each question is worth 5 marks. Evaluate each answer and assign marks between 0 and 5.

Provide output strictly in valid JSON:
{{
  "answers": [
    {{
      "id": <int>,
      "type": "<string>",
      "question": "<string>",
      "answer": "<string>"
    }}
  ],
  "total_marks": <integer>,
  "final_feedback": "<string>"
}}

Rules:
- One global feedback only.
- Do not include markdown, code fences, or extra commentary.
- Each question gets only its question text and student's answer.
"""

    # --- 7️⃣ Invoke AI safely ---
    try:
        response = llm.invoke([HumanMessage(content=prompt)])
        cleaned = clean_json_output(response.content)
        result = json.loads(cleaned)
    except json.JSONDecodeError:
        logger.warning("Invalid JSON from AI: %s", response.content)
        result = {
            "answers": [],
            "total_marks": 0,
            "final_feedback": "Invalid AI response format."
        }
    except Exception as e:
        logger.error("AI evaluation failed: %s", str(e))
        result = {
            "answers": [],
            "total_marks": 0,
            "final_feedback": "An internal evaluation error occurred."
        }

    # --- 8️⃣ Save submission (store only total + feedback) ---
    new_submission = Submission(
        assignment_id=assignment_id,
        student_id=current_user.id,
        answers=answers,  # original raw answers
        submitted_at=datetime.utcnow(),
        grade=result.get("total_marks", 0),
        feedback=result.get("final_feedback", "No feedback."),
    )
    db.add(new_submission)
    db.commit()
    db.refresh(new_submission)

    # --- 9️⃣ Return clean structured response ---
    return {
        "submission_id": str(new_submission.id),
        "assignment_id": assignment_id,
        "student_id": current_user.id,
        "answers": result.get("answers", []),
        "total_marks": result.get("total_marks", 0),
        "final_feedback": result.get("final_feedback", "No feedback."),
    }
