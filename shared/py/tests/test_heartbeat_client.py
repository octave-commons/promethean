import asyncio
import json
import os
import sys
import threading

import websockets

sys.path.insert(
    0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
)

from shared.py.heartbeat_client import HeartbeatClient


def test_send_once():
    received = {}

    async def handler(ws):
        msg = await ws.recv()
        received.update(json.loads(msg))

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    server = loop.run_until_complete(websockets.serve(handler, "127.0.0.1", 0))
    port = server.sockets[0].getsockname()[1]
    thread = threading.Thread(target=loop.run_forever, daemon=True)
    thread.start()

    client = HeartbeatClient(url=f"ws://127.0.0.1:{port}", pid=1234, name="test")
    client.send_once()

    # give the server a moment to receive the message
    loop.call_soon_threadsafe(lambda: None)
    threading.Event().wait(0.1)

    assert received["action"] == "publish"
    assert received["message"]["payload"] == {"pid": 1234, "name": "test"}

    loop.call_soon_threadsafe(server.close)
    loop.call_soon_threadsafe(loop.stop)
    thread.join()
