from __future__ import annotations

"""Shared helper for building Discord services.

This module centralizes Discord client setup, environment handling, logging,
heartbeat management, and channel iteration so individual services can remain
focused on their domain logic.
"""

import asyncio
import logging
import os
from typing import Awaitable, Callable, Optional

import discord
from dotenv import load_dotenv

from shared.py import settings
from shared.py.heartbeat_broker import start_broker_heartbeat
from shared.py.utils.discord import shuffle_array

load_dotenv()


def _configure_logger(name: str) -> logging.Logger:
    """Configure and return a logger for the service."""
    logging.basicConfig(level=os.environ.get("LOG_LEVEL", "INFO"))
    return logging.getLogger(name)


def create_discord_client(
    service_name: str,
    channel_handler: Optional[Callable[[discord.TextChannel], Awaitable[None]]] = None,
    message_handler: Optional[Callable[[discord.Message], Awaitable[None]]] = None,
) -> discord.Client:
    """Create a configured Discord client.

    Parameters
    ----------
    service_name:
        Identifier used for heartbeat logging and logger naming.
    channel_handler:
        Coroutine invoked for every ``TextChannel`` in the guild on a
        background loop.
    message_handler:
        Coroutine invoked for every message event.
    """

    intents = discord.Intents.default()
    intents.message_content = True
    client = discord.Client(intents=intents)
    logger = _configure_logger(service_name)

    _hb_started = False
    _hb_ctx = None

    @client.event
    async def on_ready():
        nonlocal _hb_started, _hb_ctx
        if not _hb_started:
            try:
                _hb_ctx = await start_broker_heartbeat(
                    service_id=os.environ.get("PM2_PROCESS_NAME", service_name)
                )
                _hb_started = True
                logger.info("heartbeat started")
            except Exception as e:  # pragma: no cover - best effort
                logger.error(f"failed to start broker heartbeat: {e}")

        if channel_handler:
            while True:
                for channel in shuffle_array(list(client.get_all_channels())):
                    if isinstance(channel, discord.TextChannel):
                        try:
                            await channel_handler(channel)
                        except Exception as e:  # pragma: no cover - service-level
                            logger.error(f"error processing channel {channel}: {e}")

    if message_handler:

        @client.event
        async def on_message(message: discord.Message):
            try:
                await message_handler(message)
            except Exception as e:  # pragma: no cover - service-level
                logger.error(f"error handling message {message.id}: {e}")

    return client


def run_discord_service(
    service_name: str,
    channel_handler: Optional[Callable[[discord.TextChannel], Awaitable[None]]] = None,
    message_handler: Optional[Callable[[discord.Message], Awaitable[None]]] = None,
) -> None:
    """Create and run a Discord service with the given callbacks."""

    client = create_discord_client(
        service_name=service_name,
        channel_handler=channel_handler,
        message_handler=message_handler,
    )
    logger = logging.getLogger(service_name)
    logger.info("%s running for %s", service_name, settings.AGENT_NAME)
    client.run(settings.DISCORD_TOKEN)
