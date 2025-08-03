"""HTTP clients for speech services.

This module provides simple helper functions to communicate with the
speech-to-text (STT) and text-to-speech (TTS) services. They are
extracted from various scripts so other modules can reuse the logic.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, Optional
from urllib.parse import urlencode

import requests
from scipy.io import wavfile


def send_wav_as_pcm(
    file_path: str | Path,
    url: str = "http://localhost:5001/transcribe_pcm",
    query_params: Optional[Dict[str, Any]] = None,
) -> str:
    """Send a 16-bit PCM WAV file to the STT service.

    Parameters
    ----------
    file_path:
        Path to the WAV file to send.
    url:
        Endpoint of the STT service.
    query_params:
        Optional mapping of query parameters to append to the URL.

    Returns
    -------
    str
        Transcription text returned by the service.
    """

    sample_rate, data = wavfile.read(str(file_path))
    if data.dtype != "int16":
        raise ValueError("Only 16-bit PCM WAV files are supported.")

    pcm_data = data.tobytes()
    if query_params:
        url += "?" + urlencode(query_params)

    headers = {
        "Content-Type": "application/octet-stream",
        "X-Sample-Rate": str(sample_rate),
        "X-Dtype": "int16",
    }

    response = requests.post(url, data=pcm_data, headers=headers)
    response.raise_for_status()
    return response.json().get("transcription", "")


def synthesize_text_to_file(
    text: str,
    output_path: str | Path,
    url: str = "http://localhost:5000/synth_voice",
) -> Path:
    """Request speech synthesis and save the audio to ``output_path``.

    Parameters
    ----------
    text:
        Text to synthesize.
    output_path:
        Location where the resulting WAV file will be written.
    url:
        Endpoint of the TTS service.

    Returns
    -------
    pathlib.Path
        Path to the written audio file.
    """

    response = requests.post(url, data={"input_text": text})
    response.raise_for_status()
    output_file = Path(output_path)
    with output_file.open("wb") as f:
        f.write(response.content)
    return output_file
