import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from fastapi.testclient import TestClient
from embedding_service.main import app


def test_naive_embedding():
    client = TestClient(app)
    res = client.post(
        "/embed",
        json={
            "items": [{"type": "text", "data": "hello"}],
            "driver": "naive",
            "function": "simple",
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert len(data["embeddings"][0]) == 256


def test_websocket_embedding():
    client = TestClient(app)
    with client.websocket_connect("/ws/embed") as ws:
        ws.send_json(
            {
                "items": [{"type": "text", "data": "hello"}],
                "driver": "naive",
                "function": "simple",
            }
        )
        data = ws.receive_json()
        assert len(data["embeddings"][0]) == 256
