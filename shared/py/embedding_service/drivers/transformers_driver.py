from functools import lru_cache
from typing import List, Any, Union
from PIL.Image import Image as PILImage

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
        self, items: List[dict[str, Any]], fn: str, model: SentenceTransformer
    ) -> List[List[float]]:
        texts: List[Union[str, PILImage]] = []
        for item in items:
            item_type = item.get("type")
            data = item.get("data")
            if item_type == "text":
                # ensure text is str for the model
                if isinstance(data, str):
                    texts.append(data)
                else:
                    raise ValueError("Expected 'data' to be str when type=='text'")
            elif item_type == "image_url":
                import requests
                from PIL import Image
                from io import BytesIO

                if not isinstance(data, str):
                    raise ValueError(
                        "Expected 'data' to be URL string when type=='image_url'"
                    )
                response = requests.get(data, timeout=30)
                response.raise_for_status()
                img = Image.open(BytesIO(response.content))
                texts.append(img)
            else:
                raise ValueError(f"Unsupported item type {item_type}")
        # SentenceTransformer.encode can handle mixed str/Image inputs for multimodal models
        return model.encode(texts).tolist()
