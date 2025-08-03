import os, sys

ROOT_DIR = os.path.join(os.path.dirname(__file__), "../../../../")
sys.path.insert(0, os.path.join(ROOT_DIR, "shared", "py"))
sys.path.insert(0, ROOT_DIR)

import numpy as np
from fastapi.testclient import TestClient
from unittest.mock import patch
import types
import importlib


def test_websocket_tts_returns_wav_bytes():
    dummy_audio = np.zeros(22050, dtype=np.float32)
    dummy_module = types.SimpleNamespace(generate_voice=lambda text: dummy_audio)
    dummy_package = types.ModuleType("speech")
    dummy_package.tts = dummy_module

    class DummyHB:
        def send_once(self):
            pass

        def start(self):
            pass

        def stop(self):
            pass

    with patch("shared.py.heartbeat_client.HeartbeatClient", lambda *a, **k: DummyHB()):
        with patch.dict(
            sys.modules,
            {
                "speech": dummy_package,
                "speech.tts": dummy_module,
                "shared.py.speech": dummy_package,
                "shared.py.speech.tts": dummy_module,
            },
        ):
            app_module = importlib.import_module("services.py.tts.ws")
            client = TestClient(app_module.app)
            with client.websocket_connect("/ws/tts") as websocket:
                websocket.send_text("hello")
                data = websocket.receive_bytes()
                assert data.startswith(b"RIFF")
                assert len(data) > 44  # standard WAV header size
