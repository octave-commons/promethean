import asyncio
from unittest.mock import MagicMock

import pytest

from shared.py.utils.discord import (
    fetch_channel_history,
    get_or_create_channel_record,
    update_cursor,
)


def test_get_or_create_channel_record_creates_missing():
    collection = MagicMock()
    collection.find_one.return_value = None

    record = get_or_create_channel_record(collection, 1, "cursor")

    assert record == {"id": 1, "cursor": None}
    collection.insert_one.assert_called_once_with(record)


def test_get_or_create_channel_record_adds_cursor_field():
    collection = MagicMock()
    collection.find_one.return_value = {"id": 1}

    record = get_or_create_channel_record(collection, 1, "cursor")

    assert record == {"id": 1, "cursor": None}
    collection.update_one.assert_called_once_with({"id": 1}, {"$set": {"cursor": None}})


def test_get_or_create_channel_record_returns_existing():
    collection = MagicMock()
    collection.find_one.return_value = {"id": 1, "cursor": 7}

    record = get_or_create_channel_record(collection, 1, "cursor")

    assert record == {"id": 1, "cursor": 7}
    collection.insert_one.assert_not_called()
    collection.update_one.assert_not_called()


def test_fetch_channel_history_without_cursor():
    messages = ["a", "b"]
    channel = MagicMock()
    channel.id = 1

    async def history_gen():
        for m in messages:
            yield m

    channel.history = MagicMock(side_effect=lambda *a, **k: history_gen())
    channel.get_partial_message = MagicMock()

    collection = MagicMock()
    collection.find_one.return_value = {"id": 1, "cursor": None}

    result = asyncio.run(fetch_channel_history(channel, collection, "cursor"))

    assert result == messages
    channel.history.assert_called_once_with(limit=200, oldest_first=True)


def test_fetch_channel_history_with_cursor():
    messages = ["x"]
    channel = MagicMock()
    channel.id = 1
    channel.get_partial_message = MagicMock(return_value="partial")

    async def history_gen():
        for m in messages:
            yield m

    channel.history = MagicMock(side_effect=lambda *a, **k: history_gen())

    collection = MagicMock()
    collection.find_one.return_value = {"id": 1, "cursor": 9}

    result = asyncio.run(fetch_channel_history(channel, collection, "cursor"))

    assert result == messages
    channel.get_partial_message.assert_called_once_with(9)
    channel.history.assert_called_once_with(
        limit=200, oldest_first=True, after="partial"
    )


def test_fetch_channel_history_skips_invalid_channel():
    channel = MagicMock()
    channel.id = 1
    channel.history = MagicMock()

    collection = MagicMock()
    collection.find_one.return_value = {
        "id": 1,
        "cursor": None,
        "is_valid": False,
    }

    result = asyncio.run(fetch_channel_history(channel, collection, "cursor"))

    assert result == []
    channel.history.assert_not_called()


def test_fetch_channel_history_marks_invalid_on_error():
    channel = MagicMock()
    channel.id = 1

    async def error_gen():
        raise RuntimeError("fail")
        yield  # pragma: no cover

    channel.history = MagicMock(side_effect=lambda *a, **k: error_gen())
    channel.get_partial_message = MagicMock()

    collection = MagicMock()
    collection.find_one.return_value = {"id": 1, "cursor": None}

    result = asyncio.run(fetch_channel_history(channel, collection, "cursor"))

    assert result == []
    collection.update_one.assert_called_once_with(
        {"id": 1}, {"$set": {"is_valid": False}}
    )


def test_update_cursor_persists_value():
    collection = MagicMock()

    update_cursor(collection, 1, 5, "cursor")

    collection.update_one.assert_called_once_with({"id": 1}, {"$set": {"cursor": 5}})


def test_update_cursor_raises_on_failure():
    collection = MagicMock()
    collection.update_one.side_effect = RuntimeError("db error")

    with pytest.raises(RuntimeError):
        update_cursor(collection, 1, 5, "cursor")
