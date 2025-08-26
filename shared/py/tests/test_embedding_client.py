import os
import sys
import types
import time
import requests

sys.path.insert(
    0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
)

# Stub chromadb EmbeddingFunction to avoid heavy dependency
chromadb_utils = types.ModuleType("chromadb.utils.embedding_functions")
setattr(chromadb_utils, "EmbeddingFunction", object)
sys.modules["chromadb"] = types.ModuleType("chromadb")
sys.modules["chromadb.utils"] = types.ModuleType("chromadb.utils")
sys.modules["chromadb.utils.embedding_functions"] = chromadb_utils

from shared.py.embedding_client import EmbeddingServiceClient


class DummyResponse:
    def __init__(self, data):
        self._data = data

    def raise_for_status(self):
        pass

    def json(self):
        return self._data


def test_embedding_client_builds_payload(monkeypatch):
    captured = {}

    def fake_post(url, json, timeout):  # noqa: A002 - argument name from requests.post
        captured["url"] = url
        captured["json"] = json
        return DummyResponse({"embeddings": [[0.1, 0.2]] * len(json["items"])})

    monkeypatch.setattr("requests.post", fake_post)

    client = EmbeddingServiceClient(
        url="http://test",
        driver="drv",
        function="fn",
    )

    result = client(["hello", {"type": "image_url", "data": "https://image"}])

    assert captured["url"] == "http://test"
    assert captured["json"] == {
        "items": [
            {"type": "text", "data": "hello"},
            {"type": "image_url", "data": "https://image"},
        ],
        "driver": "drv",
        "function": "fn",
    }
    assert result == [[0.1, 0.2], [0.1, 0.2]]


def test_embedding_client_without_optional_fields(monkeypatch):
    captured = {}

    def fake_post(url, json, timeout):  # noqa: A002 - argument name from requests.post
        captured["json"] = json
        return DummyResponse({"embeddings": [[1.0]]})

    monkeypatch.setattr("requests.post", fake_post)

    client = EmbeddingServiceClient(url="http://test")
    result = client(["text"])

    assert captured["json"] == {"items": [{"type": "text", "data": "text"}]}
    assert result == [[1.0]]


def test_embedding_client_retries_and_returns_error(monkeypatch):
    attempts = {"count": 0}

    def fake_post(url, json, timeout):  # noqa: A002
        attempts["count"] += 1
        raise requests.RequestException("boom")

    sleeps: list[float] = []

    monkeypatch.setattr("requests.post", fake_post)
    monkeypatch.setattr(time, "sleep", lambda s: sleeps.append(s))

    client = EmbeddingServiceClient(url="http://test")
    result = client(["text"])

    assert result["error"] == "request_failed"
    assert attempts["count"] == 3
    assert sleeps == [1, 2]


def test_embedding_client_missing_embeddings_returns_error(monkeypatch):
    def fake_post(url, json, timeout):  # noqa: A002
        return DummyResponse({"foo": "bar"})

    monkeypatch.setattr("requests.post", fake_post)

    client = EmbeddingServiceClient(url="http://test")
    result = client(["text"])

    assert result["error"] == "missing_embeddings"
