---
uuid: bdca8ded-0e64-417b-a258-4528829c4704
created_at: pure-typescript-search-microservice.md
filename: Pure TypeScript Search Microservice
title: Pure TypeScript Search Microservice
description: >-
  A pure TypeScript search microservice that replaces MeiliSearch with a custom
  index. It supports keyword/full-text search using MiniSearch (MIT licensed)
  and optional hybrid search with TEI and Qdrant for vector + keyword fusion.
  All components are local, self-hosted, and written in TypeScript.
tags:
  - pure-typescript
  - search
  - microservice
  - minisearch
  - tei
  - qdrant
  - in-memory
  - docker
  - nginx
  - local-search
related_to_uuid:
  - e9aece2c-221c-44fc-9bc3-83c591c8e74d
  - d975dfe2-e98e-40b1-9df0-fcd13161e951
  - aa88652d-c8e5-4a1b-850e-afdf7fe15dae
  - 0e289525-1904-4f7d-9d3a-4fedc53efe9b
  - 0f203aa7-c96d-4323-9b9e-bbc438966e8c
  - 73d64bce-f428-4735-a3d0-6225a0588e46
  - 6b91d91d-6b5c-4516-a0c8-d66d9b9fcc9b
  - abe9ec8d-5a0f-42c5-b2ab-a2080c86d70c
  - 2c9f86e6-9b63-44d7-902d-84b10b0bdbe3
  - a23de044-17e0-45f0-bba7-d870803cbfed
  - fd753d3a-84cb-4bdd-ae93-8c5b09617e3b
  - b25be760-256e-4a8a-b34d-867281847ccb
  - 792a343e-674c-4bb4-8435-b3f8c163349d
  - 95410f6e-dabb-4560-80a8-1ed4fd9c3d3b
  - 740bbd1c-c039-405c-8a32-4baeddfb5637
  - 6e678cce-b68f-4420-980f-5c9009f0d971
  - d65e5b6c-29ed-458f-bf9b-94bf0d48fa79
  - 46b3c583-a4e2-4ecc-90de-6fd104da23db
  - 2611e17e-c7dd-4de6-9c66-d98fcfa9ffb5
  - cdb74242-b61d-4b7e-9288-5859e040e512
  - 004a0f06-3808-4421-b9e1-41b5b41ebcb8
  - 65c145c7-fe3e-4989-9aae-5db39fa0effc
  - 4d8cbf01-e44a-452f-96a0-17bde7b416a8
  - 2478e18c-f621-4b0c-a4c5-9637d213cccf
  - aa437a1f-eb7e-4096-a6cc-98d2eeeef8c5
related_to_title:
  - promethean-qdrant-demo
  - minimal-typescript-qdrant-demo
  - Promethean Web UI Setup
  - functional-programming-in-typescript
  - schema-evolution-workflow
  - Voice Access Layer Design
  - AGENTS.md
  - RAG UI Panel with Qdrant and PostgREST
  - Field Node Diagrams
  - Komorebi Group Manager
  - polyglot-repl-interface-layer
  - ripple-propagation-demo
  - windows-tiling-with-autohotkey
  - model-selection-for-lightweight-conversational-tasks
  - heartbeat-fragment-demo
  - balanced-bst
  - sibilant-macro-targets
  - Promethean Event Bus MVP
  - Universal Lisp Interface
  - Event Bus Projections Architecture
  - ecs-offload-workers
  - event-bus-mvp
  - pure-node-crawl-stack-with-playwright-and-crawlee
  - Cross-Language Runtime Polymorphism
  - Prometheus Observability Stack
