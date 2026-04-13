# Walker Contract v1

## Status
Draft

## Parent specs

- `specs/drafts/graph-field-walker-treaty.md`
- `specs/drafts/promethean-octaves-story-backlog.md`
- `orgs/open-hax/knoxx/specs/knowledge-ops-knoxx-graph-query-contract-v1.md`
- `orgs/octave-commons/cephalon/specs/cephalon-openplanner-graph-query-contract.md`

Direct children:
- `specs/drafts/field-nexus-substrate-contract-v1.md`
- `specs/drafts/cephalon-walker-client-v1.md`

## Purpose

Define the first stable contract for **bounded graph-field walkers**.

This contract is the next layer above `graph_query`.

`graph_query` v1 is for:
- search
- node lookup
- bounded incident edge retrieval
- bounded graph slices

`walker` v1 is for:
- bounded expansion from seeds
- interpretable associative traversal
- graph-field-aware candidate gathering
- explanation-carrying retrieval results

## Founding rule

The walker contract is not lake-only.

It must be able to incorporate four kinds of input without confusing their roles:

1. **canonical graph truth** from `openplanner`
2. **view and overlay context** from `graph-weaver`
3. **field/geometry context** from `eros-eris-field` or equivalent field engines
4. **bounded motion policy** from `daimoi`

The contract should let `cephalon` and `knoxx` consume walkers without owning any of those lower layers directly.

## Design position

### What this contract is
- a bounded request/response seam
- graph-stack-aware
- explanation-carrying
- suitable for local use or service wrapping

### What this contract is not
- not a graph database API
- not a workbench mutation API
- not a full layout engine API
- not an ACO crawl API
- not a promise that `daimoi` are fully implemented yet

## Relationship to existing contracts

### Relative to `graph_query` v1
`graph_query` v1 gives the caller explicit graph search and neighborhood lookup.

Walker v1 begins where graph query stops.

Expected layering:

1. run bounded graph query to obtain seeds or anchor nodes
2. run walker expansion over those seeds
3. return candidates, reasons, and budget traces

### Relative to Graph-Weaver
Graph-Weaver is not the canonical truth source.
It may provide:
- selected graph slice
- visible node set
- overlay constraints
- human-facing workbench context

### Relative to Eros-Eris Field
Eros-Eris does not own walker policy.
It contributes field/geometry semantics such as:
- node positions
- semantic edges
- local force neighborhoods
- pressure-related graph geometry hints

### Relative to Daimoi
Daimoi own the motion doctrine.
This contract is the first stable boundary where that doctrine can become implementable without freezing one internal algorithm forever.

## Contract goals

1. Define one request shape for bounded walker expansion.
2. Define one response shape for candidates plus explanations.
3. Keep the contract graph-stack-aware without overfitting to one repo.
4. Preserve deterministic budget semantics.
5. Keep room for multiple walker implementations behind one interface.

## Non-goals

1. Encoding full adaptive policy in v1.
2. Replacing `graph_query` with walkers.
3. Binding directly to Graph-Weaver mutation flows.
4. Defining every future score component now.

## Core mental model

A walker request says:

> starting from these seeds, under this budget, over this canonical graph truth, optionally filtered or framed by this workbench view and this field context, tell me which nodes are worth surfacing and why.

## Public interface

```ts
interface WalkerClient {
  expand(request: WalkerExpandRequest): Promise<WalkerExpandResponse>
}
```

## Request shape

```ts
type WalkerExpandRequest = {
  requestId?: string
  source: WalkerSourceRef
  seeds: WalkerSeed[]
  budget: WalkerBudget
  field?: WalkerFieldContext
  options?: WalkerOptions
}
```

### `source`

Canonical graph source plus optional view context.

```ts
type WalkerSourceRef = {
  canonical: {
    kind: "openplanner"
    projects?: string[]
    edgeView?: "raw" | "discovery" | "structural" | "evidence" | "bridge"
    graphQueryRef?: string
  }
  view?: {
    kind: "graph-weaver"
    viewId?: string
    overlayMode?: "exclude" | "include" | "only"
    visibleNodeIds?: string[]
  }
}
```

Rules:
- `canonical` is required
- `view` is optional
- `view` must never silently replace canonical truth

## `seeds`

```ts
type WalkerSeed = {
  nodeId: string
  kind?: string
  score?: number
  reasons?: string[]
}
```

Seeds usually come from:
- graph search
- node lookup
- vector/memory search mapped to graph anchors
- prior walker output

## `budget`

Deterministic resource control.

```ts
type WalkerBudget = {
  maxWalkers: number
  maxHopsPerWalker: number
  maxKeysPerNode: number
  maxNeighborsPerKey: number
  maxCandidates: number
  summaryBias: number
  exploration: number
}
```

