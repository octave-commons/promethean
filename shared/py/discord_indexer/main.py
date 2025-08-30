"""
Crawl through discord history and fill in all messages that are not getting processed in real time.
"""

import hy
import asyncio
import random
from typing import List
import logging

import discord

from shared.py import settings
from shared.py.mongodb import discord_message_collection, discord_channel_collection
from shared.py.utils.discord import fetch_channel_history, update_cursor
from shared.py.discord_service import run_discord_service

logger = logging.getLogger("discord_indexer")


def format_message(message: discord.Message) -> dict:
    channel = message.channel
    author = message.author

    # Determine channel name safely for DMs vs guild channels
    if isinstance(channel, discord.DMChannel):
        recipient = getattr(channel, "recipient", None)
        rec_name = getattr(recipient, "name", None)
        channel_name = f"DM from {rec_name}" if rec_name else "DM"
    else:
        channel_name = getattr(channel, "name", str(channel))

    guild = getattr(message, "guild", None)
    guild_id = guild.id if guild is not None else None

    author_name = getattr(author, "name", "unknown")
    author_id = getattr(author, "id", None)
    channel_id = getattr(channel, "id", None)

    return {
        "id": message.id,
        "recipient": settings.DISCORD_CLIENT_USER_ID,
        "recipient_name": settings.DISCORD_CLIENT_USER_NAME,
        "created_at": str(message.created_at),
        "raw_mentions": message.raw_mentions,
        "author_name": author_name,
        "guild": guild_id,
        "channel_name": channel_name,
        "content": message.content,
        "author": author_id,
        "channel": channel_id,
    }


def index_message(message: discord.Message) -> None:
    """Index a message only if it has not already been added to mongo."""
    message_record = discord_message_collection.find_one({"id": message.id})
    if message_record is None:
        logger.info("Indexing message %s %s", message.id, message.content)
        discord_message_collection.insert_one(format_message(message))
    else:
        logger.debug("Message %s already indexed", message.id)
        logger.debug(message_record)


async def index_channel(channel: discord.TextChannel) -> None:
    """Index all messages in a channel."""
    logger.info("Indexing channel %s", channel)
    messages = await fetch_channel_history(
        channel, discord_channel_collection, "cursor"
    )
    newest_message = None
    for message in messages:
        await asyncio.sleep(0.1)
        index_message(message)
        newest_message = message
    if newest_message is not None:
        update_cursor(
            discord_channel_collection, channel.id, newest_message.id, "cursor"
        )
        logger.info("Newest message: %s", newest_message)


async def next_messages(channel: discord.TextChannel) -> List[discord.Message]:
    """Return messages after the stored cursor for a channel."""
    doc = discord_channel_collection.find_one({"id": channel.id})
    after = None
    if doc:
        cursor = doc.get("cursor")
        if cursor is not None:
            after = channel.get_partial_message(cursor)
    return [m async for m in channel.history(limit=200, oldest_first=True, after=after)]


async def handle_channel(channel: discord.TextChannel) -> None:
    random_sleep = random.randint(1, 10)
    await asyncio.sleep(random_sleep)
    await index_channel(channel)


async def handle_message(message: discord.Message) -> None:
    logger.debug("Received message %s", message.id)
    index_message(message)


run_discord_service(
    service_name="discord_indexer",
    channel_handler=handle_channel,
    message_handler=handle_message,
)
