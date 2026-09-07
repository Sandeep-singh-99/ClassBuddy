from langgraph.graph import StateGraph, END
from app.ai.interview_agent.state import InterviewState
from app.ai.interview_agent.planner import planner_node
from app.ai.interview_agent.research import research_node
from app.ai.interview_agent.generator import generator_node
from app.ai.interview_agent.evaluator import evaluator_node
from app.ai.interview_agent.improver import improver_node
from app.ai.interview_agent.finalizer import finalizer_node

# 1. Initialize StateGraph
workflow = StateGraph(InterviewState)

# 2. Add Nodes
workflow.add_node("planner", planner_node)
workflow.add_node("research", research_node)
workflow.add_node("generator", generator_node)
workflow.add_node("evaluator", evaluator_node)
workflow.add_node("improver", improver_node)
workflow.add_node("finalizer", finalizer_node)

# 3. Set Entry Point and Linear Edges
workflow.set_entry_point("planner")
workflow.add_edge("planner", "research")
workflow.add_edge("research", "generator")
workflow.add_edge("generator", "evaluator")

# 4. Conditional Routing from Evaluator
def route_evaluation(state: InterviewState) -> str:
    eval_res = state.get("evaluation") or {}
    iteration = state.get("iteration", 0)
    max_iter = state.get("max_iterations", 2)

    if not eval_res.get("is_valid", True) and iteration < max_iter:
        return "improver"
    return "finalizer"

workflow.add_conditional_edges(
    "evaluator",
    route_evaluation,
    {
        "improver": "improver",
        "finalizer": "finalizer",
    },
)

# 5. Improvement Loop Back Edge
workflow.add_edge("improver", "evaluator")

# 6. Completion Edge
workflow.add_edge("finalizer", END)

# 7. Compile Compiled Graph
interview_graph = workflow.compile()
graph = interview_graph  # Alias for backward compatibility
