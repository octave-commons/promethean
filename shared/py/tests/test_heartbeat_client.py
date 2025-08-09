import asyncio
import json
import os
import threading
import sys

import websockets

sys.path.insert(
    0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
)

from shared.py import heartbeat_client


async def handler(_websocket):
    pass


def test_send_once(monkeypatch):
    sent = {}

    class DummyConn:
        open = True

        def __init__(self, url):
            self.url = url

        def send(self, msg):
            sent.update(json.loads(msg))

        def close(self):
            pass

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

    monkeypatch.setattr(heartbeat_client, "connect", lambda url: DummyConn(url))

    client = heartbeat_client.HeartbeatClient(url="ws://example", pid=1234, name="test")
    client.send_once()

    assert sent["action"] == "publish"
    assert sent["message"]["payload"] == {"pid": 1234, "name": "test"}
