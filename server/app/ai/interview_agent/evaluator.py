import json
import re
from app.ai.interview_agent.state import InterviewState

async def evaluator_node(state: InterviewState) -> dict:
    """
    Evaluator Node: Parses and validates the generated quiz schema and question quality.
    """
    raw_output = state.get("raw_quiz_output", "")
    iteration = state.get("iteration", 0)

    is_valid = True
    reason = "Valid JSON quiz schema"
    parsed_quiz = []

    # Attempt to extract JSON from raw output
    clean_text = raw_output.replace("```json", "").replace("```", "").strip()

    try:
        json_match = re.search(r"\{.*\}", clean_text, re.DOTALL)
        if json_match:
            data = json.loads(json_match.group())
        else:
            data = json.loads(clean_text)

        if not isinstance(data, dict) or "questions" not in data:
            is_valid = False
            reason = "Root element missing 'questions' key"
        else:
            questions = data.get("questions", [])
            if not isinstance(questions, list) or len(questions) == 0:
                is_valid = False
                reason = "'questions' array is empty or invalid"
            else:
                for idx, q in enumerate(questions):
                    if not isinstance(q, dict):
                        is_valid = False
                        reason = f"Question index {idx} is not a valid object"
                        break
                    
                    if not q.get("question") or not isinstance(q.get("question"), str):
                        is_valid = False
                        reason = f"Question index {idx} missing valid 'question' text"
                        break
                    
                    options = q.get("options")
                    if not isinstance(options, list) or len(options) < 2:
                        is_valid = False
                        reason = f"Question index {idx} does not have at least 2 options"
                        break
                    
                    if not q.get("answer"):
                        is_valid = False
                        reason = f"Question index {idx} missing 'answer'"
                        break
                
                if is_valid:
                    parsed_quiz = questions

    except Exception as e:
        is_valid = False
        reason = f"JSON parse error: {str(e)}"

    return {
        "quiz": parsed_quiz if is_valid else state.get("quiz", []),
        "evaluation": {
            "is_valid": is_valid,
            "reason": reason,
            "question_count": len(parsed_quiz),
        },
        "iteration": iteration + 1,
    }
