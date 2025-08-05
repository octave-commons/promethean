import os
import sys
import types
import importlib

sys.path.insert(
    0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../"))
)

from fastapi.testclient import TestClient


class DummyStreamer:
    def __init__(self):
        self.chunks = []

    def transcribe_chunks(self, chunks, sample_rate=16000):
        for _ in chunks:
            self.chunks.append(True)
            yield "hi"


def test_ws_stream(monkeypatch):
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

    stub = types.SimpleNamespace(transcribe_pcm=lambda *a, **k: "")
    monkeypatch.setitem(sys.modules, "shared.py.speech.wisper_stt", stub)

    app_module = importlib.import_module("services.py.stt.app")
    dummy = DummyStreamer()
    monkeypatch.setattr(app_module, "streamer", dummy)
    client = TestClient(app_module.app)

    with client.websocket_connect("/stream") as ws:
        ws.send_bytes(b"aa")
        msg = ws.receive_json()
        assert msg["transcription"] == "hi"
        assert dummy.chunks
