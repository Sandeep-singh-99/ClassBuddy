from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request
from fastapi.responses import JSONResponse


def ai_rate_limit_key(request: Request) -> str:
    return str(getattr(request.state, "user_id", get_remote_address(request)))

# shortcut: limits are per process; configure shared Redis storage before enforcing global quotas.
limiter = Limiter(key_func=get_remote_address)


async def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"detail": "Too many requests. Please try again later."}
    )
