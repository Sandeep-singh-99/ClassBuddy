import asyncio
import inspect
import json
import threading
from datetime import datetime, timedelta
from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock, patch

import pytest
from fastapi import HTTPException, Request
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.api.v1.endpoints import generate_assignment, generate_notes, interviewPerp
from app.config.db import Base
from app.inngest import assignment_function, interview_prep_function
from app.inngest import student_insight_function
from langchain_core.messages import AIMessage
from app.models import Assignment, InterviewPrep, Note, TeacherInsight, User, userRole
from app.models.InterviewPreparation import Status
from app.schemas.interviewpreparation import InterviewPrepSubmit, InterviewResponse, QuizSubmissionResult


@pytest.fixture
def worker_db():
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(engine)
    sessions = sessionmaker(bind=engine)
    with sessions() as db:
        teacher = User(id="teacher", email="teacher@example.com", full_name="Teacher", role=userRole.TEACHER)
        student = User(id="student", email="student@example.com", full_name="Student", role=userRole.STUDENT)
        group = TeacherInsight(id="classroom", owner=teacher, group_name="Class", group_des="Tests", members=[student])
        db.add_all([group, Assignment(id="assignment", owner_id="teacher", group_id="classroom", title="Test", description="Databases", due_date=datetime.utcnow() + timedelta(days=1))])
        db.commit()
    yield sessions
    engine.dispose()


@pytest.mark.asyncio
async def test_assignment_dispatch_failure_releases_claim(worker_db):
    with worker_db() as db, patch.object(generate_assignment.inngest_client, "send", new_callable=AsyncMock, side_effect=RuntimeError("offline")):
        with pytest.raises(HTTPException) as error:
            await generate_assignment.generate_question.__wrapped__(Request({"type": "http"}), "assignment", db, db.get(User, "teacher"))
    assert error.value.status_code == 503
    with worker_db() as db:
        assert db.get(Assignment, "assignment").is_generating is False


@pytest.mark.asyncio
async def test_parallel_assignment_requests_dispatch_once(worker_db):
    started, release = asyncio.Event(), asyncio.Event()
    async def send(event):
        started.set()
        await release.wait()
    with patch.object(generate_assignment.inngest_client, "send", new_callable=AsyncMock, side_effect=send) as dispatch:
        with worker_db() as db:
            task = asyncio.create_task(generate_assignment.generate_question.__wrapped__(Request({"type": "http"}), "assignment", db, db.get(User, "teacher")))
            try:
                await asyncio.wait_for(started.wait(), 5)
                with worker_db() as second:
                    with pytest.raises(HTTPException) as error:
                        await generate_assignment.generate_question.__wrapped__(Request({"type": "http"}), "assignment", second, second.get(User, "teacher"))
                assert error.value.status_code == 409
            finally:
                release.set()
                await task
        dispatch.assert_awaited_once()


@pytest.mark.asyncio
async def test_exhausted_assignment_and_interview_jobs_recover(worker_db):
    with worker_db() as db:
        db.get(Assignment, "assignment").is_generating = True
        db.add(InterviewPrep(id="quiz", name="Test", description="Test", user_id="student", status=Status.GENERATING, questions=[]))
        db.commit()
    async def run(step_id, callback):
        return await callback()
    ctx = SimpleNamespace(event=SimpleNamespace(data={"assignment_id": "assignment", "description": "Test"}), step=SimpleNamespace(run=run))
    with patch.object(assignment_function.graph, "ainvoke", new_callable=AsyncMock, side_effect=RuntimeError("provider failure")):
        with pytest.raises(RuntimeError):
            await assignment_function.generate_assignment_questions._handler(ctx)
    with worker_db() as db:
        assert db.get(Assignment, "assignment").is_generating is True
    with patch.object(assignment_function, "SessionLocal", worker_db):
        await assignment_function.assignment_generation_failed(SimpleNamespace(event=SimpleNamespace(data={"event": {"data": {"assignment_id": "assignment"}}})))
    with patch.object(interview_prep_function, "SessionLocal", worker_db):
        await interview_prep_function.interview_generation_failed(SimpleNamespace(event=SimpleNamespace(data={"event": {"data": {"interview_prep_id": "quiz"}}})))
    with worker_db() as db:
        assert db.get(Assignment, "assignment").is_generating is False
        assert db.get(InterviewPrep, "quiz").status == Status.ERROR
    assert assignment_function.generate_assignment_questions.on_failure_fn_id
    assert interview_prep_function.generate_interview_questions.on_failure_fn_id


