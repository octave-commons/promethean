"""Shared utility functions used across Promethean services."""

__all__: list[str] = []

try:  # pragma: no cover - optional dependency
    from .websocket import websocket_endpoint

    __all__.append("websocket_endpoint")
except ModuleNotFoundError:  # FastAPI or other deps might be missing
    pass
