from langgraph.graph import StateGraph, END
from app.ai.industry_agent.state import IndustryState
from app.ai.industry_agent.planner import planner_node
from app.ai.industry_agent.research import research_node
from app.ai.industry_agent.analyzer import analyzer_node
from app.ai.industry_agent.evaluator import evaluator_node
from app.ai.industry_agent.improver import improver_node
from app.ai.industry_agent.finalizer import finalizer_node

# 1. Initialize StateGraph
workflow = StateGraph(IndustryState)

# 2. Add Nodes
workflow.add_node("planner", planner_node)
workflow.add_node("research", research_node)
workflow.add_node("analyzer", analyzer_node)
workflow.add_node("evaluator", evaluator_node)
workflow.add_node("improver", improver_node)
workflow.add_node("finalizer", finalizer_node)

# 3. Entry Point & Edges
workflow.set_entry_point("planner")

workflow.add_edge("planner", "research")
workflow.add_edge("research", "analyzer")
workflow.add_edge("analyzer", "evaluator")


# 4. Conditional Edge: Quality / Schema Check
def route_evaluation(state: IndustryState) -> str:
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

# 5. Loop edge from improver back to evaluator
workflow.add_edge("improver", "evaluator")

# 6. Completion edge from finalizer to END
workflow.add_edge("finalizer", END)

# 7. Compile Graph
industry_graph = workflow.compile()
