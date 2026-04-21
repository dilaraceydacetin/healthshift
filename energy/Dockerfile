FROM python:3.11-slim

WORKDIR /app

COPY energy/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PYTHONPATH=/app

EXPOSE 8001
CMD ["sh", "-c", "uvicorn energy.main:app --host 0.0.0.0 --port ${PORT:-8001}"]