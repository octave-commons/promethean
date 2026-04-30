# Fork Tales and Shibboleth Research Framing

## Status

- date: 2026-04-04
- author: OpenCode synthesis pass
- purpose: clean up the conceptual frame around `fork_tales` and `shibboleth`, connect them to current agent-memory and evaluation literature, and identify paper-shaped deliverables
- note: Perplexity API calls were attempted first for fresh research but failed due to quota exhaustion in this environment; direct source fetches and local workspace materials were used instead.

## Executive Summary

Two different research artifacts are latent in this workspace.

- `shibboleth` is already shaped like an evaluation paper and benchmark framework.
- `fork_tales` is not one clean paper yet. It is a research program with at least one strong systems paper inside it, and probably a small family of papers once the decomposition is finished.

The cleanest way to think about them is:

- `Shibboleth` asks: how do we build and evaluate multilingual adversarial prompt classifiers in a way that is reproducible, leakage-resistant, and production-relevant?
- `Fork Tales` asks: what if agent memory, graph topology, resource pressure, provenance, and control are all part of the same runtime substrate instead of being glued together as separate tools?

The current literature on agentic memory systems provides the missing frame for `fork_tales`:

- passive RAG is the hydration layer
- active RAG is the retrieval control loop
- graph memory is the durable relational world model
- temporal provenance is the audit substrate
- resource budgeting and backpressure are the operational survival layer

`fork_tales` was reaching for all of these at once.

## 1. External Research Frame

### 1.1 Passive RAG

Passive RAG is the simplest pattern:

- retrieve top-k documents or chunks
- stuff them into the prompt
- generate once

It is cheap and often good enough for local grounding, but it is weak at:

- multi-hop reasoning
- conflict resolution
- provenance over long chains
- evolving world state
- structured temporal memory

This matches the framing already written in `devel/orgs/open-hax/knoxx/specs/knoxx-session-lake-graph-and-memory.md`.

### 1.2 Active / Agentic RAG

Active RAG turns retrieval into a loop:

- decide whether retrieval is needed
- retrieve
- critique or grade evidence
- rewrite query or change tool
- retrieve again if necessary
- stop when evidence is sufficient

This is the pattern behind:

- Self-RAG
- CRAG
- newer agentic search and repair work

The important shift is that retrieval stops being a single preprocessing step and becomes part of policy.

### 1.3 Graph RAG

Graph-based retrieval systems improve on flat chunk retrieval when the task depends on:

- relations
- communities
- multi-hop structure
- corpus-level themes
- explainable traversal

GraphRAG is the clean reference for this move on document corpora. HippoRAG 2 pushes the framing further toward long-term memory by using graph structure plus Personalized PageRank to improve associativity and sense-making without giving up factual retrieval.

### 1.4 Temporal Graph Memory

Temporal graph systems go one step beyond GraphRAG.

They do not only derive a graph from documents. They also track:

- what was true when
- which episode produced which fact
- how facts are superseded instead of deleted
- incremental updates rather than full rebuilds

Graphiti and the Zep paper are the clearest current examples here.

### 1.5 Long-Term Agent Memory

Recent memory systems are converging on a stable architecture split:

- episodic memory: interactions, transcripts, tool traces, sessions
- semantic memory: facts, durable summaries, extracted knowledge
- procedural memory: policies, reusable strategies, subroutines, system rules
- graph memory: relations, neighborhoods, temporal fact structure, provenance

CoALA gives the cleanest abstract taxonomy. MemGPT/Letta treats memory as tiered context management. Mem0 emphasizes production extraction, consolidation, and retrieval. LightMem emphasizes efficiency and sleep-time consolidation. AriGraph and HippoRAG move the design toward graph-native memory.

### 1.6 Stable Design Pattern Across Sources

Across the literature and tooling, the same pattern keeps reappearing:

1. raw data is retained in an append-only or at least durable base layer
2. one or more derived indexes are built on top of it
3. vector retrieval handles local semantic lookup
4. graph retrieval handles relations and multi-hop queries
5. active control loops decide when to retrieve, inspect, retry, or stop
6. temporal provenance is necessary if the system must survive over time
7. ingestion must be rate-limited or backpressured to avoid memory pollution and compute collapse

