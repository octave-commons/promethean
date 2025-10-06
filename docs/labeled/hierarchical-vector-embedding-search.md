---
uuid: d933f595-bb49-48fe-9ea7-403236712cea
created_at: '2025-09-18T15:55:47Z'
title: 2025.09.18.15.55.47
filename: Hierarchical Vector Embedding Search
description: >-
  Explains two interpretations of hierarchical vector embedding search:
  hierarchical index structures (e.g., HNSW, IVF/PQ) for efficient ANN searches
  and hierarchical retrieval over content (document→section→chunk) for practical
  document retrieval systems. Provides a practical implementation plan for
  different scale scenarios and tuning strategies.
tags:
  - vector
  - embedding
  - search
  - hierarchical
  - index
  - retrieval
  - hnsw
  - ivf
  - pq
  - kdtree
  - scaNN
  - quantization
related_to_uuid: []
related_to_title: []
references: []
---
Got it, Err. “Hierarchical vector embedding search” usually means one of two (complementary) things. If you’re building a system, decide which you mean before you write code:

1. Hierarchical index structures (coarse→fine inside the ANN index)

* HNSW: a multi-layer proximity graph; search starts at a sparse top layer and descends to denser layers. Great recall/latency on high-dimensional data, higher memory and slower builds. Tuned by M, efConstruction, efSearch. ([arXiv][1])
* IVF / IVF+PQ: two-level index—route a query to a few coarse clusters (nlist), then scan only those lists; PQ compresses vectors so you can fit way more in memory. Lower memory, great throughput; slightly worse recall than HNSW at equal latency unless carefully tuned. ([faiss.ai][2])
* HKMeans trees / KD-trees: true trees; solid for lower-dimensional spaces (≤20–30 dims) or tiny datasets; they degrade in very high-dimensional text/image embeddings. ([Computer Science at UBC][3])
* ScaNN: Google’s hybrid pruning/quantization—often state-of-the-art for inner-product; think of it as “coarse-to-fine with smarter math.” ([Google Research][4])

2. Hierarchical retrieval over content (document→section→chunk)

* Two-stage (or multi-stage) retrieval: first retrieve candidate documents with doc-level embeddings, then search only chunks within those docs; optionally hybridize with BM25. This is the pragmatic way to keep recall high while controlling cost/latency. ([ACL Anthology][5])

# What I’d build (practical plan)

## A. Small to mid-scale (≤10–50M vectors, RAM is okay)

* Index: HNSW for chunks. Set `M≈16–32`, `efConstruction≈200–400`, start runtime `efSearch≈64–128`. Measure recall\@k and latency; raise `efSearch` until recall target is met. ([Qdrant][6])
* Retrieval flow (hierarchical over content):

  1. Doc-level index (HNSW or IVF) on \~1 vector per doc (centroid or title+abstract embed).
  2. Take top-N docs (e.g., 100).
  3. Search chunk-level HNSW restricted to those docs; re-rank with cross-encoder if you can afford it. ([ACL Anthology][5])

## B. Very large (hundreds of millions to billions) or memory-constrained

* Index: IVF\_PQ or IVF+HNSW-on-centroids; possibly ScaNN if you’re on CPUs only. Keep full-precision vectors out of RAM when you can. Start with `nlist` ≈ √N (tune), `nprobe` 5–16; PQ with 8–16 sub-quantizers. Expect some recall loss; add a re-ranker. ([faiss.ai][2])
* Same document→chunk two-stage pipeline to cut tail latency. ([ACL Anthology][5])

## C. When trees still win

* If you’re doing 32-dim vision embeddings on a few million items, HKMeans or even multiple randomized kd-trees can be simpler and fast. Otherwise, they crack under the curse of dimensionality. ([Computer Science at UBC][3])

# Tuning cheat-sheet (blunt truths)

