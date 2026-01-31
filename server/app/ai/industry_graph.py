import json
from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, END, add_messages
from langchain_tavily import TavilySearch
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from dotenv import load_dotenv

load_dotenv()

class State(TypedDict):
    industry: Annotated[list, add_messages]
    research: Annotated[list, add_messages]
    getIndustry: Annotated[list, add_messages]

search_tool = TavilySearch(max_results=4)
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.7)

async def tavily_search_node(state: State):
    topic = state["industry"][-1].content
    results = await search_tool.ainvoke({"query": f"latest industry trends and salary for {topic}"})
    
    combined = "\n".join([f"- {r['title']}: {r['content']}" for r in results.get("results", [])])
    return {"research": [HumanMessage(content=combined or "No data found.")]}

async def generate_industry_node(state: State):
    ind = state["industry"][-1].content
    research_data = state["research"][-1].content

    prompt = f"""
Using this research: {research_data}
Analyze the {ind} industry and return ONLY a raw JSON object. 
IMPORTANT: Every field must be populated. Do not return null values.

{{
   "salary_range": [{{"role": "string", "min": number, "max": number, "median": number, "location": "string"}}],
   "growth_rate": number,  // If unknown, provide an estimated percentage as a number
   "demand_level": "High" | "Medium" | "Low",
   "top_skills": ["string"],
   "market_outlook": "Positive" | "Neutral" | "Negative",
   "key_trends": ["string"],
   "recommend_skills": ["string"] 
}}
"""
    response = await llm.ainvoke(prompt)
    clean_content = response.content.replace("```json", "").replace("```", "").strip()
    return {"getIndustry": [HumanMessage(content=clean_content)]}

workflow = StateGraph(State)
workflow.add_node("search", tavily_search_node)
workflow.add_node("generate", generate_industry_node)
workflow.set_entry_point("search")
workflow.add_edge("search", "generate")
workflow.add_edge("generate", END)
industry_graph = workflow.compile()