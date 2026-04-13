# Field-Nexus Substrate Contract v1

## Status
Draft

## Parent specs

- `specs/drafts/promethean-octaves-story-backlog.md`
- `specs/drafts/graph-field-walker-treaty.md`
- `specs/drafts/walker-contract-v1.md`
- `orgs/octave-commons/cephalon/specs/contracts/memory-record.md`

## Purpose

Define the substrate contract beneath walkers.

This contract names:
- what the field is at the boundary
- what a nexus key is at the boundary
- how subjects bind into canonical and contextual lanes
- what minimal query surfaces the walker layer can assume

Without this contract, walkers have no stable ground to walk on.

## Founding rule

The field and the nexus are not private note-only ideas.

They are boundary concepts that need stable shapes.

The field gives state-conditioned meaning.
The nexus gives typed anchors and associative adjacency.

Together they form the substrate from which:
- contextual embeddings
- graph-linked retrieval
- bounded walkers
- summary-preferring associative memory

become implementable.

## Contract scope

This v1 contract defines:

1. subject identity
2. lane identity
3. field digest identity
4. nexus key shape and canonicalization
5. substrate binding record
6. minimal nexus query interface
7. lineage and lifecycle rules

This v1 contract does not define:

1. one mandatory storage backend
2. one mandatory embedding model
3. the full walker algorithm
4. the full OpenPlanner schema migration plan

## Core concepts

## 1. Subject

A subject is the thing being placed into the substrate.

Examples:
- a canonical memory record
- a summary memory
- an aggregate memory
- a graph node document
- a tool result artifact

```ts
type SubstrateSubjectRef = {
  id: string
  subjectKind: "memory" | "summary" | "aggregate" | "graph.node" | "artifact"
  source?: string
  project?: string
  sessionId?: string
}
```

## 2. Lane

Every subject may project into one or both lanes.

```ts
type SubstrateLane = "canonical" | "contextual"
```

### Canonical lane
- stable content meaning
- minimal metadata
- does not drift with live state

### Contextual lane
- field-entangled meaning
- tied to a field digest
- may have multiple projections over time

Rule:
- contextual projections must never erase the canonical projection

## 3. Field digest

The field digest is a quantized, hashable summary of runtime state used to entangle meaning with circumstance.

```ts
type FieldDigestRef = {
  fieldVersion: number
  digestHash: string
  timeBucket?: string
  cephalonId?: string
  sessionId?: string
  circuitId?: string
  focus?: string
  tagsTop?: string[]
  nexusTop?: string[]
}
```

Rules:
- `digestHash` must be derived from a canonical serialization
- digest contents should be bounded, deterministic, and cheap to diff
- digest components may become nexus keys, but the raw digest hash should not become a general-purpose nexus key

## 4. Nexus key

A nexus key is a typed anchor that multiple subjects may share.

```ts
type NexusKey = string
```

Preferred families include:
- `tag:topic/...`
- `tag:ops/...`
- `tool:...`
- `path:...`
- `url:...`
- `net:domain/...`
- `chan:...`
- `err:...`
- `repo:...`
- `hash:content/...`
- `focus/...`
- `health/...`
- `pressure/...`
- `circuit/...`

### Canonicalization rules

At minimum:
- domains lower-cased
- URLs normalized
- paths normalized
- tool names canonicalized
- tags normalized
- stable string forms only

Rule:
- deterministic keys are what make nexus real

## 5. Substrate binding record

This is the smallest boundary record tying a subject to the field/nexus substrate.

```ts
type FieldNexusBinding = {
  bindingId: string
  subject: SubstrateSubjectRef
  lane: SubstrateLane
  contentHash?: string
  normalizedHash?: string
  fieldDigest?: FieldDigestRef
  nexusKeys: NexusKey[]
  embedded?: {
    model?: string
    dims?: number
    vectorId?: string
    embeddedAt?: number
  }
  lifecycle?: {
    deleted?: boolean
    replacedBySummaryId?: string | null
  }
}
```

