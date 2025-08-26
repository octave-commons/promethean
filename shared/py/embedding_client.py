from __future__ import annotations

import os
import time
import logging
from typing import Any, Dict, List, Union

import requests
from chromadb.utils.embedding_functions import EmbeddingFunction


logger = logging.getLogger(__name__)


class EmbeddingServiceClient(EmbeddingFunction):
    """Chromadb embedding function that forwards requests to the embedding service.

    Items passed to this client may be either plain strings, which are treated as
    text, or dictionaries containing explicit ``{"type", "data"}`` pairs. The
    following formats are supported:

    - ``"some text"`` → ``{"type": "text", "data": "some text"}``
    - ``{"type": "image_url", "data": "https://example.com"}``

    Additional item types may be forwarded to the service as-is.
    """

    def __init__(
        self,
        url: str | None = None,
        driver: str | None = None,
        function: str | None = None,
    ):
        self.url: str = (
            url
            if url is not None
            else os.environ.get("EMBEDDING_SERVICE_URL", "http://localhost:8000/embed")
        )
        self.driver = driver or os.environ.get("EMBEDDING_DRIVER")
        self.function = function or os.environ.get("EMBEDDING_FUNCTION")

    def __call__(
        self, texts: List[Union[str, Dict[str, str]]]
    ) -> List[List[float]] | Dict[str, Any]:
        """Generate embeddings for the provided items.

        Each item may be a plain string or a dictionary with ``{"type", "data"}``
        keys. Plain strings are normalised to ``{"type": "text", "data": s}``.
        """

        items = [
            t if isinstance(t, dict) else {"type": "text", "data": t} for t in texts
        ]
        payload: dict = {"items": items}
        if self.driver:
            payload["driver"] = self.driver
        if self.function:
            payload["function"] = self.function

        for attempt in range(3):
            try:
                response = requests.post(self.url, json=payload, timeout=30)
                response.raise_for_status()
                try:
                    data = response.json()
                except ValueError as e:
                    logger.exception("Failed to decode embedding service response")
                    return {"error": "invalid_json", "detail": str(e)}
                embeddings = data.get("embeddings") if isinstance(data, dict) else None
                if embeddings is None:
                    logger.error(
                        "Embedding service response missing 'embeddings': %s", data
                    )
                    return {"error": "missing_embeddings", "detail": data}
                return embeddings
            except requests.RequestException as e:
                logger.warning(
                    "Embedding request failed (attempt %d/3): %s", attempt + 1, e
                )
                if attempt < 2:
                    time.sleep(2**attempt)
                else:
                    logger.exception("Embedding request failed after retries")
                    return {"error": "request_failed", "detail": str(e)}

        return {"error": "unknown"}
