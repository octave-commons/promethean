# Spec: Promethean model consolidation as shape language

## Context

Promethean currently holds several kinds of truth in the same symbolic vessel:

- a mythic and pedagogical language for explaining the system to humans
- a cognitive ontology built around fields, daimoi, nexuses, and circuits
- an architectural language for ports, adapters, runtimes, and orchestration
- a partially implemented software system under the Pantheon and ENSO names

This makes the project rich, memorable, and communicable.
It also makes it painful to reason about when all layers are treated as if they are the same kind of thing.

The goal of this document is to make Promethean legible without flattening it.

## Problem statement

The current fuzziness is not a sign that the model is empty.
It is a sign that multiple abstraction layers have been braided together:

1. **Source mythology**
   - inspired by the eight-circuit model in the Leary/Wilson lineage
   - operationalized through Promethean's renamed circuit vocabulary
2. **Epistemic discipline**
   - Wilson's model-agnosticism
   - map is not territory
   - E-Prime style suspicion of reified nouns and premature certainty
3. **System ontology**
   - Eidolon Fields, Nooi, Daimoi, Nexus, Cephalon
4. **Executable architecture**
   - Pantheon as agent language/runtime
   - ENSO/Cephalon as rooms/events/streams protocol and boundary router
5. **Concrete implementation**
   - packages, services, event stores, context compilers, runtime adapters

When these are not separated, the model feels simultaneously profound and unusable.

## Thesis

Promethean is best understood as a **shape language for cognitive systems**.

It is not one concrete runtime.
It is not merely a metaphor.
It is not a scientific theory of mind.

It is a layered design language that:

- gives a stable symbolic vocabulary for discussing cognitive architecture
- encodes policy and long-distance intent
- constrains the relationships that any implementation should preserve
- does **not** force one specific data structure, framework, or runtime

In that sense, Promethean behaves more like a **category-level sketch** than a fixed object model.

## Canonical reading

### 1. Promethean
The umbrella worldview and policy language.

Promethean names the system-level thesis:
- personal sovereignty
- AI as intent compiler
- learn once, solve forever
- contextual security
- human-led, AI-augmented systems design

This is the broadest layer.

### 2. Pantheon
The current executable architecture for agent language and runtime.

Pantheon is the main attempt to instantiate Promethean in software as:
- actors
- orchestration
- context compilation
- state management
- multi-runtime execution
- a Lisp-like language for defining agent behavior

### 3. ENSO and Cephalon
The externalization and coordination boundary.

ENSO handles:
- rooms
- causally ordered events
- voice/media/tool streams
- capability negotiation
- privacy and policy envelopes

Cephalon is the routing and interpretation function at the boundary where thought becomes speakable and action becomes executable.

### 4. Eidolon ontology
The internal conceptual model.

This includes:
- Eidolon Fields as cognitive substrate
- Nooi as local field cells
- Daimoi as mobile attractors or agents
- Nexuses as anchors where cognition becomes about something
- circuits as graded dimensions or lenses over the same system

## Four-layer translation model

To keep Promethean usable, every concept should be translated through four layers.

### A. Mythic layer
What humans can remember and hand to other humans.

Example:
- Metisean is the recursive architect.

### B. Formal layer
What relation or invariant the symbol encodes.

Example:
- Metisean means planning, protocol formation, self-modeling, and structure selection.

### C. Architectural layer
What kind of software concern this corresponds to.

Example:
- orchestration, workflow planning, runtime selection, refactoring logic, protocol export.

### D. Concrete layer
What package, service, interface, or process currently plays that role.

Example:
- orchestrator package, scheduler, runtime registry, benchmark policy, integration spec.

This translation model is the primary anti-fuzz tool.

## Core formal model

Let a Promethean system be described as:

```text
P = <F, N, D, X, C, R, M, E>

F = field / context manifold
N = nooi / local field cells
D = daimoi / mobile attractor-agents
X = nexus set / referential anchors
C = circuits / evaluative lenses
R = routing and expression layer
M = memory and history layer
E = external protocols and environments
```

