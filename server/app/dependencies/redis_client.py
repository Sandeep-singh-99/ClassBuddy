import redis


redis_client = redis.Redis(
    host="redis",
    port=6379,
    db=0,
    decode_responses=True
)

try:
    redis_client.ping()
except redis.exceptions.ConnectionError:
    raise Exception("Redis server is not reachable")


def get_redis_client():
    return redis_client
