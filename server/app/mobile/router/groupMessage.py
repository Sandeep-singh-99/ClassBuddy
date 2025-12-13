from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    WebSocket,
    WebSocketDisconnect,
    Query,
)
from sqlalchemy.orm import Session, joinedload
from app.config.db import get_db
from app.models.auth import User, userRole
from app.models.groupMessage import GroupMessage
from app.models.teacherInsight import TeacherInsight
from app.schemas.groupMessage import (
    GroupMessageListResponse,
    GroupListResponse,
    SendMessageRequest,
    GroupMessageResponse,
)
from app.mobile.router.auth import get_current_user_mobile as get_current_user
from app.utils.utils import decode_access_token
from typing import Optional, List
import json
from datetime import datetime

router = APIRouter()


# --- WebSocket Manager ---
class ConnectionManager:
    def __init__(self):
        # group_id -> list of WebSockets
        self.active_connections: dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, group_id: str):
        await websocket.accept()
        if group_id not in self.active_connections:
            self.active_connections[group_id] = []
        self.active_connections[group_id].append(websocket)

    def disconnect(self, websocket: WebSocket, group_id: str):
        if group_id in self.active_connections:
            if websocket in self.active_connections[group_id]:
                self.active_connections[group_id].remove(websocket)
            if not self.active_connections[group_id]:
                del self.active_connections[group_id]

    async def broadcast(self, message: dict, group_id: str):
        if group_id in self.active_connections:
            # Copy list to separate closing connections during iteration
            for connection in self.active_connections[group_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    # Connection might be dead
                    pass


manager = ConnectionManager()


# --- Helper for WS Auth ---
async def get_current_user_ws(
    websocket: WebSocket,
    token: Optional[str] = Query(None),
    db: Session = Depends(get_db),
) -> Optional[User]:
    # Mobile clients might send token in query param: ws://...?token=...
    if not token:
        # Fallback: check headers (auth header might not be standard in all WS clients but good to have)
        auth_header = websocket.headers.get("Authorization")
        if auth_header:
            scheme, _, param = auth_header.partition(" ")
            if scheme.lower() == "bearer":
                token = param

    if not token:
        # Fallback: check cookies? Mobile usually uses headers/query, but just in case
        token = websocket.cookies.get("access_token")

    if not token:
        return None

    try:
        payload = decode_access_token(token)
        email = payload.get("sub")
        if not email:
            return None
        user = db.query(User).filter(User.email == email).first()
        return user
    except Exception:
        return None


# --------------------------


@router.get("/get-group", response_model=GroupListResponse)
def get_groups(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    groups = []

    if current_user.role == userRole.TEACHER:
        # Teacher: View their own group
        teacher_group = (
            db.query(TeacherInsight)
            .options(joinedload(TeacherInsight.owner))
            .filter(TeacherInsight.user_id == current_user.id)
            .first()
        )
        if teacher_group:
            groups.append(teacher_group)

    elif current_user.role == userRole.STUDENT:
        # Student: View all joined groups
        group_ids = [g.id for g in current_user.groups]
        if group_ids:
            groups = (
                db.query(TeacherInsight)
                .options(joinedload(TeacherInsight.owner))
                .filter(TeacherInsight.id.in_(group_ids))
                .all()
            )

    return {"groups": groups}


@router.get("/get-messages/{group_id}", response_model=GroupMessageListResponse)
def get_messages_by_group(
    group_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Authorization Check
    if current_user.role == userRole.TEACHER:
        # Teacher: Must own the group
        teacher_group = (
            db.query(TeacherInsight)
            .filter(
                TeacherInsight.id == group_id,
                TeacherInsight.user_id == current_user.id,
            )
            .first()
        )
        if not teacher_group:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only view messages from your own group",
            )

    elif current_user.role == userRole.STUDENT:
        # Student: Must be a member
        is_member = any(group.id == group_id for group in current_user.groups)
        if not is_member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not a member of this group",
            )

    # Fetch messages with sender details
    messages = (
        db.query(GroupMessage)
        .options(joinedload(GroupMessage.sender))
        .filter(GroupMessage.group_id == group_id)
        .order_by(GroupMessage.created_at.asc())
        .all()
    )

    return {"messages": messages}


@router.post("/send-message", response_model=GroupMessageResponse)
async def send_message(
    request: SendMessageRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    target_group_id = request.group_id

    # Verify strict role-based access to groups
    if current_user.role == userRole.TEACHER:
        # Teacher: Find their own group
        teacher_group = (
            db.query(TeacherInsight)
            .filter(
                TeacherInsight.user_id == current_user.id,
            )
            .first()
        )
        if not teacher_group:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Teacher group not found",
            )

        # Auto-set group_id if not provided
        if not target_group_id:
            target_group_id = teacher_group.id

        # Verify matches own group
        if target_group_id != teacher_group.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only send messages to your own group",
            )

    elif current_user.role == userRole.STUDENT:
        if not target_group_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Group ID is required for students",
            )

        # Student can only send to joined groups
        is_member = any(group.id == target_group_id for group in current_user.groups)
        if not is_member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not a member of this group",
            )

    # Create the message
    new_message = GroupMessage(
        group_id=target_group_id,
        sender_id=current_user.id,
        message=request.message,
    )
    db.add(new_message)
    db.commit()
    db.refresh(new_message)

    # Broadcast via WebSocket (Hybrid Approach)
    message_with_sender = (
        db.query(GroupMessage)
        .options(joinedload(GroupMessage.sender))
        .filter(GroupMessage.id == new_message.id)
        .first()
    )

    if message_with_sender:
        # Serialize using Pydantic
        response_data = GroupMessageResponse.model_validate(
            message_with_sender
        ).model_dump(mode="json")
        await manager.broadcast(response_data, target_group_id)

    return new_message


@router.websocket("/ws/{group_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    group_id: str,
    db: Session = Depends(get_db),
    token: Optional[str] = Query(None),
):
    # 1. Authenticate (Pass token explicitly to helper)
    user = await get_current_user_ws(websocket, token, db)
    if not user:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # 2. Authorization (Check group membership)
    is_authorized = False
    if user.role == userRole.TEACHER:
        # Check if own group
        teacher_group = (
            db.query(TeacherInsight)
            .filter(TeacherInsight.user_id == user.id, TeacherInsight.id == group_id)
            .first()
        )
        if teacher_group:
            is_authorized = True
    elif user.role == userRole.STUDENT:
        # Check if member
        is_member = any(g.id == group_id for g in user.groups)
        if is_member:
            is_authorized = True

    if not is_authorized:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # 3. Connect
    await manager.connect(websocket, group_id)

    try:
        while True:
            # 4. Listen for messages (if client sends via WS)
            data = await websocket.receive_text()
            message_data = json.loads(data)
            content = message_data.get("message")

            if content:
                # Save to DB
                new_msg = GroupMessage(
                    group_id=group_id, sender_id=user.id, message=content
                )
                db.add(new_msg)
                db.commit()
                db.refresh(new_msg)

                # Fetch with sender for details
                msg_with_sender = (
                    db.query(GroupMessage)
                    .options(joinedload(GroupMessage.sender))
                    .filter(GroupMessage.id == new_msg.id)
                    .first()
                )

                if msg_with_sender:
                    response_data = GroupMessageResponse.model_validate(
                        msg_with_sender
                    ).model_dump(mode="json")
                    await manager.broadcast(response_data, group_id)

    except WebSocketDisconnect:
        manager.disconnect(websocket, group_id)
    except Exception:
        manager.disconnect(websocket, group_id)
