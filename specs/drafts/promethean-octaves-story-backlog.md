# Promethean Octaves Story Backlog

## Status
Draft

## Purpose

Turn the residual Promethean concepts into narrative work items that can survive outside the Promethean repo.

This is not a generic backlog.
It is a **songbook** for the missing organs.

Each story should do four things at once:

1. preserve the original Promethean intent
2. connect that intent to the systems that have already manifested
3. define the smallest next slice that would count as real manifestation
4. make it easier to tell the next story after that

This document is a direct follow-on to:
- `specs/drafts/promethean-octaves-manifestation-map.md`
- `orgs/octave-commons/promethean/spec/2026-04-05-promethean-model-consolidation.md`

Immediate child artifact:
- `specs/drafts/graph-field-walker-treaty.md`

## Story grammar

Each story is written in five voices:

- **Missing thing**: the concept that still has no clean home
- **Why it matters**: why the system keeps rediscovering it
- **Narrative**: what role it plays in the larger organism
- **User story**: the smallest practical statement of need
- **Exit signal**: what must become real in code/docs/contracts for the story to count as manifested

## Program thesis

Promethean will not manifest by rebuilding one titan repo.

It will manifest by:
- stabilizing the extracted organs
- connecting them with contracts
- giving the missing concepts one honest home at a time
- repeating the same shape at multiple octaves until the system sings in tune

## The stories

## Story 1 - The Field Finds a Home

### Missing thing
Canonical home for **eidolon / nexus / prompt-field** logic.

### Why it matters
This is the sharpest unresolved gap named explicitly in the Cephalon backlog.

Current anchor:
- `orgs/octave-commons/cephalon/specs/implementation-backlog.md`

The system already has:
- eidolon retrieval and vector maintenance in `cephalon-cljs`
- nexus key doctrine in Cephalon notes
- graph receipts and query surfaces in OpenPlanner
- retrieval-walker doctrine in `daimoi`

But it does not yet have one agreed canonical home for the shared substrate logic.

### Narrative
The field is the weather of significance.
The nexus is where weather learns a name.
The prompt-field is the lens that lets the same artifact mean differently under different conditions.

Right now these ideas are alive but distributed.
They keep appearing in notes, helper implementations, and side-channel retrieval logic.

This story is about giving the weather a stable observatory.

### User story
As a runtime that needs state-conditioned retrieval,
I need one canonical field/nexus substrate contract and one canonical implementation home,
so that Cephalon, OpenPlanner, Knoxx, and Daimoi stop re-inventing the same semantic terrain in incompatible ways.

### Likely homes
- `orgs/octave-commons/cephalon/`
- `orgs/octave-commons/daimoi/`
- `packages/` in devel if a shared extraction is cleaner than either repo owning it directly

### Source anchors
- `orgs/octave-commons/cephalon/packages/cephalon-cljs/docs/notes/cephalon/cephalon-eidolon-field-concept.md`
- `orgs/octave-commons/cephalon/packages/cephalon-cljs/docs/notes/cephalon/cephalon-nexus-index-v01.md`
- `orgs/octave-commons/cephalon/specs/implementation-backlog.md`
- `orgs/octave-commons/daimoi/specs/retrieval-walkers.md`

### Smallest honest slice
Write one cross-repo `field/nexus substrate` contract that defines:
- canonical vector lane vs contextual vector lane
- nexus key schema and normalization rules
- seed -> key -> neighbor expansion vocabulary
- lineage and retention identity for contextual embeddings

### Exit signal
- one canonical contract exists
- one repo or shared package is named as the implementation home
- Cephalon and Daimoi both point to it instead of private note doctrine

## Story 2 - The Head Learns the Walkers

### Missing thing
Cephalon consuming **daimoi retrieval walkers** as a first-class retrieval path instead of treating them as doctrine or noteware.

### Why it matters
The corpus already shows the semantic migration:
- daimoi were packet/field dynamics in early `fork_tales`
- daimoi later became bounded graph retrieval walkers in Cephalon notes and the `daimoi` repo

But Cephalon still does not have a clean runtime seam where the head deliberately asks the walkers to move.

