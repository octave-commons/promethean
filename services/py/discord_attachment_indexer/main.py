"""
Scan Discord history for attachments and add their metadata to message documents.
"""

import os
import sys
import asyncio
import random
from typing import List

import discord

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../../"))

from shared.py import settings
from shared.py.mongodb import discord_message_collection, discord_channel_collection

AGENT_NAME = os.environ.get("AGENT_NAME", "duck")
print(f"Discord attachment indexer running for {AGENT_NAME}")

intents = discord.Intents.default()
client = discord.Client(intents=intents)
intents.message_content = True


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
    print(
        f"Indexing attachments for message {message.id}: {[a['filename'] for a in attachments]}"
    )
    discord_message_collection.update_one(
        {"id": message.id}, {"$set": {"attachments": attachments}}
    )


def setup_channel(channel_id) -> None:
    print(f"Setting up channel {channel_id}")
    discord_channel_collection.insert_one({"id": channel_id, "attachment_cursor": None})


def update_attachment_cursor(message: discord.Message) -> None:
    print(
        f"Updating attachment cursor for channel {message.channel.id} to {message.id}"
    )
    discord_channel_collection.update_one(
        {"id": message.channel.id}, {"$set": {"attachment_cursor": message.id}}
    )


def find_channel_record(channel_id):
    print(f"Finding channel record for {channel_id}")
    record = discord_channel_collection.find_one({"id": channel_id})
    if record is None:
        setup_channel(channel_id)
        record = discord_channel_collection.find_one({"id": channel_id})
    if "attachment_cursor" not in record:
        discord_channel_collection.update_one(
            {"id": channel_id}, {"$set": {"attachment_cursor": None}}
        )
        record["attachment_cursor"] = None
    print(f"Channel record: {record}")
    return record


async def next_messages(channel: discord.TextChannel) -> List[discord.Message]:
    channel_record = find_channel_record(channel.id)
    if not channel_record.get("is_valid", True):
        return []
    cursor = channel_record.get("attachment_cursor")
    try:
        if cursor is None:
            return [
                message
                async for message in channel.history(limit=200, oldest_first=True)
            ]
        else:
            return [
                message
                async for message in channel.history(
                    limit=200,
                    oldest_first=True,
                    after=channel.get_partial_message(cursor),
                )
            ]
    except Exception as e:
        print(f"Error getting history for {channel_record['id']}")
        print(e)
        discord_channel_collection.update_one(
            {"id": channel_record["id"]}, {"$set": {"is_valid": False}}
        )
        return []


async def index_channel(channel: discord.TextChannel) -> None:
    newest_message = None
    for message in await next_messages(channel):
        await asyncio.sleep(0.1)
        newest_message = message
        index_attachments(message)
    if newest_message is not None:
        update_attachment_cursor(newest_message)


def shuffle_array(array):
    random.shuffle(array)
    return array


@client.event
async def on_ready():
    while True:
        for channel in shuffle_array(list(client.get_all_channels())):
            if isinstance(channel, discord.TextChannel):
                random_sleep = random.randint(1, 10)
                await asyncio.sleep(random_sleep)
                await index_channel(channel)


@client.event
async def on_message(message):
    index_attachments(message)


client.run(settings.DISCORD_TOKEN)
