# Package Roadmap and Demo Plan

This roadmap captures the initial implementation order and supporting tooling
for ENSO-1.

## Package Priorities

| Package | Responsibilities | Status | Next Steps |
| --- | --- | --- | --- |
| **`enso-protocol`** | Publish schemas, codecs, and guards shared by all participants. | ✅ Implemented | Continue evolving schemas as new events emerge. |
| **`enso-gateway`** | Implement WebSocket transport, room registry, policy broadcast, and routing handlers. | ⏳ Pending | Bootstrap the server and handler wiring from the [[#gateway-handler-checklist\|Gateway Handler Checklist]]. |
| **`enso-client`** | Deliver the TypeScript SDK with assets, contexts, cache, and voice helpers. | ⏳ Pending | Flesh out the SDK using the [[07-sdk-and-implementation#client-skeleton\|Client Skeleton]]. |
| **`enso-asset`** | Content-addressed blob store with chunk ingestion and hash verification. | ⏳ Pending | Stand up the store following the [[09-assets-and-derivations#asset-upload-lifecycle\|Asset Upload Lifecycle]]. |
| **`enso-cache`** | Cache registry with LRU/TTL policy, manifests, and deterministic CID helpers. | ⏳ Pending | Implement cache coordination per [[10-caching\|Caching and Content Addressing]]. |
| **`enso-transcode`** | Deterministic derivation runners for PDF, OCR, audio, and video workloads. | ⏳ Pending | Prototype derivation workers aligned with [[09-assets-and-derivations#derivation-requests\|Derivation Requests]]. |
| **`enso-context`** | Context registry, rule evaluation, and LLM view computation. | ⏳ Pending | Build the registry and view builder described in [[12-context-management\|Context Management and Data Curation]]. |
| **`enso-mcp`** | Bridge for MCP mounts and tool execution. | ⏳ Pending | Implement the bridge according to [[08-mcp-integration\|Model Context Protocol Interop]]. |
| **`enso-rituals`** | AVA guardrails verifying Morganna rules, deterministic CIDs, and privacy behaviours. | ⏳ Pending | Codify guardrails from [[#rituals-guardrail-tests\|Rituals (Guardrail Tests)]]. |
| **`enso-cli`** | Developer demo for quick manual testing. | ⏳ Pending | Flesh out the CLI interactions outlined in [[#demo-cli-behaviour\|Demo CLI Behaviour]]. |

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
