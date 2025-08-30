# TTS Service

This service converts text to speech using Tacotron and WaveRNN models.
It exposes both an HTTP endpoint (`/synth_voice_pcm`) and a WebSocket
endpoint (`/ws/tts`) on the same server. On startup the service also uses
`shared.py.service_template` to connect to the message broker, consuming
text tasks from the `tts.speak` queue and publishing synthesized audio as
`tts-output` events.

## Dependencies

The service requires the NLTK package and its `averaged_perceptron_tagger_eng`
resource for part-of-speech tagging. The model is downloaded at startup if it
is not already present.

## Usage

Run via pm2 or execute `run.sh` directly:

```bash
./run.sh
```

#hashtags: #tts #service #promethean
