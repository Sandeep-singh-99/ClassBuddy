import redis.asyncio as redis
from dotenv import load_dotenv
import os

load_dotenv()

# Async Redis Client using redis-py's asyncio support
# This client is specifically for non-blocking operations in WebSockets
redis_async_client = redis.Redis(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=int(os.getenv("REDIS_PORT", 6379)),
    username=os.getenv("REDIS_USER"),
    password=os.getenv("REDIS_PASSWORD"),
    decode_responses=True,
)


async def check_redis_connection():
    """Confirms Redis connection is active."""
    try:
        await redis_async_client.ping()
        print("✅ Redis async connection successful")
    except redis.exceptions.ConnectionError as e:
        print(f"❌ Redis async connection failed: {e}")
        raise e