references:
  - uuid: e9aece2c-221c-44fc-9bc3-83c591c8e74d
    line: 42
    col: 0
    score: 0.92
  - uuid: d975dfe2-e98e-40b1-9df0-fcd13161e951
    line: 42
    col: 0
    score: 0.92
  - uuid: aa88652d-c8e5-4a1b-850e-afdf7fe15dae
    line: 241
    col: 0
    score: 0.89
  - uuid: 0e289525-1904-4f7d-9d3a-4fedc53efe9b
    line: 316
    col: 0
    score: 0.89
  - uuid: 0f203aa7-c96d-4323-9b9e-bbc438966e8c
    line: 98
    col: 0
    score: 0.88
  - uuid: 6b91d91d-6b5c-4516-a0c8-d66d9b9fcc9b
    line: 182
    col: 0
    score: 0.86
  - uuid: 6b91d91d-6b5c-4516-a0c8-d66d9b9fcc9b
    line: 205
    col: 0
    score: 0.86
  - uuid: 73d64bce-f428-4735-a3d0-6225a0588e46
    line: 35
    col: 0
    score: 0.86
  - uuid: abe9ec8d-5a0f-42c5-b2ab-a2080c86d70c
    line: 321
    col: 0
    score: 0.85
---
hell yeah. here’s a **pure TypeScript, own-it** search microservice that replaces Meili with *your* index: ^ref-d17d3a96-1-0

* keyword/full-text: **MiniSearch** (MIT, TS, in-memory w/ JSON persistence) ^ref-d17d3a96-3-0
* optional hybrid: uses your **TEI** + **Qdrant** (already in your stack) to fuse vector + keyword ^ref-d17d3a96-4-0
* no SaaS. no CE. all local. all TS. ^ref-d17d3a96-5-0
* Dockerfile lives in `./images/`, code in `./services/ts/search/` (your rule) ^ref-d17d3a96-6-0

---

# 0) Compose + NGINX

### `docker-compose.websearch.ts.yaml`

```yaml
version: "3.9"
networks: { prom-net: { external: true } }

services:
  search-ts:
    build:
      context: .
      dockerfile: ./images/search-ts.docker
      args:
        APP_DIR: services/ts/search
    image: promethean-search-ts:latest
    container_name: search-ts
    environment:
      DATA_DIR: /data
      # Optional hybrid config (internal URLs keep it off the edge)
      TEI_URL: 
      QDRANT_URL: 
      QDRANT_COLLECTION: pages
      # If you DO proxy via the edge for any reason:
      EDGE_API_KEY: ${EDGE_API_KEY:-}
    volumes:
      - search_data:/data
    networks: [ prom-net ]
    restart: unless-stopped

volumes:
  search_data: {}
```
^ref-d17d3a96-14-0

### NGINX (add to your `server { ... }`)
 ^ref-d17d3a96-46-0
```nginx
    # ----- Local Search (your engine) -----
    location /search/local/ {
      limit_req zone=ip_rl_embed  burst=30 nodelay;
      limit_req zone=tok_rl_embed burst=15 nodelay;
      proxy_http_version 1.1; proxy_buffering off;
      proxy_set_header Host $host; proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
      rewrite ^/search/local/(.*)$ /$1 break;
      proxy_pass 
    }
^ref-d17d3a96-46-0
``` ^ref-d17d3a96-60-0

Bring it up: ^ref-d17d3a96-62-0

```bash
docker compose -f docker-compose.yaml -f docker-compose.websearch.ts.yaml up -d --build
^ref-d17d3a96-62-0
docker compose exec edge nginx -s reload
```

---

# 1) Dockerfile (kept in `./images/`)
 ^ref-d17d3a96-73-0
### `images/search-ts.docker`

```dockerfile
FROM node:22-alpine

WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.9.0 --activate

ARG APP_DIR
COPY ${APP_DIR}/package.json ${APP_DIR}/pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

COPY ${APP_DIR}/ ./
RUN pnpm build

EXPOSE 8010
VOLUME ["/data"]
^ref-d17d3a96-73-0
ENV DATA_DIR=/data
CMD ["node", "dist/server.js"]
```
^ref-d17d3a96-76-0
 ^ref-d17d3a96-96-0
