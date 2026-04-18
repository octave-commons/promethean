# Shared Semantic Accel Clojure Runtime

## Status
Draft

## Summary
Build a shared local semantic-compute runtime that lifts the proven acceleration patterns from `orgs/octave-commons/fork_tales` into a reusable, Clojure-first package for OpenPlanner, Knoxx, and adjacent graph/layout systems.

The runtime should make semantic work feel like a local systems primitive instead of a loose pile of HTTP calls and per-request fallback logic.

The core idea is simple:
- keep the hot path local
- keep buffers warm
- keep device policy explicit
- keep fallbacks loud
- keep Python quarantined

## Why this exists
Right now the workspace has the right ingredients in the wrong shape.

- `fork_tales` already has the best acceleration work:
  - native ONNX Runtime session management
  - preallocated buffers and pooled scratch state
  - explicit NPU/GPU/CPU selection
  - silent CPU fallback detection
  - thresholded cosine-matrix offload
  - adaptive NPU/GPU routing
- `openplanner` is the main semantic storage and retrieval plane, but it still does too much work inline on request paths.
- `knoxx` already has strong Clojure/CLJS integration points, but part of its "semantic" behavior is still lexical file scanning.
- `eros-eris-field` is a physics/layout kernel that should consume reduced semantic edges, not own embedding inference.

The result is duplicated semantic work, inconsistent fallback behavior, and too much expensive compute happening at the wrong boundary.

## Intent
Create one shared semantic accelerator that:

1. owns local embedding and similarity hot paths
2. prefers Clojure for performance-critical orchestration
3. uses a native ONNX Runtime core for device-sensitive work
4. serves both JVM/Clojure callers and local TypeScript services
5. keeps Python out of the hot path unless a narrow bridge is explicitly required

## Goals
- Shared local runtime for:
  - `embed-batch`
  - `cosine-topk`
  - `cosine-matrix`
  - device/runtime health snapshots
  - benchmark and fallback receipts
- Clojure-first API for:
  - `orgs/open-hax/knoxx/ingestion`
  - future JVM-side OpenPlanner helpers if introduced
- Local bulk API for TypeScript callers:
  - `orgs/open-hax/openplanner`
  - `orgs/open-hax/knoxx/backend`
- Explicit device policy:
  - `AUTO`
  - `NPU`
  - `GPU`
  - `CPU`
  - strict/noisy fallback modes
- Reuse `fork_tales` native runtime ideas rather than re-discovering them in each repo.

## Non-goals
- Rewriting all TypeScript services into Clojure.
- Moving embedding inference into `eros-eris-field`.
- Making Python the canonical runtime for embeddings or cosine similarity.
- Hiding device fallback behind "best effort" behavior.
- Forcing all services onto one embedding model immediately.

## Source Anchors
The following code is the practical source material for this spec.

### Fork Tales acceleration patterns
- `orgs/octave-commons/fork_tales/part64/code/world_web/native/c_embed_runtime.cpp`
- `orgs/octave-commons/fork_tales/part64/code/world_web/c_double_buffer_backend.py`
- `orgs/octave-commons/fork_tales/part64/code/world_web/embed_lane_worker.py`
- `orgs/octave-commons/fork_tales/specs/npu-benchmark-spec.md`
- `orgs/octave-commons/fork_tales/docs/notes/research/2026-02-20-local-embeddings-benchmarking-and-mrl-selection.md`

### Python quarantine / bridge discipline
- `orgs/octave-commons/shibboleth/src/promptbench/python/embed.clj`
- `orgs/octave-commons/shibboleth/src/promptbench/python/cluster.clj`
- `orgs/octave-commons/shibboleth/src/promptbench/python/parquet.clj`

### Current consumer bottlenecks
- `orgs/open-hax/openplanner/src/routes/v1/events.ts`
- `orgs/open-hax/openplanner/src/routes/v1/documents.ts`
- `orgs/open-hax/openplanner/src/lib/mongo-vectors.ts`
- `orgs/open-hax/knoxx/backend/src/cljs/knoxx/backend/core.cljs`
- `orgs/open-hax/knoxx/ingestion/src/kms_ingestion/jobs/worker.clj`
- `orgs/octave-commons/eros-eris-field/src/sim.ts`

## Proposed placement
Canonical implementation home:
- `packages/<working-name>/`