### F: Field
The substrate in which tension accumulates and gradients become actionable.

In software terms, this is not necessarily a literal 8D tensor.
It is the **state manifold** of the subsystem:
- queues
- context stores
- embeddings
- event histories
- pressure metrics
- pending goals

### N: Nooi
The smallest local units that hold state.

In software terms:
- cache cells
- chunks
- event records
- memory shards
- vector partitions
- local metrics buckets

Nooi are not agents.
They are the substrate that agents read and write.

### D: Daimoi
Persistent mobile patterns with agency-like behavior.

In software terms:
- actor instances
- workflows
- daemons
- long-lived jobs
- planner loops
- reinforcement routines

### X: Nexus
The point where internal cognition binds to external reference.

In software terms:
- document ids
- session ids
- task ids
- file paths
- model names
- user identities
- tool handles

### C: Circuits
The graded dimensions through which the system interprets itself.

Circuits are **not** best modeled as eight separate services.
They are better modeled as eight lenses or projections over the same system.

### R: Router
The boundary function that turns internal state into messages, plans, tool calls, or speech.

This is Cephalon in the older language and ENSO/Cephalon surfaces in the newer one.

### M: Memory
The layer where history becomes geography.

In software terms:
- event sourcing
- snapshots
- context persistence
- reinforced pathways
- cached retrieval surfaces

### E: Externalization
The protocols and environments in which the system must survive.

In software terms:
- MCP
- ENSO
- OpenCode
- OpenAI-compatible runtimes
- filesystems
- networks
- deployments

## Category-theoretic reading

Promethean makes the most sense when read as a category-shaped design, not as a concrete class hierarchy.

### Promethean as sketch
Promethean defines a **shape**:
- kinds of things that must exist
- relations that must exist between them
- invariants that implementations should preserve

It does not require one implementation of those things.

### Objects
Useful core object kinds are:
- `Agent`
- `Context`
- `Memory`
- `Task`
- `Tool`
- `Artifact`
- `Session`
- `Policy`
- `Runtime`
- `Event`
- `Anchor`

### Morphisms
Useful core morphisms are:
- `interpret`
- `bind`
- `route`
- `compile`
- `plan`
- `execute`
- `reinforce`
- `evaluate`
- `integrate`
- `evoke`
- `archive`

### Circuits as indexed lenses
The circuits are best treated as indexed lenses or projections:

```text
Ci : P -> Viewi
```

where each `Ci` asks a different question of the same system.

This preserves the key insight:
- Aionian is not a daemon.
- Dorian is not an auth server.
- Metisean is not a package.

They are perspectives that may be realized by several concrete components at once.

### Functors to concrete implementations
An implementation is a functor from the Promethean sketch into some concrete category:

- TypeScript packages
- Clojure services
- runtime processes
- database schemas
- event protocols

Two different implementations can both be faithful if they preserve the same relations.

This is the correct place to honor the user's category-theory instinct:
Promethean describes **shape without forcing one structure**.

### Natural transformations
Runtime adapters are natural-transform-like structures.

They preserve agent meaning while changing substrate:
- OpenCode -> OpenAI-compatible runtime
- local runtime -> cloud runtime
- in-memory state -> persisted state

The point is not the category theory performance.
The point is that Promethean wants semantic preservation across substrate change.

## External lineage: what to keep and what to discard

### From Prometheus Rising / the eight-circuit lineage, keep:
- the idea of multiple cognitive modes or lenses
- developmental layering from reflex to metaprogramming to integration
- exercises and metaprogramming as practical reconfiguration, not passive theory
- the notion that the system can inspect and rewrite its own operating assumptions

### From Quantum Psychology, keep:
- model-agnosticism
- the map is not the territory
- suspicion of absolutist language and reified nouns
- E-Prime-style epistemic hygiene
- reality tunnels as partial perspectives, not total truth

### Discard or demote:
- claims that pretend the model is empirically established science
- any attempt to treat the eight circuits as literal neuroscience
- mystic terminology when it obscures implementable relations