--- ^ref-d17d3a96-96-0

# 2) Service code (kept in `./services/ts/search/`)

```
services/
  ts/
    search/
      package.json
      tsconfig.json
      src/
        types.ts
        store.ts
^ref-d17d3a96-96-0
        indexer.ts
        hybrid.ts
        server.ts
``` ^ref-d17d3a96-114-0
^ref-d17d3a96-112-0

### `services/ts/search/package.json`

```json
{
  "name": "search-ts",
  "private": true,
  "type": "module",
  "version": "0.1.0",
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "start": "node dist/server.js",
    "dev": "tsx watch src/server.ts"
  },
  "dependencies": {
    "express": "^4.19.2",
    "minisearch": "^7.1.0",
    "undici": "^6.19.8",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
^ref-d17d3a96-112-0
    "tsx": "^4.16.2",
    "typescript": "^5.5.4"
  }
}
^ref-d17d3a96-139-0
```
^ref-d17d3a96-139-0

### `services/ts/search/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
^ref-d17d3a96-139-0
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"]
^ref-d17d3a96-155-0
}
^ref-d17d3a96-155-0
^ref-d17d3a96-148-0
```
^ref-d17d3a96-155-0

### `services/ts/search/src/types.ts`

```ts
export type Doc = {
  id: string;
  title?: string;
  content?: string;
  url?: string;
  meta?: Record<string, unknown>;
  // optional: precomputed embedding, etc.
};

export type SearchHit = {
  id: string;
  score: number;
^ref-d17d3a96-155-0
  title?: string;
  url?: string;
  preview?: string;
};
^ref-d17d3a96-178-0

^ref-d17d3a96-178-0
export type Health = { ok: true };
^ref-d17d3a96-178-0
```

### `services/ts/search/src/store.ts`

```ts
import fs from "node:fs";
import path from "node:path";
import { Doc } from "./types.js";

const DATA_DIR = process.env.DATA_DIR || "/data";
const DOCS_PATH = path.join(DATA_DIR, "docs.jsonl");

export class DocStore {
  private map = new Map<string, Doc>();

  constructor() {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    if (fs.existsSync(DOCS_PATH)) {
      const lines = fs.readFileSync(DOCS_PATH, "utf8").split(/\r?\n/).filter(Boolean);
      for (const line of lines) {
        const d = JSON.parse(line) as Doc;
        this.map.set(d.id, d);
      }
    }
  }

  all(): Doc[] { return [...this.map.values()]; }
  get(id: string): Doc | undefined { return this.map.get(id); }

  upsert(doc: Doc) {
    this.map.set(doc.id, doc);
    fs.appendFileSync(DOCS_PATH, JSON.stringify(doc) + "\n");
  }

  bulk(docs: Doc[]) {
    for (const d of docs) this.map.set(d.id, d);
    const buf = docs.map(d => JSON.stringify(d)).join("\n") + "\n";
    fs.appendFileSync(DOCS_PATH, buf);
  }

  remove(id: string) {
    this.map.delete(id);
^ref-d17d3a96-178-0
    // rewrite file for simplicity; optimize later if needed
    const buf = [...this.map.values()].map(d => JSON.stringify(d)).join("\n") + "\n";
    fs.writeFileSync(DOCS_PATH, buf);
  }
^ref-d17d3a96-227-0

^ref-d17d3a96-227-0
  size(): number { return this.map.size; }
^ref-d17d3a96-227-0
}
```

### `services/ts/search/src/indexer.ts`

```ts
import MiniSearch, { Options as MiniOptions } from "minisearch";
import fs from "node:fs";
import path from "node:path";
import { Doc, SearchHit } from "./types.js";

const DATA_DIR = process.env.DATA_DIR || "/data";
const IDX_PATH = path.join(DATA_DIR, "index.json");

export class KeywordIndex {
  private mini: MiniSearch<Doc>;

