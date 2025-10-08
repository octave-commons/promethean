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

Events are discrete JSON payloads for chat, content management, presence,
tooling, policy, and audit trails. They remain intentionally small so relays can
persist or replay short histories.

### Event Families

| Family | Example types | Purpose | Detailed reference |
```
| --- | --- | --- | --- |
```
| Chat | `chat.msg` | Lightweight text events for clients that do not need the richer `content.*` surface. | [Rooms, Sessions, and Capability Handshake]03-rooms-and-capabilities.md |
| Content | `content.post`, `content.message`, `content.retract`, `content.burn` | Rich, multi-part chat delivery, receipts, and deletions. | [Assets, Derivations, and Messaging]09-assets-and-derivations.md & [Privacy Profiles and Retention Policy]11-privacy-and-retention.md |
| Presence | `presence.join`, `presence.part` | Room roster updates and advisory lifecycle signals. | [Rooms, Sessions, and Capability Handshake]03-rooms-and-capabilities.md |
| Capabilities | `caps.update` | Authoritative capability revisions with server acknowledgements. | [Rooms, Sessions, and Capability Handshake]03-rooms-and-capabilities.md |
| State | `state.patch` | CRDT-friendly room state diffs (e.g., degraded stream indicators). | [Flow Control and Reliability]04-flow-control-and-reliability.md |
| Tooling | `tool.advertise`, `tool.call`, `tool.result`, `tool.partial` | Capability discovery, invocation, incremental progress, and completion. | [Tools, Voice, and Stream Semantics]05-tools-and-streams.md & [Model Context Protocol Interop]08-mcp-integration.md |
| Voice | `voice.meta` | Metadata accompanying `voice.frame` streams (language, speaker, hints). | [Tools, Voice, and Stream Semantics]05-tools-and-streams.md |
| Flow | `flow.nack`, `flow.pause`, `flow.resume` | Reliability and backpressure signals tied to specific streams. | [Flow Control and Reliability]04-flow-control-and-reliability.md |
| Stream control | `stream.resume` | Resuming cached or long-lived streams via their stream CID. | [Caching and Content Addressing]10-caching.md |
| Assets | `asset.put`, `asset.commit`, `asset.ready`, `asset.derive`, `asset.derived`, `asset.delete` | Upload lifecycle, derivation planning, result publication, and retention cleanup. | [Assets, Derivations, and Messaging]09-assets-and-derivations.md |
| Cache | `cache.put`, `cache.hit`, `cache.miss`, `cache.evict`, `cache.partial`, `cache.policy` | Content-addressed cache coordination across sessions and rooms. | [Caching and Content Addressing]10-caching.md |
| Context & data | `datasource.add`, `datasource.update`, `context.create`, `context.add`, `context.apply`, `context.pin`, `context.activate`, `context.ignore`, `context.diff` | Curating knowledge graphs, applying context views, and surfacing diffs. | [Context Management and Data Curation]12-context-management.md |
| Approvals | `approval.request`, `approval.grant` | Coordinating conditional access or soft policy prompts. | [Context Management and Data Curation]12-context-management.md |
| Guardrail actions | `act.rationale`, `act.intent` | Morganna evaluation telemetry describing tool usage and declared intent. | [Security, Signatures, and Guardrails]06-security-and-guardrails.md |
| Privacy & policy | `privacy.accepted`, `room.policy` | Negotiated privacy profile acknowledgements and room-wide retention settings. | [Privacy Profiles and Retention Policy]11-privacy-and-retention.md |
| Consent & audit | `consent.record` | Receipts showing when export or logging actions were approved. | [Security, Signatures, and Guardrails]06-security-and-guardrails.md |
| MCP interop | `mcp.mount`, `mcp.announce` | Mounting and advertising Model Context Protocol servers. | [Model Context Protocol Interop]08-mcp-integration.md |

The canonical union is exported as `EnsoEvent` from
`@promethean/enso-protocol/src/types/events.ts`. Consumers can rely on the
package types to stay aligned with this specification:

```ts
import type { EnsoEvent } from "@promethean/enso-protocol/types.js";

export function handleEvent(event: EnsoEvent) {
  // exhaustive pattern matching keeps gateway and client logic in sync
}
```

### Payload Schema Appendix

Payload interfaces live alongside the transport code to guarantee drift-free
implementations. Key mappings include:

* `ChatMsgPayload` → `chat.msg`
* `ContentPostPayload`, `ContentMessagePayload`, `ContentRetractPayload`, `ContentBurnPayload` → `content.*`
* `ToolAdvertisement`, `ToolCall`, `ToolResult`, `ToolPartialPayload` → `tool.*`
* `VoiceMetaPayload` → `voice.meta`
* `FlowNackPayload`, `FlowPausePayload`, `FlowResumePayload` → `flow.*`
* `AssetPut`, `AssetCommitPayload`, `AssetReadyPayload`, `AssetDerivePayload`, `AssetDerivedPayload`, `AssetDeletePayload` → `asset.*`
* `CachePut`, `CacheHit`, `CacheMiss`, `CacheEvict`, `CachePartial`, `CachePolicy` → `cache.*`
* `DatasourceAddPayload`, `DatasourceUpdatePayload`, `ContextCreatePayload`, `ContextAddPayload`, `ContextApplyPayload`, `ContextPinPayload`, `ContextActivatePayload`, `ContextIgnorePayload`, `ContextDiffPayload` → context and data source events
* `ApprovalRequestPayload`, `ApprovalGrantPayload` → `approval.*`
* `ActRationalePayload`, `ActIntentPayload` → `act.*`
* `PrivacyAcceptedPayload`, `RoomPolicyPayload` → privacy and policy broadcasts
* `ConsentRecordPayload` → `consent.record`
* `McpMountPayload`, `McpAnnouncePayload` → `mcp.*`

Specialised chapters define the business rules for each family while the shared
types guarantee that transport-level envelopes remain consistent.

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
