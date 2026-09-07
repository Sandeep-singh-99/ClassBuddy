"""
Re-export compiled agent graph from app.ai.notes_agent.graph
for backward compatibility across API routers and existing imports.
"""

from app.ai.notes_agent.graph import graph

__all__ = ["graph"]