Rules:
- budgets are counts, not timeouts
- walkers must stop because the budget says so, not because the implementation got tired
- `summaryBias` and `exploration` are normalized tuning knobs, not repo-specific magic numbers

## `field`

Optional field/geometry context.

```ts
type WalkerFieldContext = {
  digest?: WalkerFieldDigest
  semanticEdges?: WalkerSemanticEdge[]
  positions?: WalkerNodePosition[]
  hotKeys?: string[]
}
```

### `digest`

```ts
type WalkerFieldDigest = {
  fieldVersion?: number
  digestHash?: string
  cephalonId?: string
  sessionId?: string
  circuitId?: string
  focus?: string
  tagsTop?: string[]
  nexusTop?: string[]
}
```

This is intentionally compatible in spirit with the Cephalon field digest note without requiring the entire note format in every consumer.

### `semanticEdges`

```ts
type WalkerSemanticEdge = {
  a: string
  b: string
  sim: number
}
```

This mirrors the `SemanticEdge` concept already exported by `eros-eris-field`.

### `positions`

```ts
type WalkerNodePosition = {
  id: string
  x: number
  y: number
  mass?: number
}
```

Use cases:
- local neighborhood bias
- bridge preference
- force-nearby expansion heuristics

Rule:
- field context may influence ranking and exploration,
- but it must not replace canonical graph adjacency.

## `options`

```ts
type WalkerOptions = {
  allowDeleted?: boolean
  preferredNodeTypes?: string[]
  preferredEdgeTypes?: string[]
  explanationLimit?: number
  returnVisited?: boolean
}
```

## Response shape

```ts
type WalkerExpandResponse = {
  source: WalkerResolvedSource
  candidates: WalkerCandidate[]
  budgetSpent: WalkerBudgetSpent
  visited?: WalkerVisitedNode[]
  diagnostics?: WalkerDiagnostics
}
```

### `source`

```ts
type WalkerResolvedSource = {
  canonical: {
    kind: "openplanner"
    projects?: string[]
    edgeView?: string
    graphQueryRef?: string
  }
  view?: {
    kind: "graph-weaver"
    viewId?: string
    overlayMode?: string
  }
  fieldApplied: boolean
}
```

### `candidates`

```ts
type WalkerCandidate = {
  nodeId: string
  score: number
  distance?: number
  reasons: WalkerReason[]
  traces?: WalkerTraceRef[]
}
```

### `reasons`

```ts
type WalkerReason = {
  kind:
    | "seed"
    | "shared_key"
    | "summary_bias"
    | "field_hot_key"
    | "semantic_edge"
    | "view_visible"
    | "bridge_bonus"
    | "degree_penalty"
    | "neighbor_match"
  value?: string
  weight?: number
}
```

The exact scoring math may vary,
but the explanation vocabulary should remain stable enough for prompts, logs, and UIs.

### `traces`

```ts
type WalkerTraceRef = {
  fromNodeId: string
  viaKey?: string
  hop: number
}
```

### `budgetSpent`

```ts
type WalkerBudgetSpent = {
  walkers: number
  hops: number
  keysExpanded: number
  neighborReads: number
  candidatesConsidered: number
}
```

### `visited`

```ts
type WalkerVisitedNode = {
  nodeId: string
  hop: number
  expandedKeys?: string[]
}
```

### `diagnostics`

```ts
type WalkerDiagnostics = {
  degraded?: boolean
  reason?: string
  notes?: string[]
}
```

Examples:
- `reason: "graph_view_unavailable"`
- `reason: "field_context_missing"`
- `reason: "canonical_graph_partial"`

No silent downgrade from graph-field-aware behavior to raw adjacency-only behavior without a surfaced note.

## Behavioral invariants

1. **Canonical-first**
   - OpenPlanner-compatible graph truth anchors the walk.

2. **Budget-bound**
   - walkers must stop at declared count budgets.

3. **Explainability**
   - surfaced candidates must carry reasons.

4. **Field-aware but not field-replacing**
   - field context influences ranking and exploration, not canonical adjacency.

5. **View-aware but not view-canonicalizing**
   - Graph-Weaver context may filter or prioritize, but must not silently redefine truth.

6. **Summary-preferring**
   - implementations should be able to prefer summaries and aggregates over redundant raw nodes.

## Suggested implementation layering

### V1 minimum
- seeds from `graph_query` or equivalent bounded graph lookup
- nexus/key expansion using bounded associative graph surfaces
- explanation reasons
- deterministic budget accounting

### V1.1 likely additions
- explicit bridge rescue reasoning
- field-hot-key weighting from digest
- derived edge-view selection awareness

### Later, but not v1
- adaptive policy learning
- cross-host frontier economics
- heavy geometric coupling to live simulation state