  constructor() {
    this.mini = new MiniSearch<Doc>({
      idField: "id",
      fields: ["title", "content"],
      storeFields: ["title", "url"],
      searchOptions: { boost: { title: 2 }, fuzzy: 0.2, prefix: true }
    } as MiniOptions);
    this.load();
  }

  load() {
    if (fs.existsSync(IDX_PATH)) {
      try {
        const json = JSON.parse(fs.readFileSync(IDX_PATH, "utf8"));
        this.mini = MiniSearch.loadJSON<Doc>(JSON.stringify(json), {
          idField: "id",
          fields: ["title", "content"],
          storeFields: ["title", "url"],
          searchOptions: { boost: { title: 2 }, fuzzy: 0.2, prefix: true }
        });
      } catch { /* ignore */ }
    }
  }

  save() {
    const json = this.mini.toJSON();
    fs.writeFileSync(IDX_PATH, JSON.stringify(json));
  }

  rebuild(allDocs: Doc[]) {
    this.mini = new MiniSearch<Doc>({
      idField: "id",
      fields: ["title", "content"],
      storeFields: ["title", "url"],
      searchOptions: { boost: { title: 2 }, fuzzy: 0.2, prefix: true }
    });
    this.mini.addAll(allDocs);
    this.save();
  }

  upsert(doc: Doc) {
    // remove then add to ensure freshness
    try { this.mini.discard(doc.id); } catch { /* not present */ }
    this.mini.add(doc);
    this.save();
  }

  remove(id: string) {
    try { this.mini.discard(id); } catch { /* ignore */ }
    this.save();
  }

  search(q: string, limit = 10): SearchHit[] {
    const res = this.mini.search(q, { limit });
    return res.map(r => ({
^ref-d17d3a96-227-0
      id: String(r.id),
      score: r.score,
      title: (r as any).title,
      url: (r as any).url,
^ref-d17d3a96-306-0
      preview: undefined
^ref-d17d3a96-306-0
    }));
^ref-d17d3a96-306-0
  }
}
```

### `services/ts/search/src/hybrid.ts`

```ts
import { fetch } from "undici";
import { SearchHit } from "./types.js";

const TEI_URL = process.env.TEI_URL || "
const QDRANT_URL = process.env.QDRANT_URL || "
const QDRANT_COLLECTION = process.env.QDRANT_COLLECTION || "pages";
const EDGE_API_KEY = process.env.EDGE_API_KEY || "";

type QdrantPoint = { id: string | number; score: number; payload?: Record<string, any> };

async function embedTEI(text: string): Promise<number[]> {
  const r = await fetch(`${TEI_URL}/v1/embeddings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input: text })
  });
  if (!r.ok) throw new Error(`TEI ${r.status}`);
  const j: any = await r.json();
  return j?.data?.[0]?.embedding || j?.embedding || j?.embeddings?.[0];
}

async function qdrantSearch(vector: number[], topK: number): Promise<QdrantPoint[]> {
  const r = await fetch(`${QDRANT_URL}/collections/${encodeURIComponent(QDRANT_COLLECTION)}/points/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(EDGE_API_KEY ? { "X-API-Key": EDGE_API_KEY } : {}) },
    body: JSON.stringify({ vector, limit: topK, with_payload: true })
  });
  if (!r.ok) throw new Error(`Qdrant ${r.status}`);
  const j: any = await r.json();
  return j?.result ?? [];
}

function normalize(scores: Array<{ id: string; score: number }>): Record<string, number> {
  const max = Math.max(1e-9, ...scores.map(s => s.score));
  const out: Record<string, number> = {};
  for (const s of scores) out[s.id] = s.score / max;
  return out;
}

