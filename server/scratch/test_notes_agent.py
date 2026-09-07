import asyncio
from app.ai.notes_agent.graph import graph


async def test_agent():
    print("--- TEST 1: Topic requiring research ('React Hooks') ---")
    inputs = {
        "topic": "React Hooks",
        "plan": None,
        "research": "",
        "notes": "",
        "evaluation": None,
        "iteration": 0,
        "max_iterations": 2,
        "final_notes": "",
    }

    async for event in graph.astream_events(inputs, version="v2"):
        kind = event["event"]
        name = event.get("name", "")
        if kind == "on_chain_start" and name in ["planner", "research", "generate_notes", "evaluate_notes", "improve_notes", "save_notes"]:
            print(f"-> Starting Node: {name}")

    print("\n--- TEST 2: Topic not requiring research ('Basic Addition and Subtraction') ---")
    inputs2 = {
        "topic": "Basic Addition and Subtraction",
        "plan": None,
        "research": "",
        "notes": "",
        "evaluation": None,
        "iteration": 0,
        "max_iterations": 2,
        "final_notes": "",
    }

    async for event in graph.astream_events(inputs2, version="v2"):
        kind = event["event"]
        name = event.get("name", "")
        if kind == "on_chain_start" and name in ["planner", "research", "generate_notes", "evaluate_notes", "improve_notes", "save_notes"]:
            print(f"-> Starting Node: {name}")


if __name__ == "__main__":
    asyncio.run(test_agent())