Rules:
- canonical lane bindings should not require a `fieldDigest`
- contextual lane bindings should include a `fieldDigest`
- `nexusKeys` should always be explicit
- lifecycle flags must be visible to readers of the substrate

## 6. Minimal nexus query interface

Walkers need a small stable surface.

```ts
interface NexusIndexClient {
  getNeighbors(key: NexusKey, options?: NeighborQueryOptions): Promise<NexusNeighbor[]>
  getDegree(key: NexusKey): Promise<number>
  getCoKeys?(key: NexusKey, limit?: number): Promise<NexusCoKey[]>
}
```

```ts
type NeighborQueryOptions = {
  limit?: number
  prefer?: "summary" | "useful" | "recent"
  includeDeleted?: boolean
}

type NexusNeighbor = {
  subjectId: string
  subjectKind?: string
  ts?: number
  kind?: string
  score?: number
}

type NexusCoKey = {
  key: NexusKey
  count: number
}
```

Rules:
- deleted subjects must be excluded by default
- preference ordering must be explicit
- co-key lookup is optional in v1

## 7. Identity and lineage rules

### Content identity
- `contentHash` identifies raw content identity
- `normalizedHash` identifies normalized semantic identity

### Contextual identity
- contextual bindings should be derivable from:
  - subject identity
  - lane
  - digest hash
  - model identity

### Retention rule
- keep canonical bindings as the durable floor
- contextual bindings may be capped per `(subject, circuit, model)` family
- if contextual bindings are compacted away, a summary or lineage pointer should remain

## 8. Relationship to memory records

The substrate does not replace the canonical memory record.

The memory record remains the boundary event/memory shape.
The field-nexus substrate adds:
- lane projection identity
- field digest binding
- nexus key binding
- optional embedding projection identity

That means a future pipeline can be read as:

```text
memory record
  -> substrate binding(s)
     -> embeddings / graph anchors / walker expansion
```

## 9. Relationship to OpenPlanner

OpenPlanner is the likeliest canonical storage/query home for much of this substrate,
but this contract is intentionally storage-agnostic.

What OpenPlanner must preserve if it becomes the primary host:
- canonical subject identities
- explicit lane identity
- field digest metadata for contextual lane
- nexus keys as queryable structure
- lifecycle visibility

## 10. Relationship to Eros-Eris Field

Field-nexus substrate and Eros-Eris are adjacent but distinct.

The substrate says:
- what state-conditioned meaning and anchors exist

Eros-Eris says:
- how graph relations and semantic edges behave as geometry and force

They meet at shared concepts like:
- semantic edges
- hot keys
- local neighborhoods
- field pressure

## 11. Relationship to walkers

Walker v1 assumes this substrate exists conceptually.

Specifically, walkers assume:
- seeds bind to canonical subjects
- subjects carry typed nexus keys
- contextual state may be represented by field digests
- summaries and aggregates can be preferred over noisy raw nodes

## Suggested implementation order

1. define canonical `NexusKey` normalization helpers
2. define `FieldDigestRef` canonical serialization and hashing
3. define `FieldNexusBinding` adapters for memory records and graph-node subjects
4. implement `NexusIndexClient` over one real backend
5. plug Walker v1 into that substrate

## Smallest truthful implementation target

The smallest truthful v1 implementation would support:

1. one subject kind from memory records
2. both canonical and contextual lane binding
3. explicit nexus key lists
4. `getNeighbors` + `getDegree`
5. lifecycle-aware reads

## Exit signal

This contract becomes real when:

1. at least one producer emits substrate bindings
2. at least one backend can answer `getNeighbors` and `getDegree`
3. walker-contract-v1 can target this substrate explicitly
4. Cephalon no longer has to rely on scattered note prose to explain field/nexus behavior

## Reading path

1. `orgs/octave-commons/cephalon/specs/contracts/memory-record.md`
2. `orgs/octave-commons/cephalon/packages/cephalon-cljs/docs/notes/cephalon/cephalon-field-digest-v01.md`
3. `orgs/octave-commons/cephalon/packages/cephalon-cljs/docs/notes/cephalon/cephalon-nexus-index-v01.md`
4. `specs/drafts/walker-contract-v1.md`
