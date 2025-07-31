"""
High‑level API for running Whisper on NPUs.

This package provides classes for audio pre‑processing, model management and
token decoding (both greedy and beam search).  The goal of the refactor is
to remove side effects at import time, encapsulate state into classes and
parameterise all configurable values.
"""

from .config import Config
from .audio import AudioProcessor
from .models import ModelManager
from .decoder import GreedyDecoder, BeamDecoder
from .post_processing import PostProcessor

__all__ = [
    "Config",
    "AudioProcessor",
    "ModelManager",
    "GreedyDecoder",
    "BeamDecoder",
    "PostProcessor",
]