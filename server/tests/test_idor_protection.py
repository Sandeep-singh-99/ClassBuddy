import pytest
from datetime import datetime, timedelta
from fastapi import HTTPException

from starlette.requests import Request
import app.models as models
from app.services.notes_service import NotesService
from app.api.v1.endpoints.docsupload import get_my_doc
from app.api.v1.endpoints.submission import get_assignment_marks, assignment_stats


@pytest.fixture
def teacher_and_group(db_session, teacher_user):
    """Creates a teacher group with owner=teacher_user."""
    group = models.TeacherInsight(
        id="teacher-group-1",
        user_id=teacher_user.id,
        group_name="Math 101",
        group_des="Mathematics course",
    )
    db_session.add(group)
    db_session.commit()
    return teacher_user, group


@pytest.fixture
def other_teacher(db_session):
    """Creates a second teacher user."""
    user = models.User(
        id="other-teacher-uuid",
        email="other_teacher@classbuddy.test",
        full_name="Other Teacher",
        role=models.userRole.TEACHER,
        hashed_password="mock_password",
    )
    db_session.add(user)
    db_session.commit()
    return user


@pytest.fixture
def other_student(db_session):
    """Creates a second student who is NOT enrolled in any group."""
    user = models.User(
        id="other-student-uuid",
        email="other_student@classbuddy.test",
        full_name="Other Student",
        role=models.userRole.STUDENT,
        hashed_password="mock_password",
    )
    db_session.add(user)
    db_session.commit()
    return user


# =========================================================================
# 1. Notes IDOR Protection Tests
# =========================================================================

def test_note_idor_protection(db_session, teacher_and_group, student_user, other_teacher, other_student):
    teacher, group = teacher_and_group

    # Enroll student_user into group
    group.members.append(student_user)
    db_session.commit()

    # Create note owned by teacher in group
    note = models.Note(
        id="note-secure-1",
        title="Chapter 1 Notes",
        content="Confidential course material",
        owner_id=teacher.id,
        group_id=group.id,
    )
    db_session.add(note)
    db_session.commit()

    # 1. Owner teacher can access
    result = NotesService.get_note_by_id(db=db_session, note_id=note.id, current_user=teacher)
    assert result.id == note.id

    # 2. Enrolled student can access
    result_student = NotesService.get_note_by_id(db=db_session, note_id=note.id, current_user=student_user)
    assert result_student.id == note.id

    # 3. Non-owner teacher cannot access (HTTP 403)
    with pytest.raises(HTTPException) as exc_info:
        NotesService.get_note_by_id(db=db_session, note_id=note.id, current_user=other_teacher)
    assert exc_info.value.status_code == 403
    assert "Not authorized" in exc_info.value.detail

    # 4. Non-enrolled student cannot access (HTTP 403)
    with pytest.raises(HTTPException) as exc_info:
        NotesService.get_note_by_id(db=db_session, note_id=note.id, current_user=other_student)
    assert exc_info.value.status_code == 403
    assert "Not authorized" in exc_info.value.detail


# =========================================================================
# 2. Documents IDOR Protection Tests
# =========================================================================

def test_doc_idor_protection(db_session, teacher_and_group, student_user, other_teacher, other_student):
    teacher, group = teacher_and_group

    # Enroll student_user into group
    group.members.append(student_user)
    db_session.commit()

    doc = models.DocsUpload(
        id="doc-secure-1",
        filename="Exam_Solutions.pdf",
        file_url="https://cloudinary.com/test/exam.pdf",
        owner_id=teacher.id,
        group_id=group.id,
    )
    db_session.add(doc)
    db_session.commit()

    req = Request({"type": "http", "path": "/docs", "headers": [], "client": ("127.0.0.1", 1234)})

    # 1. Owner teacher can access
    result = get_my_doc(request=req, doc_id=doc.id, db=db_session, current_user=teacher)
    assert result.id == doc.id

    # 2. Enrolled student can access
    result_student = get_my_doc(request=req, doc_id=doc.id, db=db_session, current_user=student_user)
    assert result_student.id == doc.id

    # 3. Non-owner teacher cannot access (HTTP 403)
    with pytest.raises(HTTPException) as exc_info:
        get_my_doc(request=req, doc_id=doc.id, db=db_session, current_user=other_teacher)
    assert exc_info.value.status_code == 403
    assert "Not authorized" in exc_info.value.detail

    # 4. Non-enrolled student cannot access (HTTP 403)
    with pytest.raises(HTTPException) as exc_info:
        get_my_doc(request=req, doc_id=doc.id, db=db_session, current_user=other_student)
    assert exc_info.value.status_code == 403
    assert "Not authorized" in exc_info.value.detail


# =========================================================================
# 3. Assignment Marks & Stats IDOR Protection Tests
# =========================================================================

def _run(coro):
    """Synchronously advance an async endpoint that has no awaits."""
    try:
        coro.send(None)
    except StopIteration as e:
        return e.value


def test_assignment_marks_idor_protection(db_session, teacher_and_group, student_user, other_teacher):
    teacher, group = teacher_and_group

    assignment = models.Assignment(
        id="assignment-secure-1",
        title="Midterm Exam",
        description="Math Midterm",
        due_date=datetime.utcnow() + timedelta(days=7),
        owner_id=teacher.id,
        group_id=group.id,
    )
    db_session.add(assignment)
    db_session.flush()

    submission = models.Submission(
        id="submission-secure-1",
        assignment_id=assignment.id,
        student_id=student_user.id,
        answers={},
        grade=95,
        feedback="Excellent",
    )
    db_session.add(submission)
    db_session.commit()

    # 1. Owner teacher can view all submissions & grades
    result = _run(get_assignment_marks(assignment_id=assignment.id, db=db_session, current_user=teacher))
    assert result["assignment_id"] == assignment.id
    assert len(result["students"]) == 1
    assert result["students"][0]["grade"] == 95

    # 2. Other teacher cannot inspect grades (HTTP 403)
    with pytest.raises(HTTPException) as exc_info:
        _run(get_assignment_marks(assignment_id=assignment.id, db=db_session, current_user=other_teacher))
    assert exc_info.value.status_code == 403
    assert "You do not own this assignment" in exc_info.value.detail

    # 3. Non-teacher role gets rejected
    with pytest.raises(HTTPException) as exc_info:
        _run(get_assignment_marks(assignment_id=assignment.id, db=db_session, current_user=student_user))
    assert exc_info.value.status_code == 403

    # 4. Assignment stats endpoint also enforces ownership
    with pytest.raises(HTTPException) as exc_info:
        _run(assignment_stats(assignment_id=assignment.id, db=db_session, current_user=other_teacher))
    assert exc_info.value.status_code == 403
    assert "You do not own this assignment" in exc_info.value.detail




