from __future__ import annotations

import os
from typing import List

import requests
from chromadb.utils.embedding_functions import EmbeddingFunction


class EmbeddingServiceClient(EmbeddingFunction):
    """Chromadb embedding function that forwards to the embedding service."""

    def __init__(
        self,
        url: str | None = None,
        driver: str | None = None,
        function: str | None = None,
    ):
        self.url = url or os.environ.get(
            "EMBEDDING_SERVICE_URL", "http://localhost:8000/embed"
        )
        self.driver = driver or os.environ.get("EMBEDDING_DRIVER")
        self.function = function or os.environ.get("EMBEDDING_FUNCTION")

    def __call__(self, texts: List[str]) -> List[List[float]]:  # type: ignore[override]
        items = [
            (
                {"type": "image_url", "data": t[4:]}
                if t.startswith("img:")
                else {"type": "text", "data": t}
            )
            for t in texts
        ]
        payload: dict = {"items": items}
        if self.driver:
            payload["driver"] = self.driver
        if self.function:
            payload["function"] = self.function
        response = requests.post(self.url, json=payload, timeout=30)
        response.raise_for_status()
        return response.json()["embeddings"]
