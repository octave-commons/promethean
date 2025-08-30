"""Embedding utilities using sentence-transformers."""

from typing import List, Union
import numpy as np
from sentence_transformers import SentenceTransformer


def get_embeddings(
    texts: Union[str, List[str]], model_name: str = "all-MiniLM-L6-v2", **kwargs
) -> np.ndarray:
    """Get embeddings for text(s) using sentence-transformers."""
    model = SentenceTransformer(model_name)
    return model.encode(texts, **kwargs)
