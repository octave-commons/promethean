import base64
import io
import os
import sys

import numpy as np
import soundfile as sf

sys.path.insert(
    0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../.."))
)

from shared.py.speech.audio_utils import pcm_from_base64, wav_to_base64


def test_pcm_from_base64_roundtrip():
    original = b"\x01\x02\x03\x04"
    encoded = base64.b64encode(original).decode("utf-8")
    decoded = pcm_from_base64(encoded)
    assert decoded == bytearray(original)


def test_wav_to_base64_roundtrip():
    sr = 22050
    # generate 1 second of a sine wave
    t = np.linspace(0, 1, sr, endpoint=False)
    audio = np.sin(2 * np.pi * 440 * t).astype("float32")
    encoded = wav_to_base64(audio, sr)
    decoded = base64.b64decode(encoded)
    recovered, read_sr = sf.read(io.BytesIO(decoded), dtype="float32")
    assert read_sr == sr
    np.testing.assert_allclose(recovered, audio, atol=1e-4)
