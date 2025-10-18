import redis

def get_redis_client():
    r = redis.Redis(
        host="redis",  
        port=6379,
        db=0,
        decode_responses=True
    )
    try:
        r.ping()  
    except redis.exceptions.ConnectionError:
        raise Exception("Redis server is not reachable")
    return r
