"""Shared utility functions used across Promethean services."""

import random

from .websocket import websocket_endpoint


def shuffle_array(array):
    """Shuffle an array in place and return it."""
    random.shuffle(array)
    return array


__all__ = ["websocket_endpoint", "shuffle_array"]
