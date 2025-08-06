import os
import sys
from pathlib import Path
import importlib


import pytest
import asyncio
import discord


# Ensure service and repository roots are on the import path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
sys.path.insert(0, str(Path(__file__).resolve().parents[4]))


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


class FakeUser:
    def __init__(self, id, name):
        self.id = id
        self.name = name


class FakeGuild:
    def __init__(self, id):
        self.id = id


class FakeChannel:
    def __init__(self, id, messages, name="chan"):
        self.id = id
        self.name = name
        self._messages = messages
        self.guild = FakeGuild(999)

    async def history(self, limit=200, oldest_first=True, after=None):
        msgs = self._messages
        if after:
            for i, m in enumerate(self._messages):
                if m.id == after.id:
                    msgs = self._messages[i + 1 :]
                    break
        for m in msgs:
            yield m

    def get_partial_message(self, msg_id):
        for m in self._messages:
            if m.id == msg_id:
                return m
        return FakeMessage(msg_id, "", self, FakeUser(0, ""))


class FakeMessage:
    def __init__(
        self,
        id,
        content,
        channel,
        author,
        attachments=None,
        created_at="2024-01-01",
        raw_mentions=None,
    ):
        self.id = id
        self.content = content
        self.channel = channel
        self.author = author
        self.attachments = attachments or []
        self.created_at = created_at
        self.guild = channel.guild
        self.raw_mentions = raw_mentions or []


@pytest.fixture(autouse=True)
def setup_env(monkeypatch):
    monkeypatch.setenv("DISCORD_TOKEN", "token")
    monkeypatch.setenv("DEFAULT_CHANNEL", "0")
    monkeypatch.setenv("DEFAULT_CHANNEL_NAME", "general")
    monkeypatch.setenv("DISCORD_CLIENT_USER_ID", "1")
    monkeypatch.setenv("DISCORD_CLIENT_USER_NAME", "client")
    monkeypatch.setattr(discord.Client, "run", lambda self, token: None)

    class DummyHB:
        def send_once(self):
            pass

        def start(self):
            pass

        def stop(self):
            pass

    monkeypatch.setattr(
        "shared.py.heartbeat_client.HeartbeatClient", lambda *a, **k: DummyHB()
    )


def load_indexer(monkeypatch):
    mod = importlib.import_module("main")
    monkeypatch.setattr(mod, "discord_channel_collection", MemoryCollection())
    monkeypatch.setattr(mod, "discord_message_collection", MemoryCollection())
    return mod


def test_index_attachments(monkeypatch):
    mod = load_indexer(monkeypatch)
    channel = FakeChannel(5, [])
    msg = FakeMessage(
        1,
        "hello",
        channel,
        FakeUser(2, "bob"),
        attachments=[FakeAttachment(10, "file.txt")],
    )
    coll = mod.discord_message_collection
    coll.insert_one({"id": 1})
    mod.index_attachments(msg)
    assert coll.find_one({"id": 1})["attachments"][0]["filename"] == "file.txt"


@pytest.mark.asyncio
async def test_index_channel(monkeypatch):
    mod = load_indexer(monkeypatch)
    chan = FakeChannel(10, [])
    messages = [
        FakeMessage(i, f"m{i}", chan, FakeUser(9, "x"), attachments=[])
        for i in range(3)
    ]
    messages[1].attachments = [FakeAttachment(20, "pic.png")]
    chan._messages = messages

    async def dummy_sleep(*a, **k):
        return None

    monkeypatch.setattr(asyncio, "sleep", dummy_sleep)
    coll = mod.discord_message_collection
    for m in messages:
        coll.insert_one({"id": m.id})
    ch_coll = mod.discord_channel_collection
    ch_coll.insert_one({"id": 10, "attachment_cursor": None})
    await mod.index_channel(chan)
    assert (
        coll.find_one({"id": messages[1].id})["attachments"][0]["filename"] == "pic.png"
    )
    assert ch_coll.find_one({"id": 10})["attachment_cursor"] == messages[-1].id
