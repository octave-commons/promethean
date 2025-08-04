import os
import sys
import importlib

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../../../"))

import pytest

import asyncio

import discord


# Dummy in-memory collection to mimic pymongo behaviour
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


# Simple discord object stubs
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
            # skip messages up to and including the one with after.id
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
        self, id, content, channel, author, created_at="2024-01-01", raw_mentions=None
    ):
        self.id = id
        self.content = content
        self.channel = channel
        self.author = author
        self.created_at = created_at
        self.guild = channel.guild
        self.raw_mentions = raw_mentions or []


@pytest.fixture(autouse=True)
def setup_env(monkeypatch):
    # Minimal environment required by settings module
    monkeypatch.setenv("DISCORD_TOKEN", "token")
    monkeypatch.setenv("DEFAULT_CHANNEL", "0")
    monkeypatch.setenv("DEFAULT_CHANNEL_NAME", "general")
    monkeypatch.setenv("DISCORD_CLIENT_USER_ID", "1")
    monkeypatch.setenv("DISCORD_CLIENT_USER_NAME", "client")
    monkeypatch.setattr(discord.Client, "run", lambda self, token: None)


def load_indexer(monkeypatch):
    # Reload module with patched collections for isolation
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

    mod = importlib.import_module("main")
    monkeypatch.setattr(mod, "discord_channel_collection", MemoryCollection())
    monkeypatch.setattr(mod, "discord_message_collection", MemoryCollection())
    return mod


def test_format_message(monkeypatch):
    mod = load_indexer(monkeypatch)
    channel = FakeChannel(5, [])
    msg = FakeMessage(1, "hello", channel, FakeUser(2, "bob"))
    formatted = mod.format_message(msg)
    assert formatted["id"] == 1
    assert formatted["channel_name"] == "chan"
    assert formatted["author_name"] == "bob"


def test_index_message(monkeypatch):
    mod = load_indexer(monkeypatch)
    coll = mod.discord_message_collection
    msg = FakeMessage(2, "hey", FakeChannel(7, []), FakeUser(3, "sally"))
    mod.index_message(msg)
    assert coll.find_one({"id": 2})["content"] == "hey"
    # second call should not create a duplicate
    mod.index_message(msg)
    assert len(coll.data) == 1


@pytest.mark.asyncio
async def test_index_channel(monkeypatch):
    mod = load_indexer(monkeypatch)
    chan = FakeChannel(10, [])
    messages = [FakeMessage(i, f"m{i}", chan, FakeUser(9, "x")) for i in range(3)]
    chan._messages = messages

    async def dummy_sleep(*a, **k):
        return None

    monkeypatch.setattr(asyncio, "sleep", dummy_sleep)
    coll = mod.discord_message_collection
    ch_coll = mod.discord_channel_collection
    ch_coll.insert_one({"id": 10, "cursor": None})
    await mod.index_channel(chan)
    # all messages inserted
    assert len(coll.data) == 3
    # cursor updated to newest message id
    assert ch_coll.find_one({"id": 10})["cursor"] == messages[-1].id
