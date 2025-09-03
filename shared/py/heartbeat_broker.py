# SPDX-License-Identifier: GPL-3.0-only
"""Broker-tied heartbeat helper for Python services.

This publishes heartbeat events using the canonical BrokerClient so that
heartbeats stop when the broker connection is unavailable.

Preferred usage is via `shared.py.service_template.start_service(..., enable_heartbeat=True)`.
This module exists for services that don't use the template (e.g., Discord indexers).
"""

from __future__ import annotations

import asyncio
import os
from typing import Tuple

from shared.py.broker_client import BrokerClient


async def start_broker_heartbeat(
    service_id: str,
    interval: float = float(os.environ.get("HEARTBEAT_INTERVAL", "3")),
) -> Tuple[BrokerClient, asyncio.Task]:
    """Connect a BrokerClient and start an async heartbeat loop.

    Returns a tuple of (client, task).
    The caller is responsible for cancelling/awaiting the task on shutdown.
    """

    client = BrokerClient(client_id=service_id)
    await client.connect()

    name = os.environ.get("PM2_PROCESS_NAME", service_id)
    pid = os.getpid()

    async def loop():
        while True:
            try:
                await client.publish("heartbeat", {"pid": pid, "name": name})
            except Exception as e:  # pragma: no cover - best-effort logging
                print(f"[{service_id}] heartbeat publish failed: {e}")
            await asyncio.sleep(interval)

    task = asyncio.create_task(loop())
    return client, task
