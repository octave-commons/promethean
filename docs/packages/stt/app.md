# app.py

**Path**: `services/py/stt/app.py`

**Description**: FastAPI application providing HTTP and WebSocket speech-to-text
APIs. Supports raw PCM transcription and real-time streaming.

Note: The runtime STT worker uses `shared.py.service_template` with a
broker-tied heartbeat to report liveness. Do not use a separate heartbeat
client.

### Endpoints

- `POST /transcribe_pcm` – accepts 16‑bit PCM audio in the request body with
  `x-sample-rate` and `x-dtype` headers. Returns `{ "transcription": str }`.
- `WS /transcribe` – WebSocket endpoint for single-shot transcription. Send
  `{ "pcm": base64, "sample_rate": int }` and receive the transcription as
  JSON.
- `WS /stream` – WebSocket endpoint for streaming audio chunks. Send raw PCM
  bytes and receive incremental transcriptions.

## Dependencies
- fastapi
- fastapi.responses
- shared.py.speech.whisper_stt
- shared.py.speech.whisper_stream
- shared.py.utils

## Dependents
- None
