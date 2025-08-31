import importlib
import os

os.environ.setdefault("DISCORD_TOKEN", "token")
os.environ.setdefault("DEFAULT_CHANNEL", "0")
os.environ.setdefault("DEFAULT_CHANNEL_NAME", "general")
os.environ.setdefault("DISCORD_CLIENT_USER_ID", "1")
os.environ.setdefault("DISCORD_CLIENT_USER_NAME", "client")

from shared.py.utils.discord_attachment import format_attachment


class MemoryCollection:
    def __init__(self):
        self.data = []

    def insert_one(self, doc):
        self.data.append(doc)

    def find_one(self, query):
        for item in self.data:
            if all(item.get(k) == v for k, v in query.items()):
                return item
        return None

    def update_one(self, query, update):
        doc = self.find_one(query)
        if doc:
            for k, v in update.get("$set", {}).items():
                doc[k] = v


class FakeAttachment:
    def __init__(self, id, filename, size=0, url="u", content_type="text/plain"):
        self.id = id
        self.filename = filename
        self.size = size
        self.url = url
        self.content_type = content_type


class FakeMessage:
    def __init__(self, id, attachments=None):
        self.id = id
        self.attachments = attachments or []


def test_format_attachment():
    att = FakeAttachment(1, "file.txt", size=5, url="/x", content_type="text/plain")
    assert format_attachment(att) == {
        "id": 1,
        "filename": "file.txt",
        "size": 5,
        "url": "/x",
        "content_type": "text/plain",
    }


def test_index_attachments(monkeypatch):
    mod = importlib.import_module("shared.py.utils.discord_attachment")
    coll = MemoryCollection()
    monkeypatch.setattr(mod, "discord_message_collection", coll)
    msg = FakeMessage(1, attachments=[FakeAttachment(10, "file.txt")])
    coll.insert_one({"id": 1})
    mod.index_attachments(msg)
    assert coll.find_one({"id": 1})["attachments"][0]["filename"] == "file.txt"
