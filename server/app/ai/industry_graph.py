"""
Re-export compiled Industry Insights AI Agent graph from app.ai.industry_agent.graph
using Groq AI (ChatGroq) instead of Google Gemini.
"""

from app.ai.industry_agent.graph import industry_graph

__all__ = ["industry_graph"]