"""Utilities for sending periodic heartbeats to the heartbeat service.

This module provides a small `HeartbeatClient` class that can be reused by
other services. It relies only on Python's standard library so that it can be
embedded in constrained environments.
"""

from __future__ import annotations

import json
import os
import threading
from dataclasses import dataclass
from typing import Optional
from urllib import request

HEARTBEAT_PORT = os.environ.get("HEARTBEAT_PORT", 5000)


@dataclass
class HeartbeatClient:
    """Send PID heartbeats to a heartbeat service.

    Parameters
    ----------
    url:
        Fully qualified URL of the service's `/heartbeat` endpoint.
    pid:
        Process identifier to report. Defaults to ``os.getpid()``.
    interval:
        Seconds between heartbeats when :meth:`start` is used.
    """

    url: str = f"http://127.0.0.1:{HEARTBEAT_PORT}/heartbeat"
    pid: int = os.getpid()
    interval: float = 3.0

    _thread: Optional[threading.Thread] = None
    _stop: threading.Event = threading.Event()

    def send_once(self) -> dict:
        """Send a single heartbeat.

        Returns the parsed JSON response from the service.
        """

        data = json.dumps({"pid": self.pid}).encode("utf-8")
        req = request.Request(
            self.url,
            data=data,
            headers={"Content-Type": "application/json"},
        )
        with request.urlopen(req, timeout=5) as resp:
            body = resp.read()
        return json.loads(body.decode("utf-8"))

    def _run(self) -> None:
        while not self._stop.is_set():
            try:
                self.send_once()
            except Exception:
                # Swallow errors to keep heartbeat loop alive.
                pass
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
