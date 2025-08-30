"""
Load and manage OpenVINO Whisper models.

The :class:`ModelManager` encapsulates the tokeniser and compiled models.  Models
are loaded lazily on first use.  Because the OpenVINO runtime is not
available in this environment, these methods currently raise
``NotImplementedError``.  When running on actual hardware, install
``openvino`` and implement the ``_load_models`` method accordingly.
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Dict, Optional

import numpy as np
from transformers import WhisperTokenizer

from .config import Config

LOGGER = logging.getLogger(__name__)


class ModelManager:
    """Manage the Whisper tokenizer and OpenVINO models."""

    def __init__(
        self, config: Config, tokenizer_name: str = "openai/whisper-medium"
    ) -> None:
        self.config = config
        self.tokenizer = WhisperTokenizer.from_pretrained(tokenizer_name)
        self._encoder = None
        self._cross_kv = None
        self._decoder = None

    def _load_models(self) -> None:
        """Internal helper to load and compile models.

        Raises
        ------
        NotImplementedError
            If running in an environment without OpenVINO runtime.
        """
        raise NotImplementedError(
            "OpenVINO runtime is required to load models; please implement _load_models()."
        )

    @property
    def encoder(self):
        if self._encoder is None:
            self._load_models()
        return self._encoder

    @property
    def cross_kv(self):
        if self._cross_kv is None:
            self._load_models()
        return self._cross_kv

    @property
    def decoder(self):
        if self._decoder is None:
            self._load_models()
        return self._decoder

    def run_encoder(self, mel: np.ndarray) -> Dict[str, np.ndarray]:
        """Run the encoder on a mel spectrogram and return encoder outputs.

        Parameters
        ----------
        mel: np.ndarray
            A mel spectrogram with shape ``(n_mels, n_frames)``.

        Returns
        -------
        Dict[str, np.ndarray]
            A mapping of output names to numpy arrays.
        """
        if self._encoder is None:
            self._load_models()
        raise NotImplementedError("run_encoder requires OpenVINO runtime")

    def run_cross_kv(self, encoded: Dict[str, np.ndarray]) -> Dict[str, np.ndarray]:
        """Run the cross‑kv model to produce key/value pairs for the decoder."""
        if self._cross_kv is None:
            self._load_models()
        raise NotImplementedError("run_cross_kv requires OpenVINO runtime")

    def run_decoder_step(
        self,
        input_ids: np.ndarray,
        attention_mask: np.ndarray,
        position_ids: np.ndarray,
        encoder_kv: Dict[str, np.ndarray],
        past_kv: Dict[str, np.ndarray],
    ) -> np.ndarray:
        """Run a single decoder step.

        Returns the logits for the current position.
        """
        if self._decoder is None:
            self._load_models()
        raise NotImplementedError("run_decoder_step requires OpenVINO runtime")
