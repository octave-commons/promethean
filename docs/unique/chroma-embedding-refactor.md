---
uuid: 774ef257-b07e-43b3-8ce3-582e3da5c27d
created_at: chroma-embedding-refactor.md
filename: chroma-embedding-refactor
title: chroma-embedding-refactor
description: >-
  Refactor embedding storage to use Chroma's upsert API for minimal-churn
  updates, avoiding JSON vector storage while maintaining backward compatibility
  through a tiny compat layer.
tags:
  - chroma
  - embedding
  - refactor
  - minimal-churn
  - json
  - compatibility
related_to_uuid:
  - 1cfae310-35dc-49c2-98f1-b186da25d84b
  - bb4f4ed0-91f3-488a-9d64-3a33bde77e4e
  - ab748541-020e-4a7e-b07d-28173bd5bea2
  - 5e408692-0e74-400e-a617-84247c7353ad
  - e1056831-ae0c-460b-95fa-4cf09b3398c6
  - 8b8e6103-30a4-4d66-b5f2-87db1612b587
  - bb7f0835-c347-474f-bfad-eabd873b51ad
  - 93d2ba51-8689-49ee-94e2-296092e48058
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
  - fc21f824-4244-4030-a48e-c4170160ea1d
  - 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
  - c14edce7-0656-45b2-aaf3-51f042451b7d
  - b01856b4-999f-418d-8009-ade49b00eb0f
  - dd89372d-10de-42a9-8c96-6bc13ea36d02
  - e811123d-5841-4e52-bf8c-978f26db4230
  - 8430617b-80a2-4cc9-8288-9a74cb57990b
  - 8f4c1e86-1236-4936-84ca-6ed7082af6b7
  - babdb9eb-3b15-48a7-8a22-ecc53af7d397
  - 5158f742-4a3b-466e-bfc3-d83517b64200
  - 9044701b-03c9-4a30-92c4-46b1bd66c11e
  - af5d2824-faad-476c-a389-e912d9bc672c
  - 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
  - aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
  - 7b7ca860-780c-44fa-8d3f-be8bd9496fba
related_to_title:
  - Functional Refactor of TypeScript Document Processing
  - chroma-embedding-refactor
  - Promethean-native config design
  - i3-bluetooth-setup
  - RAG UI Panel with Qdrant and PostgREST
  - Promethean Pipelines
  - Agent Reflections and Prompt Evolution
  - 'Agent Tasks: Persistence Migration to DualStore'
  - Chroma Toolkit Consolidation Plan
  - eidolon-node-lifecycle
  - Fnord Tracer Protocol
  - Promethean Full-Stack Docker Setup
  - universal-intention-code-fabric
  - Universal Lisp Interface
  - komorebi-group-window-hack
  - WebSocket Gateway Implementation
  - ripple-propagation-demo
  - archetype-ecs
  - Recursive Prompt Construction Engine
  - Promethean Agent DSL TS Scaffold
  - file-watcher-auth-fix
  - Sibilant Meta-Prompt DSL
  - Event Bus MVP
  - prom-lib-rate-limiters-and-replay-api
  - TypeScript Patch for Tool Calling Support
