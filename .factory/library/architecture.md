# Architecture

## Bluesky Collection

- **searchQuery unreliable**: Bluesky search API returns 0 results for common terms. Use `actor`-based collection as primary path. searchQuery is a fallback only.

## Postgres Patterns

- **JSONB round-trip**: postgres.js returns JSONB columns as strings. Use `parseJsonb()` helper in all row mappers. When adding new JSONB columns, always apply parseJsonb in the row mapper.

Architectural decisions, patterns, and system design.

---

## Package Map

### Shared packages (in /home/err/devel/packages/)
- `@workspace/radar-core` — Core domain schemas: Radar, SignalEvent, Thread, ConnectionOpportunity, ActionCard, assessment packets, reducer, evidence index, audit
- `@workspace/mcp-foundation` — MCP server factory, HTTP router, OAuth, persistence
- `@workspace/thread-assessment` — Original assessment packet schema (predecessor of radar-core, may be deprecated)
- `@workspace/signal-atproto` — AT Protocol publisher for radar data (Bluesky)
- `@workspace/signal-embed-browser` — Browser-side ONNX cosine similarity via WebNN/WebGPU/WASM

### Service repos (in orgs/riatzukiza/)
- `threat-radar-mcp` — MCP control plane: Express API + MCP tools for radar management, signal collection, reduction
- `threat-radar-web` — React dashboard: wall of clocks → 3-lane mission control UI

### Fork Tales extraction packages (in orgs/open-hax/openhax/packages/)
- `@open-hax/signal-contracts` — Shared signal data contracts (SourceSeed, NormalizedSignal, etc.)
- `@open-hax/signal-watchlists` — Watchlist parsing/merge
- `@open-hax/signal-source-utils` — URL normalization, feed parsing, semantic extraction
- `@open-hax/signal-radar-core` — Scoring helpers (clamp, proximity strategy)

## Package Naming Conventions

Most shared packages use the `@workspace/*` scope (e.g., `@workspace/radar-core`, `@workspace/mcp-foundation`). Exception: `packages/embedding` uses `@promethean-os/embedding` — the legacy Promethean namespace. Workers should check actual `package.json` name fields rather than assuming the `@workspace/` prefix.

## TypeScript Configuration Template

The workspace has no shared `tsconfig.base.json`. New packages should use this standard template:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "dist",
    "rootDir": "src",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

Note: 11 packages in `orgs/riatzukiza/promethean/packages/` had broken tsconfigs extending a missing `../../config/tsconfig.base.json`. These were fixed in the foundation milestone using the above template.

## Key Architectural Decisions

1. **Models emit packets, not clocks** — assessment packets are structured forms; the reducer is deterministic
2. **Deterministic reducer** — weighted median aggregation; uncertainty from percentile spread; no model can dominate
3. **Visible disagreement** — clock shows range + agreement level, not just central estimate
4. **AT Protocol first** — public data goes to Bluesky, SQL only for config/state
5. **Three lanes** — η (global, uncontrollable), μ (local, actionable), Π (connections, federated)
6. **Enso protocol for Π** — envelope-based federation from promethean experimental

## Data Flow

```
Bluesky/Reddit → Collectors → SignalEvent → Normalize/Dedupe →
  Thread clustering → Assessment packets → Deterministic reducer →
  Live snapshot → Dashboard render
                → AT Protocol publish
                → Daily snapshot seal
```

## Bluesky Public API

- **Unauthenticated access**: Use `public.api.bsky.app` (no auth required) for public feed/search/list endpoints
- **Authenticated access**: Use `bsky.social` (requires `BSKY_IDENTIFIER` + `BSKY_APP_PASSWORD`)
- Workers should NOT use `bsky.social` for public read-only operations — it returns `AuthMissing` errors

## Collector Tool Pattern

Both Bluesky and Reddit collectors follow a standard pattern:
1. MCP tool registered with Zod input schema validation
2. Fetch from external API → normalize to `SignalEvent` with `source_type`, `content_hash`
3. Deduplicate by `content_hash` via `store.findSignalByContentHash()`
4. Persist new signals via `store.createSignal()`
5. Return `{ ok: true, collected: N, duplicates: N, total_fetched: N }`

