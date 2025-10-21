# Duck WebRTC Chat

A simple two-way browser interface for talking to **Duck** without Discord, built on **ENSO** and **WebRTC**.

## Architecture

````text
[Browser UI: @promethean/duck-web]            [Gateway: @promethean/enso-browser-gateway]          [ENSO]
+------------------------------+   WS / WebRTC   +-----------------------------+   WS   +-------------------+
| <duck-chat> Web Component    |<--------------->| WebSocket + WebRTC bridge   |<----->| Enso server       |
| - mic → 16k PCM16 frames     |                 | - forwards voice.frames     |       | (Duck agent)      |
| - text box + TTS / audio out |                 | - mirrors content.post      |       |                   |
+------------------------------+                 +-----------------------------+       +-------------------+
````

## Packages
- **`@promethean/duck-web`** — browser client (Vite, Web Components).
- **`@promethean/enso-browser-gateway`** — Node signaling + ENSO bridge WebSocket + wrtc.

## Features
### Browser UI
- `<duck-chat>` element with mic toggle, text box, and log.
- Captures mic audio, downsamples to 16kHz PCM16 mono, sends via WebRTC.
- Receives text messages (`content.post`) and logs them.
- Optionally speaks replies via browser TTS.
- Receives `audio` channel frames and plays them with WebAudio.
- Configurable signaling URL, optional auth token, and ICE servers.

### Gateway
- WebSocket signaling endpoint at `/ws`.
- Auth optional: pass `?token=...` if `DUCK_TOKEN` is set.
- WebRTC channels:
  - `voice` browser → gateway → ENSO.
  - `events` gateway → browser.
- `audio` gateway → browser, optional ENSO audio.
- Forwards mic frames as `voice.frame` events to ENSO.
- Mirrors ENSO `content.post` events to browser.
- Configurable ICE servers via `ICE_SERVERS` env var.
- `RTCDataChannel.protocol` is not guaranteed across browsers; Safari, for
  example, can surface an empty string. If the `voice` channel does not
  negotiate a `frameDurationMs`, the gateway falls back to 20 ms frames to keep
  sequenced timestamps aligned with the expected 50fps audio cadence.

## Setup
```bash
# 1. install dependencies
pnpm -w install

# 2. run gateway (with ENSO running)
ENSO_WS_URL=ws://localhost:7766 \
DUCK_TOKEN=secret123 \
ICE_SERVERS='[{"urls":"stun:stun.l.google.com:19302"}]' \
npx nx run @promethean/enso-browser-gateway:serve

# 3. run browser client
npx nx run @promethean/duck-web:serve
```

Visit `http://localhost:5173` in your browser.

## ICE servers
To add STUN/TURN in the browser UI:
```js
localStorage.setItem('duck.iceServers', JSON.stringify([{ urls: 'stun:stun.l.google.com:19302' }]));
```

## Production notes
- Use **TURN servers** in `ICE_SERVERS` for NAT traversal.
- Run signaling `enso-browser-gateway` behind TLS.
- Set `DUCK_TOKEN` for auth.
- Replace browser TTS with actual audio once ENSO provides `voice.frame` replies.

## Nx targets
- `nx run @promethean/duck-web:serve` → run browser client.
- `nx run @promethean/duck-web:build` → build client.
- `nx run @promethean/enso-browser-gateway:serve` → run gateway.
