import importlib
from typing import Any, cast

import numpy as np


class WhisperStreamer:
    """Stream transcription using the openai-whisper library."""

    def __init__(self, model_size: str = "tiny") -> None:
        """Load the chosen model size."""
        self.model_size = model_size
        whisper = importlib.import_module("whisper")
        self.model = cast(Any, whisper).load_model(model_size)

    def transcribe_chunks(self, chunks, sample_rate: int = 16000):
        """Yield transcripts for each pcm chunk provided."""
        buffer = bytearray()
        for chunk in chunks:
            buffer.extend(chunk)
            audio = np.frombuffer(buffer, np.int16).astype(np.float32) / 32768.0
            result = self.model.transcribe(
                audio, language="en", task="transcribe", fp16=False
            )
            yield result.get("text", "")
