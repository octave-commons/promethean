import os
import sys
import types
import pytest
from unittest.mock import patch

# Ensure service directory is importable
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
# Ensure shared modules are importable
sys.path.append("../../../")


@pytest.fixture(autouse=True)
def stub_wisper_module(monkeypatch):
    mock_module = types.SimpleNamespace(
        transcribe_pcm=lambda *a, **k: "transcribed text"
    )
    sys.modules["shared.py.speech.wisper_stt"] = mock_module
    yield
    sys.modules.pop("shared.py.speech.wisper_stt", None)


@pytest.fixture
def client(monkeypatch):
    class DummyHB:
        def send_once(self):
            pass

        def start(self):
            pass

        def stop(self):
            pass

    monkeypatch.setattr(
        "shared.py.heartbeat_client.HeartbeatClient", lambda *a, **k: DummyHB()
    )

    import app
    from fastapi.testclient import TestClient

    return TestClient(app.app)


def test_endpoint(client):
    response = client.post(
        "/transcribe_pcm",
        headers={"X-Sample-Rate": "16000", "X-Dtype": "int16"},
        data=b"fake_pcm_data___fake_pcm_data___",
    )
    assert response.status_code == 200
    assert response.json() == {"transcription": "transcribed text"}
