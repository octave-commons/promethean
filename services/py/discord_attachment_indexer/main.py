"""
Scan Discord history for attachments and add their metadata to message documents.
"""

import hy
import os
import sys
import asyncio
import random
from typing import List

import discord

# sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../../"))
from shared.py import settings
from shared.py.mongodb import discord_message_collection, discord_channel_collection
from shared.py.heartbeat_broker import start_broker_heartbeat
from shared.py.utils.discord import (
    fetch_channel_history,
    shuffle_array,
    update_cursor,
)

AGENT_NAME = os.environ.get("AGENT_NAME", "duck")
print(f"Discord attachment indexer running for {AGENT_NAME}")
intents = discord.Intents.default()
client = discord.Client(intents=intents)
intents.message_content = True

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
        return
        _hy_anon_var_1 = None
    else:
        _hy_anon_var_1 = None
    print(
        f"Indexing attachments for message {message.id}: {[a['filename'] for a in attachments]}"
    )
    return discord_message_collection.update_one(
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


@client.event
async def on_ready():
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
            print(f"[discord_attachment_indexer] failed to start broker heartbeat: {e}")

    print("hola")
    while True:
        for channel in shuffle_array(list(client.get_all_channels())):
            if isinstance(channel, discord.TextChannel):
                random_sleep = random.randint(1, 10)
                await asyncio.sleep(random_sleep)
                _hy_anon_var_7 = await index_channel(channel)
            else:
                _hy_anon_var_7 = None


@client.event
async def on_message(message):
    return index_attachments(message)


client.run(settings.DISCORD_TOKEN)
