---
uuid: d17d3a96-c84d-4738-a403-6c733b874da2
created_at: 2025.08.31.12.07.06.md
filename: Pure TypeScript Search Microservice
description: >-
  A self-contained TypeScript search service using MiniSearch for
  keyword/full-text indexing with optional TEI and Qdrant hybrid search. All
  components are local, open-source, and Dockerized for seamless integration
  into existing stacks.
tags:
  - TypeScript
  - MiniSearch
  - TEI
  - Qdrant
  - Docker
  - In-memory
  - Hybrid Search
  - Local Search
related_to_title: []
related_to_uuid: []
references: []
---
hell yeah. here’s a **pure TypeScript, own-it** search microservice that replaces Meili with *your* index: ^ref-d17d3a96-1-0

* keyword/full-text: **MiniSearch** (MIT, TS, in-memory w/ JSON persistence) ^ref-d17d3a96-3-0
* optional hybrid: uses your **TEI** + **Qdrant** (already in your stack) to fuse vector + keyword
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
      TEI_URL: http://tei-nomic:80
      QDRANT_URL: http://qdrant:6333
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
      proxy_pass http://search-ts:8010/;
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
```
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

const TEI_URL = process.env.TEI_URL || "http://tei-nomic:80";
const QDRANT_URL = process.env.QDRANT_URL || "http://qdrant:6333";
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
  -d '{"id":"ex-1","title":"Example","content":"Hello world","url":"https://example.com"}' \
  http://localhost/search/local/docs/upsert | jq .

# search
curl -s -H "X-API-Key: CHANGEME" \
  'http://localhost/search/local/search?q=hello&limit=5' | jq .

# bulk + rebuild
^ref-d17d3a96-468-0
curl -s -H "X-API-Key: CHANGEME" -H "Content-Type: application/json" \
  -d '{"docs":[
    {"id":"a","title":"Alpha","content":"lorem ipsum"},
    {"id":"b","title":"Beta","content":"dolor sit amet"}
^ref-d17d3a96-496-0
  ]}' \
^ref-d17d3a96-496-0 ^ref-d17d3a96-513-0
  http://localhost/search/local/docs/bulk | jq . ^ref-d17d3a96-514-0
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
  http://localhost/search/local/search/hybrid | jq .
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
Want me to bolt this into the **web UI** with a new panel (drop text → index/search/hybrid, browse hits, open doc)?<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Promethean Web UI Setup](promethean-web-ui-setup.md)
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [Prometheus Observability Stack](prometheus-observability-stack.md)
- [Promethean Full-Stack Docker Setup](promethean-full-stack-docker-setup.md)
- [shared-package-layout-clarification](shared-package-layout-clarification.md)
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Local-Offline-Model-Deployment-Strategy](local-offline-model-deployment-strategy.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [Pure-Node Crawl Stack with Playwright and Crawlee](pure-node-crawl-stack-with-playwright-and-crawlee.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [observability-infrastructure-setup](observability-infrastructure-setup.md)
- [i3-config-validation-methods](i3-config-validation-methods.md)
- [Post-Linguistic Transhuman Design Frameworks](post-linguistic-transhuman-design-frameworks.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [Admin Dashboard for User Management](admin-dashboard-for-user-management.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [Services](chunks/services.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [archetype-ecs](archetype-ecs.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [AI-First-OS-Model-Context-Protocol](ai-first-os-model-context-protocol.md)
- [balanced-bst](balanced-bst.md)
- [Board Automation Improvements](board-automation-improvements.md)
- [Operations](chunks/operations.md)
- [JavaScript](chunks/javascript.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [Diagrams](chunks/diagrams.md)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler](ollama-llm-provider-for-pseudo-code-transpiler.md)
- [2d-sandbox-field](2d-sandbox-field.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [Event Bus MVP](event-bus-mvp.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [Interop and Source Maps](interop-and-source-maps.md)
- [prom-lib-rate-limiters-and-replay-api](prom-lib-rate-limiters-and-replay-api.md)
- [markdown-to-org-transpiler](markdown-to-org-transpiler.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [Tooling](chunks/tooling.md)
- [Window Management](chunks/window-management.md)
- [field-interaction-equations](field-interaction-equations.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [EidolonField](eidolonfield.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [DSL](chunks/dsl.md)
- [Shared](chunks/shared.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [Chroma-Embedding-Refactor](chroma-embedding-refactor.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [graph-ds](graph-ds.md)
- [promethean-system-diagrams](promethean-system-diagrams.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [Creative Moments](creative-moments.md)
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [heartbeat-simulation-snippets](heartbeat-simulation-snippets.md)
- [DuckDuckGoSearchPipeline](duckduckgosearchpipeline.md)
- [Promethean Chat Activity Report](promethean-chat-activity-report.md)
- [Promethean_Eidolon_Synchronicity_Model](promethean-eidolon-synchronicity-model.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [Lisp-Compiler-Integration](lisp-compiler-integration.md)
- [plan-update-confirmation](plan-update-confirmation.md)
- [pm2-orchestration-patterns](pm2-orchestration-patterns.md)
- [Lispy Macros with syntax-rules](lispy-macros-with-syntax-rules.md)
- [Obsidian ChatGPT Plugin Integration](obsidian-chatgpt-plugin-integration.md)
- [Obsidian Templating Plugins Integration Guide](obsidian-templating-plugins-integration-guide.md)
- [Model Upgrade Calm-Down Guide](model-upgrade-calm-down-guide.md)
- [NPU Voice Code and Sensory Integration](npu-voice-code-and-sensory-integration.md)
- [OpenAPI Validation Report](openapi-validation-report.md)
- [Optimizing Command Limitations in System Design](optimizing-command-limitations-in-system-design.md)
- [Mindful Prioritization](mindful-prioritization.md)
- [MindfulRobotIntegration](mindfulrobotintegration.md)
- [Obsidian ChatGPT Plugin Integration Guide](obsidian-chatgpt-plugin-integration-guide.md)
- [obsidian-ignore-node-modules-regex](obsidian-ignore-node-modules-regex.md)
- [Shared Package Structure](shared-package-structure.md)
- [Fnord Tracer Protocol](fnord-tracer-protocol.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
- [zero-copy-snapshots-and-workers](zero-copy-snapshots-and-workers.md)
- [Promethean Workflow Optimization](promethean-workflow-optimization.md)
- [Protocol_0_The_Contradiction_Engine](protocol-0-the-contradiction-engine.md)
- [Provider-Agnostic Chat Panel Implementation](provider-agnostic-chat-panel-implementation.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [schema-evolution-workflow](schema-evolution-workflow.md)
- [Functional Embedding Pipeline Refactor](functional-embedding-pipeline-refactor.md)
- [Redirecting Standard Error](redirecting-standard-error.md)
- [Recursive Prompt Construction Engine](recursive-prompt-construction-engine.md)
- [Self-Agency in AI Interaction](self-agency-in-ai-interaction.md)
- [set-assignment-in-lisp-ast](set-assignment-in-lisp-ast.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [refactor-relations](refactor-relations.md)
- [Promethean Pipelines](promethean-pipelines.md)
- [Promethean-Copilot-Intent-Engine](promethean-copilot-intent-engine.md)
- [State Snapshots API and Transactional Projector](state-snapshots-api-and-transactional-projector.md)
- [Refactor 05-footers.ts](refactor-05-footers-ts.md)
- [Promethean Agent DSL TS Scaffold](promethean-agent-dsl-ts-scaffold.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [Stateful Partitions and Rebalancing](stateful-partitions-and-rebalancing.md)
- [Promethean Pipelines: Local TypeScript-First Workflow](promethean-pipelines-local-typescript-first-workflow.md)
- [Refactor Frontmatter Processing](refactor-frontmatter-processing.md)
- [Promethean Documentation Pipeline Overview](promethean-documentation-pipeline-overview.md)
- [TypeScript Patch for Tool Calling Support](typescript-patch-for-tool-calling-support.md)
- [WebSocket Gateway Implementation](websocket-gateway-implementation.md)
- [file-watcher-auth-fix](file-watcher-auth-fix.md)
- [System Scheduler with Resource-Aware DAG](system-scheduler-with-resource-aware-dag.md)
- [Promethean State Format](promethean-state-format.md)
- [Functional Refactor of TypeScript Document Processing](functional-refactor-of-typescript-document-processing.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [template-based-compilation](template-based-compilation.md)
- [Universal Lisp Interface](universal-lisp-interface.md)
- [typed-struct-compiler](typed-struct-compiler.md)
- [sibilant-metacompiler-overview](sibilant-metacompiler-overview.md)
- [Tracing the Signal](tracing-the-signal.md)
- [Voice Access Layer Design](voice-access-layer-design.md)
- [windows-tiling-with-autohotkey](windows-tiling-with-autohotkey.md)
- [Vectorial Exception Descent](vectorial-exception-descent.md)
- [sibilant-meta-string-templating-runtime](sibilant-meta-string-templating-runtime.md)
## Sources
- [api-gateway-versioning — L286](api-gateway-versioning.md#^ref-0580dcd3-286-0) (line 286, col 0, score 0.62)
- [Debugging Broker Connections and Agent Behavior — L44](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-44-0) (line 44, col 0, score 0.68)
- [Dynamic Context Model for Web Components — L410](dynamic-context-model-for-web-components.md#^ref-f7702bf8-410-0) (line 410, col 0, score 0.68)
- [observability-infrastructure-setup — L373](observability-infrastructure-setup.md#^ref-b4e64f8c-373-0) (line 373, col 0, score 0.68)
- [Promethean-Copilot-Intent-Engine — L65](promethean-copilot-intent-engine.md#^ref-ae24a280-65-0) (line 65, col 0, score 0.68)
- [Promethean Full-Stack Docker Setup — L438](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-438-0) (line 438, col 0, score 0.68)
- [Promethean Infrastructure Setup — L582](promethean-infrastructure-setup.md#^ref-6deed6ac-582-0) (line 582, col 0, score 0.68)
- [Promethean Web UI Setup — L601](promethean-web-ui-setup.md#^ref-bc5172ca-601-0) (line 601, col 0, score 0.68)
- [RAG UI Panel with Qdrant and PostgREST — L327](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-327-0) (line 327, col 0, score 0.68)
- [Promethean Documentation Pipeline Overview — L147](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-147-0) (line 147, col 0, score 0.66)
- [Promethean-Copilot-Intent-Engine — L30](promethean-copilot-intent-engine.md#^ref-ae24a280-30-0) (line 30, col 0, score 0.65)
- [Dynamic Context Model for Web Components — L80](dynamic-context-model-for-web-components.md#^ref-f7702bf8-80-0) (line 80, col 0, score 0.65)
- [Language-Agnostic Mirror System — L507](language-agnostic-mirror-system.md#^ref-d2b3628c-507-0) (line 507, col 0, score 0.61)
- [AI-Centric OS with MCP Layer — L8](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-8-0) (line 8, col 0, score 0.64)
- [RAG UI Panel with Qdrant and PostgREST — L329](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-329-0) (line 329, col 0, score 0.71)
- [universal-intention-code-fabric — L393](universal-intention-code-fabric.md#^ref-c14edce7-393-0) (line 393, col 0, score 0.64)
- [Dynamic Context Model for Web Components — L36](dynamic-context-model-for-web-components.md#^ref-f7702bf8-36-0) (line 36, col 0, score 0.64)
- [RAG UI Panel with Qdrant and PostgREST — L1](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-1-0) (line 1, col 0, score 0.68)
- [Lisp-Compiler-Integration — L520](lisp-compiler-integration.md#^ref-cfee6d36-520-0) (line 520, col 0, score 0.6)
- [Language-Agnostic Mirror System — L513](language-agnostic-mirror-system.md#^ref-d2b3628c-513-0) (line 513, col 0, score 0.59)
- [field-node-diagram-set — L24](field-node-diagram-set.md#^ref-22b989d5-24-0) (line 24, col 0, score 0.58)
- [obsidian-ignore-node-modules-regex — L38](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-38-0) (line 38, col 0, score 0.58)
- [Promethean State Format — L27](promethean-state-format.md#^ref-23df6ddb-27-0) (line 27, col 0, score 0.58)
- [polymorphic-meta-programming-engine — L149](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-149-0) (line 149, col 0, score 0.57)
- [Chroma Toolkit Consolidation Plan — L122](chroma-toolkit-consolidation-plan.md#^ref-5020e892-122-0) (line 122, col 0, score 0.57)
- [Agent Tasks: Persistence Migration to DualStore — L70](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-70-0) (line 70, col 0, score 0.57)
- [Per-Domain Policy System for JS Crawler — L437](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-437-0) (line 437, col 0, score 0.7)
- [Local-Offline-Model-Deployment-Strategy — L282](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-282-0) (line 282, col 0, score 0.69)
- [Local-Offline-Model-Deployment-Strategy — L1](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-1-0) (line 1, col 0, score 0.67)
- [Agent Tasks: Persistence Migration to DualStore — L72](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-72-0) (line 72, col 0, score 0.65)
- [Local-Only-LLM-Workflow — L1](local-only-llm-workflow.md#^ref-9a8ab57e-1-0) (line 1, col 0, score 0.64)
- [Promethean Pipelines: Local TypeScript-First Workflow — L1](promethean-pipelines-local-typescript-first-workflow.md#^ref-6b63edca-1-0) (line 1, col 0, score 0.63)
- [Agent Tasks: Persistence Migration to DualStore — L109](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-109-0) (line 109, col 0, score 0.63)
- [Shared Package Structure — L148](shared-package-structure.md#^ref-66a72fc3-148-0) (line 148, col 0, score 0.6)
- [Promethean Infrastructure Setup — L542](promethean-infrastructure-setup.md#^ref-6deed6ac-542-0) (line 542, col 0, score 0.6)
- [Local-Only-LLM-Workflow — L154](local-only-llm-workflow.md#^ref-9a8ab57e-154-0) (line 154, col 0, score 0.59)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L416](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-416-0) (line 416, col 0, score 0.58)
- [Fnord Tracer Protocol — L15](fnord-tracer-protocol.md#^ref-fc21f824-15-0) (line 15, col 0, score 0.58)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L417](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-417-0) (line 417, col 0, score 0.67)
- [shared-package-layout-clarification — L118](shared-package-layout-clarification.md#^ref-36c8882a-118-0) (line 118, col 0, score 0.62)
- [Per-Domain Policy System for JS Crawler — L446](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-446-0) (line 446, col 0, score 0.77)
- [Per-Domain Policy System for JS Crawler — L439](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-439-0) (line 439, col 0, score 0.71)
- [RAG UI Panel with Qdrant and PostgREST — L316](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-316-0) (line 316, col 0, score 0.73)
- [Prometheus Observability Stack — L485](prometheus-observability-stack.md#^ref-e90b5a16-485-0) (line 485, col 0, score 0.68)
- [RAG UI Panel with Qdrant and PostgREST — L71](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-71-0) (line 71, col 0, score 0.88)
- [observability-infrastructure-setup — L357](observability-infrastructure-setup.md#^ref-b4e64f8c-357-0) (line 357, col 0, score 0.72)
- [Promethean Full-Stack Docker Setup — L432](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-432-0) (line 432, col 0, score 0.73)
- [Voice Access Layer Design — L89](voice-access-layer-design.md#^ref-543ed9b3-89-0) (line 89, col 0, score 0.61)
- [Voice Access Layer Design — L95](voice-access-layer-design.md#^ref-543ed9b3-95-0) (line 95, col 0, score 0.61)
- [Promethean Web UI Setup — L9](promethean-web-ui-setup.md#^ref-bc5172ca-9-0) (line 9, col 0, score 0.82)
- [Promethean Infrastructure Setup — L93](promethean-infrastructure-setup.md#^ref-6deed6ac-93-0) (line 93, col 0, score 0.68)
- [Prometheus Observability Stack — L7](prometheus-observability-stack.md#^ref-e90b5a16-7-0) (line 7, col 0, score 0.7)
- [Promethean Full-Stack Docker Setup — L404](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-404-0) (line 404, col 0, score 0.77)
- [RAG UI Panel with Qdrant and PostgREST — L9](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-9-0) (line 9, col 0, score 0.74)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L9](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-9-0) (line 9, col 0, score 0.73)
- [Promethean Full-Stack Docker Setup — L3](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-3-0) (line 3, col 0, score 0.7)
- [Prometheus Observability Stack — L500](prometheus-observability-stack.md#^ref-e90b5a16-500-0) (line 500, col 0, score 0.73)
- [AI-Centric OS with MCP Layer — L185](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-185-0) (line 185, col 0, score 0.68)
- [observability-infrastructure-setup — L96](observability-infrastructure-setup.md#^ref-b4e64f8c-96-0) (line 96, col 0, score 0.68)
- [Promethean Full-Stack Docker Setup — L169](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-169-0) (line 169, col 0, score 0.7)
- [Promethean Web UI Setup — L44](promethean-web-ui-setup.md#^ref-bc5172ca-44-0) (line 44, col 0, score 0.69)
- [RAG UI Panel with Qdrant and PostgREST — L81](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-81-0) (line 81, col 0, score 0.75)
- [observability-infrastructure-setup — L44](observability-infrastructure-setup.md#^ref-b4e64f8c-44-0) (line 44, col 0, score 0.71)
- [Per-Domain Policy System for JS Crawler — L184](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-184-0) (line 184, col 0, score 0.66)
- [api-gateway-versioning — L7](api-gateway-versioning.md#^ref-0580dcd3-7-0) (line 7, col 0, score 0.68)
- [Promethean Infrastructure Setup — L61](promethean-infrastructure-setup.md#^ref-6deed6ac-61-0) (line 61, col 0, score 0.68)
- [Per-Domain Policy System for JS Crawler — L27](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-27-0) (line 27, col 0, score 0.68)
- [Promethean-Copilot-Intent-Engine — L23](promethean-copilot-intent-engine.md#^ref-ae24a280-23-0) (line 23, col 0, score 0.67)
- [Chroma-Embedding-Refactor — L64](chroma-embedding-refactor.md#^ref-8b256935-64-0) (line 64, col 0, score 0.64)
- [Chroma-Embedding-Refactor — L109](chroma-embedding-refactor.md#^ref-8b256935-109-0) (line 109, col 0, score 0.64)
- [Chroma-Embedding-Refactor — L258](chroma-embedding-refactor.md#^ref-8b256935-258-0) (line 258, col 0, score 0.64)
- [Chroma Toolkit Consolidation Plan — L72](chroma-toolkit-consolidation-plan.md#^ref-5020e892-72-0) (line 72, col 0, score 0.64)
- [Chroma Toolkit Consolidation Plan — L88](chroma-toolkit-consolidation-plan.md#^ref-5020e892-88-0) (line 88, col 0, score 0.64)
- [Chroma Toolkit Consolidation Plan — L107](chroma-toolkit-consolidation-plan.md#^ref-5020e892-107-0) (line 107, col 0, score 0.64)
- [Chroma Toolkit Consolidation Plan — L148](chroma-toolkit-consolidation-plan.md#^ref-5020e892-148-0) (line 148, col 0, score 0.64)
- [zero-copy-snapshots-and-workers — L70](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-70-0) (line 70, col 0, score 0.64)
- [Tracing the Signal — L53](tracing-the-signal.md#^ref-c3cd4f65-53-0) (line 53, col 0, score 0.63)
- [Migrate to Provider-Tenant Architecture — L80](migrate-to-provider-tenant-architecture.md#^ref-54382370-80-0) (line 80, col 0, score 0.63)
- [Cross-Language Runtime Polymorphism — L157](cross-language-runtime-polymorphism.md#^ref-c34c36a6-157-0) (line 157, col 0, score 0.63)
- [Dynamic Context Model for Web Components — L331](dynamic-context-model-for-web-components.md#^ref-f7702bf8-331-0) (line 331, col 0, score 0.63)
- [Promethean-native config design — L31](promethean-native-config-design.md#^ref-ab748541-31-0) (line 31, col 0, score 0.63)
- [RAG UI Panel with Qdrant and PostgREST — L109](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-109-0) (line 109, col 0, score 0.85)
- [Promethean Infrastructure Setup — L536](promethean-infrastructure-setup.md#^ref-6deed6ac-536-0) (line 536, col 0, score 0.85)
- [Promethean Infrastructure Setup — L545](promethean-infrastructure-setup.md#^ref-6deed6ac-545-0) (line 545, col 0, score 0.84)
- [Promethean Web UI Setup — L563](promethean-web-ui-setup.md#^ref-bc5172ca-563-0) (line 563, col 0, score 0.78)
- [Promethean Full-Stack Docker Setup — L388](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-388-0) (line 388, col 0, score 0.72)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L389](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-389-0) (line 389, col 0, score 0.63)
- [Promethean Web UI Setup — L1](promethean-web-ui-setup.md#^ref-bc5172ca-1-0) (line 1, col 0, score 0.68)
- [Promethean Web UI Setup — L238](promethean-web-ui-setup.md#^ref-bc5172ca-238-0) (line 238, col 0, score 0.9)
- [Promethean Infrastructure Setup — L33](promethean-infrastructure-setup.md#^ref-6deed6ac-33-0) (line 33, col 0, score 0.65)
- [Promethean Documentation Pipeline Overview — L119](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-119-0) (line 119, col 0, score 0.71)
- [file-watcher-auth-fix — L9](file-watcher-auth-fix.md#^ref-9044701b-9-0) (line 9, col 0, score 0.69)
- [plan-update-confirmation — L637](plan-update-confirmation.md#^ref-b22d79c6-637-0) (line 637, col 0, score 0.68)
- [Universal Lisp Interface — L74](universal-lisp-interface.md#^ref-b01856b4-74-0) (line 74, col 0, score 0.66)
- [Promethean Infrastructure Setup — L54](promethean-infrastructure-setup.md#^ref-6deed6ac-54-0) (line 54, col 0, score 0.66)
- [obsidian-ignore-node-modules-regex — L26](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-26-0) (line 26, col 0, score 0.69)
- [Promethean Pipelines: Local TypeScript-First Workflow — L3](promethean-pipelines-local-typescript-first-workflow.md#^ref-6b63edca-3-0) (line 3, col 0, score 0.6)
- [obsidian-ignore-node-modules-regex — L14](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-14-0) (line 14, col 0, score 0.64)
- [ecs-offload-workers — L434](ecs-offload-workers.md#^ref-6498b9d7-434-0) (line 434, col 0, score 0.64)
- [obsidian-ignore-node-modules-regex — L8](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-8-0) (line 8, col 0, score 0.67)
- [shared-package-layout-clarification — L145](shared-package-layout-clarification.md#^ref-36c8882a-145-0) (line 145, col 0, score 0.63)
- [Promethean Web UI Setup — L262](promethean-web-ui-setup.md#^ref-bc5172ca-262-0) (line 262, col 0, score 0.75)
- [Promethean Infrastructure Setup — L287](promethean-infrastructure-setup.md#^ref-6deed6ac-287-0) (line 287, col 0, score 0.82)
- [api-gateway-versioning — L51](api-gateway-versioning.md#^ref-0580dcd3-51-0) (line 51, col 0, score 0.8)
- [Promethean Infrastructure Setup — L335](promethean-infrastructure-setup.md#^ref-6deed6ac-335-0) (line 335, col 0, score 0.8)
- [Promethean Infrastructure Setup — L392](promethean-infrastructure-setup.md#^ref-6deed6ac-392-0) (line 392, col 0, score 0.77)
- [shared-package-layout-clarification — L47](shared-package-layout-clarification.md#^ref-36c8882a-47-0) (line 47, col 0, score 0.74)
- [Shared Package Structure — L64](shared-package-structure.md#^ref-66a72fc3-64-0) (line 64, col 0, score 0.71)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L107](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-107-0) (line 107, col 0, score 0.68)
- [Per-Domain Policy System for JS Crawler — L117](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-117-0) (line 117, col 0, score 0.68)
- [shared-package-layout-clarification — L84](shared-package-layout-clarification.md#^ref-36c8882a-84-0) (line 84, col 0, score 0.79)
- [file-watcher-auth-fix — L11](file-watcher-auth-fix.md#^ref-9044701b-11-0) (line 11, col 0, score 0.65)
- [Promethean Agent DSL TS Scaffold — L3](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-3-0) (line 3, col 0, score 0.63)
- [pm2-orchestration-patterns — L129](pm2-orchestration-patterns.md#^ref-51932e7b-129-0) (line 129, col 0, score 0.63)
- [Promethean Agent DSL TS Scaffold — L1](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-1-0) (line 1, col 0, score 0.62)
- [Promethean Web UI Setup — L298](promethean-web-ui-setup.md#^ref-bc5172ca-298-0) (line 298, col 0, score 0.9)
- [Local-First Intention→Code Loop with Free Models — L100](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-100-0) (line 100, col 0, score 0.68)
- [sibilant-macro-targets — L153](sibilant-macro-targets.md#^ref-c5c9a5c6-153-0) (line 153, col 0, score 0.68)
- [Cross-Target Macro System in Sibilant — L160](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-160-0) (line 160, col 0, score 0.68)
- [Lispy Macros with syntax-rules — L3](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-3-0) (line 3, col 0, score 0.68)
- [ripple-propagation-demo — L9](ripple-propagation-demo.md#^ref-8430617b-9-0) (line 9, col 0, score 0.67)
- [Language-Agnostic Mirror System — L147](language-agnostic-mirror-system.md#^ref-d2b3628c-147-0) (line 147, col 0, score 0.67)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L332](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-332-0) (line 332, col 0, score 0.67)
- [template-based-compilation — L60](template-based-compilation.md#^ref-f8877e5e-60-0) (line 60, col 0, score 0.67)
- [Cross-Language Runtime Polymorphism — L90](cross-language-runtime-polymorphism.md#^ref-c34c36a6-90-0) (line 90, col 0, score 0.66)
- [Interop and Source Maps — L470](interop-and-source-maps.md#^ref-cdfac40c-470-0) (line 470, col 0, score 0.66)
- [Language-Agnostic Mirror System — L151](language-agnostic-mirror-system.md#^ref-d2b3628c-151-0) (line 151, col 0, score 0.65)
- [Promethean Event Bus MVP v0.1 — L423](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-423-0) (line 423, col 0, score 0.7)
- [Promethean Agent DSL TS Scaffold — L86](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-86-0) (line 86, col 0, score 0.73)
- [Promethean Event Bus MVP v0.1 — L28](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-28-0) (line 28, col 0, score 0.73)
- [universal-intention-code-fabric — L68](universal-intention-code-fabric.md#^ref-c14edce7-68-0) (line 68, col 0, score 0.73)
- [Promethean Agent DSL TS Scaffold — L215](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-215-0) (line 215, col 0, score 0.72)
- [Shared Package Structure — L103](shared-package-structure.md#^ref-66a72fc3-103-0) (line 103, col 0, score 0.72)
- [Event Bus MVP — L7](event-bus-mvp.md#^ref-534fe91d-7-0) (line 7, col 0, score 0.61)
- [Shared Package Structure — L124](shared-package-structure.md#^ref-66a72fc3-124-0) (line 124, col 0, score 0.72)
- [Promethean Agent DSL TS Scaffold — L197](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-197-0) (line 197, col 0, score 0.71)
- [Promethean Agent DSL TS Scaffold — L247](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-247-0) (line 247, col 0, score 0.7)
- [schema-evolution-workflow — L146](schema-evolution-workflow.md#^ref-d8059b6a-146-0) (line 146, col 0, score 0.7)
- [WebSocket Gateway Implementation — L447](websocket-gateway-implementation.md#^ref-e811123d-447-0) (line 447, col 0, score 0.7)
- [Promethean Agent DSL TS Scaffold — L227](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-227-0) (line 227, col 0, score 0.7)
- [Promethean Agent DSL TS Scaffold — L186](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-186-0) (line 186, col 0, score 0.69)
- [prom-lib-rate-limiters-and-replay-api — L186](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-186-0) (line 186, col 0, score 0.69)
- [refactor-relations — L10](refactor-relations.md#^ref-41ce0216-10-0) (line 10, col 0, score 0.69)
- [Per-Domain Policy System for JS Crawler — L141](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-141-0) (line 141, col 0, score 0.68)
- [Refactor 05-footers.ts — L9](refactor-05-footers-ts.md#^ref-80d4d883-9-0) (line 9, col 0, score 0.65)
- [markdown-to-org-transpiler — L273](markdown-to-org-transpiler.md#^ref-ab54cdd8-273-0) (line 273, col 0, score 0.73)
- [Chroma-Embedding-Refactor — L28](chroma-embedding-refactor.md#^ref-8b256935-28-0) (line 28, col 0, score 0.7)
- [Chroma-Embedding-Refactor — L111](chroma-embedding-refactor.md#^ref-8b256935-111-0) (line 111, col 0, score 0.62)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L178](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-178-0) (line 178, col 0, score 0.61)
- [Local-Only-LLM-Workflow — L69](local-only-llm-workflow.md#^ref-9a8ab57e-69-0) (line 69, col 0, score 0.69)
- [graph-ds — L5](graph-ds.md#^ref-6620e2f2-5-0) (line 5, col 0, score 0.64)
- [Language-Agnostic Mirror System — L336](language-agnostic-mirror-system.md#^ref-d2b3628c-336-0) (line 336, col 0, score 0.67)
- [ecs-offload-workers — L75](ecs-offload-workers.md#^ref-6498b9d7-75-0) (line 75, col 0, score 0.67)
- [zero-copy-snapshots-and-workers — L267](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-267-0) (line 267, col 0, score 0.67)
- [Local-First Intention→Code Loop with Free Models — L23](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-23-0) (line 23, col 0, score 0.67)
- [Language-Agnostic Mirror System — L52](language-agnostic-mirror-system.md#^ref-d2b3628c-52-0) (line 52, col 0, score 0.62)
- [sibilant-macro-targets — L127](sibilant-macro-targets.md#^ref-c5c9a5c6-127-0) (line 127, col 0, score 0.63)
- [typed-struct-compiler — L16](typed-struct-compiler.md#^ref-78eeedf7-16-0) (line 16, col 0, score 0.61)
- [Performance-Optimized-Polyglot-Bridge — L170](performance-optimized-polyglot-bridge.md#^ref-f5579967-170-0) (line 170, col 0, score 0.62)
- [RAG UI Panel with Qdrant and PostgREST — L50](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-50-0) (line 50, col 0, score 0.61)
- [Functional Embedding Pipeline Refactor — L31](functional-embedding-pipeline-refactor.md#^ref-a4a25141-31-0) (line 31, col 0, score 0.69)
- [Performance-Optimized-Polyglot-Bridge — L12](performance-optimized-polyglot-bridge.md#^ref-f5579967-12-0) (line 12, col 0, score 0.61)
- [Functional Embedding Pipeline Refactor — L26](functional-embedding-pipeline-refactor.md#^ref-a4a25141-26-0) (line 26, col 0, score 0.6)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L223](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-223-0) (line 223, col 0, score 0.63)
- [RAG UI Panel with Qdrant and PostgREST — L172](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-172-0) (line 172, col 0, score 0.64)
- [Stateful Partitions and Rebalancing — L351](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-351-0) (line 351, col 0, score 0.63)
- [Promethean Infrastructure Setup — L471](promethean-infrastructure-setup.md#^ref-6deed6ac-471-0) (line 471, col 0, score 0.71)
- [Promethean Web UI Setup — L351](promethean-web-ui-setup.md#^ref-bc5172ca-351-0) (line 351, col 0, score 0.68)
- [Promethean Event Bus MVP v0.1 — L733](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-733-0) (line 733, col 0, score 0.64)
- [ecs-offload-workers — L209](ecs-offload-workers.md#^ref-6498b9d7-209-0) (line 209, col 0, score 0.64)
- [Promethean Agent DSL TS Scaffold — L142](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-142-0) (line 142, col 0, score 0.63)
- [State Snapshots API and Transactional Projector — L9](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-9-0) (line 9, col 0, score 0.72)
- [schema-evolution-workflow — L243](schema-evolution-workflow.md#^ref-d8059b6a-243-0) (line 243, col 0, score 0.64)
- [Event Bus MVP — L284](event-bus-mvp.md#^ref-534fe91d-284-0) (line 284, col 0, score 0.63)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L26](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-26-0) (line 26, col 0, score 0.62)
- [Stateful Partitions and Rebalancing — L202](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-202-0) (line 202, col 0, score 0.62)
- [Promethean Infrastructure Setup — L415](promethean-infrastructure-setup.md#^ref-6deed6ac-415-0) (line 415, col 0, score 0.69)
- [Promethean Infrastructure Setup — L456](promethean-infrastructure-setup.md#^ref-6deed6ac-456-0) (line 456, col 0, score 0.62)
- [Promethean Infrastructure Setup — L224](promethean-infrastructure-setup.md#^ref-6deed6ac-224-0) (line 224, col 0, score 0.67)
- [Promethean Infrastructure Setup — L485](promethean-infrastructure-setup.md#^ref-6deed6ac-485-0) (line 485, col 0, score 0.72)
- [Refactor Frontmatter Processing — L11](refactor-frontmatter-processing.md#^ref-cfbdca2f-11-0) (line 11, col 0, score 0.64)
- [RAG UI Panel with Qdrant and PostgREST — L140](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-140-0) (line 140, col 0, score 0.66)
- [api-gateway-versioning — L79](api-gateway-versioning.md#^ref-0580dcd3-79-0) (line 79, col 0, score 0.64)
- [Promethean Infrastructure Setup — L439](promethean-infrastructure-setup.md#^ref-6deed6ac-439-0) (line 439, col 0, score 0.7)
- [Promethean Infrastructure Setup — L358](promethean-infrastructure-setup.md#^ref-6deed6ac-358-0) (line 358, col 0, score 0.69)
- [Functional Refactor of TypeScript Document Processing — L5](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-5-0) (line 5, col 0, score 0.69)
- [Promethean Infrastructure Setup — L311](promethean-infrastructure-setup.md#^ref-6deed6ac-311-0) (line 311, col 0, score 0.68)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L194](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-194-0) (line 194, col 0, score 0.7)
- [universal-intention-code-fabric — L252](universal-intention-code-fabric.md#^ref-c14edce7-252-0) (line 252, col 0, score 0.69)
- [Mongo Outbox Implementation — L381](mongo-outbox-implementation.md#^ref-9c1acd1e-381-0) (line 381, col 0, score 0.68)
- [Promethean Web UI Setup — L415](promethean-web-ui-setup.md#^ref-bc5172ca-415-0) (line 415, col 0, score 0.68)
- [compiler-kit-foundations — L50](compiler-kit-foundations.md#^ref-01b21543-50-0) (line 50, col 0, score 0.65)
- [Promethean Agent DSL TS Scaffold — L107](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-107-0) (line 107, col 0, score 0.64)
- [Event Bus MVP — L99](event-bus-mvp.md#^ref-534fe91d-99-0) (line 99, col 0, score 0.63)
- [balanced-bst — L3](balanced-bst.md#^ref-d3e7db72-3-0) (line 3, col 0, score 0.62)
- [Mongo Outbox Implementation — L323](mongo-outbox-implementation.md#^ref-9c1acd1e-323-0) (line 323, col 0, score 0.66)
- [Promethean Event Bus MVP v0.1 — L474](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-474-0) (line 474, col 0, score 0.68)
- [Promethean Event Bus MVP v0.1 — L380](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-380-0) (line 380, col 0, score 0.67)
- [WebSocket Gateway Implementation — L533](websocket-gateway-implementation.md#^ref-e811123d-533-0) (line 533, col 0, score 0.66)
- [Stateful Partitions and Rebalancing — L290](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-290-0) (line 290, col 0, score 0.66)
- [prom-lib-rate-limiters-and-replay-api — L106](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-106-0) (line 106, col 0, score 0.71)
- [Promethean Agent DSL TS Scaffold — L525](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-525-0) (line 525, col 0, score 0.64)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L130](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-130-0) (line 130, col 0, score 0.67)
- [TypeScript Patch for Tool Calling Support — L35](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-35-0) (line 35, col 0, score 0.67)
- [Local-First Intention→Code Loop with Free Models — L47](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-47-0) (line 47, col 0, score 0.67)
- [universal-intention-code-fabric — L277](universal-intention-code-fabric.md#^ref-c14edce7-277-0) (line 277, col 0, score 0.66)
- [RAG UI Panel with Qdrant and PostgREST — L300](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-300-0) (line 300, col 0, score 0.85)
- [schema-evolution-workflow — L393](schema-evolution-workflow.md#^ref-d8059b6a-393-0) (line 393, col 0, score 0.64)
- [Agent Tasks: Persistence Migration to DualStore — L26](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-26-0) (line 26, col 0, score 0.7)
- [schema-evolution-workflow — L3](schema-evolution-workflow.md#^ref-d8059b6a-3-0) (line 3, col 0, score 0.65)
- [RAG UI Panel with Qdrant and PostgREST — L358](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-358-0) (line 358, col 0, score 0.61)
- [RAG UI Panel with Qdrant and PostgREST — L336](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-336-0) (line 336, col 0, score 0.88)
- [Promethean Web UI Setup — L581](promethean-web-ui-setup.md#^ref-bc5172ca-581-0) (line 581, col 0, score 0.81)
- [Promethean Infrastructure Setup — L501](promethean-infrastructure-setup.md#^ref-6deed6ac-501-0) (line 501, col 0, score 0.77)
- [Promethean Pipelines — L58](promethean-pipelines.md#^ref-8b8e6103-58-0) (line 58, col 0, score 0.76)
- [Language-Agnostic Mirror System — L11](language-agnostic-mirror-system.md#^ref-d2b3628c-11-0) (line 11, col 0, score 0.74)
- [Dynamic Context Model for Web Components — L51](dynamic-context-model-for-web-components.md#^ref-f7702bf8-51-0) (line 51, col 0, score 0.73)
- [Promethean Pipelines: Local TypeScript-First Workflow — L219](promethean-pipelines-local-typescript-first-workflow.md#^ref-6b63edca-219-0) (line 219, col 0, score 0.71)
- [archetype-ecs — L423](archetype-ecs.md#^ref-8f4c1e86-423-0) (line 423, col 0, score 0.7)
- [State Snapshots API and Transactional Projector — L235](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-235-0) (line 235, col 0, score 0.69)
- [universal-intention-code-fabric — L9](universal-intention-code-fabric.md#^ref-c14edce7-9-0) (line 9, col 0, score 0.69)
- [Promethean Agent Config DSL — L239](promethean-agent-config-dsl.md#^ref-2c00ce45-239-0) (line 239, col 0, score 0.69)
- [ecs-scheduler-and-prefabs — L352](ecs-scheduler-and-prefabs.md#^ref-c62a1815-352-0) (line 352, col 0, score 0.69)
- [System Scheduler with Resource-Aware DAG — L350](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-350-0) (line 350, col 0, score 0.69)
- [Redirecting Standard Error — L7](redirecting-standard-error.md#^ref-b3555ede-7-0) (line 7, col 0, score 0.69)
- [Duck's Attractor States — L5](ducks-attractor-states.md#^ref-13951643-5-0) (line 5, col 0, score 0.68)
- [Agent Tasks: Persistence Migration to DualStore — L92](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-92-0) (line 92, col 0, score 0.71)
- [TypeScript Patch for Tool Calling Support — L175](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-175-0) (line 175, col 0, score 0.7)
- [Chroma Toolkit Consolidation Plan — L96](chroma-toolkit-consolidation-plan.md#^ref-5020e892-96-0) (line 96, col 0, score 0.69)
- [Promethean State Format — L26](promethean-state-format.md#^ref-23df6ddb-26-0) (line 26, col 0, score 0.69)
- [Agent Tasks: Persistence Migration to DualStore — L97](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-97-0) (line 97, col 0, score 0.68)
- [Agent Tasks: Persistence Migration to DualStore — L117](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-117-0) (line 117, col 0, score 0.68)
- [Agent Tasks: Persistence Migration to DualStore — L31](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-31-0) (line 31, col 0, score 0.67)
- [promethean-system-diagrams — L179](promethean-system-diagrams.md#^ref-b51e19b4-179-0) (line 179, col 0, score 0.65)
- [schema-evolution-workflow — L311](schema-evolution-workflow.md#^ref-d8059b6a-311-0) (line 311, col 0, score 0.68)
- [Promethean State Format — L28](promethean-state-format.md#^ref-23df6ddb-28-0) (line 28, col 0, score 0.66)
- [RAG UI Panel with Qdrant and PostgREST — L357](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-357-0) (line 357, col 0, score 0.65)
- [typed-struct-compiler — L380](typed-struct-compiler.md#^ref-78eeedf7-380-0) (line 380, col 0, score 0.65)
- [schema-evolution-workflow — L463](schema-evolution-workflow.md#^ref-d8059b6a-463-0) (line 463, col 0, score 0.64)
- [schema-evolution-workflow — L123](schema-evolution-workflow.md#^ref-d8059b6a-123-0) (line 123, col 0, score 0.64)
- [ecs-offload-workers — L33](ecs-offload-workers.md#^ref-6498b9d7-33-0) (line 33, col 0, score 0.64)
- [typed-struct-compiler — L3](typed-struct-compiler.md#^ref-78eeedf7-3-0) (line 3, col 0, score 0.63)
- [Dynamic Context Model for Web Components — L31](dynamic-context-model-for-web-components.md#^ref-f7702bf8-31-0) (line 31, col 0, score 0.63)
- [Promethean Agent Config DSL — L11](promethean-agent-config-dsl.md#^ref-2c00ce45-11-0) (line 11, col 0, score 0.63)
- [Local-Offline-Model-Deployment-Strategy — L240](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-240-0) (line 240, col 0, score 0.65)
- [sibilant-metacompiler-overview — L16](sibilant-metacompiler-overview.md#^ref-61d4086b-16-0) (line 16, col 0, score 0.64)
- [Agent Tasks: Persistence Migration to DualStore — L25](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-25-0) (line 25, col 0, score 0.64)
- [universal-intention-code-fabric — L417](universal-intention-code-fabric.md#^ref-c14edce7-417-0) (line 417, col 0, score 0.64)
- [windows-tiling-with-autohotkey — L107](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-107-0) (line 107, col 0, score 0.52)
- [Promethean Pipelines — L12](promethean-pipelines.md#^ref-8b8e6103-12-0) (line 12, col 0, score 0.5)
- [Promethean-native config design — L376](promethean-native-config-design.md#^ref-ab748541-376-0) (line 376, col 0, score 0.5)
- [schema-evolution-workflow — L23](schema-evolution-workflow.md#^ref-d8059b6a-23-0) (line 23, col 0, score 0.5)
- [shared-package-layout-clarification — L33](shared-package-layout-clarification.md#^ref-36c8882a-33-0) (line 33, col 0, score 0.49)
- [windows-tiling-with-autohotkey — L13](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-13-0) (line 13, col 0, score 0.49)
- [TypeScript Patch for Tool Calling Support — L133](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-133-0) (line 133, col 0, score 0.48)
- [Vectorial Exception Descent — L142](vectorial-exception-descent.md#^ref-d771154e-142-0) (line 142, col 0, score 0.48)
- [Voice Access Layer Design — L164](voice-access-layer-design.md#^ref-543ed9b3-164-0) (line 164, col 0, score 0.48)
- [Promethean-native config design — L50](promethean-native-config-design.md#^ref-ab748541-50-0) (line 50, col 0, score 0.47)
- [sibilant-meta-string-templating-runtime — L114](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-114-0) (line 114, col 0, score 0.47)
- [api-gateway-versioning — L293](api-gateway-versioning.md#^ref-0580dcd3-293-0) (line 293, col 0, score 1)
- [eidolon-field-math-foundations — L168](eidolon-field-math-foundations.md#^ref-008f2ac0-168-0) (line 168, col 0, score 1)
- [i3-config-validation-methods — L75](i3-config-validation-methods.md#^ref-d28090ac-75-0) (line 75, col 0, score 1)
- [Local-Only-LLM-Workflow — L200](local-only-llm-workflow.md#^ref-9a8ab57e-200-0) (line 200, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L325](migrate-to-provider-tenant-architecture.md#^ref-54382370-325-0) (line 325, col 0, score 1)
- [observability-infrastructure-setup — L377](observability-infrastructure-setup.md#^ref-b4e64f8c-377-0) (line 377, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L475](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-475-0) (line 475, col 0, score 1)
- [Promethean Full-Stack Docker Setup — L434](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-434-0) (line 434, col 0, score 1)
- [eidolon-field-math-foundations — L158](eidolon-field-math-foundations.md#^ref-008f2ac0-158-0) (line 158, col 0, score 1)
- [observability-infrastructure-setup — L375](observability-infrastructure-setup.md#^ref-b4e64f8c-375-0) (line 375, col 0, score 1)
- [Promethean Full-Stack Docker Setup — L435](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-435-0) (line 435, col 0, score 1)
- [Promethean Infrastructure Setup — L576](promethean-infrastructure-setup.md#^ref-6deed6ac-576-0) (line 576, col 0, score 1)
- [Promethean Web UI Setup — L602](promethean-web-ui-setup.md#^ref-bc5172ca-602-0) (line 602, col 0, score 1)
- [Prometheus Observability Stack — L518](prometheus-observability-stack.md#^ref-e90b5a16-518-0) (line 518, col 0, score 1)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L436](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-436-0) (line 436, col 0, score 1)
- [shared-package-layout-clarification — L188](shared-package-layout-clarification.md#^ref-36c8882a-188-0) (line 188, col 0, score 1)
- [api-gateway-versioning — L282](api-gateway-versioning.md#^ref-0580dcd3-282-0) (line 282, col 0, score 1)
- [archetype-ecs — L470](archetype-ecs.md#^ref-8f4c1e86-470-0) (line 470, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L201](chroma-toolkit-consolidation-plan.md#^ref-5020e892-201-0) (line 201, col 0, score 1)
- [Dynamic Context Model for Web Components — L382](dynamic-context-model-for-web-components.md#^ref-f7702bf8-382-0) (line 382, col 0, score 1)
- [ecs-offload-workers — L456](ecs-offload-workers.md#^ref-6498b9d7-456-0) (line 456, col 0, score 1)
- [ecs-scheduler-and-prefabs — L390](ecs-scheduler-and-prefabs.md#^ref-c62a1815-390-0) (line 390, col 0, score 1)
- [eidolon-field-math-foundations — L125](eidolon-field-math-foundations.md#^ref-008f2ac0-125-0) (line 125, col 0, score 1)
- [i3-config-validation-methods — L61](i3-config-validation-methods.md#^ref-d28090ac-61-0) (line 61, col 0, score 1)
- [Mongo Outbox Implementation — L572](mongo-outbox-implementation.md#^ref-9c1acd1e-572-0) (line 572, col 0, score 1)
- [observability-infrastructure-setup — L360](observability-infrastructure-setup.md#^ref-b4e64f8c-360-0) (line 360, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L163](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-163-0) (line 163, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L472](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-472-0) (line 472, col 0, score 1)
- [AI-Centric OS with MCP Layer — L420](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-420-0) (line 420, col 0, score 1)
- [aionian-circuit-math — L177](aionian-circuit-math.md#^ref-f2d83a77-177-0) (line 177, col 0, score 1)
- [Board Automation Improvements — L18](board-automation-improvements.md#^ref-ac60a1d6-18-0) (line 18, col 0, score 1)
- [Board Walk – 2025-08-11 — L140](board-walk-2025-08-11.md#^ref-7aa1eb92-140-0) (line 140, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L118](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-118-0) (line 118, col 0, score 1)
- [Diagrams — L47](chunks/diagrams.md#^ref-45cd25b5-47-0) (line 47, col 0, score 1)
- [JavaScript — L35](chunks/javascript.md#^ref-c1618c66-35-0) (line 35, col 0, score 1)
- [Math Fundamentals — L33](chunks/math-fundamentals.md#^ref-c6e87433-33-0) (line 33, col 0, score 1)
- [Services — L31](chunks/services.md#^ref-75ea4a6a-31-0) (line 31, col 0, score 1)
- [compiler-kit-foundations — L640](compiler-kit-foundations.md#^ref-01b21543-640-0) (line 640, col 0, score 1)
- [AI-Centric OS with MCP Layer — L401](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-401-0) (line 401, col 0, score 1)
- [api-gateway-versioning — L296](api-gateway-versioning.md#^ref-0580dcd3-296-0) (line 296, col 0, score 1)
- [i3-bluetooth-setup — L110](i3-bluetooth-setup.md#^ref-5e408692-110-0) (line 110, col 0, score 1)
- [Local-Offline-Model-Deployment-Strategy — L291](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-291-0) (line 291, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L279](migrate-to-provider-tenant-architecture.md#^ref-54382370-279-0) (line 279, col 0, score 1)
- [Mongo Outbox Implementation — L574](mongo-outbox-implementation.md#^ref-9c1acd1e-574-0) (line 574, col 0, score 1)
- [observability-infrastructure-setup — L359](observability-infrastructure-setup.md#^ref-b4e64f8c-359-0) (line 359, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L477](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-477-0) (line 477, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L175](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-175-0) (line 175, col 0, score 1)
- [AI-Centric OS with MCP Layer — L409](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-409-0) (line 409, col 0, score 1)
- [api-gateway-versioning — L295](api-gateway-versioning.md#^ref-0580dcd3-295-0) (line 295, col 0, score 1)
- [eidolon-field-math-foundations — L166](eidolon-field-math-foundations.md#^ref-008f2ac0-166-0) (line 166, col 0, score 1)
- [Local-Offline-Model-Deployment-Strategy — L293](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-293-0) (line 293, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L307](migrate-to-provider-tenant-architecture.md#^ref-54382370-307-0) (line 307, col 0, score 1)
- [observability-infrastructure-setup — L364](observability-infrastructure-setup.md#^ref-b4e64f8c-364-0) (line 364, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L492](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-492-0) (line 492, col 0, score 1)
- [Chroma-Embedding-Refactor — L328](chroma-embedding-refactor.md#^ref-8b256935-328-0) (line 328, col 0, score 1)
- [Diagrams — L46](chunks/diagrams.md#^ref-45cd25b5-46-0) (line 46, col 0, score 1)
- [i3-config-validation-methods — L53](i3-config-validation-methods.md#^ref-d28090ac-53-0) (line 53, col 0, score 1)
- [Local-Only-LLM-Workflow — L180](local-only-llm-workflow.md#^ref-9a8ab57e-180-0) (line 180, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L276](migrate-to-provider-tenant-architecture.md#^ref-54382370-276-0) (line 276, col 0, score 1)
- [observability-infrastructure-setup — L376](observability-infrastructure-setup.md#^ref-b4e64f8c-376-0) (line 376, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L89](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-89-0) (line 89, col 0, score 1)
- [Promethean Agent Config DSL — L358](promethean-agent-config-dsl.md#^ref-2c00ce45-358-0) (line 358, col 0, score 1)
- [2d-sandbox-field — L225](2d-sandbox-field.md#^ref-c710dc93-225-0) (line 225, col 0, score 1)
- [Admin Dashboard for User Management — L49](admin-dashboard-for-user-management.md#^ref-2901a3e9-49-0) (line 49, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L150](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-150-0) (line 150, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L163](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-163-0) (line 163, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L9](ai-first-os-model-context-protocol.md#^ref-618198f4-9-0) (line 9, col 0, score 1)
- [aionian-circuit-math — L179](aionian-circuit-math.md#^ref-f2d83a77-179-0) (line 179, col 0, score 1)
- [api-gateway-versioning — L304](api-gateway-versioning.md#^ref-0580dcd3-304-0) (line 304, col 0, score 1)
- [archetype-ecs — L479](archetype-ecs.md#^ref-8f4c1e86-479-0) (line 479, col 0, score 1)
- [balanced-bst — L295](balanced-bst.md#^ref-d3e7db72-295-0) (line 295, col 0, score 1)
- [zero-copy-snapshots-and-workers — L363](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-363-0) (line 363, col 0, score 1)
- [Simulation Demo — L32](chunks/simulation-demo.md#^ref-557309a3-32-0) (line 32, col 0, score 1)
- [Tooling — L26](chunks/tooling.md#^ref-6cb4943e-26-0) (line 26, col 0, score 1)
- [Window Management — L36](chunks/window-management.md#^ref-9e8ae388-36-0) (line 36, col 0, score 1)
- [compiler-kit-foundations — L639](compiler-kit-foundations.md#^ref-01b21543-639-0) (line 639, col 0, score 1)
- [Creative Moments — L10](creative-moments.md#^ref-10d98225-10-0) (line 10, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L258](cross-language-runtime-polymorphism.md#^ref-c34c36a6-258-0) (line 258, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L215](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-215-0) (line 215, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L50](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-50-0) (line 50, col 0, score 1)
- [AI-Centric OS with MCP Layer — L408](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-408-0) (line 408, col 0, score 1)
- [api-gateway-versioning — L316](api-gateway-versioning.md#^ref-0580dcd3-316-0) (line 316, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L213](chroma-toolkit-consolidation-plan.md#^ref-5020e892-213-0) (line 213, col 0, score 1)
- [Event Bus MVP — L581](event-bus-mvp.md#^ref-534fe91d-581-0) (line 581, col 0, score 1)
- [i3-bluetooth-setup — L101](i3-bluetooth-setup.md#^ref-5e408692-101-0) (line 101, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L178](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-178-0) (line 178, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L303](migrate-to-provider-tenant-architecture.md#^ref-54382370-303-0) (line 303, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L140](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-140-0) (line 140, col 0, score 1)
- [Mongo Outbox Implementation — L585](mongo-outbox-implementation.md#^ref-9c1acd1e-585-0) (line 585, col 0, score 1)
- [Admin Dashboard for User Management — L43](admin-dashboard-for-user-management.md#^ref-2901a3e9-43-0) (line 43, col 0, score 1)
- [api-gateway-versioning — L300](api-gateway-versioning.md#^ref-0580dcd3-300-0) (line 300, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L305](migrate-to-provider-tenant-architecture.md#^ref-54382370-305-0) (line 305, col 0, score 1)
- [observability-infrastructure-setup — L399](observability-infrastructure-setup.md#^ref-b4e64f8c-399-0) (line 399, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L79](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-79-0) (line 79, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L165](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-165-0) (line 165, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L266](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-266-0) (line 266, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L488](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-488-0) (line 488, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L436](performance-optimized-polyglot-bridge.md#^ref-f5579967-436-0) (line 436, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L504](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-504-0) (line 504, col 0, score 1)
- [polymorphic-meta-programming-engine — L244](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-244-0) (line 244, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L91](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-91-0) (line 91, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L149](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-149-0) (line 149, col 0, score 1)
- [eidolon-field-math-foundations — L155](eidolon-field-math-foundations.md#^ref-008f2ac0-155-0) (line 155, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L309](migrate-to-provider-tenant-architecture.md#^ref-54382370-309-0) (line 309, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L469](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-469-0) (line 469, col 0, score 1)
- [Promethean Full-Stack Docker Setup — L440](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-440-0) (line 440, col 0, score 1)
- [Promethean Infrastructure Setup — L578](promethean-infrastructure-setup.md#^ref-6deed6ac-578-0) (line 578, col 0, score 1)
- [Promethean Web UI Setup — L605](promethean-web-ui-setup.md#^ref-bc5172ca-605-0) (line 605, col 0, score 1)
- [Prometheus Observability Stack — L507](prometheus-observability-stack.md#^ref-e90b5a16-507-0) (line 507, col 0, score 1)
- [api-gateway-versioning — L315](api-gateway-versioning.md#^ref-0580dcd3-315-0) (line 315, col 0, score 1)
- [Chroma-Embedding-Refactor — L331](chroma-embedding-refactor.md#^ref-8b256935-331-0) (line 331, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L167](chroma-toolkit-consolidation-plan.md#^ref-5020e892-167-0) (line 167, col 0, score 1)
- [Diagrams — L25](chunks/diagrams.md#^ref-45cd25b5-25-0) (line 25, col 0, score 1)
- [Tooling — L24](chunks/tooling.md#^ref-6cb4943e-24-0) (line 24, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L173](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-173-0) (line 173, col 0, score 1)
- [Dynamic Context Model for Web Components — L390](dynamic-context-model-for-web-components.md#^ref-f7702bf8-390-0) (line 390, col 0, score 1)
- [eidolon-field-math-foundations — L147](eidolon-field-math-foundations.md#^ref-008f2ac0-147-0) (line 147, col 0, score 1)
- [Event Bus MVP — L553](event-bus-mvp.md#^ref-534fe91d-553-0) (line 553, col 0, score 1)
- [field-interaction-equations — L159](field-interaction-equations.md#^ref-b09141b7-159-0) (line 159, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L315](functional-embedding-pipeline-refactor.md#^ref-a4a25141-315-0) (line 315, col 0, score 1)
- [Math Fundamentals — L20](chunks/math-fundamentals.md#^ref-c6e87433-20-0) (line 20, col 0, score 1)
- [Services — L20](chunks/services.md#^ref-75ea4a6a-20-0) (line 20, col 0, score 1)
- [compiler-kit-foundations — L620](compiler-kit-foundations.md#^ref-01b21543-620-0) (line 620, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L237](cross-language-runtime-polymorphism.md#^ref-c34c36a6-237-0) (line 237, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L40](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-40-0) (line 40, col 0, score 1)
- [Dynamic Context Model for Web Components — L401](dynamic-context-model-for-web-components.md#^ref-f7702bf8-401-0) (line 401, col 0, score 1)
- [ecs-scheduler-and-prefabs — L386](ecs-scheduler-and-prefabs.md#^ref-c62a1815-386-0) (line 386, col 0, score 1)
- [eidolon-field-math-foundations — L127](eidolon-field-math-foundations.md#^ref-008f2ac0-127-0) (line 127, col 0, score 1)
- [Event Bus MVP — L557](event-bus-mvp.md#^ref-534fe91d-557-0) (line 557, col 0, score 1)
- [markdown-to-org-transpiler — L318](markdown-to-org-transpiler.md#^ref-ab54cdd8-318-0) (line 318, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L322](migrate-to-provider-tenant-architecture.md#^ref-54382370-322-0) (line 322, col 0, score 1)
- [Mongo Outbox Implementation — L579](mongo-outbox-implementation.md#^ref-9c1acd1e-579-0) (line 579, col 0, score 1)
- [observability-infrastructure-setup — L369](observability-infrastructure-setup.md#^ref-b4e64f8c-369-0) (line 369, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L183](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-183-0) (line 183, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L483](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-483-0) (line 483, col 0, score 1)
- [polymorphic-meta-programming-engine — L241](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-241-0) (line 241, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L415](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-415-0) (line 415, col 0, score 1)
- [Promethean Agent Config DSL — L352](promethean-agent-config-dsl.md#^ref-2c00ce45-352-0) (line 352, col 0, score 1)
- [AI-Centric OS with MCP Layer — L407](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-407-0) (line 407, col 0, score 1)
- [api-gateway-versioning — L284](api-gateway-versioning.md#^ref-0580dcd3-284-0) (line 284, col 0, score 1)
- [Services — L21](chunks/services.md#^ref-75ea4a6a-21-0) (line 21, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L43](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-43-0) (line 43, col 0, score 1)
- [Dynamic Context Model for Web Components — L407](dynamic-context-model-for-web-components.md#^ref-f7702bf8-407-0) (line 407, col 0, score 1)
- [ecs-offload-workers — L478](ecs-offload-workers.md#^ref-6498b9d7-478-0) (line 478, col 0, score 1)
- [eidolon-field-math-foundations — L167](eidolon-field-math-foundations.md#^ref-008f2ac0-167-0) (line 167, col 0, score 1)
- [i3-bluetooth-setup — L123](i3-bluetooth-setup.md#^ref-5e408692-123-0) (line 123, col 0, score 1)
- [i3-config-validation-methods — L78](i3-config-validation-methods.md#^ref-d28090ac-78-0) (line 78, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L154](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-154-0) (line 154, col 0, score 1)
- [Local-Only-LLM-Workflow — L179](local-only-llm-workflow.md#^ref-9a8ab57e-179-0) (line 179, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L304](migrate-to-provider-tenant-architecture.md#^ref-54382370-304-0) (line 304, col 0, score 1)
- [observability-infrastructure-setup — L398](observability-infrastructure-setup.md#^ref-b4e64f8c-398-0) (line 398, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L184](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-184-0) (line 184, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L506](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-506-0) (line 506, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L452](performance-optimized-polyglot-bridge.md#^ref-f5579967-452-0) (line 452, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L527](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-527-0) (line 527, col 0, score 1)
- [i3-config-validation-methods — L60](i3-config-validation-methods.md#^ref-d28090ac-60-0) (line 60, col 0, score 1)
- [Local-Only-LLM-Workflow — L193](local-only-llm-workflow.md#^ref-9a8ab57e-193-0) (line 193, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L310](migrate-to-provider-tenant-architecture.md#^ref-54382370-310-0) (line 310, col 0, score 1)
- [observability-infrastructure-setup — L400](observability-infrastructure-setup.md#^ref-b4e64f8c-400-0) (line 400, col 0, score 1)
- [Promethean Infrastructure Setup — L604](promethean-infrastructure-setup.md#^ref-6deed6ac-604-0) (line 604, col 0, score 1)
- [Promethean Web UI Setup — L615](promethean-web-ui-setup.md#^ref-bc5172ca-615-0) (line 615, col 0, score 1)
- [shared-package-layout-clarification — L169](shared-package-layout-clarification.md#^ref-36c8882a-169-0) (line 169, col 0, score 1)
- [Shared Package Structure — L177](shared-package-structure.md#^ref-66a72fc3-177-0) (line 177, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L130](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-130-0) (line 130, col 0, score 1)
- [api-gateway-versioning — L303](api-gateway-versioning.md#^ref-0580dcd3-303-0) (line 303, col 0, score 1)
- [Chroma-Embedding-Refactor — L327](chroma-embedding-refactor.md#^ref-8b256935-327-0) (line 327, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L174](chroma-toolkit-consolidation-plan.md#^ref-5020e892-174-0) (line 174, col 0, score 1)
- [eidolon-field-math-foundations — L134](eidolon-field-math-foundations.md#^ref-008f2ac0-134-0) (line 134, col 0, score 1)
- [i3-config-validation-methods — L82](i3-config-validation-methods.md#^ref-d28090ac-82-0) (line 82, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L267](migrate-to-provider-tenant-architecture.md#^ref-54382370-267-0) (line 267, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L391](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-391-0) (line 391, col 0, score 1)
- [RAG UI Panel with Qdrant and PostgREST — L374](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-374-0) (line 374, col 0, score 1)
- [Recursive Prompt Construction Engine — L200](recursive-prompt-construction-engine.md#^ref-babdb9eb-200-0) (line 200, col 0, score 1)
- [Redirecting Standard Error — L31](redirecting-standard-error.md#^ref-b3555ede-31-0) (line 31, col 0, score 1)
- [ripple-propagation-demo — L120](ripple-propagation-demo.md#^ref-8430617b-120-0) (line 120, col 0, score 1)
- [schema-evolution-workflow — L502](schema-evolution-workflow.md#^ref-d8059b6a-502-0) (line 502, col 0, score 1)
- [Self-Agency in AI Interaction — L53](self-agency-in-ai-interaction.md#^ref-49a9a860-53-0) (line 53, col 0, score 1)
- [set-assignment-in-lisp-ast — L161](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-161-0) (line 161, col 0, score 1)
- [shared-package-layout-clarification — L185](shared-package-layout-clarification.md#^ref-36c8882a-185-0) (line 185, col 0, score 1)
- [Shared Package Structure — L181](shared-package-structure.md#^ref-66a72fc3-181-0) (line 181, col 0, score 1)
- [sibilant-macro-targets — L173](sibilant-macro-targets.md#^ref-c5c9a5c6-173-0) (line 173, col 0, score 1)
- [Sibilant Meta-Prompt DSL — L194](sibilant-meta-prompt-dsl.md#^ref-af5d2824-194-0) (line 194, col 0, score 1)
- [field-node-diagram-outline — L111](field-node-diagram-outline.md#^ref-1f32c94a-111-0) (line 111, col 0, score 1)
- [field-node-diagram-set — L144](field-node-diagram-set.md#^ref-22b989d5-144-0) (line 144, col 0, score 1)
- [field-node-diagram-visualizations — L94](field-node-diagram-visualizations.md#^ref-e9b27b06-94-0) (line 94, col 0, score 1)
- [Fnord Tracer Protocol — L258](fnord-tracer-protocol.md#^ref-fc21f824-258-0) (line 258, col 0, score 1)
- [graph-ds — L398](graph-ds.md#^ref-6620e2f2-398-0) (line 398, col 0, score 1)
- [heartbeat-fragment-demo — L110](heartbeat-fragment-demo.md#^ref-dd00677a-110-0) (line 110, col 0, score 1)
- [heartbeat-simulation-snippets — L99](heartbeat-simulation-snippets.md#^ref-23e221e9-99-0) (line 99, col 0, score 1)
- [homeostasis-decay-formulas — L151](homeostasis-decay-formulas.md#^ref-37b5d236-151-0) (line 151, col 0, score 1)
- [i3-bluetooth-setup — L119](i3-bluetooth-setup.md#^ref-5e408692-119-0) (line 119, col 0, score 1)
- [eidolon-node-lifecycle — L63](eidolon-node-lifecycle.md#^ref-938eca9c-63-0) (line 63, col 0, score 1)
- [EidolonField — L269](eidolonfield.md#^ref-49d1e1e5-269-0) (line 269, col 0, score 1)
- [Event Bus MVP — L566](event-bus-mvp.md#^ref-534fe91d-566-0) (line 566, col 0, score 1)
- [Event Bus Projections Architecture — L185](event-bus-projections-architecture.md#^ref-cf6b9b17-185-0) (line 185, col 0, score 1)
- [Exception Layer Analysis — L165](exception-layer-analysis.md#^ref-21d5cc09-165-0) (line 165, col 0, score 1)
- [Factorio AI with External Agents — L160](factorio-ai-with-external-agents.md#^ref-a4d90289-160-0) (line 160, col 0, score 1)
- [field-dynamics-math-blocks — L165](field-dynamics-math-blocks.md#^ref-7cfc230d-165-0) (line 165, col 0, score 1)
- [field-interaction-equations — L184](field-interaction-equations.md#^ref-b09141b7-184-0) (line 184, col 0, score 1)
- [field-node-diagram-outline — L132](field-node-diagram-outline.md#^ref-1f32c94a-132-0) (line 132, col 0, score 1)
- [Diagrams — L13](chunks/diagrams.md#^ref-45cd25b5-13-0) (line 13, col 0, score 1)
- [DSL — L15](chunks/dsl.md#^ref-e87bc036-15-0) (line 15, col 0, score 1)
- [JavaScript — L18](chunks/javascript.md#^ref-c1618c66-18-0) (line 18, col 0, score 1)
- [Math Fundamentals — L14](chunks/math-fundamentals.md#^ref-c6e87433-14-0) (line 14, col 0, score 1)
- [Services — L14](chunks/services.md#^ref-75ea4a6a-14-0) (line 14, col 0, score 1)
- [Shared — L7](chunks/shared.md#^ref-623a55f7-7-0) (line 7, col 0, score 1)
- [Simulation Demo — L10](chunks/simulation-demo.md#^ref-557309a3-10-0) (line 10, col 0, score 1)
- [Tooling — L9](chunks/tooling.md#^ref-6cb4943e-9-0) (line 9, col 0, score 1)
- [Window Management — L15](chunks/window-management.md#^ref-9e8ae388-15-0) (line 15, col 0, score 1)
- [Exception Layer Analysis — L172](exception-layer-analysis.md#^ref-21d5cc09-172-0) (line 172, col 0, score 1)
- [field-dynamics-math-blocks — L154](field-dynamics-math-blocks.md#^ref-7cfc230d-154-0) (line 154, col 0, score 1)
- [field-interaction-equations — L164](field-interaction-equations.md#^ref-b09141b7-164-0) (line 164, col 0, score 1)
- [field-node-diagram-outline — L120](field-node-diagram-outline.md#^ref-1f32c94a-120-0) (line 120, col 0, score 1)
- [field-node-diagram-set — L149](field-node-diagram-set.md#^ref-22b989d5-149-0) (line 149, col 0, score 1)
- [field-node-diagram-visualizations — L99](field-node-diagram-visualizations.md#^ref-e9b27b06-99-0) (line 99, col 0, score 1)
- [graph-ds — L365](graph-ds.md#^ref-6620e2f2-365-0) (line 365, col 0, score 1)
- [heartbeat-fragment-demo — L111](heartbeat-fragment-demo.md#^ref-dd00677a-111-0) (line 111, col 0, score 1)
- [heartbeat-simulation-snippets — L101](heartbeat-simulation-snippets.md#^ref-23e221e9-101-0) (line 101, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L172](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-172-0) (line 172, col 0, score 1)
- [AI-Centric OS with MCP Layer — L424](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-424-0) (line 424, col 0, score 1)
- [aionian-circuit-math — L183](aionian-circuit-math.md#^ref-f2d83a77-183-0) (line 183, col 0, score 1)
- [api-gateway-versioning — L310](api-gateway-versioning.md#^ref-0580dcd3-310-0) (line 310, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L211](chroma-toolkit-consolidation-plan.md#^ref-5020e892-211-0) (line 211, col 0, score 1)
- [Diagrams — L23](chunks/diagrams.md#^ref-45cd25b5-23-0) (line 23, col 0, score 1)
- [DSL — L27](chunks/dsl.md#^ref-e87bc036-27-0) (line 27, col 0, score 1)
- [JavaScript — L29](chunks/javascript.md#^ref-c1618c66-29-0) (line 29, col 0, score 1)
- [Math Fundamentals — L39](chunks/math-fundamentals.md#^ref-c6e87433-39-0) (line 39, col 0, score 1)
- [Shared — L28](chunks/shared.md#^ref-623a55f7-28-0) (line 28, col 0, score 1)
- [Simulation Demo — L29](chunks/simulation-demo.md#^ref-557309a3-29-0) (line 29, col 0, score 1)
- [Tooling — L14](chunks/tooling.md#^ref-6cb4943e-14-0) (line 14, col 0, score 1)
- [Math Fundamentals — L31](chunks/math-fundamentals.md#^ref-c6e87433-31-0) (line 31, col 0, score 1)
- [Tooling — L19](chunks/tooling.md#^ref-6cb4943e-19-0) (line 19, col 0, score 1)
- [compiler-kit-foundations — L634](compiler-kit-foundations.md#^ref-01b21543-634-0) (line 634, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L212](cross-language-runtime-polymorphism.md#^ref-c34c36a6-212-0) (line 212, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L180](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-180-0) (line 180, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L56](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-56-0) (line 56, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L45](ducks-self-referential-perceptual-loop.md#^ref-71726f04-45-0) (line 45, col 0, score 1)
- [Dynamic Context Model for Web Components — L384](dynamic-context-model-for-web-components.md#^ref-f7702bf8-384-0) (line 384, col 0, score 1)
- [ecs-offload-workers — L468](ecs-offload-workers.md#^ref-6498b9d7-468-0) (line 468, col 0, score 1)
- [ecs-scheduler-and-prefabs — L413](ecs-scheduler-and-prefabs.md#^ref-c62a1815-413-0) (line 413, col 0, score 1)
- [Eidolon Field Abstract Model — L214](eidolon-field-abstract-model.md#^ref-5e8b2388-214-0) (line 214, col 0, score 1)
- [Lisp-Compiler-Integration — L547](lisp-compiler-integration.md#^ref-cfee6d36-547-0) (line 547, col 0, score 1)
- [Lispy Macros with syntax-rules — L408](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-408-0) (line 408, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L182](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-182-0) (line 182, col 0, score 1)
- [Local-Offline-Model-Deployment-Strategy — L307](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-307-0) (line 307, col 0, score 1)
- [Local-Only-LLM-Workflow — L210](local-only-llm-workflow.md#^ref-9a8ab57e-210-0) (line 210, col 0, score 1)
- [markdown-to-org-transpiler — L320](markdown-to-org-transpiler.md#^ref-ab54cdd8-320-0) (line 320, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L272](migrate-to-provider-tenant-architecture.md#^ref-54382370-272-0) (line 272, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L136](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-136-0) (line 136, col 0, score 1)
- [Mongo Outbox Implementation — L583](mongo-outbox-implementation.md#^ref-9c1acd1e-583-0) (line 583, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L48](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-48-0) (line 48, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L109](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-109-0) (line 109, col 0, score 1)
- [DuckDuckGoSearchPipeline — L16](duckduckgosearchpipeline.md#^ref-e979c50f-16-0) (line 16, col 0, score 1)
- [AI-Centric OS with MCP Layer — L427](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-427-0) (line 427, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L13](ai-first-os-model-context-protocol.md#^ref-618198f4-13-0) (line 13, col 0, score 1)
- [api-gateway-versioning — L288](api-gateway-versioning.md#^ref-0580dcd3-288-0) (line 288, col 0, score 1)
- [archetype-ecs — L480](archetype-ecs.md#^ref-8f4c1e86-480-0) (line 480, col 0, score 1)
- [balanced-bst — L301](balanced-bst.md#^ref-d3e7db72-301-0) (line 301, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L178](chroma-toolkit-consolidation-plan.md#^ref-5020e892-178-0) (line 178, col 0, score 1)
- [Diagrams — L39](chunks/diagrams.md#^ref-45cd25b5-39-0) (line 39, col 0, score 1)
- [DSL — L41](chunks/dsl.md#^ref-e87bc036-41-0) (line 41, col 0, score 1)
- [JavaScript — L40](chunks/javascript.md#^ref-c1618c66-40-0) (line 40, col 0, score 1)
- [Math Fundamentals — L40](chunks/math-fundamentals.md#^ref-c6e87433-40-0) (line 40, col 0, score 1)
- [Services — L38](chunks/services.md#^ref-75ea4a6a-38-0) (line 38, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L181](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-181-0) (line 181, col 0, score 1)
- [AI-Centric OS with MCP Layer — L429](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-429-0) (line 429, col 0, score 1)
- [api-gateway-versioning — L317](api-gateway-versioning.md#^ref-0580dcd3-317-0) (line 317, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L186](chroma-toolkit-consolidation-plan.md#^ref-5020e892-186-0) (line 186, col 0, score 1)
- [Dynamic Context Model for Web Components — L433](dynamic-context-model-for-web-components.md#^ref-f7702bf8-433-0) (line 433, col 0, score 1)
- [Event Bus MVP — L555](event-bus-mvp.md#^ref-534fe91d-555-0) (line 555, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L150](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-150-0) (line 150, col 0, score 1)
- [Local-Offline-Model-Deployment-Strategy — L290](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-290-0) (line 290, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L298](migrate-to-provider-tenant-architecture.md#^ref-54382370-298-0) (line 298, col 0, score 1)
- [DuckDuckGoSearchPipeline — L10](duckduckgosearchpipeline.md#^ref-e979c50f-10-0) (line 10, col 0, score 1)
- [Event Bus Projections Architecture — L169](event-bus-projections-architecture.md#^ref-cf6b9b17-169-0) (line 169, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L63](model-upgrade-calm-down-guide.md#^ref-db74343f-63-0) (line 63, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L10](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-10-0) (line 10, col 0, score 1)
- [observability-infrastructure-setup — L391](observability-infrastructure-setup.md#^ref-b4e64f8c-391-0) (line 391, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L111](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-111-0) (line 111, col 0, score 1)
- [OpenAPI Validation Report — L29](openapi-validation-report.md#^ref-5c152b08-29-0) (line 29, col 0, score 1)
- [Optimizing Command Limitations in System Design — L36](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-36-0) (line 36, col 0, score 1)
- [plan-update-confirmation — L1013](plan-update-confirmation.md#^ref-b22d79c6-1013-0) (line 1013, col 0, score 1)
- [pm2-orchestration-patterns — L252](pm2-orchestration-patterns.md#^ref-51932e7b-252-0) (line 252, col 0, score 1)
- [Admin Dashboard for User Management — L55](admin-dashboard-for-user-management.md#^ref-2901a3e9-55-0) (line 55, col 0, score 1)
- [AI-Centric OS with MCP Layer — L414](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-414-0) (line 414, col 0, score 1)
- [Board Automation Improvements — L15](board-automation-improvements.md#^ref-ac60a1d6-15-0) (line 15, col 0, score 1)
- [Operations — L7](chunks/operations.md#^ref-f1add613-7-0) (line 7, col 0, score 1)
- [Creative Moments — L7](creative-moments.md#^ref-10d98225-7-0) (line 7, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L210](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-210-0) (line 210, col 0, score 1)
- [DuckDuckGoSearchPipeline — L11](duckduckgosearchpipeline.md#^ref-e979c50f-11-0) (line 11, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L44](ducks-self-referential-perceptual-loop.md#^ref-71726f04-44-0) (line 44, col 0, score 1)
- [Dynamic Context Model for Web Components — L424](dynamic-context-model-for-web-components.md#^ref-f7702bf8-424-0) (line 424, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L96](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-96-0) (line 96, col 0, score 1)
- [Promethean Agent Config DSL — L348](promethean-agent-config-dsl.md#^ref-2c00ce45-348-0) (line 348, col 0, score 1)
- [Promethean Chat Activity Report — L22](promethean-chat-activity-report.md#^ref-18344cf9-22-0) (line 22, col 0, score 1)
- [Admin Dashboard for User Management — L45](admin-dashboard-for-user-management.md#^ref-2901a3e9-45-0) (line 45, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L170](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-170-0) (line 170, col 0, score 1)
- [AI-Centric OS with MCP Layer — L416](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-416-0) (line 416, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L11](ai-first-os-model-context-protocol.md#^ref-618198f4-11-0) (line 11, col 0, score 1)
- [aionian-circuit-math — L178](aionian-circuit-math.md#^ref-f2d83a77-178-0) (line 178, col 0, score 1)
- [api-gateway-versioning — L312](api-gateway-versioning.md#^ref-0580dcd3-312-0) (line 312, col 0, score 1)
- [balanced-bst — L297](balanced-bst.md#^ref-d3e7db72-297-0) (line 297, col 0, score 1)
- [Board Walk – 2025-08-11 — L131](board-walk-2025-08-11.md#^ref-7aa1eb92-131-0) (line 131, col 0, score 1)
- [Operations — L8](chunks/operations.md#^ref-f1add613-8-0) (line 8, col 0, score 1)
- [Local-Offline-Model-Deployment-Strategy — L305](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-305-0) (line 305, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L331](migrate-to-provider-tenant-architecture.md#^ref-54382370-331-0) (line 331, col 0, score 1)
- [Mindful Prioritization — L9](mindful-prioritization.md#^ref-40185d05-9-0) (line 9, col 0, score 1)
- [MindfulRobotIntegration — L7](mindfulrobotintegration.md#^ref-5f65dfa5-7-0) (line 7, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L66](model-upgrade-calm-down-guide.md#^ref-db74343f-66-0) (line 66, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L13](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-13-0) (line 13, col 0, score 1)
- [observability-infrastructure-setup — L393](observability-infrastructure-setup.md#^ref-b4e64f8c-393-0) (line 393, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L59](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-59-0) (line 59, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L56](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-56-0) (line 56, col 0, score 1)
- [Promethean_Eidolon_Synchronicity_Model — L74](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-74-0) (line 74, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L929](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-929-0) (line 929, col 0, score 1)
- [Promethean Infrastructure Setup — L597](promethean-infrastructure-setup.md#^ref-6deed6ac-597-0) (line 597, col 0, score 1)
- [Promethean-native config design — L421](promethean-native-config-design.md#^ref-ab748541-421-0) (line 421, col 0, score 1)
- [promethean-system-diagrams — L217](promethean-system-diagrams.md#^ref-b51e19b4-217-0) (line 217, col 0, score 1)
- [Promethean Web UI Setup — L629](promethean-web-ui-setup.md#^ref-bc5172ca-629-0) (line 629, col 0, score 1)
- [Prompt_Folder_Bootstrap — L193](prompt-folder-bootstrap.md#^ref-bd4f0976-193-0) (line 193, col 0, score 1)
- [prompt-programming-language-lisp — L107](prompt-programming-language-lisp.md#^ref-d41a06d1-107-0) (line 107, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L214](chroma-toolkit-consolidation-plan.md#^ref-5020e892-214-0) (line 214, col 0, score 1)
- [Tooling — L18](chunks/tooling.md#^ref-6cb4943e-18-0) (line 18, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L226](cross-language-runtime-polymorphism.md#^ref-c34c36a6-226-0) (line 226, col 0, score 1)
- [ecs-offload-workers — L473](ecs-offload-workers.md#^ref-6498b9d7-473-0) (line 473, col 0, score 1)
- [ecs-scheduler-and-prefabs — L399](ecs-scheduler-and-prefabs.md#^ref-c62a1815-399-0) (line 399, col 0, score 1)
- [eidolon-field-math-foundations — L146](eidolon-field-math-foundations.md#^ref-008f2ac0-146-0) (line 146, col 0, score 1)
- [Event Bus MVP — L556](event-bus-mvp.md#^ref-534fe91d-556-0) (line 556, col 0, score 1)
- [i3-bluetooth-setup — L106](i3-bluetooth-setup.md#^ref-5e408692-106-0) (line 106, col 0, score 1)
- [aionian-circuit-math — L165](aionian-circuit-math.md#^ref-f2d83a77-165-0) (line 165, col 0, score 1)
- [api-gateway-versioning — L319](api-gateway-versioning.md#^ref-0580dcd3-319-0) (line 319, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L116](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-116-0) (line 116, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L209](chroma-toolkit-consolidation-plan.md#^ref-5020e892-209-0) (line 209, col 0, score 1)
- [DSL — L13](chunks/dsl.md#^ref-e87bc036-13-0) (line 13, col 0, score 1)
- [Math Fundamentals — L16](chunks/math-fundamentals.md#^ref-c6e87433-16-0) (line 16, col 0, score 1)
- [Services — L16](chunks/services.md#^ref-75ea4a6a-16-0) (line 16, col 0, score 1)
- [Shared — L5](chunks/shared.md#^ref-623a55f7-5-0) (line 5, col 0, score 1)
- [Simulation Demo — L12](chunks/simulation-demo.md#^ref-557309a3-12-0) (line 12, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L157](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-157-0) (line 157, col 0, score 1)
- [api-gateway-versioning — L298](api-gateway-versioning.md#^ref-0580dcd3-298-0) (line 298, col 0, score 1)
- [ecs-offload-workers — L455](ecs-offload-workers.md#^ref-6498b9d7-455-0) (line 455, col 0, score 1)
- [ecs-scheduler-and-prefabs — L389](ecs-scheduler-and-prefabs.md#^ref-c62a1815-389-0) (line 389, col 0, score 1)
- [eidolon-field-math-foundations — L130](eidolon-field-math-foundations.md#^ref-008f2ac0-130-0) (line 130, col 0, score 1)
- [i3-config-validation-methods — L63](i3-config-validation-methods.md#^ref-d28090ac-63-0) (line 63, col 0, score 1)
- [Interop and Source Maps — L531](interop-and-source-maps.md#^ref-cdfac40c-531-0) (line 531, col 0, score 1)
- [Language-Agnostic Mirror System — L548](language-agnostic-mirror-system.md#^ref-d2b3628c-548-0) (line 548, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L143](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-143-0) (line 143, col 0, score 1)
- [promethean-system-diagrams — L207](promethean-system-diagrams.md#^ref-b51e19b4-207-0) (line 207, col 0, score 1)
- [Promethean Web UI Setup — L633](promethean-web-ui-setup.md#^ref-bc5172ca-633-0) (line 633, col 0, score 1)
- [Promethean Workflow Optimization — L20](promethean-workflow-optimization.md#^ref-d614d983-20-0) (line 20, col 0, score 1)
- [Prometheus Observability Stack — L543](prometheus-observability-stack.md#^ref-e90b5a16-543-0) (line 543, col 0, score 1)
- [Prompt_Folder_Bootstrap — L216](prompt-folder-bootstrap.md#^ref-bd4f0976-216-0) (line 216, col 0, score 1)
- [prompt-programming-language-lisp — L116](prompt-programming-language-lisp.md#^ref-d41a06d1-116-0) (line 116, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L156](protocol-0-the-contradiction-engine.md#^ref-9a93a756-156-0) (line 156, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L238](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-238-0) (line 238, col 0, score 1)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L445](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-445-0) (line 445, col 0, score 1)
- [Shared Package Structure — L195](shared-package-structure.md#^ref-66a72fc3-195-0) (line 195, col 0, score 1)
- [Diagrams — L50](chunks/diagrams.md#^ref-45cd25b5-50-0) (line 50, col 0, score 1)
- [DSL — L44](chunks/dsl.md#^ref-e87bc036-44-0) (line 44, col 0, score 1)
- [Math Fundamentals — L43](chunks/math-fundamentals.md#^ref-c6e87433-43-0) (line 43, col 0, score 1)
- [Operations — L15](chunks/operations.md#^ref-f1add613-15-0) (line 15, col 0, score 1)
- [Shared — L31](chunks/shared.md#^ref-623a55f7-31-0) (line 31, col 0, score 1)
- [Simulation Demo — L34](chunks/simulation-demo.md#^ref-557309a3-34-0) (line 34, col 0, score 1)
- [Window Management — L38](chunks/window-management.md#^ref-9e8ae388-38-0) (line 38, col 0, score 1)
- [compiler-kit-foundations — L651](compiler-kit-foundations.md#^ref-01b21543-651-0) (line 651, col 0, score 1)
- [Creative Moments — L15](creative-moments.md#^ref-10d98225-15-0) (line 15, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L263](cross-language-runtime-polymorphism.md#^ref-c34c36a6-263-0) (line 263, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L219](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-219-0) (line 219, col 0, score 1)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
