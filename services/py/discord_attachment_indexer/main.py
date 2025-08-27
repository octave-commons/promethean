"""
Scan Discord history for attachments and add their metadata to message documents.
"""

import hy
import asyncio
import random
import logging

import discord

from shared.py.mongodb import discord_message_collection, discord_channel_collection
from shared.py.utils.discord import fetch_channel_history, update_cursor
from shared.py.discord_service import run_discord_service

logger = logging.getLogger("discord_attachment_indexer")


def format_attachment(attachment: discord.Attachment) -> dict:
    return {
        "id": attachment.id,
        "filename": attachment.filename,
        "size": attachment.size,
        "url": attachment.url,
        "content_type": attachment.content_type,
    }


def index_attachments(message: discord.Message) -> None:
    attachments = [format_attachment(a) for a in message.attachments]
    if not attachments:
        return
    logger.info(
        "Indexing attachments for message %s: %s",
        message.id,
        [a["filename"] for a in attachments],
    )
    discord_message_collection.update_one(
        {"id": message.id}, {"$set": {"attachments": attachments}}
    )


async def index_channel(channel: discord.TextChannel) -> None:
    newest_message = None
    for message in await fetch_channel_history(
        channel, discord_channel_collection, "attachment_cursor"
    ):
        await asyncio.sleep(0.1)
        newest_message = message
        index_attachments(message)
    if newest_message is not None:
        update_cursor(
            discord_channel_collection,
            channel.id,
            newest_message.id,
            "attachment_cursor",
        )


async def handle_channel(channel: discord.TextChannel) -> None:
    random_sleep = random.randint(1, 10)
    await asyncio.sleep(random_sleep)
    await index_channel(channel)


async def handle_message(message: discord.Message) -> None:
    index_attachments(message)


run_discord_service(
    service_name="discord_attachment_indexer",
    channel_handler=handle_channel,
    message_handler=handle_message,
)
