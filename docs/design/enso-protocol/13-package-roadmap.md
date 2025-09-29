# Package Roadmap and Demo Plan

This roadmap captures the initial implementation order and supporting tooling
for ENSO-1.

## Package Priorities

1. **`enso-protocol`** – publish schemas, codecs, and guards shared by all
   participants.
2. **`enso-gateway`** – implement WebSocket transport, room registry, policy
   broadcast, and routing handlers.
3. **`enso-client`** – deliver the TypeScript SDK with assets, contexts, cache,
   and voice helpers.
4. **`enso-asset`** – content-addressed blob store with chunk ingestion and
   hash verification.
5. **`enso-cache`** – cache registry with LRU/TTL policy, manifests, and
   deterministic CID helpers.
6. **`enso-transcode`** – deterministic derivation runners for PDF, OCR, audio,
   and video workloads.
7. **`enso-context`** – context registry, rule evaluation, and LLM view
   computation.
8. **`enso-mcp`** – bridge for MCP mounts and tool execution.
9. **`enso-rituals`** – AVA guardrails verifying Morganna rules, deterministic
   CIDs, and privacy behaviours.
10. **`enso-cli`** – developer demo for quick manual testing.

## Gateway Handler Checklist

* `hello` – negotiate privacy, cache capabilities, and join room.
* `content.post` – emit `content.message`, schedule derivations.
* `asset.put` / `asset.commit` – store blobs via `enso-asset`, emit
  `asset.ready` and `cache.put`.
* `asset.derive` – enqueue transcode jobs; broadcast `asset.derived`.
* `voice.frame` – forward to mixers, enforce backpressure.
* `context.*` – update context registry and recompute LLM view.
* `mcp.*` – mount, advertise, and call external servers.
* `tool.call` – route to native or MCP handlers, enforce TTL.

## Demo CLI Behaviour

The CLI is a thin wrapper around the SDK:

```ts
#!/usr/bin/env node
import { EnsoClient } from "@promethean/enso-client";

const url = process.env.ENSO_URL ?? "ws://localhost:7747";
const token = process.env.ENSO_TOKEN ?? "dev";

const enso = new EnsoClient(url, token);
await enso.connect({ proto: "ENSO-1", caps: ["can.asset.put", "cache.read"] });
enso.on("event:content.message", (env) => console.log(env.payload));
```

Commands:

* `enso say "hello"` – send a text message.
* `enso attach ./file.pdf` – upload an attachment and watch derivations stream in.
* `enso context` – demonstrate pinning and applying a context snapshot.

## Rituals (Guardrail Tests)

* Tool timeouts emit negative `tool.result` events.
* Deterministic derivations produce identical CIDs for identical inputs.
* Privacy profiles restrict cache visibility and derivation behaviour as
  expected.

## Quick Bring-up Checklist

1. Create package manifests with `type: "module"`, strict TS configs, and AVA.
2. Run `tsx packages/enso-gateway/src/server.ts` for development.
3. Launch the CLI to drive manual scenarios while automated tests mature.