@pytest.mark.asyncio
@pytest.mark.parametrize("outcome", ["success", "failure", "cancel"])
async def test_notes_stream_releases_session_and_saves_outcome(worker_db, outcome):
    async def events(*args, **kwargs):
        with worker_db() as check:
            assert check.query(Note).count() == 1
        if outcome == "failure":
            raise RuntimeError("private provider error")
        if outcome == "cancel":
            raise asyncio.CancelledError()
        yield {"event": "on_chain_end", "data": {"output": {"final_notes": "Approved notes"}}}
    with worker_db() as db:
        with patch.object(generate_notes.graph, "astream_events", side_effect=events):
            response = await generate_notes.generate_notes.__wrapped__(Request({"type": "http"}), "Transactions", db.get(User, "teacher"), db)
            assert not db.in_transaction()
            if outcome == "cancel":
                with pytest.raises(asyncio.CancelledError):
                    async for _ in response.body_iterator:
                        pass
            else:
                output = [chunk async for chunk in response.body_iterator]
                assert "private" not in "".join(output)
    with worker_db() as db:
        content = db.query(Note).one().content
        assert content == "Approved notes" if outcome == "success" else ("interrupted" if outcome == "cancel" else "failed") in content


@pytest.mark.asyncio
async def test_quiz_answers_are_available_only_after_submission(worker_db):
    questions = [{"question": "Choose A", "options": ["A. Yes", "B. No"], "answer": "A", "explanation": "A is right."}]
    with worker_db() as db:
        quiz = InterviewPrep(id="quiz", name="Test", description="Test", user_id="student", status=Status.COMPLETED, questions=questions)
        db.add(quiz)
        db.commit()
        user = db.get(User, "student")
        public = await interviewPerp.get_interview_question.__wrapped__("quiz", Request({"type": "http"}), db, user)
        assert set(public["questions"][0]) == {"question", "options"}
        listing = InterviewResponse.model_validate(quiz).model_dump()
        assert "answer" not in listing["questions"][0]
        with pytest.raises(HTTPException) as error:
            interviewPerp.get_quiz_result("quiz", db, user)
        assert error.value.status_code == 409
        result = await interviewPerp.submit_quiz.__wrapped__(Request({"type": "http"}), InterviewPrepSubmit(id="quiz", user_answers={"0": "A. Yes"}), Mock(), db, user)
        reviewed = QuizSubmissionResult.model_validate(result)
        assert reviewed.score == 100
        assert reviewed.questions[0].answer == "A"
        assert interviewPerp.get_quiz_result("quiz", db, user).score == 100
        assert db.get(InterviewPrep, "quiz").submitted_at is not None
        with pytest.raises(HTTPException) as error:
            await interviewPerp.submit_quiz.__wrapped__(Request({"type": "http"}), InterviewPrepSubmit(id="quiz", user_answers={}), Mock(), db, user)
        assert error.value.status_code == 409


@pytest.mark.asyncio
async def test_worker_persistence_and_cache_steps_run_off_event_loop(worker_db):
    main_thread = threading.get_ident()
    def sessions():
        assert threading.get_ident() != main_thread
        return worker_db()
    async def run(step_id, callback):
        assert inspect.iscoroutinefunction(callback)
        return await callback()
    step = SimpleNamespace(run=run)
    question_data = [{"id": 1, "type": "theory", "question": "What is atomicity?"}]
    with patch.object(assignment_function, "SessionLocal", sessions), patch.object(assignment_function.graph, "ainvoke", new_callable=AsyncMock, return_value={"question": [AIMessage(content=json.dumps(question_data))]}):
        result = await assignment_function.generate_assignment_questions._handler(SimpleNamespace(event=SimpleNamespace(data={"assignment_id": "assignment", "description": "Test"}), step=step))
    assert result["questions_generated"] == 1
    with worker_db() as db:
        db.add(InterviewPrep(id="quiz", name="Test", description="Test", user_id="student", status=Status.GENERATING, questions=[]))
        db.commit()
    questions = [{"question": f"Question {i}", "options": ["A. Yes", "B. No"], "answer": "A", "explanation": "Explanation"} for i in range(5)]
    with patch.object(interview_prep_function, "SessionLocal", sessions), patch.object(interview_prep_function.graph, "ainvoke", new_callable=AsyncMock, return_value={"quiz": [AIMessage(content=json.dumps({"questions": questions}))]}):
        result = await interview_prep_function.generate_interview_questions._handler(SimpleNamespace(event=SimpleNamespace(data={"interview_prep_id": "quiz", "description": "Test"}), step=step))
    assert result["questions_generated"] == 5
    from test_ai_contracts import REPORT
    def clear(key):
        assert threading.get_ident() != main_thread
    cache = SimpleNamespace(delete=clear)
    with patch.object(student_insight_function.db, "SessionLocal", sessions), patch.object(student_insight_function.industry_graph.industry_graph, "ainvoke", new_callable=AsyncMock, return_value={"getIndustry": [AIMessage(content=json.dumps(REPORT))]}), patch.object(student_insight_function.redis_client, "get_redis_client", return_value=cache):
        result = await student_insight_function.generate_student_insight._handler(SimpleNamespace(event=SimpleNamespace(name="student/industry.generate", data={"user_id": "student", "industry": "Software"}), step=step))
    assert result["count"] == 1
