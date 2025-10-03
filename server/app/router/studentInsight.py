from fastapi import APIRouter, Depends, status, Form, File, HTTPException
from sqlalchemy.orm import Session
from typing import TypedDict, Annotated, Dict, List
from app.schemas.studentInsight import StudentInsightResponse, StudentInsightBase
from app.dependencies.dependencies import get_current_user
from app.config.db import get_db
from app.models.auth import User, userRole
from app.models.studentInsight import StudentInsight
from dotenv import load_dotenv
from langgraph.graph import add_messages, StateGraph, END
from langchain_tavily import TavilySearch
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
import json

load_dotenv()

class State(TypedDict):
    industry: Annotated[list, add_messages]
    research: Annotated[list, add_messages]
    getIndustry: Annotated[list, add_messages]

search_tool = TavilySearch(max_results=2)

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0,
    response_format="json"  
)

def tavily_search_node(state: State):
    topic = state["industry"][-1].content
    search_results = search_tool.invoke({ "query": topic })

    if not search_results or "results" not in search_results:
        combined_results = "No search results found."
    else:
        combined_results = "\n".join(
            [f"- {item['title']}: {item['content']}" for item in search_results["results"]]
        )

    return {
        "industry": state["industry"],
        "research": [HumanMessage(content=combined_results)],
        "getIndustry": state.get("getIndustry", []),
    }


def generate_industry_node(state: State):
    ind = state["industry"][-1].content
    res = state["research"][-1].content if state["research"] else "No research data available."


    prompt = (
        f"Analyze the current state of the {ind} industry and provide insights is only the following JSON format without any additional notes or explanations:\n\n"
        f"Research:\n{res}\n\n"
        f'{{"salary_range": [{"role": "string", "min": number, "max": number, "median": number, "location": "string"}]}}'
        f'{{"growth_rate": number}}'
        f'{{"demand_level": "Hight" | "Medium" | "Low"}}'
        f'{{"top_skills": ["string"]}}'
        f'{{"market_outlook": "Positive" | "Neutral" | "Negative"}}'
        f'{{"key_trends": ["string"]}}'
        f'{{"recommend_skills": ["string"]}}'

        f"IMPORTANT: Return only the JSON. No additional text or explanations, note, or makdown formatting."
        f"Include at least 5 common roles for salary_range."
        f"Growth rate should be a percentage value."
        f"Include at least 5 skills and 5 key trends."
    )

    response = llm.invoke(prompt)

    if not response or not response.content:
        raise HTTPException(status_code=500, detail="Failed to generate industry insights.")
    
    raw_output = response.content.strip()

    return {
        "industry": state["industry"],
        "research": state["research"],
        "getIndustry": [HumanMessage(content=raw_output)],
    }


workflow = StateGraph(State)
workflow.add_node("tavily_search", tavily_search_node)
workflow.add_node("generate_industry", generate_industry_node)
workflow.set_entry_point("tavily_search")

workflow.add_edge("tavily_search", "generate_industry")
workflow.add_edge("generate_industry", END)

graph = workflow.compile()

