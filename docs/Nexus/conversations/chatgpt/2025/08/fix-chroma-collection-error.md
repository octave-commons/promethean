---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Fix Chroma collection error"
conversation_id: 689d3b14-c3c0-832d-95b2-9d33d13b0f17
create_time: 08/13/2025 at 8:25 PM
update_time: 08/13/2025 at 9:18 PM
---

# Title: Fix Chroma collection error

Created: 08/13/2025 at 8:25 PM
Last Updated: 08/13/2025 at 9:18 PM
Chat URL: https://chat.openai.com/c/689d3b14-c3c0-832d-95b2-9d33d13b0f17


>[!nexus_user] **User** - 08/13/2025 at 8:25 PM
> 2|duck_embedder | Upsert failed ChromaClientError: Bad request to http://localhost:8000/api/v2/tenants/default_tenant/databases/default_database/collections/1c478066-4792-4683-9ceb-cc046df75449/upsert with status: Collection expecting embedding with dimension of 0, got 768
> 2|duck_embedder | at chromaFetch (file:///home/err/devel/promethean/services/ts/discord-embedder/node_modules/chromadb/src/chroma-fetch.ts:45:13)
> 2|duck_embedder | at processTicksAndRejections (node:internal/process/task_queues:105:5)
> 2|duck_embedder | at o (file:///home/err/devel/promethean/services/ts/discord-embedder/node_modules/.pnpm/@hey-api+client-fetch@0.10.0_@hey-api+openapi-ts@0.67.3_typescript@5.8.3_/node_modules/@hey-api/client-fetch/src/client.ts:74:20)
> 2|duck_embedder | at _CollectionImpl.upsert (file:///home/err/devel/promethean/services/ts/discord-embedder/node_modules/chromadb/src/collection.ts:668:5)
> 2|duck_embedder | at file:///home/err/devel/promethean/services/ts/discord-embedder/src/index.ts:102:4 {
> 2|duck_embedder | cause: undefined
> 2|duck_embedder | }
<!-- UID: 4bf0947e-6f64-4c0f-931a-f2a8041ae63b -->




>[!nexus_agent] **Assistant** - 08/13/2025 at 8:26 PM
> That error means your Chroma **collection was created with dimensionality = 0**, so the server is rejecting your 768-D vectors. Dimensionality is fixed per collection (it’s set at creation or on the first successful insert) and can’t be changed later. cite
> 
> Here’s the quickest way to unstick it:
> 
> ### Fix (safe + fast)
> 1. **Delete the broken collection** (the one in the error with UUID `1c478066-...`), then recreate it with the correct dimension.
>  ```ts
>  import { ChromaClient } from "chromadb";
>  const chroma = new ChromaClient();
> 
>  // If you address by name:
>  await chroma.deleteCollection({ name: "duck" }); // or whatever name you used
> 
>  // Recreate with an explicit dimension:
>  await chroma.createCollection({
>  name: "duck",
>  dimension: 768, // <-- critical
>  metadata: { "hnsw:space": "cosine"} // optional, tweak if you use something else
>  });
>  ```
>  Now your `upsert` with 768-D embeddings will work. If you prefer not to drop the existing one, create a **new** collection (e.g., `"duck_768"`) and reinsert. Chroma requires the vector dimension to match the collection’s dimension. cite
> 
> 2. **Double-check the embedding shape** your `embeddings_provider` returns:
>  ```ts
>  const vecs = await embeddingFn(["ping"]);
>  if (!Array.isArray(vecs?.[0]) || vecs[0].length !== 768) {
>  throw new Error(`Embedding provider returned ${vecs?.[0]?.length ?? "?"} dims`);
>  }
>  ```
>  (If you’re mixing `documents` + `embeddingFunction` with manual `embeddings`, pick **one** path to avoid mismatches.)
> 
> ### Why this happened
> - In newer Chroma, a collection’s dimensionality is fixed; inserts with a different size (or into a collection with a bad/unknown size) fail. If a collection was created/left with **dim=0** (e.g., after an upgrade/migration or an early bad insert), later 768-D upserts will throw. Known class of issues: **dimension mismatch** / collection config changes between versions. cite
> 
> ### Optional: sanity check via HTTP (since you have the v2 URL)
> You can confirm the collection’s stored dimension:
> ```bash
> curl http://localhost:8000/api/v2/tenants/default_tenant/databases/default_database/collections/1c478066-4792-4683-9ceb-cc046df75449
> # look for "dimension": ...
> ```
> If it’s `0`, recreate with `dimension: 768` as above. (Chroma’s FAQ/docs call out that dimension has to match exactly.) cite
> 
> If anything’s still off after recreating with `dimension: 768`, paste your `createCollection/getOrCreateCollection` call and the upsert snippet and I’ll zero in on it.
<!-- UID: 50a3b58d-a91a-4b89-b4e1-c023325dfb4e -->

---




>[!nexus_user] **User** - 08/13/2025 at 9:17 PM
> 2|duck_embedder | Upsert failed ChromaClientError: Bad request to http://localhost:8000/api/v2/tenants/default_tenant/databases/default_database/collections/84098ae2-2e9e-477f-8609-dc5dea34c064/upsert with status: Inconsistent dimensions in provided embeddings
> 2|duck_embedder | at chromaFetch (file:///home/err/devel/promethean/services/ts/discord-embedder/node_modules/chromadb/src/chroma-fetch.ts:45:13)
> 2|duck_embedder | at processTicksAndRejections (node:internal/process/task_queues:105:5)
> 2|duck_embedder | at o (file:///home/err/devel/promethean/services/ts/discord-embedder/node_modules/.pnpm/@hey-api+client-fetch@0.10.0_@hey-api+openapi-ts@0.67.3_typescript@5.8.3_/node_modules/@hey-api/client-fetch/src/client.ts:74:20)
> 2|duck_embedder | at _CollectionImpl.upsert (file:///home/err/devel/promethean/services/ts/discord-embedder/node_modules/chromadb/src/collection.ts:668:5)
> 2|duck_embedder | at file:///home/err/devel/promethean/services/ts/discord-embedder/src/index.ts:102:4 {
> 2|duck_embedder | cause: undefined
> 2|duck_embedder | }
<!-- UID: 5aa999ab-8bbf-4a49-a6c3-04ebe4a50de8 -->




>[!nexus_agent] **Assistant** - 08/13/2025 at 9:17 PM
> That specific error means **within a single `upsert` call you sent vectors of different lengths** (e.g., some 768, some 384/1024/empty). Chroma rejects the batch before it even checks the collection’s dimension.
> 
> ### Why this usually happens
> - You mixed embedding **models** (e.g., `all-MiniLM-L6-v2`=384 with `bge-large`=1024) in the same batch.
> - Your embedder sometimes returns **empty/undefined** vectors for blank inputs.
> - You passed a **TypedArray** (e.g., `Float32Array`) for some items and a normal `number[]` for others; when JSON-ified, typed arrays can serialize weirdly.
> - You’re passing both `documents` (letting a client `embeddingFunction` run) **and** `embeddings` you computed yourself in the same call.
> 
> ### Quick guardrail (drop-in before `collection.upsert`)
> Put this right where you build `ids`, `metadatas`, `embeddings` (around your index.ts:102):
> 
> ```ts
> // Ensure consistent numeric arrays
> function toArray(v: number[] | Float32Array | Float64Array | null | undefined) {
>  if (v == null) return null;
>  return Array.isArray(v) ? v : Array.from(v);
> }
> 
> const fixedEmbeddings = embeddings.map(toArray);
> 
> // sanity checks
> const dims = fixedEmbeddings.map(e => (e ? e.length : 0));
> const uniqueDims = [...new Set(dims)];
> if (uniqueDims.length !== 1 || uniqueDims[0] === 0) {
>  // log offenders and bail early
>  const byDim: Record<string, number[]> = {};
>  dims.forEach((d, i) => {
>  const k = String(d);
>  (byDim[k] ??= []).push(i);
>  });
>  console.error("Embedding dimension mismatch in batch", byDim, {
>  sampleBad: byDim["0"]?.slice(0, 5)?.map(i => ({ id: ids[i], meta: metadatas?.[i] })),
>  });
>  throw new Error(`Inconsistent embedding dims in batch: ${uniqueDims.join(", ")}`);
> }
> 
> // proceed with clean batch
> await collection.upsert({
>  ids,
>  embeddings: fixedEmbeddings as number[][],
>  metadatas,
>  documents, // or remove this if you supply embeddings!
> });
> ```
> 
> ### One-time triage checklist
> 1. **Lock one model/provider per collection run.** Don’t switch mid-stream.
> 2. **Pick one path:** either send `documents` and let your client’s `embeddingFunction` handle it, **or** send `embeddings`—not both.
> 3. **Normalize types:** convert any `Float32Array` to plain `number[]`.
> 4. **Filter empties:** skip items whose text is `""`/whitespace (many models still return full-dim vectors, but some wrappers don’t).
> 5. **Assert dimension upstream** (in your `embeddings_provider`):
>  ```ts
>  const v = await embed(texts); // number[][] expected
>  const bad = v.findIndex(x => !Array.isArray(x) || x.length !== 768);
>  if (bad !== -1) throw new Error(`Provider returned ${v[bad]?.length} dims at index ${bad}`);
>  ```
> 
> ### If you *did* change models recently
> - Either recreate the collection for the new dimension, **or** route to separate collections (e.g., `duck_768`, `duck_1024`).
> - If you already inserted with the wrong model, re-embed those docs with the target model and re-upsert (or delete+upsert).
> 
> If you paste your `create/getOrCreateCollection` and the block that builds `ids/metadatas/embeddings/documents`, I’ll point at the exact culprit.
<!-- UID: 94097576-c3b8-4ea6-b50a-5f84f1be124a -->

---


