"""
Crawl through discord history and fill in all messages that are not getting processed in real time.
"""

import hy
import os

AGENT_NAME = os.environ.get("AGENT_NAME", "duck")
print(f"Discord indexer running for {AGENT_NAME}")
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../../"))
import asyncio
import random
from typing import List

import discord

from shared.py import settings
from shared.py.mongodb import discord_message_collection, discord_channel_collection
from shared.py.heartbeat_broker import start_broker_heartbeat
from shared.py.utils.discord import (
    fetch_channel_history,
    shuffle_array,
    update_cursor,
)

intents = discord.Intents.default()
client = discord.Client(intents=intents)
intents.message_content = True

_hb_started = False
_hb_ctx = None


def format_message(message):
    channel = message.channel
    author = message.author
    if hasattr(channel, "name"):
        channel_name = channel.name
    else:
        channel_name = f"DM from {channel.recipient.name}"
    return {
        "id": message.id,
        "recipient": settings.DISCORD_CLIENT_USER_ID,
        "recipient_name": settings.DISCORD_CLIENT_USER_NAME,
        "created_at": str(message.created_at),
        "raw_mentions": message.raw_mentions,
        "author_name": author.name,
        "guild": message.guild.id,
        "channel_name": channel_name,
        "content": message.content,
        "author": author.id,
        "channel": channel.id,
    }


def index_message(message: discord.Message) -> None:
    """
    Index a message only if it has not already been added to mongo.
    """
    message_record = discord_message_collection.find_one({"id": message.id})
    if message_record is None:
        print(f"Indexing message {message.id} {message.content}")
        discord_message_collection.insert_one(format_message(message))
    else:
        print(f"Message {message.id} already indexed")
        print(message_record)


async def index_channel(channel: discord.TextChannel) -> None:
    """
    Index all messages in a channel.
    """
    print(f"Indexing channel {channel}")
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
    return print(f"Newest message: {newest_message}")


@client.event
async def on_ready():
    global _hb_started, _hb_ctx
    if not _hb_started:
        # Start broker-tied heartbeat once the loop is running
        try:
            _hb_ctx = await start_broker_heartbeat(
                service_id=os.environ.get("PM2_PROCESS_NAME", "discord_indexer")
            )
            _hb_started = True
        except Exception as e:
            print(f"[discord_indexer] failed to start broker heartbeat: {e}")

    while True:
        for channel in shuffle_array(list(client.get_all_channels())):
            if isinstance(channel, discord.TextChannel):
                print(f"Indexing channel {channel}")
                random_sleep = random.randint(1, 10)
                await asyncio.sleep(random_sleep)
                await index_channel(channel)


@client.event
async def on_message(message):
    print(message)
    index_message(message)


client.run(settings.DISCORD_TOKEN)