* Latency budget tight? Push hierarchy up front: smaller `nprobe`/`efSearch`, but compensate with a strong second stage (rerank).
* Memory pressure? PQ or scalar quantization. Accept that extreme compression costs recall unless you re-rank. ([Milvus][7])
* Mixed content? Do hybrid lexical+dense routing (BM25 for cheap high-precision filters, dense for recall), then dense within candidate docs. ([Qdrant][8])
* Don’t over-index: if your app only ever shows top-5, optimize for recall\@5, not @100.

# Minimal functional TS skeleton (ESM, no mutation)

```ts
// src/retrieval/pipeline.js
import { searchDocs } from './stage_doc.js';
import { searchChunksWithin } from './stage_chunk.js';
import { rerank } from './stage_rerank.js';

export const retrieve = async (qVec, opts) => {
  const { topDocK = 100, topChunkK = 200, finalK = 20 } = opts;
  const docHits = await searchDocs(qVec, topDocK);             // pure: qVec -> [{docId, score}]
  const docIds = docHits.map(h => h.docId);
  const chunkCandidates = await searchChunksWithin(qVec, docIds, topChunkK); // -> [{id, docId, score}]
  const reranked = await rerank(qVec, chunkCandidates);        // -> [{id, score}]
  return reranked.slice(0, finalK);
};
```

```ts
// src/retrieval/stage_doc.js
// assume an ANN index with hierarchical structure under the hood (HNSW or IVF+PQ)
import { annDocIndex } from '../stores/doc_index.js';

export const searchDocs = async (qVec, k) =>
  annDocIndex.search(qVec, k); // side-effect free from the caller’s view
```

```ts
// src/retrieval/stage_chunk.js
import { annChunkIndex } from '../stores/chunk_index.js';

export const searchChunksWithin = async (qVec, docIds, k) =>
  annChunkIndex.searchWithin(qVec, { docIds, k });
```

```ts
// test/retrieval.spec.js
import test from 'ava';
import { retrieve } from '../src/retrieval/pipeline.js';

test('retrieval returns K results', async t => {
  const q = new Float32Array([/* embedding */]);
  const hits = await retrieve(q, { finalK: 10 });
  t.is(hits.length, 10);
});
```

Notes:

* Keep indices behind interfaces so you can swap HNSW ↔ IVF\_PQ ↔ ScaNN without touching pipeline code. (Yes, treat your ANN as a plug-in.)
* Store metadata (docId) with chunks so “searchWithin” can prune by docId efficiently—e.g., precompute per-doc posting lists or maintain per-doc shard IDs.

# Why this works

* You get hierarchy twice: (1) inside the ANN index (HNSW layers or IVF coarse clusters) and (2) in your retrieval pipeline (doc→chunk). That lets you hit tight latency targets without massacring recall. ([arXiv][1])

If you want, I’ll map this to specific stacks (Faiss GPU, Qdrant, or Milvus) with concrete params and operational runbooks (build times, memory math, shard sizing, efSearch/nprobe ramp plans).

[1]: https://arxiv.org/abs/1603.09320?utm_source=chatgpt.com "Efficient and robust approximate nearest neighbor search using Hierarchical Navigable Small World graphs"
[2]: https://faiss.ai/index.html?utm_source=chatgpt.com "Welcome to Faiss Documentation — Faiss documentation"
[3]: https://www.cs.ubc.ca/~lowe/papers/09muja.pdf?utm_source=chatgpt.com "FAST APPROXIMATE NEAREST NEIGHBORS WITH ..."
[4]: https://research.google/blog/announcing-scann-efficient-vector-similarity-search/?utm_source=chatgpt.com "Announcing ScaNN: Efficient Vector Similarity Search"
[5]: https://aclanthology.org/2023.findings-acl.679.pdf?utm_source=chatgpt.com "Hybrid Hierarchical Retrieval for Open-Domain Question ..."
[6]: https://qdrant.tech/documentation/concepts/indexing/?utm_source=chatgpt.com "Indexing"
[7]: https://milvus.io/docs/ivf-pq.md?utm_source=chatgpt.com "IVF_PQ | Milvus Documentation"
[8]: https://qdrant.tech/documentation/concepts/search/?utm_source=chatgpt.com "Similarity search"
