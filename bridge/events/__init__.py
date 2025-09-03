# SPDX-License-Identifier: GPL-3.0-only
"""Event name constants loaded from events.json."""

from enum import Enum
import json
from pathlib import Path

_EVENTS_PATH = Path(__file__).with_name("events.json")
with _EVENTS_PATH.open(encoding="utf-8") as f:
    _DATA = json.load(f)


class Event(str, Enum):
    STT_INPUT = _DATA["STT_INPUT"]["name"]
    STT_OUTPUT = _DATA["STT_OUTPUT"]["name"]
    CEPHALON_ROUTE = _DATA["CEPHALON_ROUTE"]["name"]
    TTS_OUTPUT = _DATA["TTS_OUTPUT"]["name"]


# Direct access to string values
STT_INPUT = Event.STT_INPUT.value
STT_OUTPUT = Event.STT_OUTPUT.value
CEPHALON_ROUTE = Event.CEPHALON_ROUTE.value
TTS_OUTPUT = Event.TTS_OUTPUT.value

# Mapping from event enum name to associated protocol key (if any)
EVENT_TO_PROTOCOL = {key: value.get("protocol") for key, value in _DATA.items()}

__all__ = [
    "Event",
    "STT_INPUT",
    "STT_OUTPUT",
    "CEPHALON_ROUTE",
    "TTS_OUTPUT",
    "EVENT_TO_PROTOCOL",
]
