# app.py

**Path**: `services/py/tts/app.py`

**Description**: FastAPI application exposing HTTP and WebSocket text-to-speech
interfaces. On startup it also connects to the internal message broker via
`shared.py.service_template`, consuming tasks from the `tts.speak` queue and
publishing base64-encoded audio on the `tts-output` event channel.

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

