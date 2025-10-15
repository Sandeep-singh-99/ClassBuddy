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

# ----- Logging -----
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ----- Initialize LLM -----
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash", 
    temperature=0.2,
    api_version="v1",
)

# ----- Helper: Clean JSON -----
def clean_json_output(output: str):
    """Remove markdown code fences if present."""
    return re.sub(r"^```[a-zA-Z]*\n?|```$", "", output.strip(), flags=re.MULTILINE).strip()

# ----- FastAPI Router -----
router = APIRouter(prefix="/ai-evaluator", tags=["AI Evaluator"])

@router.post("/{assignment_id}/evaluate")
async def evaluate_answers(
    assignment_id: str,
    answers: dict[str, str],  # {"question_id": "student_answer"}
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Evaluate all student answers for a given assignment (store only total marks & final feedback)."""

    # --- Authorization ---
    if current_user.role != userRole.STUDENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can submit answers."
        )
    
    submission_exists = db.query(Submission).filter(Submission.student_id == current_user.id, Submission.assignment_id == assignment_id).first()
    if submission_exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already submitted this assignment."
        )

    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found.")
    if not assignment.questions:
        raise HTTPException(status_code=404, detail="No questions found in this assignment.")

    # ----- Combine all questions and answers -----
    combined_text = ""
    for q in assignment.questions:
        qid = str(q.id)

        # Convert question_text (list/dict) to readable string
        if isinstance(q.question_text, list):
            question_str = "\n".join(
                [item.get("question", str(item)) if isinstance(item, dict) else str(item) for item in q.question_text]
            )
        elif isinstance(q.question_text, dict):
            question_str = json.dumps(q.question_text)
        else:
            question_str = str(q.question_text)

        student_answer = answers.get(qid, "").strip()
        combined_text += f"Question:\n{question_str}\nAnswer:\n{student_answer}\n\n"

    # ----- AI Prompt -----
    prompt = f"""
You are an AI evaluator. Evaluate the student's assignment below.

{combined_text}

Provide:
1. Total marks (sum of marks for all questions, out of 5 per question)
2. Final constructive feedback summarizing overall performance

Respond ONLY in valid JSON:
{{
    "total_marks": <integer>,
    "final_feedback": "<string>"
}}

Do NOT include markdown or code fences.
"""

    # ----- Invoke AI -----
    try:
        response = llm.invoke([HumanMessage(content=prompt)])
        cleaned = clean_json_output(response.content)
        result = json.loads(cleaned)
        total_marks = int(result.get("total_marks", 0))
        final_feedback = result.get("final_feedback", "No feedback provided.")
    except json.JSONDecodeError:
        logger.warning("Invalid JSON from LLM. Raw output: %s", response.content)
        total_marks, final_feedback = 0, "Invalid AI response format."
    except Exception as e:
        logger.error("Evaluation failed: %s", str(e))
        total_marks, final_feedback = 0, "An evaluation error occurred."

    # ----- Save submission -----
    new_submission = Submission(
        assignment_id=assignment_id,
        student_id=current_user.id,
        answers=answers,
        submitted_at=datetime.utcnow(),
        grade=total_marks,
        feedback=final_feedback,  # store only final feedback
    )
    db.add(new_submission)
    db.commit()
    db.refresh(new_submission)

    logger.info(
        "AI evaluated assignment %s for student %s. Total Marks: %d",
        assignment_id, current_user.id, total_marks
    )

    return {
        "submission_id": new_submission.id,
        "assignment_id": assignment_id,
        "student_id": current_user.id,
        "total_marks": total_marks,
        "final_feedback": final_feedback,
    }
