FROM python:3.11-slim

WORKDIR /app

COPY symptom/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PYTHONPATH=/app

EXPOSE 8002
CMD ["sh", "-c", "uvicorn symptom.main:app --host 0.0.0.0 --port ${PORT:-8002}"]