export async function hybridFuse(
  keywordHits: SearchHit[],
  query: string,
  vectorTopK = 10,
  alpha = 0.5 // 0=all vector, 1=all keyword
): Promise<SearchHit[]> {
  const vec = await embedTEI(query);
  const vecHits = await qdrantSearch(vec, vectorTopK);

  const kNorm = normalize(keywordHits.map(h => ({ id: h.id, score: h.score })));
  const vNorm = normalize(vecHits.map(h => ({ id: String(h.id), score: h.score })));

  const ids = new Set<string>([...Object.keys(kNorm), ...Object.keys(vNorm)]);
  const fused: SearchHit[] = [];
  for (const id of ids) {
    const ks = kNorm[id] ?? 0;
    const vs = vNorm[id] ?? 0;
    fused.push({
      id,
^ref-d17d3a96-306-0
      score: alpha * ks + (1 - alpha) * vs,
      title: keywordHits.find(h => h.id === id)?.title ?? vecHits.find(v => String(v.id) === id)?.payload?.title,
      url: keywordHits.find(h => h.id === id)?.url ?? vecHits.find(v => String(v.id) === id)?.payload?.url,
      preview: keywordHits.find(h => h.id === id)?.preview
^ref-d17d3a96-378-0
    });
^ref-d17d3a96-378-0
  }
^ref-d17d3a96-378-0
  fused.sort((a, b) => b.score - a.score);
  return fused.slice(0, Math.max(keywordHits.length, vectorTopK));
}
```

### `services/ts/search/src/server.ts`

```ts
import express from "express";
import { z } from "zod";
import { Doc, Health } from "./types.js";
import { DocStore } from "./store.js";
import { KeywordIndex } from "./indexer.js";
import { hybridFuse } from "./hybrid.js";

const app = express();
app.use(express.json({ limit: "5mb" }));

const store = new DocStore();
const index = new KeywordIndex();
if (store.size() && index.search("test", 1) && index.search("test", 1).length === 0) {
  // ensure at least basic alignment; option: auto-rebuild on cold start
}

app.get("/healthz", (_req, res) => res.json({ ok: true } as Health));

app.get("/stats", (_req, res) => {
  res.json({ docs: store.size() });
});

const DocSchema = z.object({
  id: z.string().min(1),
  title: z.string().optional(),
  content: z.string().optional(),
  url: z.string().url().optional(),
  meta: z.record(z.any()).optional()
}) satisfies z.ZodType<Doc>;

app.post("/docs/upsert", (req, res) => {
  const doc = DocSchema.parse(req.body);
  store.upsert(doc);
  index.upsert(doc);
  res.json({ ok: true, id: doc.id });
});

app.post("/docs/bulk", (req, res) => {
  const arr = z.array(DocSchema).parse(req.body?.docs ?? []);
  store.bulk(arr);
  // batch add for speed
  index.rebuild(store.all());
  res.json({ ok: true, count: arr.length });
});

app.delete("/docs/:id", (req, res) => {
  store.remove(req.params.id);
  index.remove(req.params.id);
  res.json({ ok: true });
});

app.post("/reindex", (_req, res) => {
  index.rebuild(store.all());
  res.json({ ok: true, docs: store.size() });
});

app.get("/search", (req, res) => {
  const q = String(req.query.q || "").trim();
  const limit = Number(req.query.limit || 10);
  if (!q) return res.status(400).json({ error: "q required" });
  const hits = index.search(q, limit);
  res.json({ q, hits });
});

// Optional hybrid: fuse keyword + vector via TEI + Qdrant
app.post("/search/hybrid", async (req, res) => {
  const q = String(req.body?.q || "").trim();
  const limit = Number(req.body?.limit || 10);
  const alpha = Number(req.body?.alpha ?? 0.5);
  if (!q) return res.status(400).json({ error: "q required" });

  const kHits = index.search(q, limit);
  try {
^ref-d17d3a96-378-0
    const fused = await hybridFuse(kHits, q, limit, alpha);
    res.json({ q, alpha, hits: fused });
  } catch (e: any) {
    // if TEI/Qdrant unavailable, fall back
^ref-d17d3a96-468-0
    res.json({ q, alpha, hits: kHits, warning: String(e?.message || e) });
^ref-d17d3a96-468-0
  }
^ref-d17d3a96-468-0
});