Transitional compatibility surface:
- keep `packages/embedding/` as the TypeScript-facing client shim or adapter layer
- do not make `packages/embedding/` the canonical compute engine

Why this placement:
- the workspace contract says shared prototyping belongs in `packages/*`
- this is a reusable local systems component, not a single-app implementation detail
- multiple repos need it, so it should not be buried inside one consumer

## Proposed package shape
Working shape inside `packages/<working-name>/`:

```text
packages/<working-name>/
  deps.edn
  src/
    semantic_accel/
      runtime.clj
      embed.clj
      cosine.clj
      health.clj
      bench.clj
      http.clj
  native/
    c_embed_runtime.cpp
    cosine_matrix_dynamic.onnx
  resources/
    config.edn
  test/
    semantic_accel/
      runtime_test.clj
      cosine_test.clj
      bench_test.clj
```

## Runtime layers
### 1. Native core
Responsibilities:
- own persistent ONNX Runtime sessions
- own provider selection
- own pooled buffers
- own strict fallback detection
- own low-allocation batch execution

Preferred implementation:
- reuse and simplify the `fork_tales` native runtime approach
- expose a narrow C ABI callable from Clojure/JNA or JNI

Why not pure JVM only:
- ONNX Runtime Java can expose CUDA/OpenVINO provider hooks, but packaging and provider availability are more fragile than directly controlling the native runtime
- the proven local implementation in this workspace is already native-first

### 2. Clojure API
Responsibilities:
- stable public API for JVM callers
- configuration normalization
- route selection
- benchmarking and receipts
- optional local HTTP surface for non-JVM callers

Core functions:
- `(embed-batch texts opts)`
- `(cosine-topk query rows opts)`
- `(cosine-matrix left right opts)`
- `(runtime-snapshot)`
- `(bench-run opts)`

### 3. Local bulk API
Responsibilities:
- serve TypeScript consumers without forcing them into per-request remote embedding chaos
- enforce bulk calls over chatty single-item loops

Suggested endpoints:
- `POST /v1/embed/batch`
- `POST /v1/cosine/topk`
- `POST /v1/cosine/matrix`
- `GET /v1/health`
- `GET /v1/runtime`

## Device policy
### Modes
- `AUTO`
- `NPU`
- `GPU`
- `CPU`

### Auto behavior
Default preference order should mirror the successful `fork_tales` strategy:
- NPU first when present and healthy
- GPU second
- CPU last

### Strictness
Support:
- `strict`
  - fail if requested hardware path silently falls back to CPU
- `warn`
  - record fallback and continue
- `off`
  - only for debugging

### Thresholded offload
Do not treat all work as equally worthy of device dispatch.

Rules:
- small requests may stay local on the current runtime
- cosine all-pairs work only offloads above explicit row-count thresholds
- chunked row blocks are required for large cosine matrix jobs
- device routing should be measurable, not magical

## Python policy
### Default rule
Python is not allowed in the hot path.

### Allowed exception
If a capability is still only realistically available through Python, it must be quarantined behind a `shibboleth`-style bridge:
- one dedicated namespace boundary
- one initialization path
- one cache layer
- no Python-specific concerns leaking into callers

This is acceptable for research, migration, or comparison harnesses.
It is not acceptable as the main inference or cosine runtime.

## Integration plan
### OpenPlanner
Primary target.

Current issues:
- request-path indexing in:
  - `src/routes/v1/events.ts`
  - `src/routes/v1/documents.ts`
- repeated query embedding per partition in:
  - `src/lib/mongo-vectors.ts`
- app-side cosine fallback in TypeScript when native vector search is unavailable

Required changes:
1. compute query embeddings once per model, not once per partition
2. move inline indexing toward batch/background ingestion boundaries
3. replace TypeScript cosine fallback with accelerator-backed top-k or chunked matrix operations
4. keep Mongo as storage/query authority while delegating semantic compute to the accelerator

Suggested endpoint additions:
- `POST /v1/documents/batch`
- `POST /v1/events/batch-index`

### Knoxx ingestion
Natural Clojure-first consumer.

Current issues:
- one-document-at-a-time OpenPlanner ingest calls from the worker
- batching exists, but the semantic work still gets fragmented at the downstream boundary

Required changes:
1. keep file extraction and throttling in Clojure
2. send batch document/index requests downstream
3. optionally call the shared accelerator directly for local precomputation when justified

### Knoxx backend
Current issue:
- `semantic_query` is currently a lexical local-file scan dressed in semantic language

