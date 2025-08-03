import os
import sys
from unittest.mock import MagicMock, patch

import numpy as np
from scipy.io import wavfile

# Ensure repository root on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))

from shared.py.speech.service_clients import (
    send_wav_as_pcm,
    synthesize_text_to_file,
)


def test_send_wav_as_pcm(tmp_path):
    wav_path = tmp_path / "test.wav"
    wavfile.write(wav_path, 16000, np.array([0, 1, -1], dtype=np.int16))

    mock_response = MagicMock()
    mock_response.raise_for_status = MagicMock()
    mock_response.json.return_value = {"transcription": "hello"}

    with patch("requests.post", return_value=mock_response) as mock_post:
        result = send_wav_as_pcm(wav_path, url="http://example.com")
        assert result == "hello"
        mock_post.assert_called_once()


def test_synthesize_text_to_file(tmp_path):
    output = tmp_path / "out.wav"
    mock_response = MagicMock(status_code=200, content=b"data")
    mock_response.raise_for_status = MagicMock()

    with patch("requests.post", return_value=mock_response) as mock_post:
        path = synthesize_text_to_file("hi", output_path=output, url="http://example.com")
        assert path == output
        assert output.read_bytes() == b"data"
        mock_post.assert_called_once()
