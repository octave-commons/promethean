"""Tests for ``services.py.discord_attachment_embedder.main``."""

import importlib
import sys
import types

import pytest


class FakeCollection:
    def __init__(self):
        self.docs: list[str] = []

    def add(
        self, documents, metadatas, ids, embeddings=None
    ):  # noqa: D401 - simple stub
        self.docs.extend(documents)

    def count(self) -> int:
        return len(self.docs)


class FakeClient:
    def get_or_create_collection(self, name, embedding_function):
        return FakeCollection()


class FakeChromadb:
    Client = FakeClient


chromadb = FakeChromadb()


class EmbeddingFn:
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
    monkeypatch.setitem(sys.modules, "chromadb", chromadb)
    fake_mongodb = types.ModuleType("mongodb")
    fake_mongodb.discord_message_collection = None
    monkeypatch.setitem(sys.modules, "shared.py.mongodb", fake_mongodb)
    fake_embedding_client = types.ModuleType("embedding_client")

    class DummyEmbeddingServiceClient:  # noqa: D401 - simple stub
        pass

    fake_embedding_client.EmbeddingServiceClient = DummyEmbeddingServiceClient
    monkeypatch.setitem(
        sys.modules, "shared.py.embedding_client", fake_embedding_client
    )
    mod = importlib.import_module("services.py.discord_attachment_embedder.main")
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
    shared_mod = importlib.import_module("shared.py.discord_attachment_embedder")
    monkeypatch.setattr(shared_mod, "discord_message_collection", mem)
    client = chromadb.Client()

    embedding_fn = EmbeddingFn()
    collection = client.get_or_create_collection(
        "test", embedding_function=embedding_fn
    )
    mod.process_message(message, collection, embedding_fn)
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
    shared_mod = importlib.import_module("shared.py.discord_attachment_embedder")
    monkeypatch.setattr(shared_mod, "discord_message_collection", mem)
    client = chromadb.Client()

    embedding_fn = EmbeddingFn()
    collection = client.get_or_create_collection(
        "test-no-image", embedding_function=embedding_fn
    )
    mod.process_message(message, collection, embedding_fn)
    assert collection.count() == 0
    assert mem.docs[0].get("embedded") is True