Utility functions `hashContent()` and `nowIso()` are currently duplicated in `collectors/bluesky.ts` and `collectors/reddit.ts` — extract to shared module when adding new collectors.

## Thread Clustering Algorithm

`cluster()` in `radar-core/src/cluster.ts`:
- **Method**: TF-IDF cosine similarity with union-find agglomerative clustering
- **Default threshold**: 0.15 (configurable via `ClusterOptions.similarityThreshold`)
- **Performance**: O(n²) pairwise comparison — suitable for current scale, may need optimization for 10k+ signals
- Cross-source signals (Bluesky + Reddit) on the same topic cluster together

## Dual Reducer Architecture

Two independent reduction paths exist in radar-core:
1. **`reducer.ts`** → `reduceRadarPackets(packets: RadarAssessmentPacket[])` → `ReducedSnapshot` (packet-based aggregation, weighted median)
2. **`snapshot-reducer.ts`** → `reduce(threads: Thread[])` → `RadarSnapshot` (thread-based synthesis with narrative branches, deterministic)

Both are wired into `threat-radar-mcp`: the thread-based reducer triggers when threads exist for a radar during `reduceLive` and `sealDailySnapshot`.

## AT Protocol Design Decisions

- **memberRefs**: Thread records store local `signal_event_id` strings in `memberRefs` instead of AT URIs. These should be resolved to actual AT URIs when the full publishing pipeline is wired end-to-end.
- **Client config**: `signal-atproto` client accepts a config object (`identifier`/`password`), not env vars directly. Env var reading belongs at the integration layer.

## Federation Architecture (Enso Protocol)

The federation module (`threat-radar-mcp/src/lib/federation.ts`) implements Enso-style envelope messaging adapted from `promethean/experimental/enso-protocol/`.

### API Endpoints
- `GET /api/federation/status` — Returns federation status, peers, trust circle (no auth)
- `POST /api/federation/receive` — Receives envelopes from peers (**no auth** — intentional for inter-peer communication)
- `POST /api/federation/peers` — Add peer to federation (admin auth required)
- `DELETE /api/federation/peers/:id` — Remove peer (admin auth required)
- `POST /api/federation/trust/:peerId` — Add peer to trust circle (admin auth required)
- `DELETE /api/federation/trust/:peerId` — Remove peer from trust circle (admin auth required)
- `POST /api/federation/broadcast` — Broadcast local snapshot to all peers (admin auth required)
- `POST /api/federation/discover` — Discover peers via AT Protocol profiles (admin auth required)

### Privacy Model
- Only aggregate snapshots (no raw signals) are shared via federation
- `createAggregatePayload()` strips all non-aggregate data before sending
- Trust circle filtering: only trusted peers' data appears in aggregated views

### Design Choices
- Envelope hash uses deterministic canonical JSON serialization
- No Ed25519 signature verification yet (field exists on envelope but unused)
- Sequential AT Protocol discovery (could be parallelized with Promise.allSettled)
- Unknown senders are auto-registered as 'untrusted' peers

## Browser Embedding: Trigram Fallback

The `signal-embed-browser` package uses a lightweight trigram-based text similarity as fallback when ONNX models are unavailable:
- **Hash space**: 256 buckets (character-level trigrams hashed to 0-255)
- **Method**: Character trigrams → hash vector → cosine similarity
- **Limitation**: Hash collisions at 256 buckets reduce precision for large vocabularies; only character trigrams, not word n-grams
- **Full ONNX path**: WebGPU → WebNN → WASM → trigram-cpu fallback chain; currently only trigram-cpu verified in tests

## Testing Notes

- **vitest version**: Workspace uses vitest 0.34.6 which does NOT support `--grep` flag. Use file path targeting instead: `npx vitest run tests/specific.test.ts`
- **Postgres tests**: Tests that touch Postgres create tables with `IF NOT EXISTS` — safe to run repeatedly
- **Polling hook tests**: vitest fake timers conflict with `@testing-library/react`'s `waitFor` (causes timeouts). Use a `flushPromises()` helper with `act()` + `queueMicrotask` instead of `waitFor`. Working pattern in `threat-radar-web/src/api/__tests__/useRadarPolling.test.tsx`.
- **threat-radar-web vitest**: Uses vitest 1.6.x (not workspace 0.34.6). Use `-t` for pattern matching, not `--grep`.
