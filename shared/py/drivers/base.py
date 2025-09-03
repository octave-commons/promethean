# SPDX-License-Identifier: GPL-3.0-only
from abc import ABC, abstractmethod
from typing import List, Any


class EmbeddingDriver(ABC):
    """Base interface for embedding drivers."""

    @abstractmethod
    def list_functions(self) -> List[str]:
        """Return available embedding function names."""

    @abstractmethod
    def load(self, fn: str) -> Any:
        """Load resources for the given embedding function."""

    @abstractmethod
    def embed(self, items: List[dict], fn: str, model: Any) -> List[List[float]]:
        """Generate embeddings for the provided items."""
