from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from dotenv import load_dotenv
from app.ai.notes_agent.state import NotesState

load_dotenv()

# We configure the LLM and pass tags=["notes_generator"] during invocation to enable clean SSE token streaming.
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.7)


async def generate_notes_node(state: NotesState) -> dict:
    """
    Notes Generator Node: Generates structured study notes in Markdown format
    incorporating planner guidance and research context.
    """
    topic = state.get("topic", "")
    plan = state.get("plan") or {}
    research_data = state.get("research", "No external research required.")

    difficulty = plan.get("difficulty", "Intermediate")
    target_audience = plan.get("target_audience", "Students")
    include_examples = plan.get("include_examples", True)
    include_quiz = plan.get("include_quiz", True)
    plan_summary = plan.get("plan_summary", "")

    prompt = f"""
You are an elite **educator and instructional content specialist**.

Your task is to generate **high-quality, structured study notes in clean Markdown format**.

## Topic: {topic}
## Target Level: {difficulty} ({target_audience})
## Strategy: {plan_summary}

## Research & Reference Context:
{research_data}

## Formatting Instructions:
Follow these structural and styling guidelines strictly:
1. Main title using a single `#` header: `# {topic}`
2. **Overview & Learning Objectives**: Briefly outline what students will learn.
3. **Core Concepts**: Explain fundamental concepts using bold terms and bullet points.
4. **In-Depth Explanation**: Provide detailed technical breakdown with clear sub-headings (`###`).
{"5. **Real-World Examples**: Include practical, concrete code snippets or real-world scenarios." if include_examples else ""}
6. **Key Takeaways**: Concise bullet points highlighting critical concepts.
{"7. **Practice Quiz / Self-Assessment**: Include 3-5 multiple choice or short review questions with an answer key." if include_quiz else ""}
8. **Summary**: A concluding recap.

Ensure the notes are comprehensive, clear, pedagogically sound, and directly targeted at {difficulty} level.
Return ONLY the raw Markdown notes without meta commentary.
"""

    streaming_llm = llm.with_config(tags=["notes_generator"])
    response = await streaming_llm.ainvoke([HumanMessage(content=prompt)])

    return {
        "notes": response.content,
    }
