import pytest
from unittest.mock import patch, MagicMock
import os
# import parent directory to access app module
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
# import shared directory to access wisper_stt module
sys.path.append("../../../")
# import shared.py.speech.wisper_stt as wisper_stt
import fastapi


@pytest.fixture
def mock_wisper_stt():
    with patch("shared.py.speech.wisper_stt") as mock:
        mock.transcribe_pcm.return_value = "transcribed text"
        yield mock

@pytest.fixture
def mock_transcribe_pcm():
    with patch("app.transcribe_pcm", return_value="transcribed text") as mock:
        yield mock

@pytest.fixture
def client():
    import app
    from fastapi.testclient import TestClient
    return TestClient(app.app)
    
def test_endpoint(client, mock_transcribe_pcm):
    response = client.post("/transcribe_pcm",
                           headers={"X-Sample-Rate": "16000", "X-Dtype": "int16"},
                           data=b"fake_pcm_data___fake_pcm_data___")
    assert response.status_code == 200
    assert response.json() == {"transcription": "transcribed text"}