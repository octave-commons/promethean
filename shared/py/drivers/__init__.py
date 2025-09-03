# SPDX-License-Identifier: GPL-3.0-only
from .base import EmbeddingDriver
from .naive_driver import NaiveDriver

DRIVERS: dict[str, EmbeddingDriver] = {"naive": NaiveDriver()}

try:  # Optional: only register if dependency is available
    from .transformers_driver import TransformersDriver

    DRIVERS["transformers"] = TransformersDriver()
except Exception:  # pragma: no cover - missing heavy deps
    pass

try:
    from .ollama_driver import OllamaDriver

    DRIVERS["ollama"] = OllamaDriver()
except Exception:  # pragma: no cover
    pass


def get_driver(name: str) -> EmbeddingDriver:
    try:
        return DRIVERS[name]
    except KeyError as exc:
        raise ValueError(f"Unknown driver {name}") from exc
