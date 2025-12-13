from fastapi import WebSocket
from typing import List, Dict


class ConnectionManager:
    def __init__(self):
        # group_id -> list of WebSockets
        self.active_connections: Dict[str, List[WebSocket]] = {}

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