references:
  - uuid: bb4f4ed0-91f3-488a-9d64-3a33bde77e4e
    line: 114
    col: 0
    score: 0.95
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 5
    col: 0
    score: 0.93
  - uuid: ab748541-020e-4a7e-b07d-28173bd5bea2
    line: 305
    col: 0
    score: 0.93
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 2075
    col: 0
    score: 0.91
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 1201
    col: 0
    score: 0.9
  - uuid: e1056831-ae0c-460b-95fa-4cf09b3398c6
    line: 349
    col: 0
    score: 0.9
  - uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
    line: 498
    col: 0
    score: 0.89
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 968
    col: 0
    score: 0.89
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 762
    col: 0
    score: 0.89
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 465
    col: 0
    score: 0.89
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 1025
    col: 0
    score: 0.89
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 683
    col: 0
    score: 0.89
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 1226
    col: 0
    score: 0.89
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 1646
    col: 0
    score: 0.89
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 2085
    col: 0
    score: 0.89
  - uuid: b01856b4-999f-418d-8009-ade49b00eb0f
    line: 137
    col: 0
    score: 0.88
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 195
    col: 0
    score: 0.88
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 1625
    col: 0
    score: 0.88
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 68
    col: 0
    score: 0.87
  - uuid: e811123d-5841-4e52-bf8c-978f26db4230
    line: 318
    col: 0
    score: 0.87
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 64
    col: 0
    score: 0.87
  - uuid: ab748541-020e-4a7e-b07d-28173bd5bea2
    line: 35
    col: 0
    score: 0.87
  - uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
    line: 101
    col: 0
    score: 0.87
  - uuid: 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
    line: 527
    col: 0
    score: 0.87
  - uuid: 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
    line: 416
    col: 0
    score: 0.87
  - uuid: 9044701b-03c9-4a30-92c4-46b1bd66c11e
    line: 32
    col: 0
    score: 0.87
  - uuid: babdb9eb-3b15-48a7-8a22-ecc53af7d397
    line: 147
    col: 0
    score: 0.87
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 120
    col: 0
    score: 0.87
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 84
    col: 0
    score: 0.86
  - uuid: 8f4c1e86-1236-4936-84ca-6ed7082af6b7
    line: 417
    col: 0
    score: 0.86
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 88
    col: 0
    score: 0.86
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 104
    col: 0
    score: 0.86
  - uuid: ab748541-020e-4a7e-b07d-28173bd5bea2
    line: 33
    col: 0
    score: 0.86
  - uuid: e811123d-5841-4e52-bf8c-978f26db4230
    line: 296
    col: 0
    score: 0.86
  - uuid: c14edce7-0656-45b2-aaf3-51f042451b7d
    line: 388
    col: 0
    score: 0.86
  - uuid: aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
    line: 306
    col: 0
    score: 0.86
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 972
    col: 0
    score: 0.86
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 8
    col: 0
    score: 0.85
  - uuid: 8f4c1e86-1236-4936-84ca-6ed7082af6b7
    line: 366
    col: 0
    score: 0.85
  - uuid: 8f4c1e86-1236-4936-84ca-6ed7082af6b7
    line: 441
    col: 0
    score: 0.85
  - uuid: b01856b4-999f-418d-8009-ade49b00eb0f
    line: 117
    col: 0
    score: 0.85
  - uuid: d28090ac-f746-4958-aab5-ed1315382c04
    line: 28
    col: 0
    score: 0.85
  - uuid: 5158f742-4a3b-466e-bfc3-d83517b64200
    line: 818
    col: 0
    score: 0.85
  - uuid: 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
    line: 524
    col: 0
    score: 0.85
  - uuid: ba244286-4e84-425b-8bf6-b80c4eb783fc
    line: 374
    col: 0
    score: 0.85
---
You’re right—I shouldn’t have put giant `embedding: number[]` blobs on chunk objects at all if the target is **Chroma**. That was dumb. Here’s a **minimal-churn refactor** that: ^ref-8b256935-1-0

* streams work, ^ref-8b256935-3-0 ^ref-bb4f4ed0-3-0
* **writes zero vectors to JSON**, ^ref-8b256935-4-0 ^ref-bb4f4ed0-4-0
* uses **Chroma upsert** for embeddings, ^ref-8b256935-5-0
* **keeps `chunks.json` as a map `{ docUuid -> Chunk[] }`** so downstream code mostly survives, ^ref-8b256935-6-0
* and gives you a tiny **compat layer** for any old code that still expects `chunk.embedding`. ^ref-8b256935-7-0

Below are focused patches you can drop in. ^ref-8b256935-9-0

---

## 0) Install the JS client (local Chroma server)

```bash
pnpm add chromadb
# default local server is  override with CHROMA_URL
```
^ref-8b256935-15-0
 ^ref-8b256935-20-0
Chroma’s JS client exposes `client.getOrCreateCollection()` and `collection.upsert({ ids, embeddings, documents, metadatas })`. That’s exactly what we need. ([Chroma Docs][1])

---

## 1) Add a streaming JSON **object** writer (so `chunks.json` stays a map)
 ^ref-8b256935-26-0
`packages/docops/src/utils.ts` (additions):
 ^ref-8b256935-28-0
