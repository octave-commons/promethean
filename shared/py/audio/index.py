"""Audio processing utilities."""

import numpy as np
from typing import Tuple, Optional

try:
    import soundfile as sf
except ImportError:
    raise ImportError(
        "Audio lite dependencies not installed. Install with: pip install shared-audio[lite]"
    )


def load_audio(
    file_path: str, sample_rate: Optional[int] = None
) -> Tuple[np.ndarray, int]:
    """Load audio file and return audio data and sample rate."""
    audio, sr = sf.read(file_path)

    if sample_rate and sr != sample_rate:
        try:
            import soxr

            audio = soxr.resample(audio, sr, sample_rate)
            sr = sample_rate
        except ImportError:
            raise ImportError(
                "Resampling requires soxr. Install with: pip install shared-audio[lite]"
            )

    return audio, sr


def save_audio(file_path: str, audio: np.ndarray, sample_rate: int) -> None:
    """Save audio data to file."""
    sf.write(file_path, audio, sample_rate)
