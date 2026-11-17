import asyncio
import json
from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock, patch

import pytest
from fastapi import WebSocketDisconnect
from sqlalchemy import event
from sqlalchemy.orm import sessionmaker

from app.api.v1.endpoints.groupMessage import websocket_endpoint
from app.models.groupMessage import GroupMessage
from app.models.teacherInsight import TeacherInsight


@pytest.fixture
def chat_database(db_session, teacher_user, student_user):
    group = TeacherInsight(
        user_id=teacher_user.id, group_name="Chat", group_des="Session tests",
        members=[student_user],
    )
    db_session.add(group)
    db_session.commit()
    group_id, student_id, teacher_id = group.id, student_user.id, teacher_user.id
    engine = db_session.get_bind()
    db_session.close()
    checked_out = 0

    def checkout(*args):
        nonlocal checked_out
        checked_out += 1

    def checkin(*args):
        nonlocal checked_out
        checked_out -= 1

    def assert_released(*args, **kwargs):
        assert checked_out == 0

    event.listen(engine, "checkout", checkout)
    event.listen(engine, "checkin", checkin)
    try:
        yield group_id, student_id, teacher_id, sessionmaker(bind=engine), assert_released
        assert_released()
    finally:
        event.remove(engine, "checkout", checkout)
        event.remove(engine, "checkin", checkin)


@pytest.mark.asyncio
@pytest.mark.parametrize("role", ["student", "teacher"])
async def test_message_sessions_close_before_receiving_and_broadcasting(chat_database, role):
    group_id, student_id, teacher_id, sessions, assert_released = chat_database
    user_id = student_id if role == "student" else teacher_id
    messages = iter([json.dumps({"message": "Hello"}), json.dumps({"message": "Again"})])

    async def receive():
        assert_released()
        try:
            return next(messages)
        except StopIteration:
            raise WebSocketDisconnect()

    socket = SimpleNamespace(receive_text=AsyncMock(side_effect=receive))
    manager = SimpleNamespace(
        connect=AsyncMock(side_effect=assert_released),
        broadcast=AsyncMock(side_effect=assert_released), disconnect=Mock(),
    )
    with (
        patch("app.api.v1.endpoints.groupMessage.SessionLocal", sessions),
        patch("app.api.v1.endpoints.groupMessage.decode_oauth_access_token", return_value={"sub": user_id}),
        patch("app.api.v1.endpoints.groupMessage.manager", manager),
    ):
        await websocket_endpoint(socket, group_id, token="test-token")

    assert manager.broadcast.await_count == 2
    assert manager.broadcast.call_args_list[0].args[0]["sender"]["id"] == user_id
    manager.disconnect.assert_called_once_with(socket, group_id)
    with sessions() as db:
        assert db.query(GroupMessage).count() == 2


@pytest.mark.asyncio
async def test_sixteen_idle_sockets_hold_no_database_connections(chat_database):
    group_id, student_id, _, sessions, assert_released = chat_database
    ready, release = asyncio.Event(), asyncio.Event()
    idle_count = 0

    async def receive():
        nonlocal idle_count
        assert_released()
        idle_count += 1
        if idle_count == 16:
            ready.set()
        await release.wait()
        raise WebSocketDisconnect()

    manager = SimpleNamespace(connect=AsyncMock(side_effect=assert_released), disconnect=Mock())
    with (
        patch("app.api.v1.endpoints.groupMessage.SessionLocal", sessions),
        patch("app.api.v1.endpoints.groupMessage.decode_oauth_access_token", return_value={"sub": student_id}),
        patch("app.api.v1.endpoints.groupMessage.manager", manager),
    ):
        tasks = [asyncio.create_task(websocket_endpoint(
            SimpleNamespace(receive_text=AsyncMock(side_effect=receive)), group_id, token="test-token",
        )) for _ in range(16)]
        try:
            await asyncio.wait_for(ready.wait(), timeout=5)
            assert_released()
        finally:
            release.set()
            await asyncio.gather(*tasks)


@pytest.mark.asyncio
@pytest.mark.parametrize("subject", [None, "unknown-user", "nonmember"])
async def test_unauthorized_socket_closes_without_holding_connection(chat_database, subject):
    group_id, student_id, _, sessions, assert_released = chat_database
    # The existing student is not a member of this other group.
    target = "other-group" if subject == "nonmember" else group_id
    subject = student_id if subject == "nonmember" else subject
    socket = SimpleNamespace(close=AsyncMock(side_effect=assert_released))
    manager = SimpleNamespace(connect=AsyncMock())
    with (
        patch("app.api.v1.endpoints.groupMessage.SessionLocal", sessions),
        patch("app.api.v1.endpoints.groupMessage.decode_oauth_access_token", return_value={"sub": subject}),
        patch("app.api.v1.endpoints.groupMessage.manager", manager),
    ):
        await websocket_endpoint(socket, target, token="test-token")
    socket.close.assert_awaited_once_with(code=1008)
    manager.connect.assert_not_called()