```typescript
import { createWriteStream, promises as fs } from "node:fs";
import { once } from "node:events";

// existing safeReplacer() from before…

export async function writeJSONObjectStream(
  outPath: string,
  entries: AsyncIterable<[string, unknown]> | Iterable<[string, unknown]>,
  replacer: (key: string, value: any) => any = safeReplacer()
) {
  const tmp = `${outPath}.tmp`;
  const out = createWriteStream(tmp, { flags: "w" });
  const write = async (s: string) => {
    if (!out.write(s)) await once(out, "drain");
  };

  await write("{");
  let first = true;
  for await (const [k, v] of entries as any) {
    const ks = JSON.stringify(k);
    const vs = JSON.stringify(v, replacer);
    await write(first ? `${ks}:${vs}` : `,${ks}:${vs}`);
    first = false;
  }
  await write("}");
  out.end();
  await once(out, "close");
  await fs.rename(tmp, outPath);
}
^ref-8b256935-28-0
```

---

## 2) New tiny Chroma adapter ^ref-8b256935-64-0

`packages/docops/src/chroma.ts`: ^ref-8b256935-66-0 ^ref-bb4f4ed0-66-0

```typescript
import { ChromaClient, type Collection } from "chromadb";

const CHROMA_URL = process.env.CHROMA_URL ?? "

let _client: ChromaClient | null = null;
export function chromaClient() {
  _client ??= new ChromaClient({ path: CHROMA_URL });
  return _client!;
}

export async function getCollection(name: string, meta?: Record<string, any>): Promise<Collection> {
  const client = chromaClient();
  return client.getOrCreateCollection({ name, metadata: meta });
}

export async function upsertBatch(opts: {
  coll: Collection;
  ids: string[];
  embeddings: number[][];
  documents?: string[];
  metadatas?: Record<string, any>[];
}) {
  const { coll, ids, embeddings, documents, metadatas } = opts;
  if (!ids.length) return;
  await coll.upsert({ ids, embeddings, documents, metadatas });
^ref-8b256935-66-0
} ^ref-8b256935-95-0
```

(Chroma JS client and `upsert` behavior per docs. ([Chroma Docs][2]))

---
 ^ref-8b256935-101-0 ^ref-bb4f4ed0-101-0
## 3) Update your `02-embed.ts` to stream + push to Chroma (no vectors in JSON)

**Before** you were building `chunksByDoc` + `embedCache` with arrays. ^ref-8b256935-104-0
**After** we: ^ref-8b256935-105-0
 ^ref-8b256935-106-0
* keep `chunks.json` as `{ [uuid]: Chunk[] }` **without** `embedding`, ^ref-8b256935-107-0
* maintain a **fingerprint cache** (id → SHA256(text)) so we only re-embed changed chunks,
* batch-upsert embeddings to Chroma, ^ref-8b256935-109-0
* keep `docs-by-uuid.json` as-is.
 ^ref-8b256935-111-0
`packages/docops/src/02-embed.ts`:

```typescript
import { promises as fs } from "node:fs";
import * as path from "path";
import matter from "gray-matter";
import { createHash } from "node:crypto";
import {
  parseArgs,
  listFilesRec,
  readJSON,
  parseMarkdownChunks,
  writeJSONObjectStream, // NEW
} from "./utils";
import { getCollection, upsertBatch } from "./chroma"; // NEW
import type { Chunk, Front } from "./types";

const OLLAMA_URL = process.env.OLLAMA_URL ?? "

const args = parseArgs({
  "--dir": "docs/unique",
  "--ext": ".md,.mdx,.txt",
  "--embed-model": "nomic-embed-text:latest",
  "--collection": "docs", // NEW: default collection name
  "--batch": "128",       // NEW: upsert batch size
});

const ROOT = path.resolve(args["--dir"]);
const EXTS = new Set(args["--ext"].split(",").map((s) => s.trim().toLowerCase()));
const EMBED_MODEL = args["--embed-model"];
const BATCH = Math.max(1, Number(args["--batch"]) | 0) || 128;
const CACHE = path.join(process.cwd(), ".cache/docs-pipeline");
const CHUNK_CACHE = path.join(CACHE, "chunks.json");            // stays a map
const FINGERPRINTS = path.join(CACHE, "embeddings.fingerprint.json"); // id -> sha256(text)
const DOCS_MAP = path.join(CACHE, "docs-by-uuid.json");

function sha256(s: string) {
  return createHash("sha256").update(s).digest("hex");
}

async function ollamaEmbed(model: string, text: string): Promise<number[]> {
  const res = await fetch(`${OLLAMA_URL}/api/embeddings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt: text }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`ollama embeddings ${res.status}: ${body}`);
  }
  const data = await res.json();
  return data.embedding as number[];
}

type ChunksEntry = [uuid: string, chunks: Chunk[]];