Required changes:
1. route semantic retrieval to OpenPlanner vector search or direct accelerator-backed local retrieval
2. reserve lexical scan as fallback, not the primary strategy
3. preserve current tool affordances:
  - `semantic_query`
  - `semantic_read`
  - `memory_search`
  - `graph_query`

### Eros-Eris Field
Do not move embedding inference here.

Required changes upstream of the field:
1. produce reduced semantic edges elsewhere
2. send only the top attractive and minimal repulsive semantic relations
3. keep the field focused on force integration and graph layout

## Bench and verification contract
The benchmark contract should inherit the `fork_tales` NPU benchmark discipline.

Every run should capture:
- compile/load time
- time-to-first-inference
- p50 / p90 / p99 / max latency
- boundary vs model-only timing
- selected device
- provider details
- fallback detection result
- batch size
- vector dimension

At minimum, validate:
- `embed-batch` on CPU, GPU, and NPU where available
- `cosine-topk` on medium and large candidate sets
- `cosine-matrix` on threshold boundaries
- repeated warm runs show stable p99
- strict mode actually fails on silent fallback

## Migration phases
### Phase 0 - Spec and skeleton
- approve package name
- create package skeleton
- decide whether `packages/embedding` becomes a client shim or stays frozen

### Phase 1 - Native extraction
- lift the minimal native runtime and cosine machinery out of `fork_tales`
- remove simulation-specific coupling
- preserve pooled-buffer and fallback-detection behavior

### Phase 2 - Clojure API
- add the canonical JVM API
- add health and benchmark surfaces
- add strict device config handling

### Phase 3 - Local bulk API
- expose batch endpoints for TypeScript services
- ensure single-item calls are wrappers around batch forms, not separate logic

### Phase 4 - OpenPlanner integration
- fix query embedding fan-out
- replace TypeScript cosine fallback
- shift indexing toward batch/background boundaries

### Phase 5 - Knoxx integration
- switch `semantic_query` to real vector retrieval
- batch ingestion handoff

### Phase 6 - Eros-Eris edge reduction
- add upstream semantic edge pruning and top-k shaping
- keep the field package compute-focused and embedding-agnostic

## Risks
- Native packaging and provider deployment can drift across hosts.
- OpenVINO/NPU support may be machine-specific.
- Mixed embedding-model dimensions in OpenPlanner still require model-aware routing.
- Over-eager abstraction could slow down the first useful integration.
- If the package tries to solve storage and compute at the same time, scope will bloat.

## Guardrails
- Keep the accelerator responsible for compute, not persistence.
- Keep the package API bulk-first.
- Keep fallback state observable.
- Keep Python optional and quarantined.
- Keep `eros-eris-field` free of embedding/runtime concerns.

## Definition of done
This spec is satisfied when:

1. a shared package exists under `packages/*`
2. the canonical API is Clojure-first
3. a native runtime provides local embedding and cosine compute
4. OpenPlanner no longer re-embeds once per partition for the same query
5. OpenPlanner no longer relies on TypeScript cosine fallback as the primary compatibility path
6. Knoxx `semantic_query` no longer relies on lexical local file ranking as the primary semantic path
7. `eros-eris-field` consumes reduced semantic edges rather than embedding locally
8. Python is absent from the hot path
9. benchmark artifacts include p99, TTFI, and fallback verification

## Naming shortlist
This spec stays neutral on the final name, but the current shortlist is:

### xx-family
- `vexx`
  - short, local, fast, feels like vector execution without being overly literal
- `vecxx`
  - the most explicit proxx/voxx-style option, though slightly uglier on the tongue
- `semxx`
  - semantically direct, but visually harsher than the others

### Greek-family
- `Metis`
  - adaptive cunning; best fit for device routing, fallback discipline, and policy-aware acceleration
- `Mneme`
  - memory and recall; strong fit if the package is framed as retrieval infrastructure
- `Dromos`
  - lane, course, run-path; strong fit if the package is framed as the semantic fast lane
- `Semeion`
  - mark/sign; the most semantically poetic, but a bit heavier as a package name

## Recommendation
Current recommendation:
- Greek-family: `Metis`
- xx-family: `vexx`

Why:
- `Metis` fits the adaptive, policy-aware nature of the runtime
- `vexx` fits the short local-service naming grammar already established by `proxx` and `voxx`
