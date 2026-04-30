# Vexx Cosine Consumer Migration

## Status
Draft

## Purpose

Identify the real cosine-similarity consumers in the workspace and define which ones should migrate to `vexx`, in what order, and by what seam.

This spec is intentionally practical.

It is not about every mathematical cosine helper in the workspace.
It is about the consumers where:
- vector count is non-trivial
- repeated scoring is on a hot path
- CPU fallback or naive pairwise scans are already visible
- an HTTP accelerator boundary is acceptable

## Current truth

`vexx` is already integrated into two live paths:

1. `orgs/open-hax/openplanner/src/lib/mongo-vectors.ts`
   - application-side fallback scan can offload top-k cosine to `vexx`
2. `orgs/octave-commons/eros-eris-field` + `eros-eris-field-app`
   - semantic edge scoring can offload cosine matrix work to `vexx`

This spec covers the next consumers.

## Knoxx status

Knoxx does **not** currently appear to own a direct cosine hot loop in the active backend.

Current live reading:
- Knoxx agent-facing graph and memory work is primarily delegated outward
- graph and memory surfaces target OpenPlanner contracts
- `semantic_query` in the current backend is still a bounded corpus/query surface, not a local vector-cosine engine

Relevant anchors:
- `orgs/open-hax/knoxx/backend/src/cljs/knoxx/backend/core.cljs`
- `orgs/open-hax/knoxx/specs/knowledge-ops-knoxx-graph-query-contract-v1.md`
- `orgs/open-hax/knoxx/specs/knowledge-ops-graph-memory-roadmap.md`

So the short answer is:

- **Knoxx is mostly handled through OpenPlanner today** for vector-backed memory behavior.
- Knoxx should adopt `vexx` primarily through client/use-site contracts, not by inventing a separate cosine engine in the Knoxx backend.

## Selection rule

Migrate a consumer to `vexx` when all of the following are true:

1. the consumer performs repeated cosine or nearest-neighbor style work over multiple embeddings
2. the consumer is not purely browser-only or tiny-data-only
3. a network hop to `vexx` is acceptable for the caller
4. the consumer benefits from GPU/NPU dispatch or a shared top-k/matrix primitive

Keep a local cosine helper when any of the following are true:

1. tests or fixtures only
2. single-digit vectors or tiny in-memory cases
3. browser-only code with no local service contract
4. lexical cosine over TF/TF-IDF rather than embedding vectors

## Consumer inventory

## Tier 0 - Already migrated

### OpenPlanner fallback scan
- `orgs/open-hax/openplanner/src/lib/mongo-vectors.ts`
- Status: done
- Migration seam:
  - optional `vexx /v1/cosine/topk`

### Eros-Eris semantic edge scoring
- `orgs/octave-commons/eros-eris-field/src/semantic.ts`
- `orgs/octave-commons/eros-eris-field-app/src/index.ts`
- Status: done
- Migration seam:
  - optional `vexx /v1/cosine/matrix`

## Tier 1 - High-value next migrations

### Cephalon context scoring
- `orgs/octave-commons/cephalon/packages/cephalon-ts/src/context/assembler.ts:155-185`
- Why it matters:
  - `scoreMemory` computes cosine similarity in a path directly involved in context assembly
  - this is an agent-facing retrieval path where consistency with the wider graph/memory stack matters
- Proposed seam:
  - add a `VexxScorer` or generic similarity scorer port under `cephalon-ts`
  - use local cosine for tiny batches
  - use `vexx /v1/cosine/topk` or matrix when candidate counts cross a threshold

### Cephalon MongoDB memory store fallback
- `orgs/octave-commons/cephalon/packages/cephalon-ts/src/core/mongodb-memory-store.ts:241-256`
- Why it matters:
  - direct application-side cosine over fetched Mongo memories
  - structurally similar to the OpenPlanner fallback that already moved to `vexx`
- Proposed seam:
  - mirror the OpenPlanner pattern
  - offload bounded top-k over candidate memory embeddings

