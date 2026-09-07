from fastapi import APIRouter, Depends, HTTPException, status, Form
from app.dependencies.dependencies import get_current_user
from app.models.auth import User, userRole
from app.config.db import get_db
from sqlalchemy.orm import Session
from app.models.notes import Note
from app.models.teacherInsight import TeacherInsight
from fastapi.responses import StreamingResponse
import json
from app.ai.notes_graph import graph
from dotenv import load_dotenv

load_dotenv()

from app.dependencies.require_teacher_group import require_teacher_group

# -------------------------------
# FastAPI Router for AI Note Generator Agent
# -------------------------------

router = APIRouter()


@router.post("/notes-generates", status_code=status.HTTP_201_CREATED)
async def generate_notes(
    title: str = Form(...),
    current_user: User = Depends(require_teacher_group),
    db: Session = Depends(get_db),
):
    if not title.strip():
        raise HTTPException(status_code=400, detail="Title cannot be empty")

    if len(title) > 200:
        raise HTTPException(
            status_code=400, detail="Title cannot be longer than 200 characters"
        )

    # Find teacher group
    teacher_group = (
        db.query(TeacherInsight)
        .filter(TeacherInsight.user_id == current_user.id)
        .first()
    )

    if not teacher_group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No group found for this teacher. Please create a group first to attach notes.",
        )

    try:
        # Create placeholder note in DB
        new_note = Note(
            title=title,
            content="Generating notes... Please wait.",
            owner_id=current_user.id,
            group_id=teacher_group.id,
        )
        db.add(new_note)
        db.commit()
        db.refresh(new_note)

        async def event_generator():
            generated_content = ""
            inputs = {
                "topic": title,
                "plan": None,
                "research": "",
                "notes": "",
                "evaluation": None,
                "iteration": 0,
                "max_iterations": 2,
                "final_notes": "",
            }
            try:
                async for event in graph.astream_events(inputs, version="v2"):
                    kind = event["event"]
                    tags = event.get("tags", [])

                    # If improver node runs, reset the content stream for the refined version
                    if kind == "on_chain_start" and event.get("name") == "improve_notes":
                        generated_content = ""
                        yield f"data: {json.dumps({'reset': True, 'chunk': '', 'note_id': new_note.id})}\n\n"

                    # Stream LLM tokens tagged with notes_generator
                    if kind == "on_chat_model_stream" and "notes_generator" in tags:
                        chunk = event["data"]["chunk"].content
                        if chunk:
                            generated_content += chunk
                            yield f"data: {json.dumps({'chunk': chunk, 'note_id': new_note.id})}\n\n"

                # Update DB with final content
                new_note.content = generated_content if generated_content else "No notes content generated."
                db.commit()
                yield f"data: {json.dumps({'chunk': '', 'note_id': new_note.id, 'done': True})}\n\n"
            except Exception as e:
                # Update DB with error message
                new_note.content = f"Error generating notes: {str(e)}"
                db.commit()
                yield f"data: {json.dumps({'error': str(e), 'note_id': new_note.id, 'done': True})}\n\n"

        return StreamingResponse(
            event_generator(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            },
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
