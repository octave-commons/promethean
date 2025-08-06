"""Protocol manifest loader."""

import json
from pathlib import Path

_MANIFEST_PATH = Path(__file__).with_name("manifest.json")
with _MANIFEST_PATH.open(encoding="utf-8") as f:
    PROTOCOLS = json.load(f)

__all__ = ["PROTOCOLS"]
