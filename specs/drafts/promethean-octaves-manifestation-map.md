# Promethean Octaves: Manifestation Map for the Devel Workspace

## Status
Draft

## Purpose

Pull the Promethean consolidation work out of the Promethean repo and ground it in the systems that have actually manifested across the devel workspace.

This document is not the doctrine itself.
It is the bridge between:

- the original Promethean conceptualization
- the `fork_tales` proving organism
- the extracted repos and packages that now carry pieces of the model
- the still-missing ideas that need another pass, another story, another implementation cut

Companion follow-on:
- `specs/drafts/promethean-octaves-story-backlog.md`

## Claim

Promethean was too large to manifest all at once.

So it did what octaves do.
It repeated its shape at different scales.

The same pattern tried to appear:
- as mythology
- as architecture
- as runtime
- as protocol
- as data model
- as user-facing behavior
- as graph and memory surfaces
- as code you could actually keep alive

The problem is not that the model failed.
The problem is that the successful fragments are now distributed, while the original symbolic language still mostly lives in Promethean.

## Reading rule

Use these terms consistently:

- **Doctrine**: the symbolic and policy language of Promethean
- **Proving organism**: the closest large integrated experiment that made the doctrine move in code
- **Extraction**: a smaller system cut out of the proving organism because it could stand on its own
- **Manifestation**: a concept that has an actual repo, package, contract, or running runtime
- **Residual concept**: a Promethean idea that is still mostly symbolic, partial, or fragmented

## North-star sentence

Promethean is the titan-scale doctrine.
`fork_tales` is the closest single organism that made the doctrine live.
The surrounding repos are the organs extracted from that organism.
The next job is to map doctrine to manifested organs and to name what is still missing.

## The floors of the building

Think of the current system as a building where each floor repeats the same harmonic shape in a new material.

## Floor 0 - Doctrine

This is where the model is named.

Primary home:
- `orgs/octave-commons/promethean/`

What lives here:
- the circuit book
- Eidolon / Nooi / Daimoi / Nexus / Cephalon ontology
- the manifesto and policy language
- Pantheon and ENSO conceptual architecture

What it is good at:
- preserving long-distance intent
- naming the shape of the system
- communicating the system to other humans

What it is not good at:
- proving which pieces really survived contact with implementation

## Floor 1 - Proving organism

This is where the doctrine first got enough flesh to move.

Primary home:
- `orgs/octave-commons/fork_tales/`

Why it matters:
- it is the closest **single** implementation of the Promethean model
- it proved that the narrative density was not empty
- it forced the ideas through multiple story passes until they became code

What manifested strongly here:
- persistent runtime ecology
- presence and named sessions
- eventful memory
- graph-and-field thinking
- daimoi as moving packets and later as retrieval doctrine seeds
- local semantic compute and batching discipline
- field/graph/nexus pressure as operative system design motifs

Why it still cannot be the final home:
- it is integrated and alive, but too narratively dense and too entangled to serve as the clean canonical home for every extracted subsystem

## Floor 2 - Organ extraction

This is where the titan gets sliced into smaller living organs.

These extractions are not failures of vision.
They are how the vision survives.

### Cephalon
Home:
- `orgs/octave-commons/cephalon/`

Best reading:
- the head of the agent system
- the thing the user is actually speaking to

Load-bearing manifestations:
- conversation and session identity
- context compilation
- tool coordination
- memory use
- field/action timing
- always-running mind path in CLJS

Key anchors:
- `orgs/octave-commons/cephalon/README.md`
- `orgs/octave-commons/cephalon/specs/head-of-agent-system.md`
- `orgs/octave-commons/cephalon/specs/adjacent-systems-matrix.md`
- `orgs/octave-commons/cephalon/packages/cephalon-cljs/docs/IMPLEMENTATION_SURFACES.md`

### OpenPlanner
Home:
- `orgs/open-hax/openplanner/`

Best reading:
- canonical lake
- memory ledger
- graph receipt store
- search and derived query surface