Important correction:
- this seam is not `Cephalon -> OpenPlanner` alone
- daimoi belong to the graph-native knowledge line that includes:
  - `graph-weaver` as workbench
  - `myrmex` as graph forager/orchestrator
  - `eros-eris-field` as semantic-force/layout engine
  - `openplanner` as lake and canonical receipt store

### Narrative
The head should not remember everything by brute force.
It should remember by sending little bounded creatures into the graph and waiting for what comes back.

This is associative memory made inspectable inside a real graph ecology, not a lake-only lookup trick.

### User story
As Cephalon,
I need a bounded retrieval-walker surface,
so that graph and memory expansion feel like controlled thought rather than opaque vector luck.

### Likely homes
- `orgs/octave-commons/cephalon/`
- `orgs/octave-commons/daimoi/`
- `orgs/octave-commons/graph-weaver/`
- `orgs/octave-commons/myrmex/`
- `orgs/octave-commons/eros-eris-field/`
- `orgs/open-hax/openplanner/`

### Source anchors
- `orgs/octave-commons/daimoi/specs/retrieval-walkers.md`
- `orgs/octave-commons/cephalon/packages/cephalon-cljs/docs/notes/cephalon/cephalon-daimoi-v01.md`
- `orgs/octave-commons/cephalon/specs/adjacent-systems-matrix.md`

### Smallest honest slice
Add a stable `related memories via walkers` contract shaped like:
- seeds in
- budget in
- candidates out
- reasons out
- budget spent out

Cephalon can consume it through shared graph surfaces, but the seam must be explicit about the stack:
- OpenPlanner stores canonical graph receipts and queryable truth
- Graph-Weaver exposes the workbench/intervention layer
- Myrmex owns graph-native foraging/orchestration
- Eros-Eris Field shapes semantic-force layout behavior where graph geometry matters
- Daimoi provide bounded motion across that ecology

### Exit signal
- one runtime path exists where Cephalon issues a retrieval-walker request under budget
- the result explains why items were surfaced
- the path is testable without reopening old note files to understand it

Child treaty:
- `specs/drafts/graph-field-walker-treaty.md`

Executable child contract:
- `specs/drafts/walker-contract-v1.md`

## Story 3 - The Lake Remembers the Weather

### Missing thing
OpenPlanner as not just lake and ledger, but as a substrate that can preserve **field-conditioned memory** without collapsing it into raw embeddings only.

### Why it matters
OpenPlanner is already the canonical lake.
But parts of the field doctrine still live elsewhere.

OpenPlanner is necessary here, but not sufficient on its own:
- Graph-Weaver and Myrmex are where graph-native movement and intervention live
- Eros-Eris Field is where semantic-force field behavior becomes geometry

This story is about making the lake remember not just what happened, but under what pressure it mattered.

### Narrative
The lake already holds receipts.
It now needs to remember salience, field digest, and contextual lanes without turning into doctrine cosplay.

### User story
As the canonical memory lake,
I need to support canonical and contextual memory lanes,
so that systems can retrieve both what an artifact means in principle and what it meant under a specific runtime state.

### Likely homes
- `orgs/open-hax/openplanner/`
- `services/openplanner/`

### Source anchors
- `orgs/open-hax/openplanner/README.md`
- `orgs/octave-commons/cephalon/packages/cephalon-cljs/docs/notes/cephalon/cephalon-eidolon-field-concept.md`
- `specs/drafts/shared-semantic-accel-clojure-runtime.md`

### Smallest honest slice
Add one explicit dual-lane memory contract:
- canonical lane
- contextual lane
- field digest metadata
- lineage and retention policy

### Exit signal
- OpenPlanner can ingest and query both lanes intentionally
- docs stop pretending a single embedding lane is enough for the whole Promethean memory story

## Story 4 - The Mouth Stops Secretly Rebuilding the World

### Missing thing
Cephalon consuming canonical graph, memory, and field surfaces instead of quietly re-implementing them behind helper names.

### Why it matters
The adjacent-systems matrix already states the invariant:
- Cephalon is the head and mouth
- OpenPlanner is the lake
- Graph-Weaver is the workbench
- Myrmex is the forager
- Eros-Eris Field is the field engine
- Daimoi is the walker doctrine

The head should not secretly become all the organs again.

### Narrative
The mouth should speak after the world moves, not by hallucinating its own private topology empire.

