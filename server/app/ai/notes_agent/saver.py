from app.ai.notes_agent.state import NotesState


async def save_notes_node(state: NotesState) -> dict:
    """
    Save Notes Node: Finalizes the approved study notes in the state.
    """
    notes = state.get("notes", "")

    return {
        "final_notes": notes,
    }
