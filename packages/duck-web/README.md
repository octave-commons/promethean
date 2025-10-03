# @promethean/duck-web

A minimal browser UI for talking to Duck without Discord. Uses WebRTC to stream microphone audio to ENSO via the `enso-browser-gateway`, and receives replies back as text (with optional browser TTS) or real audio when available.

## Features
- Web Component (`<duck-chat>`) based UI, no frameworks.
- Captures mic, downsamples to **16kHz PCM16 mono** frames, streams to ENSO.
- Typed text box for sending messages.
- Log window for conversation history.
- Replies spoken via browser TTS, or played back from ENSO-provided audio frames.
- Configurable signaling URL and optional auth token.
- Reads ICE servers from `localStorage` (for STUN/TURN).

## Running locally
```bash
# install deps
pnpm -w install

# run the gateway first
ENSO_WS_URL=ws://localhost:7766 \
DUCK_TOKEN=secret123 \
ICE_SERVERS='[{"urls":"stun:stun.l.google.com:19302"}]' \
pnpm -w --filter @promethean/enso-browser-gateway run dev

# then run the browser UI
pnpm -w --filter @promethean/duck-web exec vite --open
```

In the UI: provide the gateway URL (default: `ws://localhost:8787/ws`), and token if required.

## ICE servers
Set in browser with:
```js
localStorage.setItem('duck.iceServers', JSON.stringify([{urls:'stun:stun.l.google.com:19302'}]));
```

## Nx targets
- `nx run @promethean/duck-web:serve` → dev server (Vite)
- `nx run @promethean/duck-web:build` → production build

---

# @promethean/enso-browser-gateway

A Node.js signaling + bridge server between browser WebRTC clients and ENSO.

## Features
- WebSocket signaling on `/ws`.
- Validates optional `?token=` if `DUCK_TOKEN` is set.
- Establishes WebRTC `DataChannel` connections.
  - `voice` (browser → gateway → ENSO): PCM16/16kHz/mono frames.
  - `events` (gateway → browser): text messages from ENSO.
  - `audio` (gateway → browser): optional ENSO audio frames (PCM16/16kHz/mono).
- Forwards browser mic frames as ENSO `voice.frame` events.
- Mirrors ENSO `content.post` messages to browser.
- Room per session, auto-generated IDs.

## Running
```bash
ENSO_WS_URL=ws://localhost:7766 \
DUCK_TOKEN=secret123 \
ICE_SERVERS='[{"urls":"stun:stun.l.google.com:19302"}]' \
pnpm -w --filter @promethean/enso-browser-gateway run dev
```

Listens on port `8787` by default.

## Nx targets
- `nx run @promethean/enso-browser-gateway:serve`

## Notes
- Replace inline browser TTS with server audio once ENSO emits `voice.frame` events.
- For production, use TURN in `ICE_SERVERS` for NAT traversal.
- Secure signaling with TLS and auth token.
