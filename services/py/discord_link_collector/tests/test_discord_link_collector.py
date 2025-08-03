import os
import sys
import importlib

import pytest


class MemoryCollection:
    def __init__(self, data=None):
        self.data = data or []

    def find(self, query=None):
        return list(self.data)

    def update_one(self, query, update, upsert=False):
        doc = next(
            (d for d in self.data if all(d.get(k) == v for k, v in query.items())), None
        )
        if doc:
            doc.update(update.get("$set", {}))
        elif upsert:
            new_doc = {**query, **update.get("$set", {})}
            self.data.append(new_doc)

    def find_one(self, query):
        for item in self.data:
            if all(item.get(k) == v for k, v in query.items()):
                return item
        return None


@pytest.fixture(autouse=True)
def setup_env(monkeypatch):
    monkeypatch.setenv("DISCORD_TOKEN", "token")
    monkeypatch.setenv("DEFAULT_CHANNEL", "0")
    monkeypatch.setenv("DEFAULT_CHANNEL_NAME", "general")
    monkeypatch.setenv("DISCORD_CLIENT_USER_ID", "1")
    monkeypatch.setenv("DISCORD_CLIENT_USER_NAME", "client")


@pytest.fixture
def service():
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../../../"))
    mod = importlib.import_module("main")
    return mod


def test_collect_links(service):
    message_collection = MemoryCollection(
        [
            {
                "id": 1,
                "content": "look http://example.com",
                "attachments": [{"url": "http://img.png"}],
                "channel": 5,
                "author": 7,
            },
            {
                "id": 2,
                "content": "no links here",
                "attachments": [{"url": "http://img2.png"}],
            },
            {
                "id": 3,
                "content": "link but no image http://example.org",
                "attachments": [{"url": "http://file.txt"}],
            },
        ]
    )
    link_collection = MemoryCollection()

    service.collect_links(message_collection, link_collection)

    assert link_collection.find_one({"message_id": 1})["links"] == [
        "http://example.com"
    ]
    assert link_collection.find_one({"message_id": 2}) is None
    assert link_collection.find_one({"message_id": 3}) is None
