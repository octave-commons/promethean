# TTS Service

This service converts text to speech using Tacotron and WaveRNN models.
It exposes both an HTTP endpoint (`/synth_voice_pcm`) and a WebSocket
endpoint (`/ws/tts`) on the same server.

## Usage

Run via pm2 or execute `run.sh` directly:

```bash
./run.sh
```

#hashtags: #tts #service #promethean
