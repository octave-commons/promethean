# app.py

**Path**: `services/py/tts/app.py`

**Description**: FastAPI application exposing HTTP and WebSocket text-to-speech
interfaces.

### Endpoints

- `POST /synth_voice_pcm` – form field `input_text`; responds with 16‑bit PCM
  audio bytes.
- `WS /ws/tts` – send text frames and receive WAV audio bytes.

## Dependencies
- fastapi
- safetensors.torch
- transformers
- soundfile
- shared.py.speech.tts

## Dependents
- None

