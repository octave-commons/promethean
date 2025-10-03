# Duck x ENSO: Implementation Notes

This document tracks how `@promethean/cephalon` integrates ENSO and where docs map to code.

## Tool advertisement & calls (05-tools-and-streams.md)
- **Tool registry**: `packages/enso-protocol/src/tools.ts` exposes `ToolRegistry`.
- **Duck provider**: `packages/cephalon/src/enso/chat-agent.ts` registers built-ins (`duck.ping`, `duck.env`, `duck.version`) and emits `tool.advertise` on connect and on `server.ready`.
- **Call handling**: `chat-agent.ts` listens for `tool.call` envelopes for provider `duck` and responds with `tool.result` using `ToolRegistry.invokeEnvelope`.

## Privacy & retention (11-privacy-and-retention.md)
- `createEnsoChatAgent({ privacyProfile })` includes the chosen profile in the initial `hello` payload.
- In `packages/cephalon/src/bot.ts` we now **honor `DUCK_PRIVACY_PROFILE=ephemeral`**: inbound ENSO messages are *not persisted* to the local `enso_messages` collection when ephemeral. Other profiles behave as before.

## Evaluation mode & guardrails (06-security-and-guardrails.md)
- The chat agent tracks `room.flags.eval` and logs entry/exit. Today Duck is a **tool provider**, not a caller, so `act.rationale` emission is not required. When we add Duck-as-caller, emit an `act.rationale` **immediately prior** to `tool.call` and include the JSON rubric from the doc.

## Developer ergonomics
- Enable the chat bridge by setting either:
  - `ENSO_CHAT_ENABLE=1` **(local bus)**, or
  - `ENSO_WS_URL=ws://host:port` to point at a remote ENSO relay.
- Optional: `ENSO_CHAT_ROOM` (default `duck:chat`), `DUCK_PRIVACY_PROFILE` one of `pseudonymous|ephemeral|persistent`.

## Tests
- `packages/enso-protocol/test/tool-registry.test.ts` covers advertise/timeout/unknown-tool.

## Gaps / TODO
- Emit `act.rationale` when Duck makes outbound tool calls (caller path).
- Add TTL enforcement when `ephemeral` (skip persisted writes today).
- Add WebSocket-level tests for `chat-agent.ts` using a lightweight WS harness.
- Add resource URIs for tools where relevant, e.g. transcription file blobs.

## Audio capture pipeline
- `apps/duck-web/public/pcm16k-worklet.js` emits mono Float32Array frames resampled to 16 kHz inside the AudioWorklet.
- `apps/duck-web/src/mic.ts` converts those frames to signed 16-bit PCM via `float32ToInt16` and timestamps delivery with `performance.now()` for monotonic sequencing.
