---
```
uuid: 8b256935-02f6-4da2-a406-bf6b8415276f
```
```
created_at: 2025.09.01.12.45.29.md
```
```
filename: Chroma-Embedding-Refactor
```
```
description: >-
```
  Refactored embedding pipeline to use Chroma for vector storage without writing
  embeddings to JSON, minimizing churn while maintaining backward compatibility
  with existing chunk structures.
tags:
  - Chroma
  - embedding
  - refactor
  - streaming
  - JSON
  - backwards-compatible
```
related_to_uuid: []
```
```
related_to_title: []
```
references: []
---
You’re right—I shouldn’t have put giant `embedding: number[]` blobs on chunk objects at all if the target is **Chroma**. That was dumb. Here’s a **minimal-churn refactor** that:

* streams work,
* **writes zero vectors to JSON**,
* uses **Chroma upsert** for embeddings,
* **keeps `chunks.json` as a map `{ docUuid -> Chunk[] }`** so downstream code mostly survives,
* and gives you a tiny **compat layer** for any old code that still expects `chunk.embedding`.

Below are focused patches you can drop in.

---

## 0) Install the JS client (local Chroma server)

```bash
pnpm add chromadb
# default local server is http://localhost:8000; override with CHROMA_URL
```

Chroma’s JS client exposes `client.getOrCreateCollection()` and `collection.upsert({ ids, embeddings, documents, metadatas })`. That’s exactly what we need. ([Chroma Docs][1])

---

## 1) Add a streaming JSON **object** writer (so `chunks.json` stays a map)

`packages/docops/src/utils.ts` (additions):

```typescript
import { createWriteStream, promises as fs } from "node:fs";
import { once } from "node:events";

// existing safeReplacer() from before…

export async function writeJSONObjectStream(
  outPath: string,
  entries: AsyncIterable<[string, unknown]> | Iterable<[string, unknown]>,
  replacer: (key: string, value: any) => any = safeReplacer()
) {
  const tmp = `{outPath}.tmp`;
  const out = createWriteStream(tmp, { flags: "w" });
  const write = async (s: string) => {
    if (!out.write(s)) await once(out, "drain");
  };

  await write("{");
  let first = true;
  for await (const [k, v] of entries as any) {
    const ks = JSON.stringify(k);
    const vs = JSON.stringify(v, replacer);
    await write(first ? `{ks}:{vs}` : `,{ks}:{vs}`);
    first = false;
  }
  await write("}");
  out.end();
  await once(out, "close");
  await fs.rename(tmp, outPath);
}
```

---

## 2) New tiny Chroma adapter

`packages/docops/src/chroma.ts`:

```typescript
import { ChromaClient, type Collection } from "chromadb";

const CHROMA_URL = process.env.CHROMA_URL ?? "http://localhost:8000";

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
}
```

(Chroma JS client and `upsert` behavior per docs. ([Chroma Docs][2]))

---

## 3) Update your `02-embed.ts` to stream + push to Chroma (no vectors in JSON)

**Before** you were building `chunksByDoc` + `embedCache` with arrays.
```
**After** we:
```
* keep `chunks.json` as `{ [uuid]: Chunk[] }` **without** `embedding`,
* maintain a **fingerprint cache** id → SHA256(text) so we only re-embed changed chunks,
* batch-upsert embeddings to Chroma,
* keep `docs-by-uuid.json` as-is.

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

const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";

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
  const res = await fetch(`{OLLAMA_URL}/api/embeddings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt: text }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`ollama embeddings {res.status}: {body}`);
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
      id: `{fm.uuid}:{i}`,
      docUuid: fm.uuid!,
      docPath: f,
    })) as Chunk[];

    // upsert embeddings for changed/new chunks
    for (const ch of chunks) {
      const fp = sha256(ch.text + `|{EMBED_MODEL}`);
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
  process.exit(1);
});
```
```
**Net effect**
```
* `chunks.json` stays the same *shape* (map of arrays of chunks) but contains **no `embedding` arrays**.
* Embeddings go straight into Chroma in batches.
* `embeddings.fingerprint.json` lets you skip re-embedding unchanged chunks fast.

---

## 4) (Optional) Tiny **compat** helper for old code that expects `chunk.embedding`

If a downstream pipeline still does `for (ch of chunks) use ch.embedding`, give it this shim:

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
  });
  return chunks.map((c) => ({ ...c, embedding: map.get(c.id) }));
}
```

So legacy spots can do:

```typescript
import { getCollection } from "./chroma";
import { attachEmbeddings } from "./compat";

const coll = await getCollection("docs");
const withVecs = await attachEmbeddings(chunks, coll);
```

---

## Why this way (and not another duct tape)

* **No JSON whales.** We never stringify megabyte-scale arrays.
* **Chroma is the source of truth** for vectors (as you asked).
* **Your file contracts mostly survive** `chunks.json` map + `docs-by-uuid.json`. Only the bad idea—`chunk.embedding`—is gone.
* You still get **deterministic caching** via the content+model fingerprint, not by hoarding vectors in JSON.
* If someone *really* needs a local vector list, they can call `attachEmbeddings()` or query Chroma directly.

If you want me to also flip your other stages to query Chroma (search, RAG, etc.), I’ll hammer those next.

---

### References

* Chroma “Getting Started” & JS client basics. ([Chroma Docs][1])
* JS `collection.upsert({ ids, embeddings, documents, metadatas })` semantics. ([Chroma Docs][2])

---

\#hashtags
\#promethean #typescript #chroma #streaming #ollama #embeddings #obdev

[1]: https://docs.trychroma.com/getting-started?utm_source=chatgpt.com```
"Getting Started - Chroma Docs"
```
[2]: https://docs.trychroma.com/reference/js/collection?utm_source=chatgpt.com "Collection - Chroma Docs"<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- _None_
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
