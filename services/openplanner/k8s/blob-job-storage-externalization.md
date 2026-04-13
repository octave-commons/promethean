# OpenPlanner blob/job storage externalization plan

## Status
Draft

## Scope
This document is intentionally limited to the `services/openplanner/k8s` runtime/deployment lane.
It does **not** change application source.
It exists to coordinate the Kubernetes/runtime side of the move from legacy local-file storage toward a cleaner MongoDB-first deployment contract.

## Why this exists
The Kubernetes path now has a working MongoDB-backed overlay with rolling updates and locally validated continuity.

However, the app still uses `OPENPLANNER_DATA_DIR` as a filesystem root for non-Mongo state.
That means the current MongoDB overlay is good enough for a local rolling-update candidate, but it is not yet the final clean zero-downtime shape.

## Current filesystem coupling
Observed from the current application code:

- `src/lib/paths.ts`
  - derives `blobsDir = <OPENPLANNER_DATA_DIR>/blobs/sha256`
  - derives `duckdbDir = <OPENPLANNER_DATA_DIR>/duckdb`
  - derives `jobsPath = <OPENPLANNER_DATA_DIR>/jobs/jobs.jsonl`
- `src/routes/v1/blobs.ts`
  - writes uploaded blobs to the local filesystem
- `src/lib/jobs.ts`
  - persists job state as append-only JSONL on the local filesystem
- `src/routes/v1/jobs.ts`
  - initializes the in-process file-backed job queue from `jobsPath`

So even when `OPENPLANNER_STORAGE_BACKEND=mongodb`:

- structured/query/vector data can live in MongoDB
- but blobs and job state still live on disk under `OPENPLANNER_DATA_DIR`

## Why this matters for Kubernetes
For a cluster-safe runtime, we want app replicas to avoid relying on a shared mutable filesystem for correctness-critical coordination.

The current MongoDB overlay works because:

- the app replicas are compatible enough with the shared PVC in local kind
- rolling updates were validated locally with uninterrupted health responses

But the remaining filesystem contract still creates long-term pressure around:

- blob consistency and portability
- job queue durability semantics
- replica coordination
- multi-node scheduling assumptions
- backup/restore boundaries

## Target runtime contract
The clean target shape is:

- **MongoDB** for structured/query/vector data
- **Object storage** for blobs
- **MongoDB or another durable DB-backed queue/projection** for job state
- **No shared correctness-critical application filesystem** except optional ephemeral cache/scratch

### Desired environment split
The runtime-side desired end state is an application contract like:

- `OPENPLANNER_STORAGE_BACKEND=mongodb`
- `OPENPLANNER_BLOBS_BACKEND=file|s3`
- `OPENPLANNER_BLOBS_DIR=...` for transitional file mode
- `OPENPLANNER_BLOBS_BUCKET=...`
- `OPENPLANNER_BLOBS_ENDPOINT=...`
- `OPENPLANNER_BLOBS_REGION=...`
- `OPENPLANNER_BLOBS_FORCE_PATH_STYLE=true|false`
- `OPENPLANNER_JOBS_BACKEND=file|mongodb`
- `OPENPLANNER_JOBS_PATH=...` for transitional file mode

This keeps the migration reversible while decoupling the app from one overloaded `OPENPLANNER_DATA_DIR` root.

## Recommended deployment progression

### Phase A — current recommended path
Already achieved in `services/openplanner/k8s/overlays/local-kind-mongodb/`:

- MongoDB-backed OpenPlanner runtime
- rolling app deployment
- local continuity verification script
- shared filesystem retained only for remaining blob/job paths

### Phase B — split file contracts without changing backend yet
Source-side request for the migration lane:

1. separate blob path from generic `OPENPLANNER_DATA_DIR`
2. separate jobs path from generic `OPENPLANNER_DATA_DIR`
3. keep transitional file mode working
4. keep MongoDB runtime as the default k8s backend

Kubernetes/runtime effect:

- app PVC can shrink in scope
- blob and job storage can be reasoned about independently
- overlays stop pretending one data directory means one storage concern

### Phase C — move job state into MongoDB
Source-side request:

- replace `jobs/jobs.jsonl` append-log semantics with a Mongo-backed job collection or projection
- preserve current API behavior (`GET /jobs`, `GET /jobs/:id`, async updates)
- keep a migration bridge if needed for existing local job files

Kubernetes/runtime effect:

- one less shared mutable filesystem dependency
- replica-safe job state
- clearer operational backup surface

### Phase D — move blobs to object storage
Source-side request:

- add an object-store-backed blob implementation while preserving the `/v1/blobs` API
- allow a transitional local-file backend for non-k8s workflows

Recommended local cluster add-on:

- **MinIO** for local-kind
- installed as a chart-backed dependency when the source-side blob backend lands

Recommended higher-environment target:

- S3-compatible object store (AWS S3, Cloudflare R2, MinIO, or equivalent)

Kubernetes/runtime effect:

- app replicas no longer need a shared blob filesystem
- blob durability and backup become storage-system concerns instead of pod/PVC concerns
- app pods can become much closer to stateless

## What the k8s side should do now
Until source support lands, the runtime/deployment lane should:

1. keep `local-kind-mongodb` as the default overlay
2. keep the old DuckDB/Chroma path only as compatibility fallback
3. treat the remaining shared PVC as transitional, not canonical
4. avoid creating more overlays that deepen the filesystem assumption
5. prepare for a future chart-backed object-store add-on, but do not wire it into the app until the source contract exists

## Explicit handoff request to the concurrent migration lane
When the other agent reaches the right point, the runtime side wants these source-level affordances next:

1. split `OPENPLANNER_DATA_DIR` into narrower blob/job/file contracts
2. add Mongo-backed job persistence
3. add object-store-backed blob persistence
4. keep transitional local-file modes for non-k8s workflows
5. keep the public API surface stable during the backend swap

## Acceptance criteria for declaring OpenPlanner k8s "clean"
We should consider the OpenPlanner Kubernetes runtime clean when all of the following are true:

1. `OPENPLANNER_STORAGE_BACKEND=mongodb` is the canonical runtime path
2. app replicas do not depend on shared local filesystem state for blob correctness
3. app replicas do not depend on shared local filesystem state for job correctness
4. rolling updates remain continuity-safe
5. the remaining pod filesystem can be ephemeral or cache-only

## Current conclusion
The current MongoDB overlay is the right active path and is already good enough for local rolling updates.

But the final zero-downtime / cluster-clean milestone is **not** "MongoDB exists".
It is: **blob and job storage stop depending on shared application filesystem state**.
