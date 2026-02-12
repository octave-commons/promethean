Alright — embedding benchmarks are *exactly* the next missing pillar.

You want to evaluate **embedding models** the same way we’re evaluating **tool calling / vision / agents**:

* suite-driven
* crash-resumable (events.jsonl)
* reportable (tables + summaries)
* DSL that feels “native” (authoring is pleasant)
* reusable for real systems (RAG, search, clustering)

Below is a complete **Embedding Benchmark Spec + DSL proposal** that plugs into your framework.

---

# Embedding Benchmark Spec

## Suite name

`embeddings/*`

## Goals

You want to measure **embedding usefulness** for:

* 🔎 semantic search / retrieval (RAG, docs, code, chat logs)
* 🧩 clustering / grouping (dedup, topic bundles)
* 🧠 similarity judgments (ranking, rerank prefilter)
* ⚡ performance (latency, throughput, caching stability)
* 🧪 robustness (negation, lexical traps, near-miss decoys)

## Non-goals

* No massive BEIR/MTEB full-corpus reproductions (yet)
* No “perfect human semantic truth” — we want practical signals
* No dependence on a single embedding dimension or vendor API

---

# Core Tasks

## 1) Pair similarity

Given `(a, b)` and an expected relation class:

* `:same` (duplicate / paraphrase)
* `:related` (same topic)
* `:unrelated` (different topic)
* `:contrast` (opposite/negated)

### Metrics

* cosine / dot similarity score distribution
* threshold accuracy (simple classifier)
* **margin** between true positive and decoys

---

## 2) Ranking / retrieval

Given a `query`, rank a small set of candidates:

* positives: should be near top
* hard negatives: high lexical overlap but wrong meaning
* random negatives: unrelated

### Metrics

* `MRR@k`
* `Recall@k`
* `NDCG@k` (optional)
* average similarity gap: `min(pos) - max(neg)`

This is your most important benchmark for “real life embedding usage”.

---

## 3) Chunked document retrieval

Given:

* corpus of chunks
* queries pointing at specific chunks

Measure whether embeddings can pull the right chunk **without reranking**.

This mirrors your real RAG system.

### Metrics

* Recall@k, MRR
* chunk position bias (are first chunks always winning?)
* failure types (near-miss chunk vs total miss)

---

## 4) Clustering / grouping

Given a set of items with known labels (topics):

* cluster with a simple algorithm (e.g., k-means)
* score purity / homogeneity

### Metrics

* cluster purity
* silhouette score (optional)
* label entropy per cluster

---

## 5) Dedup / near-duplicate detection

Given a list containing:

* exact duplicates
* paraphrases
* “almost the same but important difference”

### Metrics

* precision/recall at a chosen similarity cutoff
* false positives (danger zone)

This matters a lot for **stream chat indexing** and **Discord logs**.

---

# Decoys for Embeddings

Decoys are mandatory here (they’re the tool-choice equivalent).

## Decoy types

* `:lexical` — share words but wrong meaning
* `:negation` — “enable X” vs “disable X”
* `:near-domain` — same topic neighborhood but different intent
* `:format` — code vs prose describing same thing
* `:entity-swap` — same structure, different named thing

These produce the best “embedding model is lying” evidence.

---

# Performance & Stability Metrics

Embeddings are used constantly — so performance is *the* practical signal.

## Metrics to always record

* `latency/embed_ms` per item
* `throughput/vec_per_sec`
* `cache/hit_rate`
* `stability/repeat_similarity`
  (embed the same text twice; cosine should be ~1.0)

Also record vector metadata:

* dims
* normalization behavior (does the model output unit vectors?)

---

# Storage + Replay

Embed benchmarks should generate artifacts like:

```
reports/embeddings/<run-id>/
  events.jsonl
  vectors/
    <model>/
      corpus.vecs.npy | edn | fressian
      queries.vecs.npy
  tables/
    retrieval.csv
    pairs.csv
    perf.csv
  summary.json
```

You want vectors saved so you can:

* replay scoring without recomputing embeddings
* compare models later
* inspect weird failures

---

# Embedding DSL Syntax

You said “DSL syntax” explicitly — so here’s a macro system that will feel natural.

## Authoring primitives

We’ll define:

* `def-embedder` — model configuration
* `def-corpus` — named corpora
* `def-embed-suite` — suite config
* `pair` — pair similarity test
* `rank` — retrieval/ranking test
* `cluster` — clustering test
* `dedup` — dedup test