Load-bearing manifestations:
- append-only event storage
- session retrieval
- graph receipts
- vector and FTS search
- graph export/query materialization

### Knoxx
Homes:
- `orgs/open-hax/knoxx/`
- `services/knoxx/`

Best reading:
- bounded agent-facing knowledge operations surface
- execution roadmap for graph-memory convergence

Why it matters:
- the strongest current cross-system roadmap for OpenPlanner + Graph-Weaver + Cephalon-adjacent graph-memory behavior now lives here

### Graph-Weaver
Best reading:
- graph workbench
- preview and mutation surface over canonical truth

### Eros-Eris Field
Home:
- `orgs/octave-commons/eros-eris-field/`

Best reading:
- semantic-force layout engine
- extracted graph-field dynamics layer

Why it matters:
- it is one of the clearest material manifestations of field logic outside Promethean proper
- it makes semantic similarity act on graph geometry instead of staying abstract doctrine

### Graph-Weaver-ACO
Best reading:
- tiny traversal brain

### Myrmex
Best reading:
- bridge organism that combines traversal, extraction, routing, and backpressure into writes to the lake

### Daimoi
Best reading:
- bounded walker doctrine
- packet physics and retrieval-walker language

Important correction:
- daimoi belong with the broader knowledge-graphing stack, not with `openplanner` in isolation
- the live line is:
  - `openplanner` as canonical lake
  - `graph-weaver` as workbench/intervention surface
  - `myrmex` as foraging/orchestration organism
  - `eros-eris-field` as field/layout engine
  - `graph-weaver-aco` as tiny traversal kernel

### Graph-Runtime / Simulacron
Best reading:
- deeper ontology lines preserving world/substrate doctrine and layered presence doctrine

They should constrain names and decomposition, but should not block near-term product convergence.

## Floor 3 - Contracts

This is where repeated ideas stop being vibes and become reusable seams.

Current strong manifestations include:
- event envelopes
- memory record contracts
- runtime handoff/state contracts
- graph query contracts
- batch search/vector/index contracts

This floor is critical because it is where doctrine becomes interoperable without forcing one language.

## Floor 4 - Runtime convergence

This is where the extracted organs start acting like one organism again.

The strongest current convergence line looks like this:

1. Cephalon is the head and mouth.
2. OpenPlanner is the canonical lake.
3. Graph-Weaver is the workbench.
4. Myrmex is the web forager.
5. Eros-Eris Field is the semantic-force engine shaping graph-field geometry.
6. Knoxx exposes bounded agent-facing memory/graph operations.
7. Daimoi preserves the walker doctrine connecting field motion, graph traversal, and bounded retrieval across that whole stack.

This is the current living octave of Promethean outside the Promethean repo.

## The octave rule

The most important recovered philosophy is this:

> each concept of the eight-circuit model should manifest again and again at multiple scales without becoming identical across those scales.

That means each octave is the same shape, differently embodied.

Examples:

### Aionian across octaves
- doctrine: survival / wakefulness / continuity
- runtime: heartbeat, liveness, tick loop, health checks
- subsystem: watchdogs, retries, warm handles, recovery

### Dorian across octaves
- doctrine: permission, trust, boundary
- runtime: auth, capability gates, sandboxing
- subsystem: strict no-silent-fallback policies, user confirmations, tenant boundaries

### Gnostic across octaves
- doctrine: naming, representation, story, symbol
- runtime: schemas, DSLs, contracts, tags, identifiers
- subsystem: model names, graph node kinds, memory record types, query surfaces

### Nemesian across octaves
- doctrine: judgment, alignment, appropriateness
- runtime: scoring, review, guardrails, quality gates
- subsystem: graph truth checks, stale fallback visibility, benchmark gates

### Heuretic across octaves
- doctrine: reinforcement and adaptation
- runtime: learned thresholds, autotuning, cache reuse, retained history
- subsystem: adaptive batch sizes, query routing, retrieval preferences

### Oneiric across octaves
- doctrine: possibility and recombination
- runtime: candidate generation, search, speculative branching
- subsystem: traversal exploration, graph expansion candidates, alternate execution paths

