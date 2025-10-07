---
$$
uuid: fb95ff4c-29ce-4574-ab6f-b6ed5d962363
$$
$$
created_at: '2025-09-03T22:40:00Z'
$$
filename: ollama-batch-embeddings-ts
title: ollama-batch-embeddings-ts
$$
description: >-
$$
  A TypeScript implementation for batch embedding using Ollama with concurrency
  control, retry logic, and server configuration best practices.
tags:
  - ollama
  - embeddings
  - typescript
  - concurrency
  - retry
  - batch-processing
$$
related_to_uuid: []
$$
$$
related_to_title: []
$$
references: []
---
Got it — you want **batch embeddings** with Ollama, in JS/TS, done right (fast, safe, and predictable).

Here’s a lean, FP-style pattern that:

* uses the official `ollama` JS client’s **`embeddings({ model, input })`** (accepts `string | string[]`)
* limits concurrency with `p-limit`
* retries with backoff for flaky calls
* plays nice with Ollama’s own parallel workers $`OLLAMA_NUM_PARALLEL`$

Citations are underneath each point.

---

### 0) Pick an embedding model

Use a dedicated embedder $e.g. `nomic-embed-text`, `mxbai-embed-large`, etc.$. These expose `/api/embeddings` and are for vectors only. ([Ollama][1])

---

### 1) Server config (throughput knobs)

Set Ollama’s worker & queue sizing before you start sending batches:

```bash
# example
export OLLAMA_NUM_PARALLEL=4
export OLLAMA_MAX_QUEUE=1024
# then run your daemon (compose or bare):
ollama serve
```

* `OLLAMA_NUM_PARALLEL` = parallel model requests $default **1**$.
* `OLLAMA_MAX_QUEUE` = queued requests waiting for workers.
  Values are documented in the code/env docs and issue threads. Tune to your GPU/CPU. ([Go Packages][2], [GitHub][3], [HOSTKEY — premium web services provider][4])

---

### 2) Minimal, functional batcher (TypeScript, Native ESM)

```ts
// file: src/batch-embeddings.ts
// ESM + TS, functional, immutable
import ollama from 'ollama';
import pLimit from 'p-limit';

export type Embedder = (texts: readonly string[]) => Promise<readonly number[][]>;

const withBackoff = async <T>(fn: () => Promise<T>, tries = 3): Promise<T> => {
  let err: unknown;
  for (let i = 0; i < tries; i++) {
    try { return await fn(); }
    catch (e) {
      err = e;
      // 200ms, 400ms, 800ms…
      await new Promise(r => setTimeout(r, 200 * 2 ** i));
    }
  }
  throw err;
};

export const makeOllamaEmbedder = ({
  model = 'nomic-embed-text',
  concurrency = 8,           // app-level limit (independent of OLLAMA_NUM_PARALLEL)
  truncate = false,          // see API
  keepAlive = '5m',          // keep the model in RAM between calls
}: {
  model?: string;
  concurrency?: number;
  truncate?: boolean;
  keepAlive?: number | string;
}): Embedder => {
  const limit = pLimit(concurrency);

  // Chunk to leverage server-side multi-input optimization when possible,
  // while still limiting request size. Tweak as needed.
  const chunk = <T>(arr: readonly T[], n: number) =>
    arr.length <= n ? [arr] : Array.from({ length: Math.ceil(arr.length / n) },
      (_, i) => arr.slice(i * n, (i + 1) * n));

  return async (texts) => {
    // send in medium-sized groups; Ollama accepts string[] for one request
    const groups = chunk(texts, 32);

    const tasks = groups.map(g => limit(() =>
      withBackoff(async () => {
        const res = await ollama.embeddings({
          model,
          input: [...g],           // no mutation
          truncate,
          options: { keep_alive: keepAlive }, // keeps model loaded
        });
        // res.embeddings is number[][]
        return res.embeddings as number[][];
      })
    ));

    const results = await Promise.all(tasks);
    // flatten preserving order
    return results.flat();
  };
};
```
$$
Why this works: ^ref-628976ac-104-0
$$
* `ollama.embeddings({ model, input: string[] })` is supported and returns `number[][]`. ([GitHub][5])
* `p-limit` is the simplest, reliable concurrency gate. ([npm][6], [Stack Overflow][7])
* `keep_alive` keeps the model hot between calls for speed. (Exposed as an option in several client integrations and respected by the server.) ([lancedb.github.io][8])

