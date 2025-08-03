"""
Crawl through discord history and fill in all messages that are not getting processed in real time.
"""

# from dotenv import load_dotenv
# load_dotenv()

import os

import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../../"))

import asyncio
import random
import traceback
from typing import List
import discord
from shared.py import settings
from shared.py.mongodb import discord_message_collection, discord_channel_collection

print(f"Discord indexer running for {settings.AGENT_NAME}")


intents = discord.Intents.default()
client = discord.Client(intents=intents)
intents.message_content = True


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


def setup_channel(channel_id) -> None:
    """
    Setup a channel for indexing.
    """
    print(f"Setting up channel {channel_id}")
    discord_channel_collection.insert_one({"id": channel_id, "cursor": None})


def update_cursor(message: discord.Message) -> None:
    """
    Update the cursor for a channel.
    """
    print(f"Updating cursor for channel {message.channel.id} to {message.id}")
    discord_channel_collection.update_one(
        {"id": message.channel.id}, {"$set": {"cursor": message.id}}
    )


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


def find_channel_record(channel_id):
    """
    Find the record for a channel.
    """
    print(f"Finding channel record for {channel_id}")
    record = discord_channel_collection.find_one({"id": channel_id})
    if record is None:
        print(f"No record found for {channel_id}")
        setup_channel(channel_id)
        record = discord_channel_collection.find_one({"id": channel_id})
    else:
        print(f"Found channel record for {channel_id}")
    print(f"Channel record: {record}")
    return record


async def next_messages(channel: discord.TextChannel) -> List[discord.Message]:
    """
    Get the next batch of messages in a channel.
    """
    channel_record = find_channel_record(channel.id)
    print(f"Cursor: {channel_record['cursor']}")
    print(f"Getting history for {channel_record}")

    if not channel_record.get("is_valid", True):
        print(f"Channel {channel_record['id']} is not valid")
        return []
    if channel_record["cursor"] is None:
        print(f"No cursor found for {channel_record['id']}")
        try:
            return [
                message
                async for message in channel.history(limit=200, oldest_first=True)
            ]
        # mark channel as invalid if there is an error
        except Exception as e:
            print(f"Error getting history for {channel_record['id']}")
            print(e)
            discord_channel_collection.update_one(
                {"id": channel_record["id"]}, {"$set": {"is_valid": False}}
            )
            return []
    else:
        print(f"Cursor found for {channel} {channel_record['cursor']}")
        try:
            return [
                message
                async for message in channel.history(
                    limit=200,
                    oldest_first=True,
                    after=channel.get_partial_message(channel_record["cursor"]),
                )
            ]
        except AttributeError as e:
            print(f"Attribute error for {channel.id}")
            print(e)
            return []


async def index_channel(channel: discord.TextChannel) -> None:
    """
    Index all messages in a channel.
    """
    newest_message = None
    print(f"Indexing channel {channel}")
    for message in await next_messages(channel):
        await asyncio.sleep(0.1)
        newest_message = message
        index_message(message)
    if newest_message is not None:
        update_cursor(newest_message)
    print(f"Newest message: {newest_message}")


def shuffle_array(array):
    """
    Shuffle an array.
    """
    import random

    random.shuffle(array)
    return array


@client.event
async def on_ready():
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
