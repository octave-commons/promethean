# Operational Playbook

## Env
- WS_MAX_PAYLOAD_MB=16
- WS_BLOB_DIR=/var/spool/ws
- WS_BLOB_TTL_MS=1800000
- STT_HOST=stt; STT_PORT=8080; STT_PATH=/stt/transcribe_pcm
- TTS_HOST=tts; TTS_PORT=8080; TTS_PATH=/tts/synth_voice

## Healthchecks
- `/healthz` on ws (accepts; janitor alive; disk > 10%)
- STT/TTS 200 check every 30s

## Run
- `docker compose up -d stt tts`
- start ws with those envs
- smoke: send short PCM; expect interim + final; TTS file length > 0

## On-call quick fixes
- Blob dir full → increase TTL or free space; confirm janitor running
- Many NACKs → inspect worker crashes; increase lease; place MODACKs
- Checksum mismatch → client chunking bug or proxy corruption; dump reqId
