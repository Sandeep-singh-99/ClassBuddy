import redis
from dotenv import load_dotenv
import os

load_dotenv()

redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST"),
    port=os.getenv("REDIS_PORT"),
    username=os.getenv("REDIS_USER"),
    password=os.getenv("REDIS_PASSWORD"),
    decode_responses=True
)

try:
    redis_client.ping()
except redis.exceptions.ConnectionError:
    raise Exception("Redis server is not reachable")


def get_redis_client():
    return redis_client