### Cephalon in-memory memory store
- `orgs/octave-commons/cephalon/packages/cephalon-ts/src/core/memory-store.ts:245-271`
- Why it matters:
  - if the in-memory store stays test-only or tiny-data-only, keep local cosine
  - if it is used in production-sized contexts, add an optional scorer adapter
- Proposed seam:
  - adapter port first
  - `vexx` only when result counts justify it

### Eta-Mu semantic graph analysis
- `orgs/open-hax/eta-mu/pi/agent/extensions/skill-graph-aco.ts:505-553`
- Why it matters:
  - explicit all-pairs semantic edge construction over embedding vectors
  - this is exactly the kind of pairwise scoring work `vexx` is meant to absorb
- Proposed seam:
  - replace nested cosine loops with `vexx /v1/cosine/matrix`
  - keep thresholding/top-k selection local after scores are returned

## Tier 2 - Strong candidates, but secondary

### packages/utils in-memory chroma
- `packages/utils/src/in-memory-chroma.ts:70-81`
- Why it matters:
  - reusable library code with direct query-by-embedding scan
- Caveat:
  - often used in tests or tiny local stores
- Proposed seam:
  - only add `vexx` as an optional adapter, not a hard dependency

### Promethean pipelines core clustering
- `orgs/octave-commons/promethean/pipelines/core/src/index.ts:127-185`
- Why it matters:
  - nearest-neighbor style clustering and stats over embedding maps
- Caveat:
  - pipeline/offline batch workload may prefer direct local batch jobs or a future `vexx` CLI mode rather than HTTP
- Proposed seam:
  - `vexx /v1/cosine/matrix` for batch runs when vector counts are large

### Cookbookflow grouping
- `orgs/octave-commons/promethean/pipelines/cookbookflow/src/03-group.ts:26-41`
- Why it matters:
  - greedy nearest-neighbor grouping using repeated cosine
- Caveat:
  - likely offline and modest scale
- Proposed seam:
  - optional batch scorer later, not urgent

## Tier 3 - Probably leave local for now

### Resume / Mythloom lexical scoring
- `src/resume-workbench/scoring.ts`
- `orgs/octave-commons/mythloom/src/scoring.ts`
- Why not now:
  - lexical term-frequency cosine, not embedding-system hot path

### Threat-radar browser/local packages
- `threat-radar-deploy/packages/signal-embed-browser/src/similarity.ts`
- `threat-radar-deploy/packages/radar-core/src/cluster.ts`
- `threat-radar-deploy/packages/radar-core/src/connections.ts`
- Why not now:
  - browser/local/offline semantics differ
  - avoid forcing `vexx` onto front-end-native workflows without a stronger need

## Migration order

1. Cephalon MongoDB memory store
2. Cephalon context assembler scorer port
3. Eta-Mu semantic graph analysis
4. packages/utils in-memory chroma adapter
5. Promethean offline pipeline consumers

## Why this order

- The first two are architecturally adjacent to OpenPlanner and already look like the same pattern we just migrated.
- Eta-Mu is the clearest remaining explicit pairwise semantic loop.
- utils/pipelines are valuable, but more likely to want optional or offline-facing integration rather than a hard service dependency.

## Knoxx-specific implication

Knoxx should be treated as a **client of `vexx` through shared contracts**, not as a primary direct cosine migration target right now.

That means:
- Knoxx benefits as OpenPlanner uses `vexx`
- Knoxx benefits when Cephalon/walker/graph contracts use `vexx`
- Knoxx itself only needs direct `vexx` integration once a genuine local cosine hot path appears in the live backend

## Required shared seams

The next migrations should not each invent their own HTTP helper.

We need:

1. one TypeScript `vexx` client
2. one threshold policy for when to offload
3. one degrade/fallback policy
4. one auth/header policy

That is the bridge to the client-generation spec.

## Definition of done

This migration program is successful when:

1. the major server-side cosine hot paths route through `vexx`
2. `cephalon-ts` stops hand-rolling production cosine scans in its Mongo-backed retrieval path
3. at least one graph/semantic all-pairs consumer outside `eros` uses `vexx /v1/cosine/matrix`
4. Knoxx relies on `vexx` through shared upstream contracts rather than another bespoke scoring loop