---

### 3) Use it

```ts
// file: src/example.ts
import { makeOllamaEmbedder } from './batch-embeddings.js';

const texts = [
  'The quick brown fox',
  'jumps over the lazy dog',
  // ...
] as const;

const embed = makeOllamaEmbedder({
  model: 'nomic-embed-text', // or mxbai-embed-large, etc.
  concurrency: 8,            // app-level
  truncate: false,
  keepAlive: '10m',
});

const run = async () => {
  const vectors = await embed(texts);
  console.log('shape:', vectors.length, 'x', vectors[0]?.length ?? 0);
};

run().catch(e => {
  console.error('embedding failed:', e);
  process.exit(1);
});
```

---

### 4) Sanity test with AVA (quick)

```ts
// file: test/batch-embeddings.test.ts
import test from 'ava';
import { makeOllamaEmbedder } from '../src/batch-embeddings.js';

test('embeds a small batch', async t => {
  const embed = makeOllamaEmbedder({ model: 'nomic-embed-text', concurrency: 4 });
  const out = await embed(['a', 'b', 'c']);
  t.is(out.length, 3);
  t.true(Array.isArray(out[0]));
  t.true(out[0].length > 0);
});
```

---

### 5) Throughput notes & pitfalls

* **Tune both layers**: your app’s `concurrency` and Ollama’s `OLLAMA_NUM_PARALLEL`. If you set app concurrency to 32 but `OLLAMA_NUM_PARALLEL=1`, you’ll just build a long server queue. Balance both against your hardware. ([Go Packages][2], [GitHub][3])
* **Batch vs single**: Sending **string\[]** in one call reduces HTTP overhead and benefits warm state. If batches get too big, you’ll hit timeouts or memory pressure — that’s why the example chunks to \~32 texts. API supports disabling stream and returns a single JSON payload for embeddings. ([Ollama][9], [GitHub][5])
* **Model choice matters**: `nomic-embed-text` is a solid default; it’s built for embeddings and claims strong performance vs OpenAI small models. Try a few and measure recall/latency. ([Ollama][1])

---

### 6) Alt: framework helpers (if you already use them)

* **LangChain-JS `OllamaEmbeddings`** adapter (wraps the same endpoint). Handy if you’re in LC already, but the raw client above is lighter for custom pipelines. ([Langchain][10])
* **Chroma / LanceDB** have built-in Ollama embedding functions if you want the vector store to call Ollama for you. Good for POCs; I still prefer explicit control in production. ([Chroma Docs][11], [

---

If you want, I can swap in your exact runtime constraints (GPU VRAM, desired QPS, max latency) and give you concrete values for `concurrency`, `chunk` size, and `OLLAMA_NUM_PARALLEL`, plus a tiny CLI (`stdin` → JSONL embeddings) for your pipeline.
s (if you already use them)

* **LangChain-JS `OllamaEmbeddings`** adapter (wraps the same endpoint). Handy if you’re in LC already, but the raw client above is lighter for custom pipelines. ([Langchain][10])
* **Chroma / LanceDB** have built-in Ollama embedding functions if you want the vector store to call Ollama for you. Good for POCs; I still prefer explicit control in production. ([Chroma Docs][11], [

---

If you want, I can swap in your exact runtime constraints (GPU VRAM, desired QPS, max latency) and give you concrete values for `concurrency`, `chunk` size, and `OLLAMA_NUM_PARALLEL`, plus a tiny CLI (`stdin` → JSONL embeddings) for your pipeline.
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- _None_
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