const PORT = 8010;
app.listen(PORT, () => console.log(`search-ts listening on ${PORT}`));
```

---

# 3) API quick hits (through edge; X-API-Key still required)

```bash
# upsert a doc
curl -s -H "X-API-Key: CHANGEME" -H "Content-Type: application/json" \
  -d '{"id":"ex-1","title":"Example","content":"Hello world","url":" \
   | jq .

# search
curl -s -H "X-API-Key: CHANGEME" \
  ' | jq .

# bulk + rebuild
^ref-d17d3a96-468-0
curl -s -H "X-API-Key: CHANGEME" -H "Content-Type: application/json" \
  -d '{"docs":[
    {"id":"a","title":"Alpha","content":"lorem ipsum"},
    {"id":"b","title":"Beta","content":"dolor sit amet"}
^ref-d17d3a96-496-0
  ]}' \
^ref-d17d3a96-496-0 ^ref-d17d3a96-513-0
   | jq . ^ref-d17d3a96-514-0
^ref-d17d3a96-520-0
^ref-d17d3a96-517-0
^ref-d17d3a96-515-0
^ref-d17d3a96-514-0
^ref-d17d3a96-513-0
^ref-d17d3a96-496-0
 ^ref-d17d3a96-515-0
# hybrid (needs TEI + Qdrant up)
curl -s -H "X-API-Key: CHANGEME" -H "Content-Type: application/json" \ ^ref-d17d3a96-517-0
  -d '{"q":"example","limit":5,"alpha":0.6}' \
   | jq .
```

---

# 4) Tiny diagram
^ref-d17d3a96-496-0

```mermaid
flowchart LR
  UI[/ui/] -->|X-API-Key| EDGE(edge:80)
^ref-d17d3a96-520-0
^ref-d17d3a96-517-0
^ref-d17d3a96-515-0
^ref-d17d3a96-538-0
^ref-d17d3a96-536-0
^ref-d17d3a96-530-0 ^ref-d17d3a96-547-0
^ref-d17d3a96-514-0
  subgraph EDGE (NGINX) ^ref-d17d3a96-513-0
^ref-d17d3a96-530-0 ^ref-d17d3a96-550-0
^ref-d17d3a96-520-0 ^ref-d17d3a96-536-0
    EDGE -->|/search/local/*| S[search-ts:8010] ^ref-d17d3a96-514-0
    EDGE -->|/embed/nomic/*| TEI ^ref-d17d3a96-515-0 ^ref-d17d3a96-538-0
    EDGE -->|/rag/qdrant/*| QDRANT
  end ^ref-d17d3a96-517-0 ^ref-d17d3a96-530-0
  S -->|persist JSONL+index.json| D[( /data )] ^ref-d17d3a96-556-0
  S -. optional .-> TEI
  S -. optional .-> QDRANT ^ref-d17d3a96-520-0
```
 ^ref-d17d3a96-560-0
--- ^ref-d17d3a96-536-0 ^ref-d17d3a96-561-0
 ^ref-d17d3a96-547-0
## notes ^ref-d17d3a96-538-0

* **Persistence**: JSONL doc store + serialized index under `/data`. Swap to Level/SQLite later if you want massive scale; API stays the same. ^ref-d17d3a96-550-0
* **Schema**: you own it—add fields, change analyzers, wire into your RAG ingest. Nothing’s hidden.
* **Hybrid**: off by default if TEI/Qdrant aren’t reachable; it just returns keyword results.
 ^ref-d17d3a96-530-0
Want me to bolt this into the **web UI** with a new panel (drop text → index/search/hybrid, browse hits, open doc)?