## Example request

```json
{
  "source": {
    "canonical": {
      "kind": "openplanner",
      "projects": ["web"],
      "edgeView": "discovery",
      "graphQueryRef": "gq_01JX..."
    },
    "view": {
      "kind": "graph-weaver",
      "viewId": "workbench-current",
      "overlayMode": "include"
    }
  },
  "seeds": [
    {"nodeId": "web:url:https://example.com/start", "score": 0.92, "reasons": ["graph_query_match"]}
  ],
  "budget": {
    "maxWalkers": 8,
    "maxHopsPerWalker": 2,
    "maxKeysPerNode": 6,
    "maxNeighborsPerKey": 25,
    "maxCandidates": 400,
    "summaryBias": 0.8,
    "exploration": 0.2
  },
  "field": {
    "digest": {
      "digestHash": "sha256:abc",
      "cephalonId": "Duck",
      "sessionId": "janitor",
      "circuitId": "c1-survival",
      "focus": "investigate noisy edge cluster",
      "nexusTop": ["url:https://example.com/start", "tag:ops/graph"]
    },
    "semanticEdges": [
      {"a": "web:url:https://example.com/start", "b": "web:url:https://example.com/related", "sim": 0.81}
    ]
  },
  "options": {
    "preferredEdgeTypes": ["visited_to_unvisited"],
    "explanationLimit": 3,
    "returnVisited": true
  }
}
```

## Example response

```json
{
  "source": {
    "canonical": {
      "kind": "openplanner",
      "projects": ["web"],
      "edgeView": "discovery",
      "graphQueryRef": "gq_01JX..."
    },
    "view": {
      "kind": "graph-weaver",
      "viewId": "workbench-current",
      "overlayMode": "include"
    },
    "fieldApplied": true
  },
  "candidates": [
    {
      "nodeId": "web:url:https://example.com/related",
      "score": 0.88,
      "distance": 1,
      "reasons": [
        {"kind": "shared_key", "value": "url:https://example.com/start", "weight": 0.6},
        {"kind": "semantic_edge", "value": "sim=0.81", "weight": 0.2},
        {"kind": "view_visible", "value": "workbench-current", "weight": 0.1}
      ],
      "traces": [
        {"fromNodeId": "web:url:https://example.com/start", "hop": 1}
      ]
    }
  ],
  "budgetSpent": {
    "walkers": 1,
    "hops": 1,
    "keysExpanded": 4,
    "neighborReads": 12,
    "candidatesConsidered": 7
  },
  "visited": [
    {"nodeId": "web:url:https://example.com/start", "hop": 0, "expandedKeys": ["url:https://example.com/start"]}
  ]
}
```

## Ownership consequences

### OpenPlanner
Must provide stable node/edge identities and graph views that walkers can anchor against.

### Graph-Weaver
May provide visible slice and overlay context, but must not redefine canonical identities.

### Myrmex
May become a producer of graph structures walkers later use, but is not itself the walker contract host by necessity.

### Eros-Eris Field
Provides a strong precedent for field-aware structures like `SemanticEdge` and graph geometry, which walker implementations may incorporate.

### Daimoi
This contract is the most natural v1 boundary for the retrieval-walker family.

### Cephalon / Knoxx
Can target walker behavior without entangling themselves in lower-level graph persistence or field simulation details.

## Smallest implementation target

The smallest truthful v1 implementation would:

1. accept seed node ids from a canonical graph query
2. expand via bounded typed associative surfaces
3. return candidates with reasons and budget accounting
4. optionally accept field digest and semantic edges for ranking bias
5. expose the same shape to Cephalon and Knoxx

Next child specs:
- `specs/drafts/field-nexus-substrate-contract-v1.md`
- `specs/drafts/cephalon-walker-client-v1.md`

## Exit signal

This contract becomes real when:

1. one implementation exists behind it
2. Cephalon or Knoxx consumes it in one bounded path
3. candidates carry explanation reasons
4. field-aware vs non-field-aware degradation is surfaced explicitly

## Reading path

1. `orgs/open-hax/knoxx/specs/knowledge-ops-knoxx-graph-query-contract-v1.md`
2. `orgs/octave-commons/cephalon/specs/cephalon-openplanner-graph-query-contract.md`
3. `specs/drafts/graph-field-walker-treaty.md`
4. `orgs/octave-commons/daimoi/specs/retrieval-walkers.md`
5. `orgs/octave-commons/cephalon/packages/cephalon-cljs/docs/notes/cephalon/cephalon-daimoi-v01.md`
6. `orgs/octave-commons/cephalon/packages/cephalon-cljs/docs/notes/cephalon/cephalon-field-digest-v01.md`
7. `orgs/octave-commons/eros-eris-field/src/types.ts`
