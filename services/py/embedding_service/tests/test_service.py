import asyncio
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve()
sys.path.insert(0, str(BASE_DIR.parents[2]))
sys.path.insert(0, str(BASE_DIR.parents[4]))

from embedding_service.main import handle_task
from embedding_service.drivers.naive_driver import VECTOR_SIZE


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
    assert len(payload["embeddings"][0]) == VECTOR_SIZE
    assert opts["replyTo"] == "reply.queue"
    assert opts["correlationId"] == "1"