That pattern is exactly the bridge between modern agent memory papers and the `fork_tales` decomposition.

## 2. The Fork Tales Dot Map

### 2.1 The Simplest Clear Statement

`fork_tales` is best understood as a graph-native agent-memory runtime with an explicit control theory layer.

Its interesting claim is not just "graph plus agents".

Its stronger claim is:

- semantics are not only embeddings or labels
- semantics affect topology
- topology affects cost and routing
- routing affects resource flow
- resource pressure affects behavior
- behavior is recorded in an event ledger
- the system can explain the path from event to field to action

That is much stronger than a normal RAG architecture.

### 2.2 The Core Fork Tales Ideas

Fork Tales contains at least five distinct ideas that should not be mentally collapsed into one blob.

#### A. TruthGraph / ViewGraph separation

This is the most legible modern systems contribution.

- TruthGraph is immutable raw truth plus provenance
- ViewGraph is the compressed operational projection

This is not just storage optimization. It is a governance claim:

- raw history remains intact
- runtime operates on a compressed, inspectable world model
- expansion and compaction become explicit operations

#### B. Presences

Presences are decision-making entities with:

- needs
- priorities
- influence or mass
- a semantic lens

This is closer to a policy-bearing actor model than to a normal chatbot persona.

#### C. Daimoi

Daimoi are the weirdest and most original layer.

They are not just messages.

They are packets with:

- owner
- intent distribution
- motion
- collision semantics
- field interaction
- absorption or deflection
- compute-linked issuance and spending

In modern language, daimoi are part message bus, part retrieval walker, part budget token, part attention packet.

#### D. Reservoir economy

Fork Tales does not treat compute as a hidden implementation detail.

It turns compute pressure into part of the runtime semantics:

- pressure
- scarcity
- local prices
- congestion-aware routing

This is the metabolic layer that most current memory systems omit.

#### E. Graph instrumentation surfaces

The weaver and graph APIs are not just UI sugar. They are the empirical surface that makes the runtime inspectable.

This is where `fork_tales` starts to look like a research instrument rather than just an experiment.

### 2.3 The Most Useful Cleanup

If the thought process feels muddy, use this separation:

- `fork_tales` = umbrella research program and original coupled prototype
- `graph-runtime` = substrate paper candidate
- `daimoi` = packet and field semantics paper candidate
- `simulacron` = layered entity and presence architecture paper candidate
- `graph-weaver` = graph workbench and graph instrumentation surface
- `graph-weaver-aco` and `myrmex` = traversal and ingestion kernels
- `openplanner` = canonical raw lake / truth capture layer in the cleaned modern stack
- `knoxx` = agent/session runtime that should consume the cleaned memory architecture

This makes `fork_tales` the source civilization, not the final product boundary.

### 2.4 The Key Fork Tales Insight in Today’s Vocabulary

The clean translation into current agent-memory language is:

- OpenPlanner stores append-only raw episodes and corpus records
- Knoxx owns episodic/session interaction surfaces
- Graph projections turn selected raw records into a relational memory layer
- Graph Weaver exposes the combined graph as an instrument and query surface
- Daimoi are budgeted intent packets moving through the graph and field
- Presences are controllers competing and cooperating under resource pressure
- The reservoir economy is the backpressure and admission control layer

In other words:

- passive RAG = hydration from lake and memory indexes
- active RAG = policy loop over tools and graph queries
- graph memory = the durable relational substrate
- daimoi = budgeted routing and attention packets
- reservoir economy = survival and cost discipline

This is why `fork_tales` feels ahead of ordinary RAG work. It was trying to fuse the retrieval, memory, and control planes.

## 3. Fork Tales Decomposition Status

The decomposition already exists in outline.

### 3.1 What Is Already Extracted Conceptually

The following descendants now hold explicit source maps and cleaner doctrine:

- `graph-runtime`
- `daimoi`
- `simulacron`
- `graph-weaver`

This is a real gain. The workspace now contains source maps, roadmaps, and decomposition contracts that were not legible when everything lived inside Part64.

### 3.2 What Is Still Entangled

What remains incomplete is the bridge from doctrine to operationally clean systems.

The missing work is not just documentation. It is contract completion:

- append-only truth capture must have one obvious home
- graph projection must be explicit and replayable
- daimoi must become a real standalone engine or a clearly bounded protocol
- presences need bounded interfaces and authority rules
- the graph query surface needs to be first-class for agent runtimes
- backpressure and ingestion control need explicit implementation contracts

### 3.3 The Real Risk

The real decomposition failure mode is preserving the visual costume while losing the organism.

That means extracting only:

- pretty graph UIs
- particle motion
- generic crawler logic

while losing:

- ownership
- provenance
- need and pressure
- field attribution
- budgeted control

The decomposition docs in `graph-runtime`, `daimoi`, and `simulacron` already warn about exactly this.

## 4. Is Fork Tales a Paper?

Yes, but probably not as one giant paper in its current state.

### 4.1 The Strongest Paper Core

The strongest single paper nucleus is:

**A self-organizing graph-native runtime for coupled meaning, provenance, and resource flow.**

This is already close to the title of the deep research report.

Its clean claims would be:

- a TruthGraph / ViewGraph split for auditable, compressed operational memory
- graph-distance-based semantics rather than only embedding-space retrieval
- agents represented as presences with needs, priorities, and masks
- daimoi packets as stochastic, owner-bearing, intent-carrying control units
- a reservoir economy turning resource pressure into local routing and pricing signals
- event-level explainability connecting behavior back to underlying causes

### 4.2 Why It Is Not Fully Paper-Ready Yet

It still needs:

- a cleaner reference implementation boundary
- a stable experimental protocol
- a smaller named system surface
- clearer ablations that separate novelty from style
- decomposition completion so the paper is about the system, not the archaeology

### 4.3 Better Framing: Fork Tales as a Paper Family

The cleaner publication strategy is to treat `fork_tales` as a research program and publish from the extracted descendants.

Possible papers:

1. **Graph Runtime paper**
   - TruthGraph / ViewGraph
   - graph-native memory and control
   - resource-aware topology and auditable routing

2. **Daimoi paper**
   - probabilistic intent packets
   - field deposition, collisions, absorption, observer metrics
   - budgeted signaling and cross-graph bridging

3. **Graph Instrumentation / Weaver paper**
   - layered graph workbench over local, web, and user layers
   - event-driven graph growth and inspection
   - graph as instrument, not only index

4. **Presence / Simulacron paper**
   - layered entity ecology
   - survival, permission, reason, ethics
   - cast structure for agency under bounded resources

This strategy preserves the real contribution while making each paper explainable.

## 5. Shibboleth Dot Map

### 5.1 The Simplest Clear Statement

`shibboleth` is a generative, reproducible, multilingual adversarial prompt benchmark and evaluation framework for front-door prompt classification.

It is already much closer to a benchmark paper than `fork_tales` is to a systems paper.

### 5.2 What Is Actually Novel

The strongest novel pieces are:

- multilingual adversarial prompt framing that is not English-only by default
- explicit safety plus availability framing
- cluster-level split-before-transform discipline to avoid semantic leakage
- generative DSL rather than static dataset-only benchmark construction
- SEU curves for security, utility, and efficiency tradeoffs

That last point matters. Most safety benchmark talk collapses too much into accuracy. `shibboleth` explicitly tries to measure:

- under-blocking
- over-blocking
- obfuscation robustness
- resource-exhaustion behavior

### 5.3 Why Shibboleth Is Already Paper-Shaped

It already has:

- a paper draft
- a threat model
- a pipeline spec
- an evaluation spec
- a dataset schema
- baseline framing
- reproducibility language

This means the main work left is not conceptual rescue. It is execution, tightening, and evidence.

### 5.4 What Shibboleth Still Needs

To be genuinely paper-ready, it still needs:

- a fully working end-to-end build that can be rerun by others
- a released benchmark artifact or at least a reproducible build path
- empirical baselines with significance testing
- stronger evidence for native multilingual adversarial coverage beyond translated prompts
- a clear explanation of what the DSL contributes beyond a one-off pipeline config

The research contribution should remain centered on the grammar and evaluation protocol, not only on one dataset snapshot.

## 6. The Relationship Between Fork Tales and Shibboleth

These are not the same kind of contribution.

