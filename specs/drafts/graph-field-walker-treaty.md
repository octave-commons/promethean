# Graph-Field-Walker Treaty

## Status
Draft

## Parent lineage

- `specs/drafts/promethean-octaves-manifestation-map.md`
- `specs/drafts/promethean-octaves-story-backlog.md`
- `orgs/octave-commons/cephalon/specs/adjacent-systems-matrix.md`

Direct child:
- `specs/drafts/walker-contract-v1.md`

## Purpose

Define the ownership treaty for the graph-native knowledge stack so that:

- `daimoi` are placed correctly
- `openplanner` is not forced to stand in for the whole graph ecology
- `graph-weaver`, `myrmex`, `eros-eris-field`, and `graph-weaver-aco` have explicit roles
- Cephalon and Knoxx can consume the stack without secretly re-implementing it

## Founding correction

`daimoi` do **not** belong to `openplanner` alone.

They belong to the **graph-field-walker line**:

1. `openplanner` stores canonical graph and memory receipts
2. `graph-weaver` exposes graph workbench and intervention surfaces
3. `graph-weaver-aco` provides the tiny traversal kernel
4. `myrmex` orchestrates graph-native foraging and downstream writes
5. `eros-eris-field` makes semantic similarity act as force and geometry
6. `daimoi` provide bounded motion through that graph-field ecology

This treaty exists to keep that line explicit.

## Why this treaty is needed

The current corpus already contains the right pieces, but they are easy to flatten incorrectly.

The common failure mode is:
- lake truth exists,
- therefore every graph-adjacent concept gets described as a lake feature.

That is wrong here.

OpenPlanner is necessary because it is canonical.
It is not sufficient because the graph-native system also needs:
- workbench surfaces
- traversal brains
- foraging/orchestration
- field geometry
- bounded walkers

## The organism

The clean reading is:

- **OpenPlanner** is the lake.
- **Graph-Weaver** is the workbench.
- **Graph-Weaver-ACO** is the traversal kernel.
- **Myrmex** is the forager.
- **Eros-Eris Field** is the field engine.
- **Daimoi** are the walkers.
- **Cephalon** is the head that consumes this stack.
- **Knoxx** is the bounded operator-facing graph-memory execution layer.

## Ownership matrix

| System | Owns | Must not own |
| --- | --- | --- |
| `openplanner` | canonical append-only event lake, graph receipts, graph export/query, derived projections over raw graph truth | graph UI, crawl orchestration, bounded walker doctrine, force/layout simulation as primary concern |
| `graph-weaver` | graph workbench, preview/mutation, layered graph views, user overlays, declared graph view surfaces | canonical truth ownership, crawl brain, lake semantics, hidden fallback pretending to be canonical |
| `graph-weaver-aco` | bounded URL frontier, ant-like traversal policy, host pacing, event emission | persistence, graph UI, rich extraction, lake writes, high-level orchestration |
| `myrmex` | composition root for traversal + extraction + graph write routing + backpressure + checkpointing | canonical lake ownership, graph UI, deep walker doctrine, general-purpose graph database semantics |
| `eros-eris-field` | semantic-force layout engine, graph geometry, attraction/repulsion dynamics, field simulation primitives | canonical graph storage, lake ingestion, crawl policy, user-facing speaking runtime |
| `daimoi` | bounded motion doctrine across field and graph space, packet semantics, retrieval-walker contract, interpretable trace language | canonical lake ownership, graph UI, direct speaking runtime, pretending the field/graph stack is optional |
| `cephalon` | speaking runtime, context assembly, tool coordination, session identity, field-timed action | canonical graph storage, crawl orchestration, workbench ownership, private hidden graph empire |
| `knoxx` | bounded agent-facing graph and memory surfaces, execution roadmap for graph-memory convergence | canonical lake ownership, graph UI, traversal engine ownership |

## Contract surfaces between organs

## 1. Lake contract

Producer -> lake surfaces.

Current anchors:
- `orgs/open-hax/openplanner/specs/openplanner-graph-events.md`
- `orgs/octave-commons/myrmex/specs/event-and-storage-flow.md`

Contract responsibilities:
- graph receipts are append-only and canonical in the lake
- `graph.node` and `graph.edge` are evidence, not UI opinions
- derived projections must remain recomputable and non-destructive

Examples:
- `Myrmex -> OpenPlanner`
- future `Cephalon -> OpenPlanner` graph/memory receipts

## 2. Workbench contract

Lake truth -> workbench surfaces.

Current anchors:
- `orgs/octave-commons/graph-weaver/specs/graph-layers-and-storage.md`
- `orgs/open-hax/openplanner/specs/openplanner-web-edge-salience-and-backbone-projections.md`

Contract responsibilities:
- Graph-Weaver may expose:
  - raw graph truth
  - declared derived views
  - user overlays
  - direct graph interventions
- Graph-Weaver must not silently become a competing canonicalizer
- if local or stale fallback exists, it must be surfaced loudly

## 3. Traversal contract

Traversal kernel -> orchestrator.

Current anchors:
- `orgs/octave-commons/graph-weaver-aco/specs/core-engine-contract.md`
- `orgs/octave-commons/myrmex/specs/orchestrator-contract.md`

Contract responsibilities:
- `graph-weaver-aco` chooses and attempts visits
- `myrmex` normalizes events, routes writes, applies backpressure, and survives pause/resume
- traversal logic stays small enough to remain reusable

