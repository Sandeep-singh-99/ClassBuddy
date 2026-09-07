from langchain_tavily import TavilySearch
from dotenv import load_dotenv
from app.ai.notes_agent.state import NotesState

load_dotenv()

search_tool = TavilySearch(max_results=4)


async def research_node(state: NotesState) -> dict:
    """
    Research Node: Executes Tavily Search if the planner determined web research is needed.
    """
    plan = state.get("plan") or {}
    topic = state.get("topic", "")
    need_research = plan.get("need_research", True)
    search_query = plan.get("search_query") or topic

    if not need_research:
        return {
            "research": "No external web research required based on topic analysis.",
        }

    try:
        search_results = await search_tool.ainvoke({"query": search_query})

        if not search_results or "results" not in search_results:
            combined_results = f"No search results found for query: '{search_query}'."
        else:
            combined_results = "\n".join(
                [
                    f"- Title: {item.get('title', 'N/A')}\n  URL: {item.get('url', '')}\n  Snippet: {item.get('content', '')}"
                    for item in search_results.get("results", [])
                ]
            )
    except Exception as e:
        combined_results = f"Web research search error: {str(e)}"

    return {
        "research": combined_results,
    }
