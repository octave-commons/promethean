# Transport and Envelope Framing

The protocol keeps transport concerns simple: a single framed channel carries
both control-plane events and media streams. Implementations may use
WebSocket or WebTransport; WebRTC is optional for ultra-low-latency audio as
long as envelopes are preserved.

## Transport Choices

* **Control plane** – WebSocket or WebTransport with explicit message framing.
* **Media plane** – shares the same transport. Voice can move to WebRTC when a
  peer-to-peer hop is required, but envelopes and IDs remain consistent.
* **Keepalives** – ping/pong frames at the transport layer ensure idle sessions
  remain connected.

## Envelope Schema

Every payload is wrapped in an envelope that carries causality metadata and an
optional signature.

```ts
export type UUID = string;

export interface Envelope<T = unknown> {
  id: UUID;                // unique per message
  ts: string;              // ISO 8601 timestamp
  room: string;            // room id
  from: string;            // session id
  kind: "event" | "stream";
  type: string;            // e.g. "chat.msg", "voice.frame"
  seq?: number;            // ordered per stream
  rel?: {
    replyTo?: UUID;
    parents?: UUID[];      // support DAG merges/CRDTs
  };
  payload: T;
  sig?: string;            // detached Ed25519 signature (optional)
}
```

The envelope definition lives in `@promethean/enso-protocol/envelope.js` with a
matching Zod validator to guarantee type-safety at process boundaries.

## Event Payloads

Events are discrete JSON payloads for chat, presence, tool boundaries, and
state updates. They are intentionally small so relays can persist or replay
short histories.

```ts
export type EnsoEvent =
  | { type: "chat.msg"; text: string; format?: "md" | "plain" }
  | { type: "presence.join"; info?: Record<string, unknown> }
  | { type: "presence.part"; reason?: string }
  | { type: "state.patch"; diff: unknown }
  | { type: "tool.advertise"; payload: ToolAdvertisement }
  | { type: "tool.call"; payload: ToolCall }
  | { type: "tool.result"; payload: ToolResult };
```

Tool-specific payloads are defined in [Tools, Voice, and Stream Semantics](05-tools-and-streams.md).

## Stream Frames

Continuous media is modelled as deterministic frames. Voice, transcripts, and
JSONL outputs share a single framing model.

```ts
export interface StreamFrame {
  streamId: UUID;
  codec: "opus/48000/2" | "pcm16le/16000/1" | "text/utf8" | "jsonl";
  seq: number;                 // monotonic per stream
  pts: number;                 // presentation timestamp (ms)
  eof?: boolean;
  data: Uint8Array | string;   // binary or UTF-8 text
}
```

Voice messages are regular envelopes with `kind: "stream"`, `type: "voice.frame"`, and a `StreamFrame` payload. Derived streams
(text partials, JSONL tool output) reuse this format.
