from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from dotenv import load_dotenv
from app.ai.notes_agent.state import NotesState

load_dotenv()

llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.5)


async def improve_notes_node(state: NotesState) -> dict:
    """
    Improve Notes Node: Refines and rewrites the study notes addressing specific feedback
    from the Evaluator node.
    """
    topic = state.get("topic", "")
    plan = state.get("plan") or {}
    previous_notes = state.get("notes", "")
    evaluation = state.get("evaluation") or {}
    feedback = evaluation.get("feedback", "Improve clarity and completeness.")
    research_data = state.get("research", "")
    iteration = state.get("iteration", 0)

    prompt = f"""
You are an expert Educational Content Editor.

The draft study notes for "{topic}" received feedback from a Quality Reviewer.
Your goal is to rewrite and significantly improve the study notes to address ALL feedback points.

## Topic: {topic}
## Target Level: {plan.get('difficulty', 'Intermediate')}

## Reviewer Feedback:
{feedback}

## Current Draft Notes:
{previous_notes}

## Research & Reference Context:
{research_data}

## Instructions:
1. Revise the notes to directly solve every issue mentioned in the feedback.
2. Retain all accurate explanations, formatting, headers, and code snippets from the draft.
3. Ensure all sections (Overview, Concepts, Explanation, Examples, Takeaways, Quiz, Summary) are polished and complete.

Return ONLY the complete, improved Markdown study notes.
"""

    streaming_llm = llm.with_config(tags=["notes_generator"])
    response = await streaming_llm.ainvoke([HumanMessage(content=prompt)])

    return {
        "notes": response.content,
        "iteration": iteration + 1,
    }