## 4. Field contract

Graph topology + semantic similarity -> force/layout engine.

Current anchors:
- `orgs/octave-commons/eros-eris-field/README.md`
- `orgs/octave-commons/eros-eris-field/src/types.ts`
- `orgs/octave-commons/eros-eris-field/src/sim.ts`

Contract responsibilities:
- Eros-Eris Field consumes graph-adjacent structures like semantic edges and spring edges
- it turns semantic relation into geometry and pressure
- it is not merely decorative rendering; it is an extracted field dynamics layer

This means graph work that ignores `eros-eris-field` is missing the field side of the doctrine.

## 5. Walker contract

Graph truth + field semantics -> bounded walkers.

Current anchors:
- `orgs/octave-commons/daimoi/specs/retrieval-walkers.md`
- `orgs/octave-commons/cephalon/packages/cephalon-cljs/docs/notes/cephalon/cephalon-daimoi-v01.md`
- `orgs/octave-commons/cephalon/packages/cephalon-cljs/docs/notes/cephalon/cephalon-nexus-index-v01.md`

Contract responsibilities:
- walkers move under budget
- walkers expand through interpretable graph-field structure
- walkers should be able to explain why a candidate was surfaced
- walkers connect packet/field dynamics and graph retrieval rather than splitting them into unrelated doctrines

## 6. Consumption contract

Graph-native stack -> head/operator surfaces.

Current anchors:
- `orgs/octave-commons/cephalon/specs/head-of-agent-system.md`
- `orgs/open-hax/knoxx/specs/knowledge-ops-graph-memory-roadmap.md`

Contract responsibilities:
- Cephalon consumes the graph-field-walker stack as the head
- Knoxx exposes bounded operator-facing graph and memory surfaces
- neither should secretly re-own the lower organs

## Shape of the stack

```text
graph-weaver-aco
  -> traversal kernel
      -> myrmex
         -> graph/node/edge receipts
            -> openplanner
               -> canonical graph truth + derived projections
                  -> graph-weaver
                     -> workbench views and interventions

openplanner + graph-weaver + graph topology
  -> eros-eris-field
     -> graph-field geometry

openplanner + graph-weaver + eros-eris-field + nexus/index surfaces
  -> daimoi
     -> bounded graph-field walkers

openplanner/graph-weaver/daimoi surfaces
  -> cephalon + knoxx
     -> speaking/runtime/operator behavior
```

## Non-negotiable rules

1. **No lake reductionism**
   - OpenPlanner is canonical, but not synonymous with the whole graph-native system.

2. **No hidden canonicalizers**
   - Graph-Weaver may cache or overlay, but must not quietly masquerade as canonical truth.

3. **No orchestration drift into the kernel**
   - `graph-weaver-aco` stays small.

4. **No field erasure**
   - `eros-eris-field` must be treated as part of the graph-field stack, not as decorative aftermath.

5. **No walker flattening**
   - Daimoi are not just search helpers; they are the motion doctrine bridging field and graph.

6. **No head empire**
   - Cephalon should consume these organs, not absorb them all back into private helpers.

## Current practical program order

1. Stabilize canonical graph truth and graph query coherence in `openplanner` + `knoxx`.
2. Keep `graph-weaver` honest as a workbench over canonical truth.
3. Keep `myrmex` as the real graph forager with explicit backpressure and routing.
4. Define the graph-field-walker contract family explicitly:
   - graph receipts
   - view surfaces
   - field geometry inputs
   - walker request/response
5. Make Cephalon consume that stack by explicit seams.

## Smallest truthful next cuts

### Cut A - Treaty table adoption
Add this ownership table or a normalized version of it to the relevant adjacent-system docs.

### Cut B - Walker contract v1
Define one request/response schema for bounded walker expansion that is explicitly graph-stack-aware.

Drafted here:
- `specs/drafts/walker-contract-v1.md`

### Cut C - Field relation note
Add one short doc in `eros-eris-field` or adjacent devel specs making its role in the graph-native knowledge line explicit.

### Cut D - Head consumption seam
Add one Cephalon-facing contract that distinguishes:
- canonical graph truth
- graph workbench surface
- walker expansion surface
- local mind-only helper graph

## Exit signal

This treaty is real when all of these are true:

1. contributors stop describing `daimoi` as if they belong only to OpenPlanner
2. `graph-weaver`, `myrmex`, and `eros-eris-field` are named explicitly in graph-memory architecture discussions
3. one walker contract exists that references the graph-native stack instead of a lake-only view
4. Cephalon and Knoxx consume graph-native surfaces by declared seams rather than private topology reinvention

## Reading path

1. `orgs/octave-commons/cephalon/specs/adjacent-systems-matrix.md`
2. `orgs/open-hax/openplanner/specs/openplanner-graph-events.md`
3. `orgs/open-hax/openplanner/specs/openplanner-web-edge-salience-and-backbone-projections.md`
4. `orgs/octave-commons/graph-weaver/specs/graph-layers-and-storage.md`
5. `orgs/octave-commons/graph-weaver-aco/specs/core-engine-contract.md`
6. `orgs/octave-commons/myrmex/specs/orchestrator-contract.md`
7. `orgs/octave-commons/myrmex/specs/event-and-storage-flow.md`
8. `orgs/octave-commons/eros-eris-field/README.md`
9. `orgs/octave-commons/daimoi/specs/retrieval-walkers.md`
