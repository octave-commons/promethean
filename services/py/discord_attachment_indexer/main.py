"""Scan Discord history for attachments and add their metadata to message documents."""



"""Discord attachment indexing service.

This module scans Discord history for attachments and records their metadata in
the message documents stored in MongoDB.
"""
import hy
import asyncio
import logging
import os
import random

import discord

from shared.py import settings
from shared.py.mongodb import discord_channel_collection
from shared.py.heartbeat_broker import start_broker_heartbeat
from shared.py.utils.discord import (
    fetch_channel_history,
    shuffle_array,
    update_cursor,
)
from shared.py.utils.discord_attachment import index_attachments

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

AGENT_NAME = os.environ.get("AGENT_NAME", "duck")
logger.info("Discord attachment indexer running for %s", AGENT_NAME)

intents = discord.Intents.default()
intents.message_content = True
client = discord.Client(intents=intents)

# Heartbeat state guarded to avoid NameError during import/tests
_hb_started = False
_hb_ctx = None


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
        return  # Nothing to index

    logger.info(
        "Indexing attachments for message %s: %s",
        message.id,
        [a["filename"] for a in attachments],
    )
    discord_message_collection.update_one(
        {"id": message.id}, {"$set": {"attachments": attachments}}
    )


async def index_channel(channel: discord.TextChannel) -> None:
    """Index all attachments in a channel's history.

    Messages are fetched starting from the last stored ``attachment_cursor``. For
    each message, any attachments are recorded, and the cursor is updated to the
    most recent processed message so that subsequent runs resume from the latest
    point.
    """

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


@client.event
async def on_ready():
    """Start heartbeat and iterate through channels indexing attachments.

    When the Discord client becomes ready we establish a broker heartbeat so the
    service can be monitored. The task then continuously shuffles through all
    channels and calls :func:`index_channel` for each text channel, sleeping a
    random amount between iterations to avoid hitting rate limits.
    """

    global _hb_started, _hb_ctx
    if not _hb_started:
        try:
            _hb_ctx = await start_broker_heartbeat(
                service_id=os.environ.get(
                    "PM2_PROCESS_NAME", "discord_attachment_indexer"
                )
            )
            _hb_started = True
        except Exception as e:
            logger.error(
                "[discord_attachment_indexer] failed to start broker heartbeat: %s",
                e,
            )

    logger.info("Attachment indexing loop started")
    while True:
        for channel in shuffle_array(list(client.get_all_channels())):
            if isinstance(channel, discord.TextChannel):
                await asyncio.sleep(random.randint(1, 10))
                await index_channel(channel)


async def handle_message(message: discord.Message) -> None:
    index_attachments(message)


if __name__ == "__main__":
    token = os.environ.get("DISCORD_TOKEN")
    if token:
        client.run(token)
    else:
        logger.warning(
            "DISCORD_TOKEN not set; not starting discord client (import-only mode)"
        )
