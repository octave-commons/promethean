# ENSO Protocol Reference Implementation

A reference implementation of the Promethean ENSO context protocol described in
[`docs/design/enso.md`](../../docs/design/enso.md) and the detailed series under
[`docs/design/enso-protocol/`](../../docs/design/enso-protocol/).

## Modules

- `adapter.ts` – Minimal MCP-compatible transport adapter with hookable
  list/call handlers.
- `cache.ts`, `store.ts` – Content-addressed cache primitives and persistent
  asset storage with deterministic SHA-256 CIDs.
- `client.ts` – In-memory ENSO client façade that enforces capability-based
  access (post, asset upload, context management) and emits the
  `privacy.accepted` handshake acknowledgement.
- `registry.ts` – Context graph, availability evaluation, policy enforcement,
  and LLM view derivation.
- `router.ts`, `server.ts` – Utility router and event-driven server skeleton for
  dispatching envelopes between participants.
- `derive.ts` – Canonical derivation helpers mirroring
  [`10-caching.md`](../../docs/design/enso-protocol/10-caching.md) and
  [`09-assets-and-derivations.md`](../../docs/design/enso-protocol/09-assets-and-derivations.md).
- `tools.ts` – Room-scoped tool registry supporting advertisements, TTL-checked
  invocations, and `tool.*` envelope helpers.
- `flow.ts` – Stream sequence tracking, flow-control signalling (`flow.nack`,
  `flow.pause`, `flow.resume`) and degraded state patches per
  [`04-flow-control-and-reliability.md`](../../docs/design/enso-protocol/04-flow-control-and-reliability.md).
- `signature.ts` – Canonical envelope serialisation plus Ed25519
  sign/verify helpers for [`06-security-and-guardrails.md`](../../docs/design/enso-protocol/06-security-and-guardrails.md).
- `transport.ts` – Local transport wiring that links `EnsoClient` to
  `EnsoServer` with handshake + presence events for integration tests.
- `guardrails.ts` – Morganna guardrail enforcement utilities used to require
  tool rationales in evaluation mode.
- `cli.ts` – Command-line utilities for listing sources and seeding demo
  contexts.
- `policy.ts` – Published retention and cache policy defaults aligned with
  [`11-privacy-and-retention.md`](../../docs/design/enso-protocol/11-privacy-and-retention.md).

## Development

Install workspace dependencies from the monorepo root:

```bash
pnpm install
```

Compile the package:

```bash
pnpm --filter @promethean/enso-protocol run build
```

Run the full test suite with coverage (branch/function/statement/line thresholds
set to 80%+ via `c8`):

```bash
pnpm --filter @promethean/enso-protocol run test
```

The AVA-based tests (`src/tests/*.spec.ts`) exercise the context registry,
capability-gated client, MCP adapter, asset store, CLI commands, policy
constants, stream flow controller, tool registry, signature helpers, and a
package-level end-to-end workflow. Coverage reports are emitted to `coverage/`
(HTML + LCOV).

## Usage Examples

### Client handshake and capability enforcement

```ts
import { EnsoClient, EnsoServer, ContextRegistry, connectLocal } from "@promethean/enso-protocol";

const registry = new ContextRegistry();
const client = new EnsoClient(registry);
const server = new EnsoServer();

const connection = await connectLocal(client, server, {
  proto: "ENSO-1",
  caps: ["can.send.text", "can.asset.put", "can.context.write", "can.context.apply"],
  // Optional: privacy defaults to { profile: "pseudonymous" }
});

await client.post({ role: "human", parts: [{ kind: "text", text: "Hello" }] });
const context = await client.contexts.create({ name: "demo", owner: { userId: "human" }, entries: [] });
await client.contexts.apply(context.ctxId, [{ id: "human" }]);

connection.disconnect();
```

Missing capabilities raise informative errors (e.g. `missing capability: can.send.text`), mirroring the
handshake rules in [`03-rooms-and-capabilities.md`](../../docs/design/enso-protocol/03-rooms-and-capabilities.md).
Omitting the `privacy` block defaults the request to the documented `pseudonymous` profile while
allowing the server to negotiate stricter settings if needed.

### Registering and invoking tools

```ts
import { ToolRegistry } from "@promethean/enso-protocol";
import { randomUUID } from "node:crypto";

const tools = new ToolRegistry();
tools.register("native", {
  name: "math.add",
  timeoutMs: 1_000,
  handler: async (args) => {
    const { a, b } = args as { a: number; b: number };
    return { sum: a + b };
  },
});

const call = {
  callId: randomUUID(),
  provider: "native" as const,
  name: "math.add",
  args: { a: 2, b: 3 },
  ttlMs: 250,
};

const result = await tools.invoke(call);
// → { callId, ok: true, result: { sum: 5 } }
```