async function* generateChunksAndUpsert(): AsyncIterable<ChunksEntry> {
  const files = await listFilesRec(ROOT, EXTS);
  const fingerprints: Record<string, string> = await readJSON(FINGERPRINTS, {});
  const docsByUuid: Record<string, { path: string; title: string }> = await readJSON(DOCS_MAP, {});

  const coll = await getCollection(args["--collection"], {
    embed_model: EMBED_MODEL,
    source: "docops",
  });

  let ids: string[] = [];
  let embs: number[][] = [];
  let docs: string[] = [];
  let metas: Record<string, any>[] = [];

  const flush = async () => {
    if (ids.length) {
      await upsertBatch({ coll, ids, embeddings: embs, documents: docs, metadatas: metas });
      ids = []; embs = []; docs = []; metas = [];
    }
  };

  for (const f of files) {
    const raw = await fs.readFile(f, "utf-8");
    const { data, content } = matter(raw);
    const fm = data as Front;
    if (!fm.uuid) continue;

    const title = fm.filename || path.parse(f).name;
    docsByUuid[fm.uuid] = { path: f, title };

    const chunks = parseMarkdownChunks(content).map((c, i) => ({
      ...c,
      id: `${fm.uuid}:${i}`,
      docUuid: fm.uuid!,
      docPath: f,
    })) as Chunk[];

    // upsert embeddings for changed/new chunks
    for (const ch of chunks) {
      const fp = sha256(ch.text + `|${EMBED_MODEL}`);
      if (fingerprints[ch.id] !== fp) {
        const emb = await ollamaEmbed(EMBED_MODEL, ch.text);
        fingerprints[ch.id] = fp;

        ids.push(ch.id);
        embs.push(emb);
        // Optional: omit documents if you don’t want full text stored in Chroma
        docs.push(ch.text);
        metas.push({ docUuid: ch.docUuid, path: ch.docPath, title, ext: path.extname(f).slice(1) });

        if (ids.length >= BATCH) await flush();
      }
    }

    // yield this doc’s chunks (NO embedding property)
    yield [fm.uuid, chunks];
  }

  await flush();

  // Write the two small maps at the end (streaming object writers)
  // docs-by-uuid.json
  await writeJSONObjectStream(DOCS_MAP, Object.entries(docsByUuid));
  // embeddings.fingerprint.json
  await writeJSONObjectStream(FINGERPRINTS, Object.entries(fingerprints));
}

async function main() {
  // Stream the big map `{ uuid -> Chunk[] }` without keeping it all in RAM
  await fs.mkdir(CACHE, { recursive: true });
  await writeJSONObjectStream(CHUNK_CACHE, generateChunksAndUpsert());
  console.log("02-embed: done (vectors in Chroma, JSON is lean).");
}

main().catch((e) => {
  console.error(e);
^ref-8b256935-111-0
  process.exit(1); ^ref-8b256935-246-0
});
``` ^ref-8b256935-248-0
^ref-bb4f4ed0-114-0
^ref-8b256935-114-0
 ^ref-8b256935-249-0 ^ref-8b256935-250-0
**Net effect** ^ref-8b256935-250-0

* `chunks.json` stays the same *shape* (map of arrays of chunks) but contains **no `embedding` arrays**.
* Embeddings go straight into Chroma in batches.
* `embeddings.fingerprint.json` lets you skip re-embedding unchanged chunks fast.
 ^ref-8b256935-256-0
--- ^ref-8b256935-256-0
 ^ref-8b256935-258-0
## 4) (Optional) Tiny **compat** helper for old code that expects `chunk.embedding` ^ref-8b256935-258-0
 ^ref-8b256935-260-0
If a downstream pipeline still does `for (ch of chunks) use ch.embedding`, give it this shim: ^ref-8b256935-260-0

`packages/docops/src/compat.ts`:

```typescript
import type { Collection } from "chromadb";
import type { Chunk } from "./types";

// returns new chunks with .embedding filled from Chroma
export async function attachEmbeddings(chunks: Chunk[], coll: Collection) {
  if (!chunks.length) return chunks as (Chunk & { embedding?: number[] })[];

  const ids = chunks.map((c) => c.id);
  // low-volume get; if you need strict order, map by id
  const res = await coll.get({ ids });
  const map = new Map<string, number[]>();
  (res.ids || []).forEach((id, i) => {
    const vec = (res.embeddings?.[i] || []) as number[];
    map.set(id, vec);
^ref-8b256935-260-0
  });
  return chunks.map((c) => ({ ...c, embedding: map.get(c.id) }));
}
```
^ref-8b256935-282-0 ^ref-8b256935-285-0

So legacy spots can do:

```typescript
import { getCollection } from "./chroma";
^ref-8b256935-282-0
import { attachEmbeddings } from "./compat";

