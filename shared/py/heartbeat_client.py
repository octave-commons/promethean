"""Utilities for sending periodic heartbeats via the message broker.

This module provides a small :class:`HeartbeatClient` class that can be reused
by other services. It uses the ``websockets`` package to publish heartbeat
messages to the broker.
"""

from __future__ import annotations

import json
import os
import threading
from dataclasses import dataclass
import time
import os
import signal
from typing import Optional

from websockets.sync.client import connect

BROKER_PORT = os.environ.get("BROKER_PORT", 7000)


@dataclass
class HeartbeatClient:
    """Send PID heartbeats to the broker.

    Parameters
    ----------
    url:
        Fully qualified WebSocket URL of the broker.
    pid:
        Process identifier to report. Defaults to ``os.getpid()``.
    name:
        Name of the process, taken from ``PM2_PROCESS_NAME`` if not provided.
    interval:
        Seconds between heartbeats when :meth:`start` is used.
    """

    url: str = f"ws://127.0.0.1:{BROKER_PORT}"
    pid: int = os.getpid()
    name: str = os.environ.get("PM2_PROCESS_NAME", "")
    interval: float = 3.0
    max_misses: int = int(os.environ.get("HEARTBEAT_MAX_MISSES", 5))
    fatal_on_miss: bool = os.environ.get("HEARTBEAT_FATAL_ON_MISS", "true").lower() in (
        "1",
        "true",
        "yes",
    )

    _thread: Optional[threading.Thread] = None
    _stop: threading.Event = threading.Event()
    _ws: Optional[object] = None
    _misses: int = 0
    _last_ok: float = 0.0

    def _ensure(self) -> None:
        if self._ws and getattr(self._ws, "open", False):
            return
        if connect is None:
            raise RuntimeError("websockets package is required for heartbeats")
        self._ws = connect(self.url)

    def send_once(self) -> None:
        """Send a single heartbeat."""

        if not self.name:
            raise RuntimeError("process name required for heartbeats")
        self._ensure()
        msg = {
            "action": "publish",
            "message": {
                "type": "heartbeat",
                "payload": {"pid": self.pid, "name": self.name},
            },
        }
        self._ws.send(json.dumps(msg))
        # mark success
        self._misses = 0
        self._last_ok = time.time()

    def _run(self) -> None:
        while not self._stop.is_set():
            try:
                self.send_once()
            except Exception:
                # record miss
                self._misses += 1
                if self.fatal_on_miss and self._misses >= self.max_misses:
                    try:
                        # Attempt graceful exit first
                        os.kill(os.getpid(), signal.SIGTERM)
                    except Exception:
                        pass
                    # Fallback hard exit
                    os._exit(1)
            self._stop.wait(self.interval)

    def start(self) -> None:
        """Begin sending heartbeats in a background thread."""

        if self._thread and self._thread.is_alive():
            return
        self._stop.clear()
        self._thread = threading.Thread(target=self._run, daemon=True)
        self._thread.start()

    def stop(self) -> None:
        """Stop the heartbeat thread."""

        self._stop.set()
        if self._thread:
            self._thread.join()
            self._thread = None
        if self._ws:
            try:
                self._ws.close()
            except Exception:
                pass
            self._ws = None
