from langgraph.graph import StateGraph, END
from app.ai.notes_agent.state import NotesState
from app.ai.notes_agent.planner import planner_node
from app.ai.notes_agent.research import research_node
from app.ai.notes_agent.generator import generate_notes_node
from app.ai.notes_agent.evaluator import evaluate_notes_node
from app.ai.notes_agent.improver import improve_notes_node
from app.ai.notes_agent.saver import save_notes_node

# 1. Initialize State Graph
workflow = StateGraph(NotesState)

# 2. Add Nodes
workflow.add_node("planner", planner_node)
workflow.add_node("research", research_node)
workflow.add_node("generate_notes", generate_notes_node)
workflow.add_node("evaluate_notes", evaluate_notes_node)
workflow.add_node("improve_notes", improve_notes_node)
workflow.add_node("save_notes", save_notes_node)

# 3. Entry Point
workflow.set_entry_point("planner")


# 4. Conditional Edge: Research Decision
def route_research(state: NotesState) -> str:
    plan = state.get("plan") or {}
    if plan.get("need_research", True):
        return "research"
    return "generate_notes"


workflow.add_conditional_edges(
    "planner",
    route_research,
    {
        "research": "research",
        "generate_notes": "generate_notes",
    },
)

# 5. Fixed Edge: Research -> Generate
workflow.add_edge("research", "generate_notes")

# 6. Fixed Edge: Generate -> Evaluate
workflow.add_edge("generate_notes", "evaluate_notes")


# 7. Conditional Edge: Quality Assessment (Improve or Save)
def route_evaluation(state: NotesState) -> str:
    eval_res = state.get("evaluation") or {}
    iteration = state.get("iteration", 0)
    max_iter = state.get("max_iterations", 2)

    if not eval_res.get("is_good", True) and iteration < max_iter:
        return "improve"
    return "save"


workflow.add_conditional_edges(
    "evaluate_notes",
    route_evaluation,
    {
        "improve": "improve_notes",
        "save": "save_notes",
    },
)

# 8. Loop Back Edge: Improve -> Re-evaluate
workflow.add_edge("improve_notes", "evaluate_notes")

# 9. Completion Edge: Save -> END
workflow.add_edge("save_notes", END)

# 10. Compile Graph
graph = workflow.compile()
