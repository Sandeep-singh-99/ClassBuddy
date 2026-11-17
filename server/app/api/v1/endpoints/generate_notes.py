import asyncio
import json
import anyio
from fastapi import APIRouter, Depends, Form, HTTPException, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.ai.notes_graph import graph
from app.config.db import get_db
from app.core.rate_limiter import limiter, ai_rate_limit_key
from app.dependencies.require_teacher_group import require_teacher_group
from app.models.auth import User
from app.models.notes import Note
from app.models.teacherInsight import TeacherInsight

router = APIRouter()


@router.post("/notes-generates", status_code=201)
@limiter.limit("5/minute", key_func=ai_rate_limit_key)
async def generate_notes(
    request: Request, title: str = Form(..., min_length=1, max_length=200),
    current_user: User = Depends(require_teacher_group), db: Session = Depends(get_db),
):
    title = title.strip()
    if not title or len(title) > 200:
        raise HTTPException(400, "Title must contain 1 to 200 characters.")
    group = db.query(TeacherInsight).filter_by(user_id=current_user.id).first()
    if not group:
        raise HTTPException(404, "Create a classroom before generating notes.")
    note = Note(title=title, content="Generating notes... Please wait.", owner_id=current_user.id, group_id=group.id)
    db.add(note)
    db.flush()
    note_id = note.id
    db.commit()
    bind = db.get_bind()
    db.close()

    def save_content(content: str):
        with Session(bind=bind) as session:
            session.query(Note).filter_by(id=note_id).update({"content": content})
            session.commit()

    async def event_generator():
        content = ""
        final_notes = ""
        try:
            async with asyncio.timeout(120):
                async for event in graph.astream_events({
                    "topic": title, "iteration": 0, "max_iterations": 2,
                }, version="v2"):
                    kind = event["event"]
                    if kind == "on_chain_start" and event.get("name") == "improve_notes":
                        content = ""
                        yield f"data: {json.dumps({'reset': True, 'chunk': '', 'note_id': note_id})}\n\n"
                    if kind == "on_chat_model_stream" and "notes_generator" in event.get("tags", []):
                        chunk = event["data"]["chunk"].content
                        if isinstance(chunk, str) and chunk:
                            content += chunk
                            yield f"data: {json.dumps({'chunk': chunk, 'note_id': note_id})}\n\n"
                    if kind == "on_chain_end":
                        output = event.get("data", {}).get("output")
                        if isinstance(output, dict) and output.get("final_notes"):
                            final_notes = output["final_notes"]
            if not final_notes:
                raise ValueError("No approved notes were generated")
            await asyncio.to_thread(save_content, final_notes)
            yield f"data: {json.dumps({'chunk': '', 'note_id': note_id, 'done': True})}\n\n"
        except asyncio.CancelledError:
            with anyio.CancelScope(shield=True):
                await asyncio.to_thread(save_content, "Generation interrupted. Please generate the notes again.")
            raise
        except Exception:
            await asyncio.to_thread(save_content, "Generation failed. Please generate the notes again.")
            yield f"data: {json.dumps({'error': 'Notes generation failed. Please retry.', 'note_id': note_id, 'done': True})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream", headers={
        "Cache-Control": "no-cache", "X-Accel-Buffering": "no",
    })