### Metisean across octaves
- doctrine: recursive planning and protocol formation
- runtime: orchestrators, planners, integration maps, system refactoring
- subsystem: convergence specs, cross-repo matrices, extraction strategies, runtime composition roots

### Anankean across octaves
- doctrine: larger necessity, integration, and irreversible constraints
- runtime: external protocols, multi-runtime federation, deployment contracts
- subsystem: OpenCode/OpenAI compatibility, ENSO/MCP boundaries, host/runtime constraints

## Manifestation table

| Promethean concept | Closest manifested home today | What actually manifested | What is still missing |
| --- | --- | --- | --- |
| Cephalon | `orgs/octave-commons/cephalon` | speaking runtime, session identity, context assembly, tools, memory surfaces, always-running mind path | one fully unified canonical head across TS/CLJS/CLJ strata |
| Eidolon field | `cephalon-cljs` plus `fork_tales` field/runtime work | eidolon retrieval/index maintenance, field vocabulary, ticked runtime thinking | a clear canonical home and stable shared contract |
| Daimoi | `fork_tales` plus `orgs/octave-commons/daimoi`, `graph-weaver`, `myrmex`, and `eros-eris-field` adjacent lines | packet/field dynamics and bounded retrieval walkers in the graph-native knowledge stack | one library and contract family that makes the graph-field-walker relation explicit and reusable |
| Nexus | `cephalon` note corpus, openplanner graph receipts, graph query surfaces | nexus keys, symbolic anchors, graph bindings, memory-to-key structures | one canonical cross-repo nexus contract |
| Memory as geography | `openplanner` and `pantheon-state` lineages | append-only receipts, event sourcing, snapshots, graph receipts, vector search | unified narrative tying event memory, graph memory, and field memory together |
| Pantheon | mostly in Promethean docs with partial experimental code | language/runtime framing, orchestration doctrine, session/state architecture | fuller manifestation outside the Promethean repo |
| ENSO / Cephalon boundary | Promethean docs, cephalon runtime seams, MCP/tool/event contracts | boundary thinking, room/event/tool/stream semantics, canonical envelope direction | broader adoption across extracted repos |
| Metisean planning layer | devel specs, cephalon matrices, knoxx roadmaps | integration planning, ownership maps, convergence roadmaps, protocol export | a named concrete orchestration layer that survives beyond docs |

## What has materially manifested already

This is the non-fuzzy core.

These things are real and should be treated as such:

1. **The head exists.**
   - Cephalon is a real family of runtime attempts.

2. **The lake exists.**
   - OpenPlanner is the real canonical memory/graph store line.

3. **The workbench exists.**
   - Graph-Weaver is the graph inspection/mutation layer.

4. **The forager exists.**
   - Myrmex is the composition root for traversal + extraction + writing.

5. **The field engine exists.**
   - Eros-Eris Field carries semantic-force graph dynamics as a clean extraction.

6. **The walker doctrine exists.**
   - Daimoi survived as both packet doctrine and bounded retrieval doctrine inside the graph-native knowledge stack.

7. **The always-running mind exists in partial form.**
   - Cephalon CLJS still carries the strongest daemon/ECS/eidolon architecture.

8. **The graph-memory convergence plan exists.**
   - Knoxx knowledge-ops specs currently hold the strongest execution roadmap.

9. **The semantic acceleration path exists.**
   - `fork_tales` proved local embedding/runtime optimization patterns that can now be extracted.

## What is still only partially manifested

These are the biggest residual concepts still waiting for another story pass.

1. **A canonical shared home for eidolon / nexus / prompt-field logic**
   - Cephalon backlog already names this as unresolved.

2. **One stable translation layer from Promethean doctrine to extracted repos**
   - the doctrine exists in Promethean
   - the organs exist elsewhere
   - the mapping is still too distributed

3. **A concrete Metisean runtime layer**
   - planning and protocol formation exist mostly as specs and integration maps
   - there is not yet a clearly named, clearly bounded orchestration layer that fully owns this role

