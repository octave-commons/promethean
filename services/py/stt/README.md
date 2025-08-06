# STT Service

This service handles speech-to-text using Whisper models accelerated on NPU hardware.
It now also exposes WebSocket endpoints for single-shot transcription (`/transcribe`)
and streaming transcription (`/stream`).

## Usage

Run the service via pm2 or execute `run.sh` directly:

```bash
./run.sh
```

#hashtags: #stt #service #promethean
