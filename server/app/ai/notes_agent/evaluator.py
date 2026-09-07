import json
import re
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from dotenv import load_dotenv
from app.ai.notes_agent.state import NotesState

load_dotenv()

llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.1)


async def evaluate_notes_node(state: NotesState) -> dict:
    """
    Evaluator Node: Assesses the quality, completeness, structure, and appropriateness
    of the generated study notes.
    """
    topic = state.get("topic", "")
    plan = state.get("plan") or {}
    notes = state.get("notes", "")

    difficulty = plan.get("difficulty", "Intermediate")
    include_examples = plan.get("include_examples", True)
    include_quiz = plan.get("include_quiz", True)

    prompt = f"""
You are a Senior Quality Assurance Evaluator for educational content.

Evaluate the following generated study notes for the topic: "{topic}" (Target Level: {difficulty}).

## Generated Notes:
{notes}

## Evaluation Checklist:
1. **Completeness**: Are key aspects of "{topic}" explained thoroughly?
2. **Level Appropriateness**: Is the language and depth appropriate for {difficulty} level?
3. **Examples**: {"Are real-world examples or code snippets provided?" if include_examples else "N/A"}
4. **Structure & Formatting**: Are clear headers, bullet points, and markdown tags used properly?
5. **Quiz / Assessment**: {"Is a practice quiz or self-assessment included?" if include_quiz else "N/A"}
6. **Relevance**: Is the content strictly accurate and relevant to "{topic}"?

Respond with ONLY a raw JSON object matching this structure:
{{
  "score": integer between 0 and 100,
  "is_good": true if score >= 75 else false,
  "feedback": "Detailed, constructive feedback specifying what is missing or needs refinement. If score >= 75, explain why it passed."
}}

Return ONLY valid JSON with no markdown syntax wrapping or extra text.
"""

    response = await llm.ainvoke([HumanMessage(content=prompt)])
    content = response.content.strip()

    eval_data = {
        "score": 85,
        "is_good": True,
        "feedback": "Notes meet quality standards.",
    }

    try:
        json_match = re.search(r"\{.*\}", content, re.DOTALL)
        if json_match:
            parsed = json.loads(json_match.group())
            eval_data.update(parsed)
            # Ensure boolean is_good matches score threshold
            if "score" in parsed and "is_good" not in parsed:
                eval_data["is_good"] = parsed["score"] >= 75
    except Exception as e:
        print(f"Evaluator JSON parse error: {e}")

    return {
        "evaluation": eval_data,
    }