### User story
As Cephalon,
I need to query shared memory/graph/field surfaces through explicit contracts,
so that the speaking runtime stays the head instead of mutating into another hidden substrate repo.

### Likely homes
- `orgs/octave-commons/cephalon/`
- `orgs/octave-commons/graph-weaver/`
- `orgs/octave-commons/myrmex/`
- `orgs/octave-commons/eros-eris-field/`
- `orgs/open-hax/openplanner/`
- `orgs/open-hax/knoxx/`

### Source anchors
- `orgs/octave-commons/cephalon/specs/head-of-agent-system.md`
- `orgs/octave-commons/cephalon/specs/adjacent-systems-matrix.md`
- `orgs/open-hax/knoxx/specs/knowledge-ops-graph-memory-roadmap.md`

### Smallest honest slice
Document and implement one strict dependency line:
- Cephalon local helper graph remains explicitly local and non-canonical
- canonical graph truth and receipts come from OpenPlanner
- graph-native intervention and visibility come from Graph-Weaver
- graph-native foraging and traversal composition come from Myrmex
- related-memory expansion comes from the walker/memory seam carried by Daimoi
- semantic-force field/layout behavior is treated as part of the same ecology rather than as an unrelated visualization layer

### Exit signal
- Cephalon docs and code distinguish local mind aids from canonical graph/memory sources
- one end-to-end query path proves the head is consuming shared organs rather than recreating them

## Story 5 - Metisean Gets a Body

### Missing thing
A concrete **Metisean orchestration layer** outside pure doctrine.

### Why it matters
Planning, protocol export, extraction strategy, and cross-repo integration all exist,
but mostly as specs, matrices, and human reasoning.

Metisean currently exists as:
- a circuit description
- a reading lens
- a planning style

It does not yet clearly exist as a named bounded runtime or package layer.

### Narrative
Metisean is the architect that keeps appearing as whiteboard wisdom and then vanishing before dawn.
It needs a body.

Not a giant brain.
A bounded planner that knows:
- what organs exist
- what contracts bind them
- what slice should happen next

### User story
As the planning layer of the organism,
I need a concrete orchestration surface for convergence and protocol formation,
so that system-level planning stops living only in scattered specs and operator memory.

### Likely homes
- devel `packages/*`
- `orgs/octave-commons/cephalon/` if tightly head-oriented
- `orgs/open-hax/knoxx/` if it first manifests as knowledge-ops orchestration

### Source anchors
- `orgs/octave-commons/promethean/docs/design/circuits/metisean.md`
- `specs/drafts/promethean-octaves-manifestation-map.md`
- `orgs/open-hax/knoxx/specs/knowledge-ops-graph-memory-roadmap.md`

### Smallest honest slice
Define one explicit orchestration artifact that can answer:
- what exists
- what owns what
- what next slice is legal
- what contracts are required first

This can start as a path-scoped planner package or a machine-readable system map before it grows into a runtime.

### Exit signal
- Metisean is no longer only a circuit name in doctrine
- one executable or semi-executable convergence tool/artifact exists outside pure prose

## Story 6 - The Creature Learns Its Cast

### Missing thing
Simulacron / presence doctrine connected to one or two real workflows instead of staying mostly explanatory.

### Why it matters
The decomposition roadmap already says simulacron should explain:
- what the layered entity is
- what kinds of presences it has
- what success/failure across layers looks like

But the cast still needs to attach to actual operations.

### Narrative
If graph-runtime is the world and daimoi are the winds, simulacron is the creature learning how to stand in that weather.
The cast is the creature’s modes of being.

### User story
As a layered entity doctrine,
I need one or two real workflow mappings,
so that presence/core/cast language stops floating above the product line.

### Likely homes
- `orgs/octave-commons/simulacron/`
- `orgs/octave-commons/cephalon/`

### Source anchors
- `orgs/octave-commons/simulacron/specs/decomposition-roadmap.md`
- `orgs/octave-commons/cephalon/specs/adjacent-systems-matrix.md`

### Smallest honest slice
Write two concrete cast stories:
- one for a speaking head workflow
- one for a graph-memory/retrieval workflow

