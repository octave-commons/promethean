import base64
import io
from typing import Any


def pcm_from_base64(data: str) -> bytearray:
    """Decode a base64-encoded PCM string into raw bytes."""
    return bytearray(base64.b64decode(data))


def wav_to_base64(audio: Any, sample_rate: int) -> str:
    """Encode audio samples as a base64 WAV string."""
    import soundfile as sf

    buffer = io.BytesIO()
    sf.write(buffer, audio, samplerate=sample_rate, format="WAV")
    return base64.b64encode(buffer.getvalue()).decode("utf-8")
