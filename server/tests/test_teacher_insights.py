from datetime import datetime, timedelta

from sqlalchemy import event

from app.api.v1.endpoints.teacherInsight import get_teacher_insights
from app.models.auth import User, userRole
from app.models.teacherInsight import TeacherInsight


def test_discovery_counts_students_without_loading_rosters(db_session, student_user):
    for index in range(50):
        owner = User(
            id=f"owner-{index}",
            full_name=f"Teacher {index}",
            email=f"teacher-{index}@example.com",
            role=userRole.TEACHER,
        )
        db_session.add(TeacherInsight(
            id=f"group-{index}",
            owner=owner,
            group_name=f"Group {index}",
            group_des="Discovery test",
            created_at=datetime(2026, 1, 1) + timedelta(days=index),
            members=[student_user, owner] if index else [],
        ))
    db_session.commit()
    db_session.expunge_all()

    statements = []

    def record_query(connection, cursor, statement, parameters, context, executemany):
        statements.append(statement)

    engine = db_session.get_bind()
    event.listen(engine, "before_cursor_execute", record_query)
    try:
        result = get_teacher_insights(db=db_session, current_user=student_user)
        payload = [group.model_dump(mode="json") for group in result]
    finally:
        event.remove(engine, "before_cursor_execute", record_query)

    assert len(statements) == 1
    assert len(payload) == 50
    assert payload[0]["id"] == "group-49"
    assert payload[0]["owner"]["id"] == "owner-49"
    assert all(group["students_count"] == 1 for group in payload[:-1])
    assert payload[-1]["students_count"] == 0
    assert all(group["members"] == [] for group in payload)
    assert "student@classbuddy.test" not in str(payload)


def test_discovery_without_groups(db_session, student_user):
    assert get_teacher_insights(db=db_session, current_user=student_user) == []
