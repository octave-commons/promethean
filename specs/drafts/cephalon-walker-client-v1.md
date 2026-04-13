# Cephalon Walker Client v1

## Status
Draft

## Parent specs

- `specs/drafts/walker-contract-v1.md`
- `specs/drafts/field-nexus-substrate-contract-v1.md`
- `orgs/octave-commons/cephalon/specs/cephalon-openplanner-graph-query-contract.md`
- `orgs/octave-commons/cephalon/specs/contracts/runtime-state-and-handoff.md`

## Purpose

Define the first head-facing client seam by which Cephalon can use walkers without becoming the owner of graph truth, field substrate, or walker internals.

This contract is intentionally consumer-oriented.

It says how the head asks for bounded graph-field expansion.
It does not say how the whole stack must be implemented internally.

## Founding rule

Cephalon is the head.
It should consume walker behavior.
It should not regrow the whole graph-native organism behind private helpers.

That means:
- canonical graph truth comes from shared graph surfaces
- field context comes from runtime state and substrate bindings
- walker expansion comes through an explicit client seam
- Cephalon normalizes results into local cognition-friendly shapes

## Current grounding

### Existing live Cephalon surfaces

`packages/cephalon-ts/src/app.ts` already exposes runtime state including:
- `graphSummary`
- `rssSummary`
- `eidolonSummary`
- `promptFieldSummary`
- session manifests

`packages/cephalon-ts/src/openplanner/client.ts` already provides:
- memory event emission
- hybrid search
- health probing

`packages/cephalon-ts/src/mind/eidolon-field.ts` and `src/mind/prompt-field.ts` already provide:
- a live eidolon summary
- a live prompt-field summary

This means the client does not need to invent field awareness from nothing.
It needs to formalize how Cephalon packages and forwards what it already knows.

## Design position

The Cephalon walker client sits above:
- graph query client behavior
- field/nexus substrate bindings
- walker expansion contract

Expected layering:

```text
Cephalon runtime state
  -> graph query
     -> walker expansion
        -> normalized related-context payload
```

## Non-goals

1. Graph mutation from Cephalon.
2. Direct ownership of graph persistence.
3. Replacing the local graph helper outright in v1.
4. Requiring every call to include full field geometry.

## Public interface

```ts
interface CephalonWalkerClient {
  status(): Promise<CephalonWalkerStatus>
  expandFromNode(request: CephalonWalkerNodeRequest): Promise<CephalonWalkerResult>
  expandFromGraphQuery(request: CephalonWalkerGraphQueryRequest): Promise<CephalonWalkerResult>
  expandFromSearchHits(request: CephalonWalkerSearchHitRequest): Promise<CephalonWalkerResult>
}
```

## Status surface

```ts
type CephalonWalkerStatus = {
  ok: boolean
  graphQueryOk: boolean
  walkerOk: boolean
  canonicalSource: "openplanner"
  fieldContextAvailable: boolean
  viewContextAvailable: boolean
}
```

Purpose:
- let the head decide whether graph-aware associative expansion is worth attempting

## Shared request context

```ts
type CephalonWalkerContext = {
  cephalonId: string
  sessionId: string
  circuitId?: string
  graphSummary?: string
  eidolonSummary?: string
  promptFieldSummary?: string
  fieldDigest?: {
    digestHash?: string
    focus?: string
    tagsTop?: string[]
    nexusTop?: string[]
  }
}
```

Rules:
- this context is derived from runtime state Cephalon already owns
- runtime summaries are allowed to remain lightweight in v1
- if richer field digest data is unavailable, that absence must be explicit

## Request variants

### 1. `expandFromNode`

Use when Cephalon already has a canonical graph node id or URL anchor.

```ts
type CephalonWalkerNodeRequest = {
  anchor: {
    nodeId?: string
    url?: string
  }
  context: CephalonWalkerContext
  budget?: Partial<CephalonWalkerBudget>
}
```

### 2. `expandFromGraphQuery`

Use when Cephalon first needs bounded graph lookup before walking.

```ts
type CephalonWalkerGraphQueryRequest = {
  query: string
  graphQuery?: {
    projects?: string[]
    nodeTypes?: string[]
    edgeTypes?: string[]
    limit?: number
    edgeLimit?: number
  }
  context: CephalonWalkerContext
  budget?: Partial<CephalonWalkerBudget>
}
```

