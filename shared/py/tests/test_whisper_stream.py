import os
import sys
import types

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../')))

class DummyModel:
    def __init__(self):
        self.called = []
    def transcribe(self, audio, language="en", task="transcribe", fp16=False):
        self.called.append(audio)
        return {"text": "chunk"}


def import_streamer(monkeypatch):
    dummy_whisper = types.SimpleNamespace(load_model=lambda size: DummyModel())
    monkeypatch.setitem(sys.modules, "whisper", dummy_whisper)
    return __import__("shared.py.speech.whisper_stream", fromlist=["WhisperStreamer"]).WhisperStreamer


def test_model_loading(monkeypatch):
    WhisperStreamer = import_streamer(monkeypatch)
    ws = WhisperStreamer(model_size="medium")
    assert ws.model_size == "medium"
    assert isinstance(ws.model, DummyModel)


def test_transcribe_chunks(monkeypatch):
    WhisperStreamer = import_streamer(monkeypatch)
    ws = WhisperStreamer()
    chunks = [b"\x00\x00", b"\x01\x00"]
    results = list(ws.transcribe_chunks(chunks))
    assert results == ["chunk", "chunk"]
    assert len(ws.model.called) == 2
