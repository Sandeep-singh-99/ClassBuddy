import time

from fastapi import Request

from app.core.logger import logger


async def log_requests(request: Request, call_next):
    start = time.time()

    response = await call_next(request)

    duration = round(time.time() - start, 3)

    logger.info(
        f"{request.method} {request.url.path} "
        f"status={response.status_code} "
        f"duration={duration}s"
    )

    return response