- `fork_tales` is a systems and runtime research thread
- `shibboleth` is an evaluation and benchmark research thread

The connection is still real:

- `fork_tales` asks how an agentic runtime should organize memory, control, and explanation
- `shibboleth` asks how a front-door safety and availability classifier should be built and evaluated

One is about the internals of durable agency.

The other is about the grammar that tests a boundary.

This difference is healthy. They do not need to collapse into one narrative.

## 7. A Cleaner Mental Model

If the goal is to make the thought process clearer, use this seven-part map.

1. **Raw truth**
   - append-only records, sessions, tool outputs, crawl data
   - modern home: `openplanner`

2. **Derived memory**
   - vector indexes, summaries, graph projections
   - modern homes: `openplanner` plus graph descendants

3. **Graph substrate**
   - TruthGraph, ViewGraph, nexus, query surface
   - modern home: `graph-runtime`

4. **Control packets**
   - routed intent, movement, collisions, absorption, packet telemetry
   - modern home: `daimoi`

5. **Agent ecology**
   - presences, roles, layered entities, authority and masks
   - modern home: `simulacron`

6. **Instrumentation and ingestion**
   - graph workbench, crawler, overlays, graph APIs
   - modern homes: `graph-weaver`, `graph-weaver-aco`, `myrmex`

7. **Safety evaluation**
   - front-door adversarial prompt classifier benchmark and harness
   - modern home: `shibboleth`

Once these are separated, `fork_tales` stops looking like a mess and starts looking like a compressed civilization.

## 8. Publication Strategy Recommendation

### 8.1 Shibboleth

Treat `shibboleth` as a benchmark and evaluation paper first.

Working title directions:

- `Shibboleth: A Generative Multilingual Benchmark for Adversarial Prompt Classification`
- `Shibboleth: Leakage-Resistant Evaluation for Multilingual Adversarial Prompt Classifiers`
- `Beyond Jailbreak Detection: A Reproducible Multilingual Evaluation Framework for Adversarial Prompt Classifiers`

Core thesis:

- current adversarial prompt evaluation is too English-centric, too static, and too safety-only
- production systems need multilingual, leakage-resistant, safety-plus-availability evaluation
- Shibboleth provides the grammar, pipeline, and evaluation harness to do that reproducibly

### 8.2 Fork Tales

Treat `fork_tales` as a systems paper family, with one flagship paper and several descendants.

Flagship title directions:

- `A Self-Organizing Graph Runtime for Coupled Meaning and Resource Flow`
- `Graph-Native Agent Memory with Auditable Topology, Temporal Provenance, and Resource-Aware Control`
- `From RAG to Runtime: A Graph-Native Architecture for Durable Agent Memory and Control`

Core thesis:

- modern agent memory systems separate retrieval, world model, provenance, and resource control too sharply
- a graph-native runtime can couple these into a single auditable substrate
- TruthGraph / ViewGraph, presences, daimoi, and a reservoir economy provide a unified control model

### 8.3 Important Strategic Advice

Do not force `fork_tales` itself to be the polished publication artifact.

Use it as the provenance base and research ancestor.

Let the extracted repos and the deep research report carry the paper narrative.

That makes the decomposition a strength instead of an embarrassment.

## 9. Paper Readiness Matrix

| Artifact | Best interpretation | Main claim type | Current readiness | Recommended role |
|---|---|---|---|---|
| `fork_tales` | research program / provenance ancestor | broad systems vision | medium conceptually, low editorially | umbrella source, not the final paper artifact |
| `fork_tales/part64/deep-research-report.md` | flagship systems paper draft nucleus | graph-native runtime | high conceptually, medium empirically | primary writing base for a runtime paper |
| `graph-runtime` | substrate paper core | TruthGraph/ViewGraph and auditable runtime substrate | medium-high | flagship paper repo or appendix/provenance companion |
| `daimoi` | component paper core | packet, field, observer, collision model | medium | second paper or major section of flagship paper |
| `simulacron` | theory and architecture note | layered entity and presence ecology | medium-low | conceptual companion, not first publication target |
| `graph-weaver` | systems / tooling paper core | graph instrumentation and layered graph workbench | medium | separate tooling paper or implementation section |
| `myrmex` / `graph-weaver-aco` | supporting subsystem | traversal and ingestion kernels | medium-low | implementation support, benchmarks, appendices |
| `openplanner` | operational memory substrate | append-only lake and raw truth capture | high as infrastructure, lower as novel paper by itself here | canonical backend substrate in the modern stack |
| `knoxx` | agent harness / consumer surface | episodic runtime and tool-using agent interface | medium | integration/demo surface, not the main novelty |
| `shibboleth` | benchmark and evaluation paper core | multilingual adversarial prompt evaluation | high conceptually, medium-high structurally | first paper candidate |