### Exit signal
- at least one real workflow can be described in simulacron terms without handwaving
- a contributor can tell which presence/policy/cast surfaces map to which concrete runtime concerns

## Story 7 - The World and the Lake Rejoin Without Confusion

### Missing thing
Clean relation between graph-runtime substrate doctrine and OpenPlanner canonical lake reality.

### Why it matters
The doctrine already knows there should be:
- truth graph
- view graph
- presence runtime
- daimoi engine
- reservoir economy
- nexus API layer

But the practical program has converged first on OpenPlanner as canonical lake truth.

The story needs to explain how doctrine and product line rhyme without pretending they are the same repo.

### Narrative
The world is the deeper doctrine.
The lake is the current material truth.
They need a treaty.

That treaty also has to name the other organs in the same line:
- Graph-Weaver
- Myrmex
- Eros-Eris Field
- Daimoi

### User story
As a contributor trying to work on graph-memory systems,
I need a clear treaty between world doctrine and lake implementation,
so that I know when to change OpenPlanner and when to change graph-runtime docs or contracts instead.

### Likely homes
- `orgs/octave-commons/graph-runtime/`
- `orgs/open-hax/openplanner/`
- devel `specs/`

### Source anchors
- `orgs/octave-commons/graph-runtime/specs/decomposition-roadmap.md`
- `orgs/octave-commons/cephalon/specs/adjacent-systems-matrix.md`
- `orgs/open-hax/openplanner/README.md`

### Smallest honest slice
Define one explicit doctrine-to-product treaty table:
- doctrinal concept
- product manifestation
- current owner
- deferred owner

### Exit signal
- readers can tell whether a graph-memory idea belongs in OpenPlanner now, Graph-Weaver now, or graph-runtime later

Child treaty:
- `specs/drafts/graph-field-walker-treaty.md`

## Story 8 - The Octave Review Method

### Missing thing
A repeatable method for checking whether a subsystem manifests the full Promethean shape across the eight circuits.

### Why it matters
Right now the circuit model is good for explanation,
but it is not yet a stable review tool for deciding what a subsystem is missing.

### Narrative
The circuits should not only be book chapters.
They should be a tuning fork.

### User story
As a designer of an extracted subsystem,
I need a circuit-complete review method,
so that I can see which layers of the Promethean shape are embodied and which are still absent.

### Likely homes
- devel `specs/`
- `orgs/octave-commons/promethean/` as doctrine reference
- `orgs/octave-commons/cephalon/` and `orgs/open-hax/knoxx/` as first practical adopters

### Source anchors
- `orgs/octave-commons/promethean/spec/2026-04-05-promethean-model-consolidation.md`
- `specs/drafts/promethean-octaves-manifestation-map.md`

### Smallest honest slice
Create one short review template that asks, for any subsystem:
- Aionian: how does it stay alive?
- Dorian: what is it allowed to do?
- Gnostic: how is it named and typed?
- Nemesian: how is it judged?
- Heuretic: how does it adapt?
- Oneiric: how does it generate possibility?
- Metisean: how does it plan and export protocol?
- Anankean: what larger constraints bind it?

### Exit signal
- the review method is used at least once on a live subsystem such as Cephalon, OpenPlanner, Knoxx, or the semantic accelerator

## Suggested execution order

1. Story 1 - The Field Finds a Home
2. Story 2 - The Head Learns the Walkers
3. Story 4 - The Mouth Stops Secretly Rebuilding the World
4. Story 3 - The Lake Remembers the Weather
5. Story 7 - The World and the Lake Rejoin Without Confusion
6. Story 5 - Metisean Gets a Body
7. Story 8 - The Octave Review Method
8. Story 6 - The Creature Learns Its Cast

## Why this order

- Story 1 names the substrate.
- Story 2 gives that substrate motion.
- Story 4 keeps the head from regrowing hidden organs.
- Story 3 gives the lake the right memory semantics.
- Story 7 keeps doctrine and product from talking past each other.
- Story 5 gives the planning layer a body after the lower seams are real.
- Story 8 turns the whole philosophy into a reusable review tool.
- Story 6 benefits from the rest being more concrete first.

## Founding sentence

The next phase of Promethean will not arrive by repeating the titan whole.
It will arrive when each missing organ gets one song, one home, one contract, and one honest runtime slice.
