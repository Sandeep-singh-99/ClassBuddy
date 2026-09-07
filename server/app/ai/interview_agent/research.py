from langchain_tavily import TavilySearch
from dotenv import load_dotenv
from app.ai.interview_agent.state import InterviewState

load_dotenv()

# Initialize Tavily Search Tool
search_tool = TavilySearch(max_results=3)

async def research_node(state: InterviewState) -> dict:
    """
    Research Node: Fetches live interview questions and industry trends using Tavily Search.
    """
    plan = state.get("plan") or {}
    topic = state.get("description", "")
    query = plan.get("search_query") or f"latest interview questions and concepts for {topic}"

    try:
        results = await search_tool.ainvoke({"query": query})
        if not results or "results" not in results:
            combined = f"No live search results found for query: {query}"
        else:
            combined = "\n".join(
                [
                    f"- Title: {r.get('title', 'N/A')}\n  Content: {r.get('content', '')}"
                    for r in results.get("results", [])
                ]
            )
    except Exception as e:
        combined = f"Tavily research search error: {str(e)}"

    return {
        "research": combined
    }
