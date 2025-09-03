# SPDX-License-Identifier: GPL-3.0-only
import os
import subprocess
import sys
import types

import numpy as np
import pytest
from fastapi.testclient import TestClient


def fake_llm(text: str) -> str:
    return f"LLM:{text}"


def _ensure_pkg(pkg: str):
    try:
        return __import__(pkg)
    except ImportError:
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", pkg])
            return __import__(pkg)
        except Exception:
            module = types.SimpleNamespace()
            sys.modules[pkg] = module
            return module


def test_stt_llm_tts_pipeline(monkeypatch):
    stt_mod = pytest.importorskip("services.py.stt.app")

    nltk = _ensure_pkg("nltk")
    monkeypatch.setattr(nltk, "download", lambda *a, **k: None, raising=False)

    transformers = _ensure_pkg("transformers")

    class DummyTokenizer:
        @classmethod
        def from_pretrained(cls, *a, **k):
            return cls()

        def __call__(self, text, return_tensors=None):
            return types.SimpleNamespace(input_ids=[0])

    class DummyModel:
        @classmethod
        def from_pretrained(cls, *a, **k):
            return cls()

        def to(self, device):
            return self

        def __call__(self, input_ids, return_dict=True):
            return types.SimpleNamespace(waveform=np.zeros(22050, dtype=np.float32))

    monkeypatch.setattr(
        transformers, "FastSpeech2ConformerTokenizer", DummyTokenizer, raising=False
    )
    monkeypatch.setattr(
        transformers, "FastSpeech2ConformerWithHifiGan", DummyModel, raising=False
    )

    torch = _ensure_pkg("torch")
    monkeypatch.setattr(torch.cuda, "is_available", lambda: False, raising=False)

    monkeypatch.setitem(
        sys.modules,
        "shared.py.speech.whisper_stt",
        types.SimpleNamespace(transcribe_pcm=lambda *_: "hello world"),
    )
    monkeypatch.setitem(
        sys.modules,
        "shared.py.speech.whisper_stream",
        types.SimpleNamespace(WhisperStreamer=object),
    )

    dummy_voice = types.SimpleNamespace(
        generate_voice=lambda _text: np.zeros(22050, dtype=np.float32)
    )
    monkeypatch.setitem(sys.modules, "speech", types.SimpleNamespace(tts=dummy_voice))
    monkeypatch.setitem(sys.modules, "speech.tts", dummy_voice)
    monkeypatch.setitem(
        sys.modules, "shared.py.speech", types.SimpleNamespace(tts=dummy_voice)
    )
    monkeypatch.setitem(sys.modules, "shared.py.speech.tts", dummy_voice)

    tts_mod = pytest.importorskip("services.py.tts.app")

    with TestClient(stt_mod.app) as stt_client, TestClient(tts_mod.app) as tts_client:
        resp = stt_client.post(
            "/transcribe_pcm",
            headers={"X-Sample-Rate": "16000", "X-Dtype": "int16"},
            data=b"pcm",
        )
        assert resp.status_code == 200
        text = resp.json()["transcription"]

        reply = fake_llm(text)

        with tts_client.websocket_connect("/ws/tts") as ws:
            ws.send_text(reply)
            audio = ws.receive_bytes()

    assert audio.startswith(b"RIFF")
