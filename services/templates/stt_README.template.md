# {{SERVICE_NAME}} Service

This service handles speech-to-text using Whisper models.
It now runs as a broker-connected worker using the shared Python service template.
Tasks from the `stt.transcribe` queue are processed and results are published to
`stt.transcribed`.

## Usage

Run the service via pm2 or execute `run.sh` directly:

```bash
./run.sh
```

#hashtags: #stt #service #promethean
