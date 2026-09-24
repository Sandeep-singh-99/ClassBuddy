from langchain_tavily import TavilySearch
from dotenv import load_dotenv
from app.ai.industry_agent.state import IndustryState

load_dotenv()

search_tool = TavilySearch(max_results=4)


async def research_node(state: IndustryState) -> dict:
    """
    Research Node: Fetches live salary ranges, growth statistics, and market trends
    for the specified industry using Tavily Search.
    """
    plan = state.get("plan") or {}
    industry_name = state.get("industry", "")
    query = plan.get("search_query") or f"latest industry trends and salary for {industry_name}"

    try:
        results = await search_tool.ainvoke({"query": query})
        if not results or "results" not in results:
            combined = f"No detailed web research found for {industry_name}."
        else:
            combined = "\n".join(
                [
                    f"- Title: {r.get('title', 'N/A')}\n  Snippet: {r.get('content', '')}"
                    for r in results.get("results", [])
                ]
            )
    except Exception as e:
        combined = f"Research search error: {str(e)}"

    return {
        "research": combined,
    }
