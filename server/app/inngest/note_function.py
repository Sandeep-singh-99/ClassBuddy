import inngest
from app.core import inngest as core_inngest
from app.config.db import SessionLocal
from app.models.notes import Note
from app.ai.notes_graph import graph
from langchain_core.messages import HumanMessage
from datetime import datetime

@core_inngest.inngest_client.create_function(
    fn_id="generate-notes-background",
    trigger=inngest.TriggerEvent(event="note/generate"),
)
async def generate_notes_background(ctx: inngest.Context):

    note_id = ctx.event.data["note_id"]
    title = ctx.event.data["title"]

    # AI Generation Step
    async def run_ai_generation():
        inputs = {
            "title": [HumanMessage(content=title)],
            "research": [],
            "notes": [],
        }
        final_state = await graph.ainvoke(inputs)
        generated_content = final_state["notes"][-1].content
        return generated_content

    generated_notes = await ctx.step.run("ai-generate-notes", run_ai_generation)

    # DB Update Step
    def update_db():
        with SessionLocal() as session:
            note = session.query(Note).filter(Note.id == note_id).first()
            if note:
                note.content = generated_notes
                note.updated_at = datetime.utcnow()
                session.commit()
                return True
            return False

    success = await ctx.step.run("db-update-notes", update_db)

    if not success:
        raise Exception("Note not found in the database. Could not save generation results.")

    return {
        "status": "success",
        "note_id": note_id,
        "title": title,
        "generated_notes": generated_notes
    }