4. **Circuit-complete subsystem evaluation**
   - many repos embody one or two circuit dimensions strongly
   - few are reviewed or designed explicitly across all eight

5. **A stable devel-root reading order for the whole organism**
   - right now readers must hop between Promethean doctrine, Fork Tales proving work, Cephalon consolidation, OpenPlanner reality, and Knoxx roadmap truth

## The narrative you can hand to people

Promethean was the titan-scale blueprint.
It named the laws of the organism before the organism had organs.

`fork_tales` was the first place the organism truly moved.
It carried too much at once, but that was also why it worked.
It held the pressure long enough for the system to prove that the doctrine had teeth.

Then the organism was cut apart on purpose.
Not to kill it.
To let it survive.

Cephalon became the head.
OpenPlanner became the lake.
Graph-Weaver became the workbench.
Myrmex became the forager.
Eros-Eris became the field engine.
Daimoi became the walkers of that graph-field ecology.
Knoxx became the bounded operator-facing execution layer where the graph-memory line is forced to become real.

What remains is not to reinvent Promethean from scratch.
It is to keep singing the same shape into each octave until the doctrine, the organs, and the interfaces line up.

## Program order: what story to tell next

### Story 1 - The doctrine-to-organ map
Write and maintain the devel-root canonical map from Promethean concepts to manifested systems.

This document is the start of that.

The direct sequel is:
- `specs/drafts/promethean-octaves-story-backlog.md`

### Story 2 - The unresolved organs
For each residual concept, decide:
- where it should live
- what contract it needs
- what smaller extraction slice would count as real manifestation

Highest-priority residuals:
- eidolon / nexus / prompt-field canonical home
- Metisean orchestration layer
- circuit-complete subsystem review method

### Story 3 - The shared seams
Promote the surviving cross-repo contracts that keep reappearing:
- memory record
- event envelope
- runtime state / handoff
- graph query
- semantic batch runtime

### Story 4 - The octave test
For each extracted subsystem, ask:
- how does each circuit manifest here?
- which circuits are missing?
- what must be added for the subsystem to be architecturally complete in Promethean terms?

### Story 5 - The next proving organism
Do not try to rebuild all of Promethean in one repo again.

Instead, let devel become the convergence floor where:
- doctrine is translated
- organs are wired
- contracts are hardened
- missing layers are named before they are built

## Immediate implications for naming

Names should reflect whether a thing is:

- a doctrine term
- an organ
- a contract
- a workbench
- a walker
- a runtime seam

This helps avoid the old confusion where one mythic term tries to be all of these at once.

Examples:
- `Metisean` is best kept for the planning/protocol/refactoring layer, not a raw compute kernel
- `Cephalon` is correctly the head
- `Daimoi` can truthfully name the walker doctrine because that semantic migration is real, not accidental

## Reading path

If you need to recover the shape quickly, read in this order:

1. `orgs/octave-commons/promethean/MANIFESTO.md`
2. `orgs/octave-commons/promethean/spec/2026-04-05-promethean-model-consolidation.md`
3. `orgs/octave-commons/fork_tales/README.md`
4. `orgs/octave-commons/cephalon/README.md`
5. `orgs/octave-commons/cephalon/docs/FORK_TALES_SOURCE_MAP.md`
6. `orgs/octave-commons/cephalon/specs/head-of-agent-system.md`
7. `orgs/octave-commons/cephalon/specs/adjacent-systems-matrix.md`
8. `orgs/open-hax/openplanner/README.md`
9. `orgs/open-hax/knoxx/specs/knowledge-ops-graph-memory-roadmap.md`
10. `orgs/octave-commons/daimoi/specs/retrieval-walkers.md`

## Definition of done

This document succeeds if it makes the following statements easy to answer:

1. Which Promethean concepts have materially manifested already?
2. Which repos currently own those manifestations?
3. Which concepts are still residual and need another story pass?
4. How does the same eight-circuit shape recur across octaves of the system?
5. What should be built next without trying to swallow the whole titan again?
