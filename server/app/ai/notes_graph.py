from typing import TypedDict, Annotated
from langgraph.graph import add_messages, StateGraph, END
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from dotenv import load_dotenv
from langchain_tavily import TavilySearch

load_dotenv()

# -------------------------------
# 1. Define Graph State
# -------------------------------
class State(TypedDict):
    title: Annotated[list, add_messages]
    research: Annotated[list, add_messages]
    notes: Annotated[list, add_messages]

search_tool = TavilySearch(max_results=3)

# -------------------------------
# 2. Initialize LLM
# -------------------------------
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0)

# -------------------------------
# 3. Tavily Search Node
# -------------------------------
async def tavily_search_node(state: State):
    """
    Fetch research data from Tavily based on the provided title.
    """
    topic = state["title"][-1].content
    search_results = await search_tool.ainvoke({"query": topic})

    if not search_results or "results" not in search_results:
        combined_results = "No search results found."
    else:
        combined_results = "\n".join(
            [f"- {item['title']}: {item['content']}" for item in search_results["results"]]
        )

    return {
        "title": state["title"],
        "research": [HumanMessage(content=combined_results)],
        "notes": state["notes"]
    }

# -------------------------------
# 4. Notes Generation Node
# -------------------------------
async def generate_notes_node(state: State):
    """
    Generate structured Markdown notes using gemini and research data.
    """
    title = state["title"][-1].content
    research_data = (
        state["research"][-1].content
        if state["research"]
        else "No additional data found."
    )

    prompt = f"""
You are an expert **teacher and educational content creator**.

Your task is to generate **high-quality structured study notes in Markdown format**.

## Topic
{title}

## Research Information
{research_data}

## Instructions

Generate **clear, detailed, and well-structured study notes** suitable for students.

Follow these rules carefully:

1. Start with a **main title** using `#`.
2. Divide the content into logical sections using `##` and `###`.
3. Use **bullet points** for key concepts.
4. Use **numbered steps** where appropriate.
5. Highlight important terms using **bold** formatting.
6. Provide **simple explanations suitable for beginners**.
7. Include **real-world examples** where helpful.
8. Add **code examples** if the topic is technical.
9. Add a **comparison table** if concepts need comparison.
10. End the notes with a **Key Takeaways / Summary section**.

## Output Format

The notes must follow this structure:

# Title

## Introduction
Brief overview of the topic.

## Key Concepts
Explain important ideas.

## Detailed Explanation
Break the topic into multiple sections.

## Examples
Provide practical examples.

## Important Points
Bullet list of critical information.

## Summary
Short recap of the topic.

Return **ONLY Markdown formatted notes**.
   """

    response = await llm.ainvoke([
        HumanMessage(content=prompt)
    ])

    return {
        "title": state["title"],
        "research": state["research"],
        "notes": [HumanMessage(content=response.content)],
    }

# -------------------------------
# 5. Build LangGraph Workflow
# -------------------------------
workflow = StateGraph(State)
workflow.add_node("tavily_search", tavily_search_node)
workflow.add_node("generate_notes", generate_notes_node)
workflow.set_entry_point("tavily_search")
workflow.add_edge("tavily_search", "generate_notes")
workflow.add_edge("generate_notes", END)
graph = workflow.compile()
