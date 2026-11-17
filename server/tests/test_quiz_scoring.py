from unittest.mock import Mock

import pytest
from fastapi import HTTPException, Request

from app.api.v1.endpoints.interviewPerp import submit_quiz
from app.models.InterviewPreparation import InterviewPrep, Status
from app.schemas.interviewpreparation import InterviewPrepSubmit


@pytest.mark.asyncio
@pytest.mark.parametrize("answers, expected", [
    ({}, 0),
    ({"0": "B. Wrong", "1": "B. Wrong"}, 0),
    ({"0": "A. Right"}, 50),
    ({"0": "A. Right", "1": "A. Right"}, 100),
    ({"0": "A. Right forged", "1": "A. fabricated"}, 0),
    ({"9": "A. Right"}, 0),
])
async def test_quiz_score_comes_from_stored_answers(db_session, student_user, answers, expected):
    quiz = InterviewPrep(
        user_id=student_user.id,
        status=Status.COMPLETED,
        questions=[
            {"question": "First question", "options": ["A. Right", "B. Wrong"], "answer": "A. Right"},
            {"question": "Second question", "options": ["A. Right", "B. Wrong"], "answer": "A"},
        ],
    )
    db_session.add(quiz)
    db_session.commit()
    cache = Mock()
    submission = InterviewPrepSubmit.model_validate({
        "id": quiz.id, "score": 100, "user_answers": answers,
    })

    result = await submit_quiz.__wrapped__(
        request=Request({"type": "http"}),
        submission=submission,
        redis_client=cache,
        db=db_session,
        current_user=student_user,
    )

    assert result["score"] == expected
    db_session.expire_all()
    assert db_session.get(InterviewPrep, quiz.id).score == expected
    assert quiz.user_answers == answers
    cache.delete.assert_called_once_with(f"interview_preps:{student_user.id}")


@pytest.mark.asyncio
@pytest.mark.parametrize("status, questions", [
    (Status.GENERATING, []),
    (Status.ERROR, []),
    (Status.COMPLETED, []),
])
async def test_unready_quiz_cannot_be_scored(db_session, student_user, status, questions):
    quiz = InterviewPrep(user_id=student_user.id, status=status, questions=questions)
    db_session.add(quiz)
    db_session.commit()
    cache = Mock()
    with pytest.raises(HTTPException) as error:
        await submit_quiz.__wrapped__(
            request=Request({"type": "http"}),
            submission=InterviewPrepSubmit(id=quiz.id, user_answers={}),
            redis_client=cache,
            db=db_session,
            current_user=student_user,
        )
    assert error.value.status_code == 400
    cache.delete.assert_not_called()
