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
    