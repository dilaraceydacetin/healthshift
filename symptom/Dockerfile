FROM python:3.11-slim

WORKDIR /app

COPY symptom/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8002
CMD ["uvicorn", "symptom.main:app", "--host", "0.0.0.0", "--port", "8002"]