### DSL goal

Make test cases readable like:

```clojure
(def-embed-suite embeddings/stream-core
  {:embedders [embed/nomic embed/mxbai]
   :metric :cosine
   :k [1 3 10]}
  (rank "fix websocket disconnect bug"
    (pos "WebSocket closes after idle timeout; add ping/pong keepalive")
    (pos "Handle reconnect loop and exponential backoff")
    (decoy :negation "Disable ping/pong keepalive to reduce traffic")
    (decoy :lexical "Socket recipe: how to make crispy potatoes")))
```

That’s the “natural language spec” vibe you’re after.

---

# Proposed Files

## 1) `benchmarks/embeddings/dsl.clj`

Defines the macros + case structs.

### `def-embedder`

```clojure
(def-embedder embed/nomic
  {:provider :ollama
   :model "nomic-embed-text"
   :dims 768
   :normalize? true})
```

### `def-embed-suite`

```clojure
(def-embed-suite embeddings/basic-retrieval
  {:embedders [embed/nomic]
   :metric :cosine
   :k [1 3 10]
   :corpus (corpus :docs "benchmarks/embeddings/assets/docs.edn")}
  ...)
```

## 2) `benchmarks/embeddings/suites/core.clj`

Your first real benchmark suite.

## 3) `benchmarks/embeddings/score.clj`

Common metrics + scoring functions.

---

# DSL Case Types

## `pair`

```clojure
(pair "websocket ping keeps connection alive"
      "keepalive ping/pong prevents idle disconnects"
      :expect :same)

(pair "enable streaming overlay"
      "disable streaming overlay"
      :expect :contrast)
```

**Scoring:** similarity should satisfy ordering constraints:

* `same > related > unrelated`
* `contrast` should not rank as `same`

---

## `rank`

```clojure
(rank "how do I fix clojure websocket visibility state?"
  (pos "tiles remain unknown visibility state because tile-visibility map empty")
  (pos "initialize tile visibility on new client connect")
  (decoy :lexical "visibility in CSS is hidden vs collapse")
  (decoy :near-domain "occlusion culling and fog of war rendering"))
```

**Scoring:**

* positives appear in top-k
* hard negatives should not beat positives

---

## `cluster`

```clojure
(cluster :topics
  {:k 3}
  (topic :streaming
    "play airhorn when I die"
    "overlay text on kill screen")
  (topic :coding
    "fix stacktrace line number"
    "clojure-lsp complexity warning")
  (topic :gameplay
    "boss is low health"
    "inventory is full"))
```

---

## `dedup`

```clojure
(dedup "discord-log-dedup"
  {:threshold 0.88}
  (dup "I fixed the websocket bug"
       "Websocket bug is fixed now")
  (near "enable overlay text"
        "disable overlay text")
  (uniq "pizza recipe crispy potatoes"))
```

---

# Embedding Bench Runner Contract

Your runner should do:

1. **materialize test texts**
2. **compute embeddings** for each embedder
3. **cache vectors** by `(embedder-id + sha256(text))`
4. compute metrics per case type
5. emit events + store tables

### Events

* `embed/item.started`
* `embed/item.completed`
* `embed/case.scored`
* `embed/suite.completed`

This matches your existing event-sourcing style.

---

# clj-kondo Understanding

Since you care about macro ergonomics:

## kondo rewrite strategy

* `def-embedder` → `(def embed/nomic {...})`
* `def-embed-suite` → `(def embeddings/basic-retrieval {...cases...})`

That’s enough to make:

* navigation
* linting
* unresolved symbol detection
  work properly.

---

# First “real-world useful” suite to write

Here’s a starter suite that maps directly to your use cases:

## `embeddings/stream-core`

* 20 `rank` cases:

  * 10 coding / IDE errors
  * 10 game HUD / events / chat intent
* 10 `pair` cases:

  * paraphrases + negation traps
* 5 `dedup` cases:

  * chat spam / repeated bits
* 3 `cluster` cases:

  * streaming topics vs coding vs game

Total: ~38 cases — fast to run, high signal.

---

# Next step (if you want me to continue “all the way”)

I can write the **full file set**:

* `benchmarks/embeddings/dsl.clj` (macros)
* `benchmarks/embeddings/score.clj`
* `benchmarks/embeddings/suites/stream_core.clj` with ~30–40 cases
* `.clj-kondo/config.edn` hook entries + hook namespace skeleton

…and keep it consistent with the tool/agent DSL style we’ve been building.
