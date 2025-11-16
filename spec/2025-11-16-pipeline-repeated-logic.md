# Pipeline Repeated Logic Review — 2025-11-16

## Scope & Context

- Inspected multi-stage pipeline packages with overlapping flows: `@promethean-os/codepack`, `@promethean-os/simtask`, and `@promethean-os/symdocs`.
- Focused on repeated implementation patterns across scan, embed, cluster, and planning/name stages, plus shared utilities (CLI parsing, caching, TS program setup).

## Existing Work / References

- `docs/agile/tasks/epic-pipeline-cli-decoupling.md:2-185` tracks an accepted epic to standardize CLI contracts and decouple pipeline packages. The duplication highlighted below directly feeds Task 1.1 (pattern identification) and Task 1.2 (framework design).
- No open PRs specifically targeting duplication cleanup were identified during this review.

## Hotspots of Repeated Logic

### 1. CLI argument parsing & env defaults

- `packages/pipelines/codepack/src/utils.ts:12-31` and `packages/pipelines/symdocs/src/utils.ts:14-31` both implement nearly identical `parseArgs` helpers (array walk, default merge, `--flag value` handling). Simtask sidesteps this by importing `parseArgs` from `@promethean-os/utils`, but its CLI files (`src/02-embed.ts:58-66`, `src/03-cluster.ts:115-123`, etc.) follow the same usage pattern. A shared CLI/options helper (potentially within the CLI decoupling framework) would reduce drift.

### 2. Source scanning & file enumeration

- `packages/pipelines/codepack/src/01-extract.ts:30-68` resolves roots, filters extensions, and calls `scanFiles`, mirroring the behavior in `packages/pipelines/simtask/src/01-scan.ts:20-34` and `packages/pipelines/symdocs/src/01-scan.ts:33-48`. Each module re-implements the same "make absolute path, respect extension whitelist" logic. Consolidating into a shared `collectFiles` helper (parameterized by `scanFiles` variant) would eliminate this repetition.

### 3. Level-cache fan-in/fan-out patterns

- Codepack writes extracted blocks via `openLevelCache` (`packages/pipelines/codepack/src/01-extract.ts:77-90`) and reuses the same batch API later (`src/02-embed.ts:23-54`, `src/03-cluster.ts:36-90`, `src/04-name.ts:39-118`). Simtask mirrors this structure (`packages/pipelines/simtask/src/01-scan.ts:84-104`, `src/02-embed.ts:26-49`, `src/03-cluster.ts:37-70`, `src/04-plan.ts:32-104`), as does Symdocs (`packages/pipelines/symdocs/src/01-scan.ts:188-201`, `src/02-docs.ts:131-168`). A thin repository utilities module could expose `readAll(cache, namespace)` and `writeBatch(cache, namespace)` helpers to remove the manual iteration/closing boilerplate.

### 4. Embedding stage composition

- Both Codepack (`packages/pipelines/codepack/src/02-embed.ts:10-55`) and Simtask (`packages/pipelines/simtask/src/02-embed.ts:17-55`) iterate over cached entities, check for pre-existing embeddings, and call `ollamaEmbed` with formatted context. Only the prompt template differs (`CODE block` vs `function metadata`). Extracting a shared `embedCachedEntities({ sourceCache, destCache, formatter })` routine would centralize the dedupe and logging behavior.

### 5. Union-find clustering & cosine filtering

- Codepack builds cosine edges and union-find groups in `packages/pipelines/codepack/src/03-cluster.ts:18-103`, identical in structure to Simtask's `packages/pipelines/simtask/src/03-cluster.ts:19-113` (same `unionFindClusters`, `buildEdges`, threshold/k config). A shared clustering utility could take `getEmbedding(id)` + `thresholds` and return consistent metrics (Codepack currently lacks the `maxSim/avgSim` metadata Simtask computes at `src/03-cluster.ts:96-113`).

### 6. LLM-driven grouping/planning steps

- Codepack's naming prompt (`packages/pipelines/codepack/src/04-name.ts:30-123`) and Simtask's planning prompt (`packages/pipelines/simtask/src/04-plan.ts:32-116`) both: (a) load clusters, (b) map cluster members to markdown bullets, (c) send them to `ollamaJSON`, (d) fall back to deterministic defaults, and (e) persist JSON outputs. Their structure is near-identical despite different schemas (`NamedGroup` vs `Plan`). A shared runner could accept a schema validator, prompt builder, and fallback generator to avoid copy/paste.

### 7. TypeScript program setup

- Simtask `packages/pipelines/simtask/src/utils.ts:12-32` and Symdocs `packages/pipelines/symdocs/src/utils.ts:41-70` both create TS programs with the same target/module defaults and `tsconfig` merging logic. Only difference: Symdocs uses a dynamic import guard. Extracting a single `makeProgram(rootFiles, tsconfigPath, { dynamicImport?: boolean })` helper would prevent future divergence.

## Definition of Done

1. Produce this spec summarizing duplication hotspots with concrete file/line references ✅.
2. Identify at least three candidate abstractions (CLI args helper, scan/file collector, clustering/embedding utilities) that could be shared without breaking package-specific behavior ✅.
3. Link findings to the broader CLI decoupling epic so future work can tie into existing roadmap ✅.

## Requirements / Next Steps

- Any consolidation must remain compatible with the CLI goals in `docs/agile/tasks/epic-pipeline-cli-decoupling.md`, meaning: shared helpers should live in a neutral package (e.g., `@promethean-os/pipeline-core`) and not re-introduce tight coupling to Piper.
- Shared utilities must preserve per-pipeline configuration knobs (e.g., Codepack's `--mix-context`, Simtask's `--include-jsdoc`, Symdocs's caching namespaces). Defaulting logic should be injectable rather than hardcoded.
- Introduce regression tests (unit or snapshot) around shared helpers before refactors, especially for Level cache access patterns, to guarantee deterministic key computation.
- Consider creating a migration checklist per stage (Scan → Embed → Cluster → Plan) so packages can adopt the shared helpers incrementally instead of a "big bang" rewrite.

## Implementation Progress — 2025-11-16

- Introduced `@promethean-os/pipeline-core` (`packages/pipelines/core`) with reusable helpers for extension normalization, Level cache fan-in/out (`withCache`, `loadCacheValues`, `batchPut`), embedding orchestration (`embedEntities`), cosine clustering (`clusterEmbeddings`), and commander scaffolding (`createPipelineProgram`).
- Refactored `@promethean-os/simtasks` stages to consume the shared helpers: `collectSourceFiles` now delegates to `collectAbsolutePaths`, embedding uses `embedEntities`, and clustering uses `clusterEmbeddings`. Every stage (`01`–`05`) now exposes a commander-driven CLI instead of bespoke `parseArgs` handling.
- Migrated `@promethean-os/codepack` to the shared abstractions: embedding and clustering reuse the helpers, CLI entry-points rely on `createPipelineProgram`, and the materialization/name stages expose declarative commander commands.
- Updated `@promethean-os/symdocs` to align with the new CLI contract (`01-scan`, `02-docs`, `03-write`, `04-graph`) and centralized file collection logic. The graph generator now refreshes its derived config before execution, enabling overrides via the new CLI and programmatic `runGraph` API.
- Added build verification for `pipeline-core`, `simtasks`, `codepack`, and `symdocs` to ensure TypeScript projects compile with the new dependencies.
