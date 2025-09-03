# SPDX-License-Identifier: GPL-3.0-only
import asyncio
import sys
import types
from types import SimpleNamespace

# Provide a minimal FastAPI stub so the websocket utilities can import.
fastapi_stub = types.ModuleType("fastapi")


class WebSocket:  # pragma: no cover - placeholder for type compatibility
    pass


class WebSocketDisconnect(Exception):
    pass


setattr(fastapi_stub, "WebSocket", WebSocket)
setattr(fastapi_stub, "WebSocketDisconnect", WebSocketDisconnect)
sys.modules.setdefault("fastapi", fastapi_stub)

from shared.py.utils import websocket as ws_utils

websocket_endpoint = ws_utils.websocket_endpoint


class DummyWebSocket:
    def __init__(self):
        self.accepted = False
        self.closed = False
        self.close_calls = 0
        self.client_state = SimpleNamespace(name="CONNECTED")

    async def accept(self):
        self.accepted = True

    async def close(self):
        self.closed = True
        self.close_calls += 1
        self.client_state.name = "CLOSED"


def test_websocket_endpoint_handles_lifecycle():
    @websocket_endpoint
    async def handler(ws):
        return "ok"

    ws = DummyWebSocket()
    result = asyncio.run(handler(ws))
    assert result == "ok"
    assert ws.accepted
    assert ws.closed
    assert ws.close_calls == 1


def test_websocket_endpoint_swallows_disconnect():
    @websocket_endpoint
    async def handler(ws):
        raise ws_utils.WebSocketDisconnect()

    ws = DummyWebSocket()
    asyncio.run(handler(ws))
    assert ws.accepted
    assert ws.closed
    assert ws.close_calls == 1


def test_websocket_endpoint_does_not_double_close():
    @websocket_endpoint
    async def handler(ws):
        await ws.close()

    ws = DummyWebSocket()
    asyncio.run(handler(ws))
    assert ws.accepted
    assert ws.closed
    assert ws.close_calls == 1
