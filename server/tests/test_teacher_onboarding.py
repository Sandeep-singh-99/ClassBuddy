import pytest
from app.models.auth import User, userRole
from app.models.teacherInsight import TeacherInsight
from app.utils.utils import hash_password
from app.utils.jwt_oauth import create_oauth_access_token
import io


def create_test_user(db, email: str, role: userRole) -> User:
    user = User(
        full_name=f"Test {role.value}",
        email=email,
        hashed_password=hash_password("Password123!"),
        role=role
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_auth_cookies(user: User) -> dict:
    access_token = create_oauth_access_token(
        user_id=str(user.id),
        client_id="classbuddy-web",
        scope="openid profile email"
    )
    return {
        "access_token": access_token
    }




def test_teacher_group_status_no_group(client, db_session):
    teacher = create_test_user(db_session, "teacher_nogroup@example.com", userRole.TEACHER)
    cookies = get_auth_cookies(teacher)

    response = client.get("/api/v1/teacher/group-status", cookies=cookies)
    assert response.status_code == 200
    data = response.json()
    assert data["has_group"] is False
    assert data["group_count"] == 0


def test_student_group_status_forbidden(client, db_session):
    student = create_test_user(db_session, "student@example.com", userRole.STUDENT)
    cookies = get_auth_cookies(student)

    response = client.get("/api/v1/teacher/group-status", cookies=cookies)
    assert response.status_code == 403


def test_protected_teacher_endpoints_require_group(client, db_session):
    teacher = create_test_user(db_session, "teacher_nogroup2@example.com", userRole.TEACHER)
    cookies = get_auth_cookies(teacher)

    # Attempt to create note
    res_note = client.post(
        "/api/v1/notes/",
        json={"title": "Math Note", "content": "Sample content"},
        cookies=cookies
    )
    assert res_note.status_code == 403
    assert res_note.json()["code"] == "TEACHER_GROUP_REQUIRED"
    assert res_note.json()["detail"] == "Teacher must create a group before accessing this feature."

    # Attempt to get teacher notes
    res_get_notes = client.get("/api/v1/notes/", cookies=cookies)
    assert res_get_notes.status_code == 403
    assert res_get_notes.json()["code"] == "TEACHER_GROUP_REQUIRED"

    # Attempt to get teacher assignments
    res_get_assignments = client.get("/api/v1/assignments/t-assignment", cookies=cookies)
    assert res_get_assignments.status_code == 403
    assert res_get_assignments.json()["code"] == "TEACHER_GROUP_REQUIRED"

    # Attempt to view teacher group students
    res_students = client.get("/api/v1/groups/", cookies=cookies)
    assert res_students.status_code == 403
    assert res_students.json()["code"] == "TEACHER_GROUP_REQUIRED"


def test_teacher_group_creation_flow(client, db_session, monkeypatch):
    # Mock cloudinary upload_image
    monkeypatch.setattr(
        "app.api.v1.endpoints.teacherInsight.upload_image",
        lambda file, folder=None: {"url": "http://example.com/fake.png", "public_id": "fake_public_id"}
    )

    teacher = create_test_user(db_session, "teacher_flow@example.com", userRole.TEACHER)
    cookies = get_auth_cookies(teacher)

    # 1. Group status is false
    res_status = client.get("/api/v1/teacher/group-status", cookies=cookies)
    assert res_status.json()["has_group"] is False

    # 2. Create group
    image_bytes = b"fake image content"
    files = {"image": ("test.png", io.BytesIO(image_bytes), "image/png")}
    data = {"group_name": "Physics 101", "group_des": "Introductory Physics"}

    res_create = client.post("/api/v1/insights/", data=data, files=files, cookies=cookies)
    assert res_create.status_code in [200, 201]

    # 3. Group status is now true
    res_status_after = client.get("/api/v1/teacher/group-status", cookies=cookies)
    assert res_status_after.json()["has_group"] is True
    assert res_status_after.json()["group_count"] == 1

    # 4. Attempting duplicate group creation fails
    files2 = {"image": ("test2.png", io.BytesIO(image_bytes), "image/png")}
    data2 = {"group_name": "Physics 102", "group_des": "Advanced Physics"}
    res_duplicate = client.post("/api/v1/insights/", data=data2, files=files2, cookies=cookies)
    assert res_duplicate.status_code == 400

    # 5. Protected endpoints now succeed
    res_note = client.post(
        "/api/v1/notes/",
        json={"title": "Gravity Note", "content": "Newton's laws"},
        cookies=cookies
    )
    assert res_note.status_code == 200

