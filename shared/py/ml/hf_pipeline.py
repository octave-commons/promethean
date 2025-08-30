"""HuggingFace pipeline utilities."""

from typing import Any, Dict, Optional

try:
    from transformers import pipeline, Pipeline
except ImportError:
    raise ImportError(
        "HuggingFace transformers not installed. Install with: pip install shared-hf[hf]"
    )


def create_pipeline(
    task: Any, model: Optional[Any] = None, device: Optional[Any] = None, **kwargs: Any
) -> Pipeline:
    """Create a HuggingFace pipeline with common configuration."""
    return pipeline(task=task, model=model, device=device, **kwargs)
