# Design: WS Binary Blobs + Private STT/TTS

## Why
Base64-in-JSON balloons memory, stresses GC, and collides with proxies. We keep JSON for control and move media to binary frames with backpressure and checksums.

## Architecture
- **WS Gateway (`packages/ws`)**
  - JSON ops: AUTH / SUBSCRIBE / PUBLISH / ACK / NACK / MODACK
  - New binary ops: see Protocol
  - Blob spool dir with TTL janitor
- **Blob Store (ephemeral)**
  - Path: `$WS_BLOB_DIR` (default tmp)
  - Content-addressed by `sha256`
  - Enforced TTL `$WS_BLOB_TTL_MS`
- **STT service** (Docker-internal)
  - Endpoint: `$STT_HOST:$STT_PORT$STT_PATH` (default `stt:8080/stt/transcribe_pcm`)
- **TTS service** (Docker-internal)
  - Endpoint: `$TTS_HOST:$TTS_PORT$TTS_PATH` (default `tts:8080/tts/synth_voice`)
- **Workers**
  - Pull JSON events, MODACK around expensive steps, push replies with blob refs

### ASCII sequence (media upload)
```

Client -> WS: BLOB_PUT_START { mime }

## Enso Protocol Integration — v1

### Goals
- Replace legacy Broker STT pathway in Cephalon with Enso envelopes.
- Use `voice.frame` streams @ `pcm16le/16000/1` with 20ms frames (640 bytes).
- Expect transcript as `event:content.post` in the same room.

### Client wiring (Cephalon)
- New `EnsoTranscriber` bridges Discord PCM → Enso `voice.frame`.
- Downmix & resample 48k stereo → 16k mono using a simple 3:1 decimator with pre-average LPF.
- Per-utterance room key: `voice:<discordUserId>:<startMs>`.
- Flow control via `client.voice.register(streamId)`; EOF emits `eof: true`.

### Server expectations (STT)
- Accept handshake with caps: `can.voice.stream`, `can.send.text`.
- Consume frames for the `room` and reply with a transcript:`,`
  ```
  { kind: "event", type: "content.post", room, payload: {
    message: { role: "agent", parts: [{ kind: "text", text } ] }
  }}
  ```

### Migration
- Feature-flag: `DISABLE_BROKER=1` and set `ENSO_WS_URL=ws://host:7766`.
- Fallback: if `ENSO_WS_URL` unset, legacy Broker path remains.

## Enso Protocol Integration — v1

### Goals
- Replace legacy Broker STT pathway in Cephalon with Enso envelopes.
- Use `voice.frame` streams @ `pcm16le/16000/1` with 20ms frames (640 bytes).
- Expect transcript as `event:content.post` in the same room.

### Client wiring (Cephalon)
- New `EnsoTranscriber` bridges Discord PCM → Enso `voice.frame`.
- Downmix & resample 48k stereo → 16k mono using a simple 3:1 decimator with pre-average LPF.
- Per-utterance room key: `voice:<discordUserId>:<startMs>`.
- Flow control via `client.voice.register(streamId)`; EOF emits `eof: true`.

### Server expectations (STT)
- Accept handshake with caps: `can.voice.stream`, `can.send.text`.
- Consume frames for the `room` and reply with a transcript:`,`
  ```
  { kind: "event", type: "content.post", room, payload: {
    message: { role: "agent", parts: [{ kind: "text", text } ] }
  }}
  ```

### Migration
- Feature-flag: `DISABLE_BROKER=1` and set `ENSO_WS_URL=ws://host:7766`.
- Fallback: if `ENSO_WS_URL` unset, legacy Broker path remains.

## Enso Protocol Integration — v1

### Goals
- Replace legacy Broker STT pathway in Cephalon with Enso envelopes.
- Use `voice.frame` streams @ `pcm16le/16000/1` with 20ms frames (640 bytes).
- Expect transcript as `event:content.post` in the same room.

### Client wiring (Cephalon)
- New `EnsoTranscriber` bridges Discord PCM → Enso `voice.frame`.
- Downmix & resample 48k stereo → 16k mono using a simple 3:1 decimator with pre-average LPF.
- Per-utterance room key: `voice:<discordUserId>:<startMs>`.
- Flow control via `client.voice.register(streamId)`; EOF emits `eof: true`.

### Server expectations (STT)
- Accept handshake with caps: `can.voice.stream`, `can.send.text`.
- Consume frames for the `room` and reply with a transcript:`,`
  ```
  { kind: "event", type: "content.post", room, payload: {
    message: { role: "agent", parts: [{ kind: "text", text } ] }
  }}
  ```

### Migration
- Feature-flag: `DISABLE_BROKER=1` and set `ENSO_WS_URL=ws://host:7766`.
- Fallback: if `ENSO_WS_URL` unset, legacy Broker path remains.
WS -> Client: OK { id }
Client -> WS: [binary CHUNK]* (1 MiB each, SHA-256 running)
Client -> WS: BLOB_PUT_END { id, size, sha256 }
WS -> Client: OK { id, size, sha256 }
Client -> WS: PUBLISH { topic, payload: { blobId: id, mime, meta } }

```

## Protocol (additions)
- `BLOB_PUT_START { mime } -> { id }`
- Binary chunk frame: `[1 byte ver=1][1 byte op=0x01][16-byte blobId prefix][4-byte BE len][chunk]`
- `BLOB_PUT_END { id, size?, sha256? } -> { id, size, sha256 }`
- `BLOB_GET_STREAM { id }` -> server emits header EVENT + binary frames with `op=0x02`

### Limits and guards
- `WS_MAX_PAYLOAD_MB` – hard cap per WS frame (keep small; we stream)
- Chunk size: 1 MiB (tunable)
- Blob TTL: default 30m; janitor reaps old blobs
- Per-IP and per-topic token buckets (reuse `server.rate.ts`)
- Checksums required for END → reject mismatch

## STT/TTS via docker-compose
- No public ports for STT/TTS; only `ws` is optionally exposed.
- Env wiring in `voice/transcriber.ts` and `voice/voice-synth.ts`:
  - `STT_HOST`, `STT_PORT`, `STT_PATH`
  - `TTS_HOST`, `TTS_PORT`, `TTS_PATH`

## Migration plan
1. Keep old JSON paths working during transition behind a flag.
2. Add blob ops + feature flag `DUCK_USE_BLOBS=1`.
3. Switch clients to send blobs (16-image batches).
4. Remove base64 handling after a week of soak.

## Observability
- Correlate by `reqId` per message (log & event payload)
- Metrics: blob sizes, chunk counts, checksum fails, TTL reaps, NACK/REDLV
- Healthchecks: WS accept, janitor status, disk free, STT/TTS 200
