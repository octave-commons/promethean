import importlib
import os
import sys
import types
import wave
from fastapi.testclient import TestClient
from unittest.mock import patch

ROOT_DIR = os.path.join(os.path.dirname(__file__), "../../../../")
sys.path.insert(0, os.path.join(ROOT_DIR, "shared", "py"))
sys.path.insert(0, ROOT_DIR)


def dummy_write(file, audio, samplerate, format=None, subtype=None):
    with wave.open(file, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(samplerate)
        wf.writeframes(b"\x00\x00" * 10)


class DummyHB:
    def send_once(self):
        pass

    def start(self):
        pass

    def stop(self):
        pass


def test_websocket_tts_returns_wav_bytes(monkeypatch):
    dummy_module = types.SimpleNamespace(generate_voice=lambda text: None)
    dummy_package = types.ModuleType("speech")
    dummy_package.tts = dummy_module

    dummy_sf = types.SimpleNamespace(write=dummy_write)
    dummy_nltk = types.SimpleNamespace(
        download=lambda *a, **k: None,
        data=types.SimpleNamespace(find=lambda *a, **k: None),
    )

    class DummyBroker:
        async def publish(self, *a, **k):
            pass

    async def dummy_start_service(*a, **k):
        return DummyBroker()

    class DummyNoGrad:
        def __enter__(self):
            pass

        def __exit__(self, exc_type, exc, tb):
            pass

    dummy_torch = types.SimpleNamespace(
        cuda=types.SimpleNamespace(is_available=lambda: False),
        no_grad=lambda: DummyNoGrad(),
    )

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
            return types.SimpleNamespace(waveform=[0] * 10)

    dummy_transformers = types.SimpleNamespace(
        FastSpeech2ConformerTokenizer=DummyTokenizer,
        FastSpeech2ConformerWithHifiGan=DummyModel,
    )
    dummy_safetensors_torch = types.SimpleNamespace(load_file=lambda *a, **k: None)
    dummy_safetensors = types.ModuleType("safetensors")
    dummy_safetensors.torch = dummy_safetensors_torch
    dummy_numpy = types.ModuleType("numpy")
    dummy_numpy.ndarray = list

    monkeypatch.setitem(
        sys.modules,
        "shared.py.heartbeat_client",
        types.SimpleNamespace(HeartbeatClient=lambda *a, **k: DummyHB()),
    )
    with patch.dict(
        sys.modules,
        {
            "speech": dummy_package,
            "speech.tts": dummy_module,
            "shared.py.speech": dummy_package,
            "shared.py.speech.tts": dummy_module,
            "shared.py.speech.audio_utils": types.SimpleNamespace(
                wav_to_base64=lambda audio, sr: ""
            ),
            "shared.py.service_template": types.SimpleNamespace(
                start_service=dummy_start_service
            ),
            "soundfile": dummy_sf,
            "nltk": dummy_nltk,
            "torch": dummy_torch,
            "transformers": dummy_transformers,
            "safetensors": dummy_safetensors,
            "safetensors.torch": dummy_safetensors_torch,
            "numpy": dummy_numpy,
        },
    ):
        app_module = importlib.import_module("services.py.tts.app")
        client = TestClient(app_module.app)
        with client.websocket_connect("/ws/tts") as websocket:
            websocket.send_text("hello")
            data = websocket.receive_bytes()
            assert data.startswith(b"RIFF")
            assert len(data) > 44  # standard WAV header size
