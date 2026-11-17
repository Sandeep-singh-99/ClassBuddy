import importlib
import json
from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock, patch

import pytest
from fastapi import FastAPI, HTTPException, Request
from fastapi.testclient import TestClient
from langchain_core.messages import AIMessage, AIMessageChunk
from pydantic import ValidationError
from slowapi.errors import RateLimitExceeded

from app.api.v1.endpoints import ai_stream, studentInsight
from app.core.rate_limiter import ai_rate_limit_key, limiter, rate_limit_exceeded_handler
from app.models import StudentInsight
from app.schemas.ai_evaluation import AssignmentAnswers
from app.schemas.interviewpreparation import QuizPayload
from app.schemas.studentInsight import StudentInsightBase


REPORT = {
    "salary_range": [{"role": "Engineer", "min": 10, "median": 20, "max": 30, "location": "Remote"}],
    "growth_rate": -2.0, "demand_level": "Medium", "top_skills": ["Python"],
    "market_outlook": "Mixed", "key_trends": ["AI"], "recommend_skills": ["SQL"],
}


@pytest.mark.asyncio
async def test_report_cannot_modify_owner(db_session, student_user):
    existing = StudentInsight(user_id=student_user.id, industry="Software", **REPORT)
    db_session.add(existing)
    db_session.commit()
    original_id, owner = existing.id, student_user.id
    graph = SimpleNamespace(ainvoke=AsyncMock(return_value={"getIndustry": [AIMessage(content=json.dumps({**REPORT, "user_id": "other-user"}))]}))
    with patch.object(studentInsight, "industry_graph", graph), pytest.raises(HTTPException) as error:
        await studentInsight.generate_industry_insight.__wrapped__(Request({"type": "http"}), "Software", student_user, db_session, Mock())
    assert error.value.status_code == 503
    assert db_session.get(StudentInsight, original_id).user_id == owner


@pytest.mark.asyncio
async def test_notes_validation_fails_closed_and_checks_score():
    evaluator = importlib.import_module("app.ai.notes_agent.evaluator")
    saver = importlib.import_module("app.ai.notes_agent.saver")
    for content in ["not JSON", '{"score":101,"feedback":"Wrong"}', '{"score":20,"is_good":true,"feedback":"Poor"}']:
        with patch.object(evaluator, "llm", SimpleNamespace(ainvoke=AsyncMock(return_value=AIMessage(content=content)))):
            state = await evaluator.evaluate_notes_node({"topic": "Python", "notes": "Draft"})
        assert not state["evaluation"]["is_good"]
        with pytest.raises(ValueError):
            await saver.save_notes_node({"notes": "Draft", **state})


@pytest.mark.asyncio
async def test_invalid_industry_finalizer_refuses_to_publish():
    from app.ai.industry_agent.finalizer import finalizer_node
    with pytest.raises(ValueError):
        await finalizer_node({"insight_data": {}, "evaluation": {"is_valid": False}, "iteration": 2})
    with pytest.raises(ValidationError):
        StudentInsightBase.model_validate({**REPORT, "top_skills": "Python"})


@pytest.mark.asyncio
async def test_interview_repair_uses_configured_fallback():
    from app.ai.interview_agent import improver
    model = SimpleNamespace(ainvoke=AsyncMock(return_value=AIMessage(content='{"questions":[]}')))
    with patch.object(improver, "get_fallback_llm", return_value=model):
        result = await improver.improver_node({"iteration": 1})
    assert result["iteration"] == 2
    model.ainvoke.assert_awaited_once()


def test_invalid_quiz_answer_and_large_inputs_are_rejected():
    question = {"question": "Choose A", "options": ["A. Yes", "B. No"], "answer": "Z", "explanation": "Test"}
    with pytest.raises(ValidationError):
        QuizPayload(questions=[question] * 5)
    with pytest.raises(ValidationError):
        ai_stream.StreamPromptRequest(prompt="x" * 4001)
    with pytest.raises(ValidationError):
        AssignmentAnswers({"1": "x" * 5001})


def test_ai_rate_limits_are_per_user():
    app = FastAPI()
    app.include_router(ai_stream.router)
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)
    def user(request: Request):
        request.state.user_id = request.headers.get("x-test-user", "one")
        return SimpleNamespace(id=request.state.user_id)
    app.dependency_overrides[ai_stream.get_current_user] = user
    app.dependency_overrides[ai_stream.get_db] = lambda: Mock()
    async def stream(messages):
        yield AIMessageChunk(content="Hello")
    limiter.reset()
    try:
        with patch.object(ai_stream, "llm", SimpleNamespace(astream=stream)), TestClient(app) as client:
            for _ in range(10):
                assert client.post("/stream", json={"prompt": "Hello"}).status_code == 200
            assert client.post("/stream", json={"prompt": "Hello"}).status_code == 429
            assert client.post("/stream", json={"prompt": "Hello"}, headers={"x-test-user": "two"}).status_code == 200
    finally:
        limiter.reset()
