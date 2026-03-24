from fastapi import APIRouter, Depends, HTTPException, status, Form
from app.dependencies.dependencies import get_current_user
from app.models.auth import User, userRole
from app.config.db import get_db
from sqlalchemy.orm import Session
from app.models.notes import Note
from app.models.teacherInsight import TeacherInsight
from app.core.inngest import inngest_client
import inngest
import asyncio
from dotenv import load_dotenv

load_dotenv()


# -------------------------------
# 6. FastAPI Router
# -------------------------------

router = APIRouter()


@router.post("/notes-generates", status_code=status.HTTP_201_CREATED)
async def generate_notes(
    title: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not title.strip():
        raise HTTPException(status_code=400, detail="Title cannot be empty")

    if len(title) > 200:
        raise HTTPException(
            status_code=400, detail="Title cannot be longer than 200 characters"
        )

    if not current_user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    if current_user.role != userRole.TEACHER:
        raise HTTPException(
            status_code=403, detail="Forbidden: Only teachers can generate notes"
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

        # Trigger Inngest Event
        await inngest_client.send(
            inngest.Event(
                name="note/generate",
                data={
                    "note_id": new_note.id,
                    "title": title,
                },
            )
        )

        # Poll the database until Inngest completes the generation
        for _ in range(30):  # Wait up to 60 seconds (30 * 2s)
            await asyncio.sleep(2)
            db.refresh(new_note)
            if new_note.content != "Generating notes... Please wait.":
                break

        return {
            "title": title,
            "generated_notes": new_note.content,
            "note_id": new_note.id,
            "format": "markdown",
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
