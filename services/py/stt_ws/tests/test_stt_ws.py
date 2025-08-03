import base64
import json
import os
import sys

# Add repository root to path to allow 'services' imports
sys.path.insert(
    0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../"))
)

from fastapi.testclient import TestClient
import services.py.stt_ws.app as app_module


def test_websocket_transcription(monkeypatch):
    client = TestClient(app_module.app)
    import types

    stub = types.SimpleNamespace(transcribe_pcm=lambda pcm, sr: "hello world")
    monkeypatch.setitem(sys.modules, "shared.py.speech.wisper_stt", stub)

    data = base64.b64encode(b"abc").decode()
    with client.websocket_connect("/transcribe") as websocket:
        websocket.send_text(json.dumps({"pcm": data, "sample_rate": 16000}))
        message = websocket.receive_json()
        assert message["transcription"] == "hello world"
