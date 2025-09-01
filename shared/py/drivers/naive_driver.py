from functools import lru_cache
from typing import List, Any

from .base import EmbeddingDriver


# 256 dimensions map neatly to byte values, offering a simple default size
# for character-frequency embeddings while remaining lightweight for tests.
VECTOR_SIZE = 256


class NaiveDriver(EmbeddingDriver):
    """Very small embedding driver for testing."""

    def list_functions(self) -> List[str]:
        return ["simple", "length"]

    @lru_cache(maxsize=1)
    def load(self, fn: str) -> Any:  # pylint: disable=unused-argument
        if fn not in self.list_functions():
            raise ValueError(f"Unknown naive function {fn}")
        return fn

    def embed(self, items: List[dict], fn: str, model: Any) -> List[List[float]]:
        func = self.load(fn)

        def get_data(item):
            return item["data"] if isinstance(item, dict) else item.data

        if func == "simple":
            return [self._simple(get_data(item)) for item in items]
        if func == "length":
            return [self._length(get_data(item)) for item in items]
        raise ValueError(f"Unknown naive function {fn}")

    def _simple(self, text: str) -> List[float]:
        """Return a normalized character-frequency vector.

        Each character's Unicode code point maps to an index via
        ``ord(ch) % VECTOR_SIZE``. Counts are accumulated and the vector is
        L2-normalized to unit length.
        """
        vec = [0.0] * VECTOR_SIZE
        for ch in text:
            vec[ord(ch) % VECTOR_SIZE] += 1.0
        norm = sum(v * v for v in vec) ** 0.5
        return [(v / norm) if norm else 0.0 for v in vec]

    def _length(self, text: str) -> List[float]:
        return [float(len(text))]
