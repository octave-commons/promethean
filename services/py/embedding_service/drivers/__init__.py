from .base import EmbeddingDriver
from .naive_driver import NaiveDriver
from .transformers_driver import TransformersDriver
from .ollama_driver import OllamaDriver

DRIVERS = {
    "naive": NaiveDriver(),
    "transformers": TransformersDriver(),
    "ollama": OllamaDriver(),
}


def get_driver(name: str) -> EmbeddingDriver:
    try:
        return DRIVERS[name]
    except KeyError as exc:
        raise ValueError(f"Unknown driver {name}") from exc