`tools.advertisement(provider)` and `tools.invokeEnvelope(call)` generate the
`tool.*` envelopes described in [`05-tools-and-streams.md`](../../docs/design/enso-protocol/05-tools-and-streams.md).

### Flow control and degraded state reporting

```ts
import { FlowController } from "@promethean/enso-protocol";

const flow = new FlowController("lab");
flow.register("V1", 1);

// Detect gaps → emits flow.nack with missing sequence numbers
const events = flow.handleFrame({ streamId: "V1", codec: "opus/48000/2", seq: 5, pts: Date.now(), data: new Uint8Array(), });

// Pause / resume streams and mark degraded when mixers fall behind
console.log(flow.pause("V1"));
console.log(flow.resume("V1"));
console.log(flow.markDegraded("V1"));
```

### Connecting client and server in-memory

```ts
import { EnsoClient, EnsoServer, connectLocal } from "@promethean/enso-protocol";
import { ContextRegistry } from "@promethean/enso-protocol";

const client = new EnsoClient(new ContextRegistry());
const server = new EnsoServer();

const hello = {
  proto: "ENSO-1" as const,
  caps: ["can.send.text"],
  // privacy defaults to { profile: "pseudonymous" as const }
};

await connectLocal(client, server, hello, {
  adjustCapabilities: (caps) => [...caps, "can.context.apply"],
  privacyProfile: "persistent",
});

await client.post({ role: "human", parts: [{ kind: "text", text: "hi" }] });
```

Presence and other room events are emitted back through the client via
`receive`, while outbound events travel through the server router.

### Enforcing guardrails

```ts
import { EnsoClient, EnsoServer, connectLocal } from "@promethean/enso-protocol";
import { randomUUID } from "node:crypto";

const client = new EnsoClient();
const server = new EnsoServer();
const { session } = await connectLocal(client, server, {
  proto: "ENSO-1",
  caps: ["can.tool.call"],
  // privacy defaults to { profile: "pseudonymous" }
});

server.enableEvaluationMode(session.id, true);

client.on("event:guardrail.violation", (event) => {
  console.warn("guardrail violation", event.payload);
});

const callId = randomUUID();
await client.send({
  id: randomUUID(),
  ts: new Date().toISOString(),
  room: "local",
  from: "tester",
  kind: "event",
  type: "act.rationale",
  payload: { callId, rationale: "Need supporting evidence" },
});

await client.send({

## Running a WebSocket server

You can run a networked ENSO WebSocket server (so other processes can connect via `ws://.../ws`):

```bash
pnpm -w --filter @promethean/enso-protocol run build
PORT=7766 pnpm -w --filter @promethean/enso-protocol run serve
# -> listens on ws://localhost:7766/ws
```

This uses `src/ws-server.ts` with the reference `EnsoServer`. Clients should call
`connectWebSocket(client, "ws://localhost:7766/ws", hello)`.

  id: randomUUID(),
  ts: new Date().toISOString(),
  room: "local",
  from: "tester",
  kind: "event",
  type: "tool.call",
  payload: { callId, provider: "native", name: "math.add", args: { a: 1, b: 2 } },
});
```

If a rationale is omitted while evaluation mode is active, the server emits a
`guardrail.violation` event and suppresses the tool call.

### Signing envelopes

```ts
import { canonicalEnvelope, signEnvelope, verifyEnvelopeSignature } from "@promethean/enso-protocol";

const envelope = { /* ... */ };
const signature = signEnvelope(envelope, privateKeyPem);
const verified = verifyEnvelopeSignature({ ...envelope, sig: signature }, publicKeyPem);
```

The helper uses Ed25519 with the canonical JSON form (envelope minus `sig`).

### CLI

After building, run the CLI to explore demo contexts or start a dual-agent chat:

```bash
pnpm --filter @promethean/enso-protocol exec node dist/cli.js help
pnpm --filter @promethean/enso-protocol exec node dist/cli.js list-sources
pnpm --filter @promethean/enso-protocol exec node dist/cli.js create-demo-context
pnpm --filter @promethean/enso-protocol exec node dist/cli.js two-agent-chat duckduckgo,github
pnpm --filter @promethean/enso-protocol exec node dist/cli.js two-agent-chat --ollama
```

When adding new features, follow the design notes in
[`docs/design/enso-protocol/`](../../docs/design/enso-protocol/) and extend the
corresponding test suites to maintain coverage and behavioural guarantees.
