from langchain_core.messages import HumanMessage
from app.ai.interview_agent.state import InterviewState
from app.ai.interview_agent.generator import get_huggingface_llm

async def improver_node(state: InterviewState) -> dict:
    """
    Improver Node: Fixes quiz schema or question errors flagged by the Evaluator.
    """
    raw_output = state.get("raw_quiz_output", "")
    eval_info = state.get("evaluation") or {}
    reason = eval_info.get("reason", "Invalid JSON format")
    description = state.get("description", "")

    prompt = f"""
The previous quiz output had an error:
Error Reason: {reason}

Previous raw output:
{raw_output}

Target Topic / Job Description:
{description}

Please fix the error and return ONLY valid JSON matching this exact structure:
{{
  "questions": [
    {{
      "question": "Question text",
      "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
      "answer": "A. Option 1",
      "explanation": "Explanation text"
    }}
  ]
}}

Return ONLY valid raw JSON without markdown block formatting (` ```json `).
"""

    llm = get_huggingface_llm()
    response = await llm.ainvoke([HumanMessage(content=prompt)])
    content = response.content.strip()

    clean_content = content.replace("```json", "").replace("```", "").strip()

    return {
        "raw_quiz_output": clean_content
    }
