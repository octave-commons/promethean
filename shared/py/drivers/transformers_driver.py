# SPDX-License-Identifier: GPL-3.0-only
from functools import lru_cache
from typing import List, Any

from sentence_transformers import SentenceTransformer

from .base import EmbeddingDriver


class TransformersDriver(EmbeddingDriver):
    """Driver backed by sentence-transformers."""

    def list_functions(self) -> List[str]:
        return ["sentence-transformers/all-MiniLM-L6-v2", "clip-ViT-B-32"]

    @lru_cache(maxsize=1)
    def load(self, fn: str) -> SentenceTransformer:
        return SentenceTransformer(fn)

    def embed(
        self, items: List[dict], fn: str, model: SentenceTransformer
    ) -> List[List[float]]:
        texts: List[str] = []
        for item in items:
            item_type = item["type"] if isinstance(item, dict) else item.type
            data = item["data"] if isinstance(item, dict) else item.data
            if item_type == "text":
                texts.append(data)
            elif item_type == "image_url":
                import requests
                from PIL import Image
                from io import BytesIO

                response = requests.get(data, timeout=30)
                response.raise_for_status()
                img = Image.open(BytesIO(response.content))
                texts.append(img)
            else:
                raise ValueError(f"Unsupported item type {item_type}")
        return model.encode(texts).tolist()
