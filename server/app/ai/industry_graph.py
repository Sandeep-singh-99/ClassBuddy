from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, END, add_messages
from langchain_tavily import tavily_search
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from dotenv import load_dotenv

load_dotenv()


class State(TypedDict):
    industry: Annotated[list, add_messages]
    research: Annotated[list, add_messages]
    getIndustry: Annotated[list, add_messages]


search_tool = tavily_search(max_results=4)

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0.7,
    response_format="json",
)


def tavily_search_tool(state: State):
    topic = state["industry"][-1].content
    results = search_tool.invoke({"query": topic})

    combined = (
        "\n".join(
            f" - {r['title']}: {r['content']}" for r in results.get("results", [])
        )
        or "No research data found."
    )

    return {
        "industry": state["industry"],
        "research": [HumanMessage(content=combined)],
        "getIndustry": [],
    }


def generate_industry_node(state: State):
    ind = state["industry"][-1].content
    research = state["research"][-1].content

    prompt = f"""
    Analyze {ind} industry and return ONLY JSON:

    {{
       "salary_range": [{{"role": "string", "min": number, "max": number, "median": number, "location": "string"}}],
       "growth_rate": number,
       "demand_level": "High" | "Medium" | "Low",
       "top_skills": ["string"],
       "market_outlook": "Positive" | "Neutral" | "Negative",
       "key_trends": ["string"],
       "recommend_skills": ["string"] 
    }}
    """

    response = llm.invoke(prompt)

    return {
        "industry": state["industry"],
        "research": state["research"],
        "getIndustry": [HumanMessage(content=response.content.split())],
    }

workflow = StateGraph(State)
workflow.add_node("search", tavily_search_tool)
workflow.add_node("generate", generate_industry_node)
workflow.set_entry_point("search")
workflow.add_edge("search", "generate")
workflow.add_edge("generate", END)

industry_graph = workflow.compile()