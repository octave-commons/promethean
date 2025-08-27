import os, sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.path.insert(
    0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../.."))
)
import asyncio

import base64
import types
import pytest

from service import process_task


class DummyClient:
    def __init__(self):
        self.calls = []

    async def publish(self, type_, payload, **opts):
        self.calls.append((type_, payload, opts))


def test_process_task_publishes_transcription(monkeypatch):
    stub = types.SimpleNamespace(transcribe_pcm=lambda data, sr: "hello world")
    monkeypatch.setitem(sys.modules, "shared.py.speech.whisper_stt", stub)
    client = DummyClient()
    pcm = base64.b64encode(b"abc").decode()
    task = {"id": "123", "payload": {"pcm": pcm, "sample_rate": 16000}}
    asyncio.run(process_task(client, task))
    assert client.calls == [
        ("stt.transcribed", {"text": "hello world"}, {"correlationId": "123"})
    ]


def test_process_task_missing_pcm(monkeypatch):
    monkeypatch.setitem(
        sys.modules,
        "shared.py.speech.whisper_stt",
        types.SimpleNamespace(transcribe_pcm=lambda *a, **k: ""),
    )
    client = DummyClient()
    task = {"id": "123", "payload": {}}
    asyncio.run(process_task(client, task))
    assert client.calls == []
