# Tools, Voice, and Stream Semantics

Tools are room-scoped capabilities that can be advertised and invoked by any
participant with the appropriate permissions. Voice traffic and derived text
streams reuse the same framing primitives.

## Tool Discovery and Calls

```ts
export interface ToolAdvertisement {
  provider: "native" | "mcp";
  serverId?: string;
  tools: Array<{ name: string; schema?: unknown }>;
  resources?: Array<{ name: string; uri: string; title?: string }>;
}

export interface ToolCall {
  callId: UUID;
  provider: "native" | "mcp";
  serverId?: string;
  name: string;
  args: unknown;
  ttlMs?: number;
}

export interface ToolResult {
  callId: UUID;
  ok: boolean;
  result?: unknown;
  error?: string;
  resources?: unknown[];
}
```

Tool lifecycles follow a simple pattern:

```json
{ "kind": "event", "type": "tool.advertise", "payload": { "tools": [{ "name": "search.web" }] } }
{ "kind": "event", "type": "tool.call", "payload": { "callId": "c1", "name": "search.web", "args": { "q": "enso" } } }
{ "kind": "event", "type": "tool.result", "payload": { "callId": "c1", "ok": true, "result": { "hits": [] } } }
```

Multiple tools can run concurrently; there is no lock-step request/response
requirement. Long-running calls MAY emit `tool.partial` events with
intermediate results before the terminal `tool.result`.

## Voice Streams and Metadata

Voice activity detection (VAD) is recommended on the client so each utterance
maps to a discrete stream. Optional diarisation metadata helps transcription
and playback.

```json
{ "kind": "event", "type": "voice.meta",
  "payload": { "streamId": "V1", "lang": "en", "speaker": "human:A", "hints": ["tech", "myth"] } }
```

Transcripts use `codec: "text/utf8"` frames and can emit partials by linking
back to the originating voice stream via `rel.parents`.

## Morganna Evaluation Mode

When a room enables `room.flags.eval = true` every tool call must be justified
with an `act.rationale` event. Agents that attempt to hide intent violate the
protocol contract.