Promethean works best as:
- a design ontology
- a policy language
- a symbolic interface for collaboration

It works poorly as:
- a literal scientific theory of cognition

## Circuit mapping as actionable architecture rubric

Every subsystem can be interrogated through the eight circuits.

### 1. Aionian
Question:
- What keeps this subsystem alive?

Implementation concerns:
- health checks
- heartbeat
- retries
- crash recovery
- watchdogs
- resource ceilings

### 2. Dorian
Question:
- What is this subsystem allowed to do, and under what consent or trust boundary?

Implementation concerns:
- permissions
- capability gating
- auth
- sandboxing
- confirmations
- operator policy

### 3. Gnostic
Question:
- How is this subsystem named, typed, and made legible?

Implementation concerns:
- schemas
- DSLs
- identifiers
- ontologies
- docs
- context compilation

### 4. Nemesian
Question:
- How does this subsystem judge whether its behavior is appropriate, aligned, or harmful?

Implementation concerns:
- evaluation
- quality gates
- scoring
- compliance
- review loops
- policy enforcement

### 5. Heuretic
Question:
- How does this subsystem adapt based on success and failure?

Implementation concerns:
- caching
- autotuning
- reinforcement
- thresholds
- operator feedback loops
- learned heuristics

### 6. Oneiric
Question:
- How does this subsystem generate possibilities beyond the current local optimum?

Implementation concerns:
- candidate generation
- speculative search
- branching
- creative recombination
- simulation

### 7. Metisean
Question:
- How does this subsystem model itself, plan over time, and export reusable protocols?

Implementation concerns:
- orchestration
- planning
- workflow decomposition
- protocol formation
- refactoring
- architecture selection

### 8. Anankean
Question:
- What larger constraints or integrations bind this subsystem into the world beyond itself?

Implementation concerns:
- cross-service integration
- deployment contracts
- runtime federation
- external protocols
- irreversibility and final constraints

## Promethean concept map to current architecture

| Promethean concept | Formal meaning | Current architecture correspondence |
| --- | --- | --- |
| Promethean | umbrella worldview and policy language | manifesto, system-level design vocabulary |
| Pantheon | executable agent language/runtime | orchestrator, state, adapters, DSL |
| ENSO | external room/event/stream protocol | event envelopes, rooms, tool streams |
| Cephalon | routing and interpretation boundary | protocol bridge, response router, context-to-speech/action layer |
| Eidolon Field | state manifold of tensions and gradients | context stores, memory substrate, queues, metrics, embeddings |
| Nooi | local substrate cells | records, chunks, event atoms, cache cells, vector partitions |
| Daimoi | mobile attractor-agents | actors, daemons, workflows, long-lived jobs |
| Nexus | referential anchors | ids, labels, files, sessions, models, tasks, docs |
| Memory as geography | persistence of history into future behavior | event sourcing, snapshots, caches, reinforced retrieval |
| Circuits | graded lenses over the whole system | architecture rubric and policy dimensions |

## Worked example: shared semantic accelerator through the Promethean model

This is how the semantic-acceleration work should be read through Promethean.

### Subsystem thesis
The shared semantic accelerator is not "the Promethean mind."
It is one subsystem within Promethean's shape.

### Field mapping
- **Field**: runtime state manifold over latency, batch size, queue depth, device availability, model/dimension partitions, fallback pressure
- **Nooi**: vector chunks, cache rows, benchmark samples, partition records, health snapshots
- **Daimoi**: embed workers, cosine jobs, batch planners, indexing workers
- **Nexuses**: model ids, partition ids, query ids, document ids, runtime names, device names
- **Router / Cephalon**: local batch API and orchestration path that turns requests into batched compute and returns structured results

### Circuit mapping
- **Aionian**
  - runtime health
  - watchdogs
  - warm handles
  - crash-safe recovery
- **Dorian**
  - device permission policy
  - strict no-silent-fallback behavior
  - auth and access to local runtime surfaces
- **Gnostic**
  - model names
  - embedding dimensions
  - batch protocol schemas
  - partition vocabulary
