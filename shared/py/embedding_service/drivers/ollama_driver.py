from functools import lru_cache
from typing import List, Any

import requests

from .base import EmbeddingDriver


class OllamaDriver(EmbeddingDriver):
    """Driver that proxies to an Ollama server."""

    def __init__(self, url: str | None = None):
        self.url = url or "http://localhost:11434/api/embeddings"

    def list_functions(self) -> List[str]:
        return ["nomic-embed-text", "all-minilm", "chroma/all-minilm-l6-v2-f32"]

    @lru_cache(maxsize=1)
    def load(self, fn: str) -> str:
        return fn

    def embed(
        self, items: List[dict[str, Any]], fn: str, model: Any
    ) -> List[List[float]]:
        embeddings: List[List[float]] = []
        for item in items:
            item_type = item.get("type")
            data = item.get("data")
            if item_type != "text":
                raise ValueError("Ollama driver only supports text inputs")
            if not isinstance(data, str):
                raise ValueError("Expected text data to be a string")
            resp = requests.post(
                self.url,
                json={"model": model, "prompt": data},
                timeout=30,
            )
            resp.raise_for_status()
            embeddings.append(resp.json()["embedding"])
        return embeddings
