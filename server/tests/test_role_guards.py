import pytest
from datetime import datetime, timedelta
from fastapi import HTTPException

import app.models as models
from app.dependencies.require_teacher_group import require_teacher_group, TeacherGroupRequiredException
from app.dependencies.require_active_subscription import check_active_subscription


def test_require_teacher_group_rejects_student(db_session, student_user):
    """Students attempting to access teacher group resources must get HTTP 403."""
    with pytest.raises(HTTPException) as exc_info:
        require_teacher_group(db=db_session, current_user=student_user)

    assert exc_info.value.status_code == 403
    assert "Only teachers can access this feature" in exc_info.value.detail


def test_require_teacher_group_rejects_teacher_without_group(db_session, teacher_user):
    """Teacher without any created group must raise TeacherGroupRequiredException (HTTP 403)."""
    with pytest.raises(TeacherGroupRequiredException) as exc_info:
        require_teacher_group(db=db_session, current_user=teacher_user)

    assert exc_info.value.status_code == 403
    assert "Teacher must create a group" in exc_info.value.detail


def test_require_teacher_group_allows_teacher_with_group(db_session, teacher_user):
    """Teacher with an existing group passes the guard and returns user."""
    group = models.TeacherInsight(
        id="teacher-group-uuid",
        user_id=teacher_user.id,
        group_name="Physics Class",
        group_des="Physics Class Description",
    )
    db_session.add(group)
    db_session.commit()

    result = require_teacher_group(db=db_session, current_user=teacher_user)
    assert result.id == teacher_user.id
    assert result.role == models.userRole.TEACHER


def test_check_active_subscription_unauthenticated(db_session):
    """Unauthenticated access raises HTTP 401."""
    with pytest.raises(HTTPException) as exc_info:
        check_active_subscription(db=db_session, current_user=None)

    assert exc_info.value.status_code == 401
    assert "not logged in" in exc_info.value.detail


def test_check_active_subscription_rejects_teacher(db_session, teacher_user):
    """Teachers are not students, must raise HTTP 401."""
    with pytest.raises(HTTPException) as exc_info:
        check_active_subscription(db=db_session, current_user=teacher_user)

    assert exc_info.value.status_code == 401
    assert "not a student" in exc_info.value.detail


def test_check_active_subscription_no_subscription(db_session, student_user):
    """Student with no subscription in DB must raise HTTP 403."""
    with pytest.raises(HTTPException) as exc_info:
        check_active_subscription(db=db_session, current_user=student_user)

    assert exc_info.value.status_code == 403
    assert "need an active subscription" in exc_info.value.detail


def test_check_active_subscription_inactive_or_expired(db_session, student_user, teacher_user):
    """Student with inactive or expired subscription must raise HTTP 403."""
    group = models.TeacherInsight(
        id="group-sub-check-id",
        user_id=teacher_user.id,
        group_name="Biology Group",
        group_des="Biology Group Description",
    )
    db_session.add(group)
    db_session.flush()

    # 1. Inactive subscription
    inactive_sub = models.StudentSubscription(
        user_id=student_user.id,
        group_id=group.id,
        plan_id="plan-1",
        amount=100,
        is_active=False,
        valid_till=datetime.utcnow() + timedelta(days=10),
    )
    db_session.add(inactive_sub)
    db_session.commit()

    with pytest.raises(HTTPException) as exc_info:
        check_active_subscription(db=db_session, current_user=student_user)
    assert exc_info.value.status_code == 403

    # 2. Expired subscription
    inactive_sub.is_active = True
    inactive_sub.valid_till = datetime.utcnow() - timedelta(days=2)
    db_session.commit()

    with pytest.raises(HTTPException) as exc_info:
        check_active_subscription(db=db_session, current_user=student_user)
    assert exc_info.value.status_code == 403


def test_check_active_subscription_success(db_session, student_user, teacher_user):
    """Student with an active, unexpired subscription passes and returns subscription."""
    group = models.TeacherInsight(
        id="group-sub-valid-id",
        user_id=teacher_user.id,
        group_name="Chemistry Group",
        group_des="Chemistry Group Description",
    )
    db_session.add(group)
    db_session.flush()

    active_sub = models.StudentSubscription(
        user_id=student_user.id,
        group_id=group.id,
        plan_id="plan-2",
        amount=250,
        is_active=True,
        valid_till=datetime.utcnow() + timedelta(days=15),
    )
    db_session.add(active_sub)
    db_session.commit()

    result = check_active_subscription(db=db_session, current_user=student_user)
    assert result.id == active_sub.id
    assert result.is_active is True
    assert result.user_id == student_user.id