## 10. Immediate Next Steps

### For Fork Tales

1. Finish the decomposition ledger.
   - make one table that says what is upstream, what is extracted, what is still coupled, and what the canonical home is

2. Choose the flagship paper boundary.
   - recommended: `graph-runtime` plus `daimoi`, with `fork_tales` as provenance ancestor

3. Define the minimum experimental story.
   - what workloads, ablations, diagnostics, and comparisons make the runtime claims testable

4. Make the metabolic layer explicit.
   - resource pressure, backpressure, issuance, and spending are part of the novelty

5. Keep raw truth and derived views separate in implementation.
   - this is one of the cleanest claims in the whole program

### For Shibboleth

1. Finish the executable end-to-end pipeline.
2. Freeze the evaluation matrix and baseline set.
3. Build at least one releasable benchmark artifact.
4. Prove the leakage-resistant split story empirically.
5. Tighten the paper around grammar, reproducibility, and production realism.

## 11. Source Anchors

### Workspace anchors

- `devel/orgs/open-hax/knoxx/specs/knoxx-session-lake-graph-and-memory.md`
- `docs/notes/2026.04.03.20.43.04.md`
- `devel/orgs/octave-commons/fork_tales/part64/deep-research-report.md`
- `devel/orgs/octave-commons/fork_tales/docs/notes/system_design/2026-02-20-hybrid-field-graph-formalism.md`
- `devel/orgs/octave-commons/fork_tales/docs/notes/system_design/2026-02-20-design-hole-responses-field-and-collisions.md`
- `devel/orgs/octave-commons/fork_tales/docs/WEB_GRAPH_WEAVER.md`
- `devel/orgs/octave-commons/graph-runtime/specs/decomposition-roadmap.md`
- `devel/orgs/octave-commons/daimoi/specs/extraction-roadmap.md`
- `devel/orgs/octave-commons/simulacron/specs/decomposition-roadmap.md`
- `devel/orgs/octave-commons/graph-weaver/specs/graph-layers-and-storage.md`
- `devel/orgs/octave-commons/shibboleth/README.md`
- `devel/orgs/octave-commons/shibboleth/docs/research-paper-draft.md`
- `devel/orgs/octave-commons/shibboleth/docs/pipeline/shibboleth-pipeline-spec.md`
- `devel/orgs/octave-commons/shibboleth/docs/evaluation/shibboleth-evaluation-spec.md`
- `devel/orgs/octave-commons/shibboleth/docs/datasets/shibboleth-threat-model.md`

### External anchors

- CoALA: `https://arxiv.org/abs/2309.02427`
- MemGPT: `https://arxiv.org/abs/2310.08560`
- Self-RAG: `https://arxiv.org/abs/2310.11511`
- CRAG: `https://arxiv.org/abs/2401.15884`
- GraphRAG: `https://arxiv.org/abs/2404.16130`
- HippoRAG: `https://arxiv.org/abs/2405.14831`
- AriGraph: `https://arxiv.org/abs/2407.04363`
- Zep / Graphiti: `https://arxiv.org/abs/2501.13956`
- HippoRAG 2: `https://arxiv.org/abs/2502.14802`
- Mem0: `https://arxiv.org/abs/2504.19413`
- LightMem: `https://arxiv.org/abs/2510.18866`
- Microsoft GraphRAG project page: `https://www.microsoft.com/en-us/research/project/graphrag/`
- Graphiti repository: `https://github.com/getzep/graphiti`
- Mem0 repository: `https://github.com/mem0ai/mem0`
- Letta repository: `https://github.com/letta-ai/letta`