const coll = await getCollection("docs");
const withVecs = await attachEmbeddings(chunks, coll);
^ref-8b256935-295-0 ^ref-8b256935-296-0
^ref-8b256935-294-0 ^ref-8b256935-297-0
^ref-8b256935-288-0 ^ref-8b256935-298-0
``` ^ref-8b256935-294-0
^ref-8b256935-289-0
^ref-8b256935-295-0 ^ref-8b256935-296-0 ^ref-8b256935-300-0
^ref-8b256935-294-0 ^ref-8b256935-297-0
 ^ref-8b256935-295-0 ^ref-8b256935-296-0 ^ref-8b256935-298-0
--- ^ref-8b256935-296-0
 ^ref-8b256935-297-0 ^ref-8b256935-298-0 ^ref-8b256935-300-0
## Why this way (and not another duct tape) ^ref-8b256935-298-0
 ^ref-8b256935-300-0 ^ref-8b256935-306-0
* **No JSON whales.** We never stringify megabyte-scale arrays. ^ref-8b256935-300-0 ^ref-8b256935-307-0
* **Chroma is the source of truth** for vectors (as you asked).
* **Your file contracts mostly survive** (`chunks.json` map + `docs-by-uuid.json`). Only the bad idea—`chunk.embedding`—is gone.
* You still get **deterministic caching** via the content+model fingerprint, not by hoarding vectors in JSON. ^ref-8b256935-306-0
* If someone *really* needs a local vector list, they can call `attachEmbeddings()` or query Chroma directly. ^ref-8b256935-307-0 ^ref-8b256935-311-0
 ^ref-8b256935-306-0
If you want me to also flip your other stages to query Chroma (search, RAG, etc.), I’ll hammer those next. ^ref-8b256935-306-0
 ^ref-8b256935-307-0
--- ^ref-8b256935-311-0 ^ref-8b256935-315-0

### References
 ^ref-8b256935-311-0
* Chroma “Getting Started” & JS client basics. ([Chroma Docs][1]) ^ref-8b256935-315-0
* JS `collection.upsert({ ids, embeddings, documents, metadatas })` semantics. ([Chroma Docs][2])
 ^ref-8b256935-315-0
--- ^ref-8b256935-315-0 ^ref-8b256935-322-0
 ^ref-8b256935-323-0
\#hashtags ^ref-8b256935-324-0
\#promethean #typescript #chroma #streaming #ollama #embeddings #obdev
 ^ref-8b256935-322-0 ^ref-8b256935-326-0
[1]:  "Getting Started - Chroma Docs" ^ref-8b256935-323-0 ^ref-8b256935-327-0
 from "./chroma";
^ref-8b256935-282-0
import { attachEmbeddings } from "./compat";

const coll = await getCollection("docs");
const withVecs = await attachEmbeddings(chunks, coll);
^ref-8b256935-295-0 ^ref-8b256935-296-0
^ref-8b256935-294-0 ^ref-8b256935-297-0
^ref-8b256935-288-0 ^ref-8b256935-298-0
``` ^ref-8b256935-294-0
^ref-8b256935-289-0
^ref-8b256935-295-0 ^ref-8b256935-296-0 ^ref-8b256935-300-0
^ref-8b256935-294-0 ^ref-8b256935-297-0
 ^ref-8b256935-295-0 ^ref-8b256935-296-0 ^ref-8b256935-298-0
--- ^ref-8b256935-296-0
 ^ref-8b256935-297-0 ^ref-8b256935-298-0 ^ref-8b256935-300-0
## Why this way (and not another duct tape) ^ref-8b256935-298-0
 ^ref-8b256935-300-0 ^ref-8b256935-306-0
* **No JSON whales.** We never stringify megabyte-scale arrays. ^ref-8b256935-300-0 ^ref-8b256935-307-0
* **Chroma is the source of truth** for vectors (as you asked).
* **Your file contracts mostly survive** (`chunks.json` map + `docs-by-uuid.json`). Only the bad idea—`chunk.embedding`—is gone.
* You still get **deterministic caching** via the content+model fingerprint, not by hoarding vectors in JSON. ^ref-8b256935-306-0
* If someone *really* needs a local vector list, they can call `attachEmbeddings()` or query Chroma directly. ^ref-8b256935-307-0 ^ref-8b256935-311-0
 ^ref-8b256935-306-0
