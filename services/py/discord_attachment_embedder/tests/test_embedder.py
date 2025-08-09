import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
sys.path.insert(0, str(Path(__file__).resolve().parents[4]))

import chromadb
import importlib
import pytest

from chromadb.utils.embedding_functions import EmbeddingFunction


class EmbeddingFn(EmbeddingFunction):
    def name(self) -> str:
        return "test"

    def __call__(self, input: list[str]) -> list[list[float]]:
        return [[0.1, 0.2, 0.3] for _ in input]


class MemoryCollection:
    def __init__(self, docs=None):
        self.docs = docs or []

    def find(self, query):
        for doc in self.docs:
            yield doc

    def update_one(self, query, update):
        for doc in self.docs:
            if doc.get("id") == query.get("id"):
                doc.update(update.get("$set", {}))


@pytest.fixture(autouse=True)
def setup_env(monkeypatch):
    monkeypatch.setenv("DISCORD_TOKEN", "token")
    monkeypatch.setenv("DEFAULT_CHANNEL", "0")
    monkeypatch.setenv("DEFAULT_CHANNEL_NAME", "general")
    monkeypatch.setenv("DISCORD_CLIENT_USER_ID", "1")
    monkeypatch.setenv("DISCORD_CLIENT_USER_NAME", "client")


def test_process_message(monkeypatch):
    mod = importlib.import_module("main")
    message = {
        "id": 1,
        "content": "this is my pet cat fluffy",
        "attachments": [
            {
                "id": 2,
                "filename": "cat.png",
                "url": "http://example.com/cat.png",
                "content_type": "image/png",
            }
        ],
    }
    mem = MemoryCollection([message])
    monkeypatch.setattr(mod, "discord_message_collection", mem)
    client = chromadb.Client()

    collection = client.get_or_create_collection(
        "test", embedding_function=EmbeddingFn()
    )
    mod.process_message(message, collection)
    assert collection.count() == 2
    assert mem.docs[0].get("embedded") is True


def test_process_message_no_image(monkeypatch):
    mod = importlib.import_module("main")
    message = {
        "id": 2,
        "attachments": [
            {
                "id": 3,
                "filename": "doc.pdf",
                "url": "http://example.com/doc.pdf",
                "content_type": "application/pdf",
            }
        ],
    }
    mem = MemoryCollection([message])
    monkeypatch.setattr(mod, "discord_message_collection", mem)
    client = chromadb.Client()

    collection = client.get_or_create_collection(
        "test-no-image", embedding_function=EmbeddingFn()
    )
    mod.process_message(message, collection)
    assert collection.count() == 0
    assert mem.docs[0].get("embedded") is True
