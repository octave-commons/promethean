import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')))

from fastapi.testclient import TestClient
import services.whisper_stream_ws.app as app_module


class DummyStreamer:
    def __init__(self):
        self.chunks = []

    def transcribe_chunks(self, chunks, sample_rate=16000):
        for _ in chunks:
            self.chunks.append(True)
            yield 'hi'


def test_ws_stream(monkeypatch):
    dummy = DummyStreamer()
    monkeypatch.setattr(app_module, 'streamer', dummy)
    client = TestClient(app_module.app)

    with client.websocket_connect('/stream') as ws:
        ws.send_bytes(b'aa')
        msg = ws.receive_json()
        assert msg['transcription'] == 'hi'
        assert dummy.chunks