If you want me to also flip your other stages to query Chroma (search, RAG, etc.), I’ll hammer those next. ^ref-8b256935-306-0
 ^ref-8b256935-307-0
--- ^ref-8b256935-311-0 ^ref-8b256935-315-0

### References
 ^ref-8b256935-311-0
* Chroma “Getting Started” & JS client basics. ([Chroma Docs][1]) ^ref-8b256935-315-0
* JS `collection.upsert({ ids, embeddings, documents, metadatas })` semantics. ([Chroma Docs][2])
 ^ref-8b256935-315-0
--- ^ref-8b256935-315-0 ^ref-8b256935-322-0
 ^ref-8b256935-323-0
\#hashtags ^ref-8b256935-324-0
\#promethean #typescript #chroma #streaming #ollama #embeddings #obdev
 ^ref-8b256935-322-0 ^ref-8b256935-326-0
[1]:  "Getting Started - Chroma Docs" ^ref-8b256935-323-0 ^ref-8b256935-327-0
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Functional Refactor of TypeScript Document Processing](functional-refactor-of-typescript-document-processing.md)
- [chroma-embedding-refactor](chroma-embedding-refactor.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [Promethean Pipelines](promethean-pipelines.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [Fnord Tracer Protocol](fnord-tracer-protocol.md)
- [Promethean Full-Stack Docker Setup](promethean-full-stack-docker-setup.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [Universal Lisp Interface](universal-lisp-interface.md)
- [komorebi-group-window-hack](komorebi-group-window-hack.md)
- [WebSocket Gateway Implementation](websocket-gateway-implementation.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [archetype-ecs](archetype-ecs.md)
- [Recursive Prompt Construction Engine](recursive-prompt-construction-engine.md)
- [Promethean Agent DSL TS Scaffold](promethean-agent-dsl-ts-scaffold.md)
- [file-watcher-auth-fix](file-watcher-auth-fix.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [Event Bus MVP](event-bus-mvp.md)
- [prom-lib-rate-limiters-and-replay-api](prom-lib-rate-limiters-and-replay-api.md)
- [TypeScript Patch for Tool Calling Support](typescript-patch-for-tool-calling-support.md)
## Sources
- [chroma-embedding-refactor — L114](chroma-embedding-refactor.md#^ref-bb4f4ed0-114-0) (line 114, col 0, score 0.95)
- [Functional Refactor of TypeScript Document Processing — L5](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-5-0) (line 5, col 0, score 0.93)
- [Promethean-native config design — L305](promethean-native-config-design.md#^ref-ab748541-305-0) (line 305, col 0, score 0.93)
- [i3-bluetooth-setup — L2075](i3-bluetooth-setup.md#^ref-5e408692-2075-0) (line 2075, col 0, score 0.91)
- [i3-bluetooth-setup — L1201](i3-bluetooth-setup.md#^ref-5e408692-1201-0) (line 1201, col 0, score 0.9)
- [RAG UI Panel with Qdrant and PostgREST — L349](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-349-0) (line 349, col 0, score 0.9)
- [Agent Reflections and Prompt Evolution — L498](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-498-0) (line 498, col 0, score 0.89)
- [Agent Tasks: Persistence Migration to DualStore — L968](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-968-0) (line 968, col 0, score 0.89)
- [Chroma Toolkit Consolidation Plan — L762](chroma-toolkit-consolidation-plan.md#^ref-5020e892-762-0) (line 762, col 0, score 0.89)
- [eidolon-node-lifecycle — L465](eidolon-node-lifecycle.md#^ref-938eca9c-465-0) (line 465, col 0, score 0.89)
- [Fnord Tracer Protocol — L1025](fnord-tracer-protocol.md#^ref-fc21f824-1025-0) (line 1025, col 0, score 0.89)
- [i3-bluetooth-setup — L683](i3-bluetooth-setup.md#^ref-5e408692-683-0) (line 683, col 0, score 0.89)
- [i3-bluetooth-setup — L1226](i3-bluetooth-setup.md#^ref-5e408692-1226-0) (line 1226, col 0, score 0.89)
- [i3-bluetooth-setup — L1646](i3-bluetooth-setup.md#^ref-5e408692-1646-0) (line 1646, col 0, score 0.89)
- [i3-bluetooth-setup — L2085](i3-bluetooth-setup.md#^ref-5e408692-2085-0) (line 2085, col 0, score 0.89)
- [Universal Lisp Interface — L137](universal-lisp-interface.md#^ref-b01856b4-137-0) (line 137, col 0, score 0.88)
- [komorebi-group-window-hack — L195](komorebi-group-window-hack.md#^ref-dd89372d-195-0) (line 195, col 0, score 0.88)
- [i3-bluetooth-setup — L1625](i3-bluetooth-setup.md#^ref-5e408692-1625-0) (line 1625, col 0, score 0.88)
- [Promethean Pipelines — L68](promethean-pipelines.md#^ref-8b8e6103-68-0) (line 68, col 0, score 0.87)
- [WebSocket Gateway Implementation — L318](websocket-gateway-implementation.md#^ref-e811123d-318-0) (line 318, col 0, score 0.87)
- [ripple-propagation-demo — L64](ripple-propagation-demo.md#^ref-8430617b-64-0) (line 64, col 0, score 0.87)
- [Promethean-native config design — L35](promethean-native-config-design.md#^ref-ab748541-35-0) (line 35, col 0, score 0.87)
- [Agent Reflections and Prompt Evolution — L101](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-101-0) (line 101, col 0, score 0.87)
- [Event Bus MVP — L527](event-bus-mvp.md#^ref-534fe91d-527-0) (line 527, col 0, score 0.87)
- [Promethean Full-Stack Docker Setup — L416](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-416-0) (line 416, col 0, score 0.87)
- [file-watcher-auth-fix — L32](file-watcher-auth-fix.md#^ref-9044701b-32-0) (line 32, col 0, score 0.87)
- [Recursive Prompt Construction Engine — L147](recursive-prompt-construction-engine.md#^ref-babdb9eb-147-0) (line 147, col 0, score 0.87)
- [Sibilant Meta-Prompt DSL — L120](sibilant-meta-prompt-dsl.md#^ref-af5d2824-120-0) (line 120, col 0, score 0.87)
- [Promethean Pipelines — L84](promethean-pipelines.md#^ref-8b8e6103-84-0) (line 84, col 0, score 0.86)
- [archetype-ecs — L417](archetype-ecs.md#^ref-8f4c1e86-417-0) (line 417, col 0, score 0.86)
- [ripple-propagation-demo — L88](ripple-propagation-demo.md#^ref-8430617b-88-0) (line 88, col 0, score 0.86)
- [TypeScript Patch for Tool Calling Support — L104](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-104-0) (line 104, col 0, score 0.86)
- [Promethean-native config design — L33](promethean-native-config-design.md#^ref-ab748541-33-0) (line 33, col 0, score 0.86)
- [WebSocket Gateway Implementation — L296](websocket-gateway-implementation.md#^ref-e811123d-296-0) (line 296, col 0, score 0.86)
- [universal-intention-code-fabric — L388](universal-intention-code-fabric.md#^ref-c14edce7-388-0) (line 388, col 0, score 0.86)
- [prom-lib-rate-limiters-and-replay-api — L306](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-306-0) (line 306, col 0, score 0.86)
- [Promethean Event Bus MVP v0.1 — L972](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-972-0) (line 972, col 0, score 0.86)
- [Agent Tasks: Persistence Migration to DualStore — L8](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-8-0) (line 8, col 0, score 0.85)
- [archetype-ecs — L366](archetype-ecs.md#^ref-8f4c1e86-366-0) (line 366, col 0, score 0.85)
- [archetype-ecs — L441](archetype-ecs.md#^ref-8f4c1e86-441-0) (line 441, col 0, score 0.85)
- [Universal Lisp Interface — L117](universal-lisp-interface.md#^ref-b01856b4-117-0) (line 117, col 0, score 0.85)
- [i3-config-validation-methods — L28](i3-config-validation-methods.md#^ref-d28090ac-28-0) (line 28, col 0, score 0.85)
- [Promethean Agent DSL TS Scaffold — L818](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-818-0) (line 818, col 0, score 0.85)
- [Event Bus MVP — L524](event-bus-mvp.md#^ref-534fe91d-524-0) (line 524, col 0, score 0.85)
- [System Scheduler with Resource-Aware DAG — L374](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-374-0) (line 374, col 0, score 0.85)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
