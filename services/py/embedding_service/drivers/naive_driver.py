from functools import lru_cache
from typing import List, Any

from .base import EmbeddingDriver


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
        vec = [0.0] * 256
        for ch in text:
            vec[ord(ch) % 256] += 1.0
        norm = sum(v * v for v in vec) ** 0.5
        return [(v / norm) if norm else 0.0 for v in vec]

    def _length(self, text: str) -> List[float]:
        return [float(len(text))]
