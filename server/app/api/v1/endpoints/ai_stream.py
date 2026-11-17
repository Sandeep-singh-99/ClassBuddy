import asyncio
import json
from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy.orm import Session

from app.config.db import get_db
from app.core.rate_limiter import limiter, ai_rate_limit_key
from app.dependencies.dependencies import get_current_user
from app.models.auth import User

router = APIRouter()
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.7, timeout=45, max_retries=0, max_output_tokens=1500)


class StreamPromptRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    prompt: str = Field(min_length=1, max_length=4000)
    system_prompt: str | None = Field(default="You are a helpful AI assistant for ClassBuddy.", max_length=1000)


@router.post("/stream")
@limiter.limit("10/minute", key_func=ai_rate_limit_key)
async def stream_ai_response(
    request: Request, request_data: StreamPromptRequest,
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db),
):
    db.close()
    async def event_generator():
        try:
            messages = []
            if request_data.system_prompt:
                messages.append(SystemMessage(content=request_data.system_prompt))
            messages.append(HumanMessage(content=request_data.prompt))
            async with asyncio.timeout(60):
                async for chunk in llm.astream(messages):
                    if isinstance(chunk.content, str) and chunk.content:
                        yield f"data: {json.dumps({'chunk': chunk.content, 'done': False})}\n\n"
            yield f"data: {json.dumps({'chunk': '', 'done': True})}\n\n"
        except Exception:
            yield f"data: {json.dumps({'error': 'AI service unavailable. Please retry.', 'done': True})}\n\n"
    return StreamingResponse(event_generator(), media_type="text/event-stream", headers={
        "Cache-Control": "no-cache", "X-Accel-Buffering": "no",
    })
