# Stage 1: builder
FROM python:3.13-slim AS builder

WORKDIR /app

COPY requirements.txt .
# RUN pip install -r requirements.txt
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Remove cache
RUN find /usr/local -type d -name "__pycache__" -exec rm -r {} + \
 && find /usr/local -type f -name "*.pyc" -delete

# Stage 2: final image

FROM python:3.13-slim

WORKDIR /app

COPY --from=builder /install /usr/local

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]