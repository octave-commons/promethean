# SPDX-License-Identifier: GPL-3.0-only
from __future__ import annotations

from typing import Any, List
import random


def get_or_create_channel_record(
    collection: Any, channel_id: int, cursor_field: str
) -> dict:
    """Fetch the channel record, creating one with a cursor if missing."""
    record = collection.find_one({"id": channel_id})
    if record is None:
        record = {"id": channel_id, cursor_field: None}
        collection.insert_one(record)
    elif cursor_field not in record:
        collection.update_one({"id": channel_id}, {"$set": {cursor_field: None}})
        record[cursor_field] = None
    return record


async def fetch_channel_history(
    channel: Any, collection: Any, cursor_field: str
) -> List[Any]:
    """Return the next batch of messages for a channel using a cursor."""
    record = get_or_create_channel_record(collection, channel.id, cursor_field)
    if not record.get("is_valid", True):
        return []

    cursor = record.get(cursor_field)
    try:
        if cursor is None:
            return [
                message
                async for message in channel.history(limit=200, oldest_first=True)
            ]
        return [
            message
            async for message in channel.history(
                limit=200,
                oldest_first=True,
                after=channel.get_partial_message(cursor),
            )
        ]
    except Exception:
        collection.update_one({"id": record["id"]}, {"$set": {"is_valid": False}})
        return []


def update_cursor(
    collection: Any, channel_id: int, message_id: int, cursor_field: str
) -> None:
    """Persist the cursor for a channel."""
    collection.update_one({"id": channel_id}, {"$set": {cursor_field: message_id}})


def shuffle_array(array: List[Any]) -> List[Any]:
    """Shuffle a list in place and return it."""
    random.shuffle(array)
    return array
