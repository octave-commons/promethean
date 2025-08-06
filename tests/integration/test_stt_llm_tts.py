import os
import sys
import types
import numpy as np
from fastapi.testclient import TestClient
import pytest

sys.path.append(os.path.join(os.path.dirname(__file__), "..", ".."))


def fake_llm(text: str) -> str:
    return f"LLM:{text}"


def stub_transcribe_pcm(_pcm: bytes, _sr: int) -> str:
    return "hello world"


def stub_generate_voice(_text: str) -> np.ndarray:
    return np.zeros(22050, dtype=np.float32)


def test_stt_llm_tts_pipeline(monkeypatch):
    pytest.importorskip("services.py.tts.app")
    # Stub STT module
    monkeypatch.setitem(
        sys.modules,
        "shared.py.speech.wisper_stt",
        types.SimpleNamespace(transcribe_pcm=stub_transcribe_pcm),
    )

    # Stub WhisperStreamer dependency
    monkeypatch.setitem(
        sys.modules,
        "shared.py.speech.whisper_stream",
        types.SimpleNamespace(WhisperStreamer=object),
    )

    # Stub TTS module
    dummy_module = types.SimpleNamespace(generate_voice=stub_generate_voice)
    monkeypatch.setitem(sys.modules, "speech", types.SimpleNamespace(tts=dummy_module))
    monkeypatch.setitem(sys.modules, "speech.tts", dummy_module)
    monkeypatch.setitem(
        sys.modules, "shared.py.speech", types.SimpleNamespace(tts=dummy_module)
    )
    monkeypatch.setitem(sys.modules, "shared.py.speech.tts", dummy_module)

    from services.py.stt import app as stt_app
    from services.py.tts import app as tts_app

    stt_client = TestClient(stt_app.app)
    tts_client = TestClient(tts_app.app)

    resp = stt_client.post(
        "/transcribe_pcm",
        headers={"X-Sample-Rate": "16000", "X-Dtype": "int16"},
        data=b"pcm",
    )
    assert resp.status_code == 200
    text = resp.json()["transcription"]

    reply = fake_llm(text)

    with tts_client.websocket_connect("/ws/tts") as websocket:
        websocket.send_text(reply)
        audio = websocket.receive_bytes()

    assert audio.startswith(b"RIFF")
