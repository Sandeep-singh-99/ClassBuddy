from app.ai.interview_agent.state import InterviewState

async def planner_node(state: InterviewState) -> dict:
    """
    Planner Node: Analyzes input job description or topic to create a targeted search plan.
    """
    description = state.get("description", "")
    
    # Handle if description was passed as list of messages or string
    if isinstance(description, list) and len(description) > 0:
        if hasattr(description[-1], "content"):
            description_text = description[-1].content
        elif isinstance(description[-1], dict):
            description_text = description[-1].get("content", "")
        else:
            description_text = str(description[-1])
    else:
        description_text = str(description)

    search_query = f"top technical interview questions and key concepts for {description_text[:120]}"

    plan = {
        "topic": description_text,
        "search_query": search_query,
        "key_focus_areas": [
            "Core Concepts & Fundamentals",
            "Practical Application & Problem Solving",
            "Best Practices & Edge Cases"
        ]
    }

    return {
        "description": description_text,
        "plan": plan,
        "iteration": 0,
        "max_iterations": 2,
    }
