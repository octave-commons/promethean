# SPDX-License-Identifier: GPL-3.0-only
"""Utilities for consistent WebSocket handling across services."""

from typing import Awaitable, Callable
from functools import wraps
from fastapi import WebSocket, WebSocketDisconnect

WebSocketHandler = Callable[[WebSocket], Awaitable[None]]


def websocket_endpoint(func: WebSocketHandler) -> WebSocketHandler:
    """Wrap a WebSocket endpoint to handle accept, disconnect, and close."""

    @wraps(func)
    async def wrapper(ws: WebSocket, *args, **kwargs):
        await ws.accept()
        try:
            return await func(ws, *args, **kwargs)
        except WebSocketDisconnect:
            pass
        finally:
            if not ws.client_state.name == "CLOSED":
                await ws.close()

    return wrapper
