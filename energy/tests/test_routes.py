from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from energy.main import app

client = TestClient(app)

def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert response.json()["service"] == "energy"

def test_ask_without_data():
    with patch("energy.routes.query_rag") as mock_rag:
        mock_rag.return_value = "No data available"
        response = client.post(
            "/api/ask",
            json={"question": "Which building uses most energy?"}
        )
        assert response.status_code == 200
        assert "question" in response.json()
        assert "answer" in response.json()

def test_upload_csv():
    with patch("energy.routes.index_documents") as mock_index:
        mock_index.return_value = None
        csv_content = b"building,date,kwh\nBuilding A,2024-01-01,450\n"
        response = client.post(
            "/api/upload",
            files={"file": ("test.csv", csv_content, "text/csv")}
        )
        assert response.status_code == 200
        assert "chunks" in response.json()