import asyncio
from datetime import datetime, timedelta
from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock, patch

import pytest
from fastapi import HTTPException, Request
from sqlalchemy.orm import Session

from app.api.v1.endpoints import ai_evaluator
from app.models import Assignment, AssignmentQuestion, Submission, TeacherInsight, User
from app.schemas.ai_evaluation import AssignmentAnswers


@pytest.fixture
def assignment(db_session, teacher_user, student_user):
    group = TeacherInsight(user_id=teacher_user.id, group_name="AI tests", group_des="Test", members=[student_user])
    db_session.add(group)
    db_session.flush()
    assignment = Assignment(title="Databases", description="Transactions", group_id=group.id, owner_id=teacher_user.id, due_date=datetime.utcnow() + timedelta(days=1))
    assignment.questions = [AssignmentQuestion(question_text=[
        {"id": 1, "type": "theory", "question": "What is atomicity?"},
        {"id": 2, "type": "coding", "question": "Show a transaction."},
    ])]
    db_session.add(assignment)
    db_session.commit()
    return assignment


def grader(result=None, error=None):
    model = Mock()
    model.with_structured_output.return_value.ainvoke = AsyncMock(return_value=result, side_effect=error)
    return model


VALID = {"grades": [{"id": 1, "marks": 4}, {"id": 2, "marks": 3}], "final_feedback": "Good work."}


async def submit(db, user, assignment_id, answers=None):
    return await ai_evaluator.evaluate_answers.__wrapped__(
        request=Request({"type": "http"}), assignment_id=assignment_id,
        answers=AssignmentAnswers(answers or {"1": "Atomicity", "2": "BEGIN; COMMIT;"}), db=db, current_user=user,
    )


@pytest.mark.asyncio
async def test_grading_requires_membership_before_ai(db_session, assignment, teacher_user):
    outsider = User(email="outsider@example.com", full_name="Outsider", role="student")
    db_session.add(outsider)
    db_session.commit()
    model = grader(VALID)
    with patch.object(ai_evaluator, "llm", model), pytest.raises(HTTPException) as error:
        await submit(db_session, outsider, assignment.id)
    assert error.value.status_code == 403
    model.with_structured_output.assert_not_called()
    assert db_session.query(Submission).count() == 0


@pytest.mark.asyncio
async def test_valid_grades_are_summed_and_zero_is_a_valid_grade(db_session, assignment, student_user):
    assignment_id = assignment.id
    model = grader({"grades": [{"id": 1, "marks": 0}, {"id": 2, "marks": 0}], "final_feedback": "Answers need work."})
    with patch.object(ai_evaluator, "llm", model):
        result = await submit(db_session, student_user, assignment_id)
    stored = db_session.query(Submission).one()
    assert result["total_marks"] == stored.grade == 0
    assert stored.status == "completed"
    messages = model.with_structured_output.return_value.ainvoke.call_args.args[0]
    assert messages[0].type == "system" and messages[1].type == "human"


@pytest.mark.asyncio
@pytest.mark.parametrize("result", [
    {}, {**VALID, "total_marks": 999},
    {**VALID, "grades": [{"id": 1, "marks": 999}, {"id": 2, "marks": 3}]},
    {**VALID, "grades": [{"id": 1, "marks": -1}, {"id": 2, "marks": 3}]},
    {**VALID, "grades": [{"id": 1, "marks": True}, {"id": 2, "marks": 3}]},
    {**VALID, "grades": [{"id": 1, "marks": 4}, {"id": 1, "marks": 3}]},
    {**VALID, "grades": [{"id": 1, "marks": 4}]},
])
async def test_invalid_model_grades_do_not_save_submission(db_session, assignment, student_user, result):
    model = grader(result)
    with patch.object(ai_evaluator, "llm", model), pytest.raises(HTTPException) as error:
        await submit(db_session, student_user, assignment.id)
    assert error.value.status_code == 503
    assert db_session.query(Submission).count() == 0


@pytest.mark.asyncio
async def test_provider_failure_allows_retry_and_releases_connection(db_session, assignment, student_user):
    assignment_id = assignment.id
    user_id = student_user.id
    model = grader(error=RuntimeError("private provider error"))
    with patch.object(ai_evaluator, "llm", model), pytest.raises(HTTPException) as error:
        await submit(db_session, student_user, assignment_id)
    assert error.value.status_code == 503
    assert "private" not in error.value.detail
    assert db_session.query(Submission).count() == 0
    async def evaluate(messages):
        assert not db_session.in_transaction()
        return VALID
    model = grader()
    model.with_structured_output.return_value.ainvoke.side_effect = evaluate
    with patch.object(ai_evaluator, "llm", model):
        result = await submit(db_session, db_session.get(User, user_id), assignment_id)
    assert result["total_marks"] == 7
    assert db_session.query(Submission).count() == 1


@pytest.mark.asyncio
async def test_simultaneous_submission_only_calls_ai_once(db_session, assignment, student_user):
    assignment_id, user_id, bind = assignment.id, student_user.id, db_session.get_bind()
    started, release = asyncio.Event(), asyncio.Event()
    async def evaluate(messages):
        started.set()
        await release.wait()
        return VALID
    model = grader()
    model.with_structured_output.return_value.ainvoke.side_effect = evaluate
    with patch.object(ai_evaluator, "llm", model):
        task = asyncio.create_task(submit(db_session, student_user, assignment_id))
        try:
            await asyncio.wait_for(started.wait(), timeout=5)
            with Session(bind=bind) as second:
                with pytest.raises(HTTPException) as error:
                    await submit(second, second.get(User, user_id), assignment_id)
            assert error.value.status_code == 409
        finally:
            release.set()
            await task
    model.with_structured_output.return_value.ainvoke.assert_awaited_once()
    assert db_session.query(Submission).count() == 1


@pytest.mark.asyncio
async def test_stale_reservation_can_be_retried(db_session, assignment, student_user):
    db_session.add(Submission(assignment_id=assignment.id, student_id=student_user.id, status="evaluating", submitted_at=datetime.utcnow() - timedelta(minutes=6)))
    db_session.commit()
    with patch.object(ai_evaluator, "llm", grader(VALID)):
        await submit(db_session, student_user, assignment.id)
    assert db_session.query(Submission).one().status == "completed"
