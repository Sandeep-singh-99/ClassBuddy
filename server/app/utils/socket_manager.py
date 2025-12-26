import asyncio
import json
from typing import List, Dict
from fastapi import WebSocket
from app.dependencies.redis_async_client import redis_async_client


class ConnectionManager:
    def __init__(self):
        # group_id -> list of local WebSocket connections
        self.active_connections: Dict[str, List[WebSocket]] = {}
        # Single PubSub instance for this manager
        self.pubsub = redis_async_client.pubsub()
        self.listen_task = None

    async def connect(self, websocket: WebSocket, group_id: str):
        """Accepts a WebSocket connection and ensures Redis subscription."""
        await websocket.accept()

        if group_id not in self.active_connections:
            self.active_connections[group_id] = []
            # Subscribe to the specific group channel
            await self.pubsub.subscribe(f"chat:{group_id}")
            print(f"Subscribed to Redis channel: chat:{group_id}")

        self.active_connections[group_id].append(websocket)

    def disconnect(self, websocket: WebSocket, group_id: str):
        """Removes a WebSocket connection and cleans up Redis subscription if empty."""
        if group_id in self.active_connections:
            if websocket in self.active_connections[group_id]:
                self.active_connections[group_id].remove(websocket)

            if not self.active_connections[group_id]:
                del self.active_connections[group_id]
                # Unsubscribe to save Redis resources
                asyncio.create_task(self._safe_unsubscribe(group_id))

    async def _safe_unsubscribe(self, group_id: str):
        try:
            await self.pubsub.unsubscribe(f"chat:{group_id}")
            print(f"Unsubscribed from Redis channel: chat:{group_id}")
        except Exception as e:
            print(f"Error unsubscribing from chat:{group_id}: {e}")

    async def broadcast(self, message: dict, group_id: str):
        """
        Publishes a message to the Redis channel.
        The local listener will pick this up and send it to all local clients.
        """
        # We publish JSON string to Redis
        try:
            await redis_async_client.publish(f"chat:{group_id}", json.dumps(message))
        except Exception as e:
            print(f"Error publishing to Redis: {e}")

    async def start_listener(self):
        """Starts the background Redis listener task."""
        if self.listen_task is None or self.listen_task.done():
            self.listen_task = asyncio.create_task(self.listen_to_redis())
            print("Redis listener started.")

    async def stop_listener(self):
        """Cancels the background Redis listener task."""
        if self.listen_task:
            self.listen_task.cancel()
            try:
                await self.listen_task
            except asyncio.CancelledError:
                pass
            self.listen_task = None
            print("Redis listener stopped.")

    async def listen_to_redis(self):
        """
        Continuously listens for messages on subscribed Redis channels
        and broadcasts them to local WebSockets.
        """
        print("🎧 Listening to Redis Pub/Sub...")
        while True:
            try:
                async for message in self.pubsub.listen():
                    if message["type"] == "message":
                        # print(f"📩 Redis Message Received: {message}")
                        channel = message["channel"]
                        if ":" in channel:
                            # Extract group_id from channel name "chat:{group_id}"
                            group_id = channel.split(":")[1]
                            if group_id in self.active_connections:
                                try:
                                    data = json.loads(message["data"])

                                    # Broadcast to all local connections for this group
                                    # Iterate over copy to safely handle potential disconnects during iteration
                                    count = 0
                                    for connection in list(
                                        self.active_connections[group_id]
                                    ):
                                        try:
                                            await connection.send_json(data)
                                            count += 1
                                        except Exception as e:
                                            print(f"Error sending to WS: {e}")
                                            # Optionally disconnect broken socket here
                                    # print(f"Sent message to {count} clients in group {group_id}")
                                except json.JSONDecodeError:
                                    print("Error decoding Redis message JSON")
            except Exception as e:
                print(f"❌ Redis listener error: {e}")
                print("Reconnecting listener in 5 seconds...")
                await asyncio.sleep(5)

            # Check if task was cancelled to exit loop
            try:
                # Add a small sleep to prevent tight loop if listen returns immediately
                await asyncio.sleep(1)
            except asyncio.CancelledError:
                break


manager = ConnectionManager()
