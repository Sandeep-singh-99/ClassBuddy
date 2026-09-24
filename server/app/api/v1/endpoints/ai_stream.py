from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.responses import StreamingResponse
from app.dependencies.dependencies import get_current_user
from app.models.auth import User
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
from pydantic import BaseModel
from typing import Optional
import json
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.7)


class StreamPromptRequest(BaseModel):
    prompt: str
    system_prompt: Optional[str] = "You are a helpful AI assistant for ClassBuddy."


@router.post("/stream")
async def stream_ai_response(
    request_data: StreamPromptRequest = Body(...),
    current_user: User = Depends(get_current_user),
):
    if not request_data.prompt.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Prompt cannot be empty"
        )

    async def event_generator():
        try:
            messages = []
            if request_data.system_prompt:
                messages.append(SystemMessage(content=request_data.system_prompt))
            messages.append(HumanMessage(content=request_data.prompt))

            async for chunk in llm.astream(messages):
                if chunk.content:
                    yield f"data: {json.dumps({'chunk': chunk.content, 'done': False})}\n\n"

            yield f"data: {json.dumps({'chunk': '', 'done': True})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e), 'done': True})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
