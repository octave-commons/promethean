from pathlib import Path
from typing import Any, Dict, Optional
from scipy.io import wavfile
from urllib.parse import urlencode
import requests


def transcribe_audio_file(
    file_path: str | Path,
    url: str = "http://localhost:8080/stt/transcribe_pcm",
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