### 3. `expandFromSearchHits`

Use when Cephalon already has hybrid search or memory hits that must be anchored back into graph or nexus space.

```ts
type CephalonWalkerSearchHitRequest = {
  hits: CephalonWalkerSearchHit[]
  context: CephalonWalkerContext
  budget?: Partial<CephalonWalkerBudget>
}

type CephalonWalkerSearchHit = {
  id: string
  score: number
  source?: string
  kind?: string
  text?: string
  nodeIdHint?: string
  urlHint?: string
}
```

## Budget shape

Cephalon should not invent a new budget model.
It should expose a smaller head-friendly projection of walker budget.

```ts
type CephalonWalkerBudget = {
  maxWalkers: number
  maxHopsPerWalker: number
  maxCandidates: number
  summaryBias: number
  exploration: number
}
```

The client may fill in deeper walker defaults like:
- `maxKeysPerNode`
- `maxNeighborsPerKey`

## Result shape

```ts
type CephalonWalkerResult = {
  source: {
    canonicalSource: "openplanner"
    graphQueryRef?: string
    fieldApplied: boolean
    viewApplied: boolean
  }
  related: CephalonWalkerRelatedItem[]
  budgetSpent: {
    walkers: number
    hops: number
    candidatesConsidered: number
  }
  diagnostics?: {
    degraded?: boolean
    reason?: string
    notes?: string[]
  }
}
```

```ts
type CephalonWalkerRelatedItem = {
  nodeId: string
  score: number
  label?: string
  distance?: number
  reasons: Array<{
    kind: string
    value?: string
    weight?: number
  }>
  preview?: {
    text?: string
    source?: string
    kind?: string
  }
}
```

Rules:
- `related` is the head-facing projection of walker candidates
- results should already be normalized enough for context assembly or explanation payloads
- the head must not need raw backend row shapes to use the result

## Required internal behavior

### `expandFromNode`
1. resolve anchor to canonical node if needed
2. package current runtime context
3. forward a walker request
4. normalize response for Cephalon use

### `expandFromGraphQuery`
1. run bounded graph query first
2. convert matched nodes into walker seeds
3. forward walker request
4. normalize related set

### `expandFromSearchHits`
1. map memory/search hits into graph or nexus anchors where possible
2. drop unanchorable hits explicitly or surface them as degraded diagnostics
3. run walker expansion from surviving anchors

## Degradation rules

1. If graph query is unavailable, fail clearly.
2. If walker service/implementation is unavailable, fail clearly.
3. If field digest is unavailable, degrade explicitly to graph-aware but field-light behavior.
4. If view context is unavailable, continue without pretending it was applied.

No silent fallback from graph-field-aware reasoning to opaque local-helper behavior.

## Relationship to the local graph helper

Cephalon may continue to maintain a local graph helper for short-horizon conversational topology.

But this client must treat that helper as:
- local
- non-canonical
- non-substitutable for shared graph truth

The local helper may contribute hints.
It must not become the base truth source for walker requests.

## Suggested implementation home

Most natural initial home:
- `orgs/octave-commons/cephalon/packages/cephalon-ts/src/openplanner/`

Likely split:
- keep existing memory/search client in `openplanner/client.ts`
- add a graph/walker-aware sibling client rather than mutating memory search code into a bag of unrelated concerns

## Smallest truthful implementation target

The smallest truthful v1 implementation would:

1. expose `status()`
2. implement `expandFromNode()`
3. derive field-light context from runtime state
4. return normalized `related` items with reasons
5. leave richer field digest and search-hit anchoring for follow-on slices

## Exit signal

This client becomes real when:

1. Cephalon TS can issue one bounded walker request in a live runtime path
2. results include explanation reasons
3. degraded field/view behavior is surfaced explicitly
4. the head uses canonical graph truth instead of private topology shortcuts for that path

## Reading path

1. `orgs/octave-commons/cephalon/specs/cephalon-openplanner-graph-query-contract.md`
2. `specs/drafts/walker-contract-v1.md`
3. `specs/drafts/field-nexus-substrate-contract-v1.md`
4. `orgs/octave-commons/cephalon/specs/contracts/runtime-state-and-handoff.md`
5. `orgs/octave-commons/cephalon/packages/cephalon-ts/src/openplanner/client.ts`
6. `orgs/octave-commons/cephalon/packages/cephalon-ts/src/app.ts`
