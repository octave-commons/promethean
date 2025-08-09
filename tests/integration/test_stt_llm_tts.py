import os
import sys
import types
import numpy as np
from fastapi.testclient import TestClient

sys.path.append(os.path.join(os.path.dirname(__file__), "..", ".."))


def fake_llm(text: str) -> str:
    return f"LLM:{text}"


def stub_transcribe_pcm(_pcm: bytes, _sr: int) -> str:
    return "hello world"


def stub_generate_voice(_text: str) -> np.ndarray:
    return np.zeros(22050, dtype=np.float32)


class DummyStreamer:
    def __init__(self, *args, **kwargs):
        pass

    def transcribe_chunks(self, chunks, sample_rate: int = 16000):
        yield "hello"


class DummyHB:
    def send_once(self):
        pass

    def start(self):
        pass

    def stop(self):
        pass


def test_stt_llm_tts_pipeline(monkeypatch):
    # Stub STT modules
    monkeypatch.setitem(
        sys.modules,
        "shared.py.speech.wisper_stt",
        types.SimpleNamespace(transcribe_pcm=stub_transcribe_pcm),
    )
    monkeypatch.setitem(
        sys.modules,
        "shared.py.speech.whisper_stream",
        types.SimpleNamespace(WhisperStreamer=DummyStreamer),
    )

    # Stub TTS module
    monkeypatch.setitem(
        sys.modules,
        "shared.py.speech.tts",
        types.SimpleNamespace(generate_voice=stub_generate_voice),
    )

    monkeypatch.setitem(
        sys.modules,
        "nltk",
        types.SimpleNamespace(download=lambda *a, **k: None),
    )

    class DummyNoGrad:
        def __enter__(self):
            pass

        def __exit__(self, exc_type, exc, tb):
            pass

    dummy_torch = types.SimpleNamespace(
        cuda=types.SimpleNamespace(is_available=lambda: False),
        no_grad=lambda: DummyNoGrad(),
    )
    monkeypatch.setitem(sys.modules, "torch", dummy_torch)

    class DummyTokenizer:
        @classmethod
        def from_pretrained(cls, *a, **k):
            return cls()

        def __call__(self, text, return_tensors=None):
            return types.SimpleNamespace(input_ids=None)

    class DummyModel:
        @classmethod
        def from_pretrained(cls, *a, **k):
            return cls()

        def to(self, device):
            return self

        def __call__(self, input_ids, return_dict=True):
            return types.SimpleNamespace(waveform=np.zeros(1))

    dummy_transformers = types.SimpleNamespace(
        FastSpeech2ConformerTokenizer=DummyTokenizer,
        FastSpeech2ConformerWithHifiGan=DummyModel,
    )
    monkeypatch.setitem(sys.modules, "transformers", dummy_transformers)

    monkeypatch.setitem(
        sys.modules,
        "safetensors.torch",
        types.SimpleNamespace(load_file=lambda *a, **k: None),
    )
    monkeypatch.setitem(
        sys.modules,
        "safetensors",
        types.SimpleNamespace(
            torch=types.SimpleNamespace(load_file=lambda *a, **k: None)
        ),
    )

    # Stub heartbeat client
    monkeypatch.setattr("shared.py.heartbeat_client.HeartbeatClient", DummyHB)

    from services.py.stt import app as stt_app
    import importlib

    tts_app = importlib.import_module("services.py.tts.app")

    with TestClient(stt_app.app) as stt_client, TestClient(tts_app.app) as tts_client:
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