- **Nemesian**
  - benchmark thresholds
  - correctness checks
  - quality gates for retrieval fidelity
- **Heuretic**
  - autotuned batch sizes
  - learned thresholds
  - cache reuse
- **Oneiric**
  - route exploration across NPU/GPU/CPU
  - speculative candidate plans for large jobs
- **Metisean**
  - orchestration
  - query fan-out reduction
  - protocol export for other repos
- **Anankean**
  - OpenPlanner / Knoxx / Eros-Eris integration
  - multi-runtime and deploy constraints

### Key architectural lesson
Metisean is not the raw BLAS kernel.
Metisean is the planner/policy layer that knows when and how to use the kernel.

That suggests a cleaner naming split:
- raw fast-lane runtime: a practical systems name
- policy/orchestration layer around it: a Promethean circuit-aligned name such as `Metis` or `Metisean`

## Design consequences

### 1. Keep the circuit book
The circuit model is good at communication because it compresses policy and intent into memorable symbols.

Do not discard that.

Instead, treat it as the **human interface** to the architecture.

### 2. Stop forcing 1:1 package-name equivalence
Not every mythic term should become a package.

Some terms are:
- lenses
- invariants
- rubrics
- governance layers

### 3. Require translation on all major design work
For each major subsystem, answer:
- mythic role
- formal role
- architectural role
- concrete implementation role

### 4. Preserve model-agnostic discipline
Promethean should encode guiding principles without hardening speculative metaphors into fake certainty.

Use probabilities, not absolutes.
Use multiple models, not one sacred map.

### 5. Treat Pantheon as one instantiation, not the entirety of Promethean
Pantheon is the current executable architecture.
Promethean is the larger doctrinal and symbolic frame.

### 6. Use Promethean as a rubric for subsystem completeness
If a subsystem lacks:
- health
- permissions
- naming
- evaluation
- adaptation
- possibility generation
- planning
- integration

then it is architecturally incomplete in Promethean terms.

## Consolidated one-sentence definition

Promethean is a symbolic and architectural shape language for AI-first systems in which cognition is modeled as a field of tensions, attractors, anchors, and recursive lenses, while concrete implementations are free to realize that shape through different runtimes, protocols, and data structures.

## Operational definition

For implementation work, use this simpler operational definition:

Promethean is a way of designing systems such that:
- state is a manifold, not a flat variable bag
- agents are attractors with persistence and goals
- memory is history made active
- names are anchors, not just labels
- communication is a protocol boundary
- every subsystem is interrogated through the eight circuit lenses
- implementations may vary as long as the relations stay intact

## Source anchors

Primary internal sources:
- `MANIFESTO.md`
- `docs/design/overview.md`
- `docs/design/circuits/overview.md`
- `docs/design/circuits/metisean.md`
- `docs/design/fields/eidolon-fields.md`
- `docs/design/nooi.md`
- `docs/design/daimoi.md`
- `docs/design/nexus.md`
- `docs/dev/packages/pantheon/README.md`
- `docs/dev/packages/pantheon/architecture-overview.md`
- `docs/dev/packages/pantheon/multi-runtime-architecture.md`
- `docs/dev/packages/pantheon/lisp-dsl-specification.md`
- `docs/dev/packages/pantheon/session-management.md`
- `docs/dev/packages/pantheon/pantheon-state.md`
- `docs/design/enso-protocol/01-overview.md`
- `spec/2025-12-01-pantheon-doc-unification.md`
- `spec/2025-12-03-pantheon-agentos-naming.md`

External lineage anchors:
- Robert Anton Wilson, `Prometheus Rising`
- Robert Anton Wilson, `Quantum Psychology`
- Timothy Leary / Wilson eight-circuit lineage as concept scaffold, not engineering truth source

## Definition of done

This consolidation is successful if future design discussions can answer three questions cleanly:

1. Is this statement mythic, formal, architectural, or concrete?
2. Is this Promethean concept a thing, a relation, or a lens?
3. What is the faithful implementation correspondence in the current system?

If those questions can be answered, the model has stopped being fog and started becoming usable structure.
