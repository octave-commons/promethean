# {{SERVICE_NAME}} Service

This service converts text to speech using Tacotron and WaveRNN models.
It exposes both an HTTP endpoint (`/synth_voice_pcm`) and a WebSocket
endpoint (`/ws/tts`) on the same server. On startup the service also uses
`shared.py.service_template` to connect to the message broker, consuming
text tasks from the `tts.speak` queue and publishing synthesized audio as
`tts-output` events.

## Usage

Run via pm2 or execute `run.sh` directly:

```bash
./run.sh
```

#hashtags: #tts #service #promethean
