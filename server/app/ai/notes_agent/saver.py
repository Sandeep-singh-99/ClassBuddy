from app.ai.notes_agent.state import NotesState


async def save_notes_node(state: NotesState) -> dict:
    """
    Save Notes Node: Finalizes the approved study notes in the state.
    """
    notes = state.get("notes", "")
    if not notes.strip() or not (state.get("evaluation") or {}).get("is_good", False):
        raise ValueError("Notes failed quality validation after repair attempts")

    return {
        "final_notes": notes,
    }
