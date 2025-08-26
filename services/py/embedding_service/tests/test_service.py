import asyncio
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve()
sys.path.insert(0, str(BASE_DIR.parents[2]))
sys.path.insert(0, str(BASE_DIR.parents[4]))

import pytest

from embedding_service.main import handle_task


class DummyClient:
    def __init__(self):
        self.published = []

    async def publish(self, type_, payload, **opts):
        self.published.append((type_, payload, opts))


def test_handle_task_publishes_embeddings():
    client = DummyClient()
    task = {
        "id": "1",
        "payload": {
            "items": [{"type": "text", "data": "hello"}],
            "driver": "naive",
            "function": "simple",
            "replyTo": "reply.queue",
        },
    }
    asyncio.run(handle_task(task, client))
    assert client.published
    evt_type, payload, opts = client.published[0]
    assert evt_type == "embedding.result"
    assert len(payload["embeddings"][0]) == 256
    assert opts["replyTo"] == "reply.queue"
    assert opts["correlationId"] == "1"


def test_handle_task_missing_fields():
    client = DummyClient()
    task = {
        "id": "2",
        "payload": {"driver": "naive", "function": "simple", "replyTo": "r"},
    }
    asyncio.run(handle_task(task, client))
    assert client.published
    evt_type, payload, opts = client.published[0]
    assert evt_type == "embedding.failed"
    assert "items" in payload["error"]


def test_handle_task_embed_failure(monkeypatch):
    client = DummyClient()
    task = {
        "id": "3",
        "payload": {
            "items": [{"type": "text", "data": "hi"}],
            "driver": "naive",
            "function": "simple",
            "replyTo": "reply.queue",
        },
    }

    def boom(*args, **kwargs):  # noqa: D401,ANN001,ARG001
        raise ValueError("boom")

    monkeypatch.setattr("embedding_service.main._embed", boom)
    asyncio.run(handle_task(task, client))
    assert client.published
    evt_type, payload, _ = client.published[0]
    assert evt_type == "embedding.failed"
    assert payload["error"] == "boom"
