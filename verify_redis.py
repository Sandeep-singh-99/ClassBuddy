import asyncio
import os
from dotenv import load_dotenv
import redis.asyncio as redis

# Load env from server directory
load_dotenv("server/.env")


async def verify_redis():
    print("Connecting to Redis...")
    host = os.getenv("REDIS_HOST", "localhost")
    port = os.getenv("REDIS_PORT", 6379)
    print(f"Target: {host}:{port}")

    client = redis.Redis(
        host=host,
        port=int(port),
        username=os.getenv("REDIS_USER"),
        password=os.getenv("REDIS_PASSWORD"),
        decode_responses=True,
    )

    try:
        await client.ping()
        print(" Redis PING Successful")
    except Exception as e:
        print(f" Redis PING Failed: {e}")
        await client.close()
        return

    pubsub = client.pubsub()
    channel = "chat:verification_test"
    await pubsub.subscribe(channel)
    print(f" Subscribed to {channel}")

    async def listener():
        print("Listener started...")
        async for message in pubsub.listen():
            if message["type"] == "message":
                print(f"Received: {message['data']}")
                break  # Exit after receiving one message

    listener_task = asyncio.create_task(listener())

    await asyncio.sleep(1)
    print(f" Publishing message to {channel}...")
    await client.publish(channel, "Hello from Verification Script!")

    try:
        await asyncio.wait_for(listener_task, timeout=5)
        print(" Message received successfully!")
    except asyncio.TimeoutError:
        print(" Timeout waiting for message.")

    await client.close()


if __name__ == "__main__":
    asyncio.run(verify_redis())
