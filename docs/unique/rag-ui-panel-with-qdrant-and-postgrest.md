---
uuid: ca3298cf-44e6-4294-8aaf-4afeb5d12722
created_at: rag-ui-panel-with-qdrant-and-postgrest.md
filename: RAG UI Panel with Qdrant and PostgREST
title: RAG UI Panel with Qdrant and PostgREST
description: >-
  A drop-in RAG UI panel that integrates with Qdrant (HTTP API) and PostgreSQL
  via PostgREST, using NGINX for edge routing with token-based authentication.
  Includes collection browser, vector search with TEI nomic embeddings, and a
  Postgres table viewer.
tags:
  - RAG
  - Qdrant
  - PostgREST
  - NGINX
  - vector search
  - TEI
  - prometheus
  - docker
  - webui
related_to_uuid:
  - 26bd1c45-3706-4bc2-9c46-78e035056f61
  - e108b8dd-c7e8-4245-8bfe-dd475c8aedf1
  - 2aafc801-c3e1-4e4f-999d-adb52af3fc41
  - c62a1815-c43b-4a3b-88e6-d7fa008a155e
  - 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
  - ba244286-4e84-425b-8bf6-b80c4eb783fc
  - d527c05d-22e8-4493-8f29-ae3cb67f035b
  - c14edce7-0656-45b2-aaf3-51f042451b7d
  - d28090ac-f746-4958-aab5-ed1315382c04
  - ad7f1ed3-c9bf-4e85-9eeb-6cc4b53155f3
  - 509e1cd5-367c-4a9d-a61b-cef2e85d42ce
  - d17d3a96-c84d-4738-a403-6c733b874da2
  - 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
  - 4330e8f0-5f46-4235-918b-39b6b93fa561
  - d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
  - b22d79c6-825b-4cd3-b0d3-1cef0532bb54
  - 37b5d236-2b3e-4a95-a4e8-31655c3023ef
  - cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - b6ae7dfa-0c53-4eb9-aea8-65072b825bee
  - 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
  - 80d4d883-59f9-401b-8699-7a2723148b1e
  - bc5172ca-7a09-42ad-b418-8e42bb14d089
  - 01b21543-7e03-4129-8fe4-b6306be69dee
  - d2b3628c-6cad-4664-8551-94ef8280851d
related_to_title:
  - git-commit-ollama-semantic-grouping
  - Git Intelligence for Strategic Code Management
  - sibilant-meta-string-templating-runtime
  - ecs-scheduler-and-prefabs
  - Voice Access Layer Design
  - System Scheduler with Resource-Aware DAG
  - Pure-Node Crawl Stack with Playwright and Crawlee
  - universal-intention-code-fabric
  - i3-config-validation-methods
  - Local-Offline-Model-Deployment-Strategy
  - State Snapshots API and Transactional Projector
  - Pure TypeScript Search Microservice
  - Promethean Infrastructure Setup
  - Stateful Partitions and Rebalancing
  - schema-evolution-workflow
  - plan-update-confirmation
  - homeostasis-decay-formulas
  - Docops Feature Updates
  - Chroma Toolkit Consolidation Plan
  - Ghostly Smoke Interference
  - Event Bus MVP
  - Refactor 05-footers.ts
  - prom ui bootstrap
  - compiler-kit-foundations
  - Language-Agnostic Mirror System
references:
  - uuid: 26bd1c45-3706-4bc2-9c46-78e035056f61
    line: 103
    col: 0
    score: 1
  - uuid: 26bd1c45-3706-4bc2-9c46-78e035056f61
    line: 284
    col: 0
    score: 1
  - uuid: e108b8dd-c7e8-4245-8bfe-dd475c8aedf1
    line: 1
    col: 0
    score: 1
  - uuid: e108b8dd-c7e8-4245-8bfe-dd475c8aedf1
    line: 6
    col: 0
    score: 1
  - uuid: 26bd1c45-3706-4bc2-9c46-78e035056f61
    line: 108
    col: 0
    score: 0.94
  - uuid: 26bd1c45-3706-4bc2-9c46-78e035056f61
    line: 289
    col: 0
    score: 0.94
  - uuid: 2aafc801-c3e1-4e4f-999d-adb52af3fc41
    line: 92
    col: 0
    score: 0.88
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 379
    col: 0
    score: 0.86
  - uuid: 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
    line: 280
    col: 0
    score: 0.85
---
Heck yeah—here’s a drop-in **RAG UI panel** that talks to **Qdrant** (HTTP API) and **PostgreSQL** via **PostgREST**, all still funneled through your NGINX “edge” with `X-API-Key` gating. It includes: collection browser, vector search (auto-embeds with TEI nomic), and a simple Postgres table viewer. ^ref-e1056831-1-0

---

# 0) Compose: add PostgREST to your RAG overlay

### `docker-compose.rag.yaml` (replace with this version or merge the new bits)

```yaml
version: "3.9"
networks: { prom-net: { external: true } }

services:
  pg:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_DB: rag
      POSTGRES_USER: rag
      POSTGRES_PASSWORD: ragpass
    volumes:
      - ./infra/db/init:/docker-entrypoint-initdb.d
      - pg_data:/var/lib/postgresql/data
    networks: [ prom-net ]

  # REST facade to PG for the UI (read-only anon)
  postgrest:
    image: postgrest/postgrest:v12.2.3
    environment:
      PGRST_DB_URI: postgres://rag:ragpass@pg:5432/rag
      PGRST_DB_SCHEMA: public
      PGRST_DB_ANON_ROLE: web_anon
      PGRST_OPENAPI_MODE: follow-privileges
      PGRST_SERVER_PORT: 3000
    depends_on: [ pg ]
    networks: [ prom-net ]

  qdrant:
    image: qdrant/qdrant:latest
    volumes:
      - qdrant_data:/qdrant/storage
    networks: [ prom-net ]

volumes:
  pg_data: {}
  qdrant_data: {}
```
^ref-abe9ec8d-9-0 ^ref-e1056831-47-0 ^ref-abe9ec8d-47-0
^ref-e1056831-9-0 ^ref-e1056831-47-0

### `infra/db/init/001-postgrest.sql` ^ref-abe9ec8d-50-0
 ^ref-e1056831-50-0
```sql
-- Enable pgvector and a minimal docs table (adjust to your schema later)
create extension if not exists vector;

create role web_anon nologin;
grant usage on schema public to web_anon;

-- Example table; if you already have one, skip this block
create table if not exists docs (
  id bigserial primary key,
  title text,
  content text,
  embedding vector(768)  -- adjust to your TEI dim
);

-- Least-privilege read-only for the UI
grant select on table docs to web_anon;
^ref-e1056831-50-0
``` ^ref-e1056831-69-0
^ref-e1056831-51-0

Bring it up (with your base + RAG overlays): ^ref-e1056831-71-0

```bash
^ref-e1056831-71-0
docker compose -f docker-compose.yaml -f docker-compose.rag.yaml up -d
```
 ^ref-e1056831-79-0
--- ^ref-abe9ec8d-80-0
 ^ref-e1056831-79-0
# 1) NGINX: add RAG routes (token-gated)
 ^ref-e1056831-81-0
Append these **two locations** to your existing `server { ... }` in `infra/nginx/nginx.conf` (keep your auth/limits as-is):

```nginx
    # -------- RAG: Qdrant (HTTP) --------
    location /rag/qdrant/ {
      limit_req zone=ip_rl_embed  burst=20 nodelay;
      limit_req zone=tok_rl_embed burst=10 nodelay;
      proxy_http_version 1.1; proxy_buffering off;
      proxy_set_header Host $host; proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
      rewrite ^/rag/qdrant/(.*)$ /$1 break;
      proxy_pass 
    }

    # -------- RAG: PostgREST (PG over HTTP) --------
    location /rag/pg/ {
      limit_req zone=ip_rl_embed  burst=20 nodelay;
      limit_req zone=tok_rl_embed burst=10 nodelay;
      proxy_http_version 1.1; proxy_buffering off;
      proxy_set_header Host $host; proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
      rewrite ^/rag/pg/(.*)$ /$1 break;
^ref-e1056831-81-0
      proxy_pass  ^ref-e1056831-107-0
    }
``` ^ref-e1056831-110-0
^ref-e1056831-109-0

Reload:
^ref-e1056831-109-0

```bash
docker compose exec edge nginx -s reload
```

---

# 2) Webapp: add a RAG panel (Qdrant + PG) ^ref-e1056831-121-0

## 2a) Wire the panel into the UI

### `services/ts/webapp/index.html` (add `<rag-panel>` below `<prom-ui>`)

```html
<body style="margin:0;font-family:system-ui,Segoe UI,Roboto,Arial">
^ref-e1056831-121-0
  <prom-ui></prom-ui>
  <rag-panel></rag-panel>
  <script type="module" src="/src/main.ts"></script>
</body>
^ref-e1056831-131-0
``` ^ref-abe9ec8d-137-0
 ^ref-e1056831-137-0
^ref-e1056831-131-0
### `services/ts/webapp/src/main.ts`

```ts
import "./components/prom-ui";
^ref-e1056831-140-0
import "./components/rag-panel";   // <— new
``` ^ref-abe9ec8d-146-0
^ref-e1056831-140-0

## 2b) API helpers for RAG

### `services/ts/webapp/src/lib/api.ts` (append)

```ts
// ---------- RAG clients ----------
export const RAG = {
  // Qdrant collection list
  qdrantCollections: () =>
    doFetch(`/rag/qdrant/collections`),

  // Qdrant search by vector (auto-embeds user text)
  qdrantSearchByText: async (collection: string, text: string, topK = 5) => {
    const emb = await API.embedNomic(text);
    const vec =
      emb?.data?.[0]?.embedding ??
      emb?.embeddings?.[0] ??
      emb?.embedding;
    if (!Array.isArray(vec)) throw new Error("Bad embedding response");
    return doFetch(`/rag/qdrant/collections/${encodeURIComponent(collection)}/points/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vector: vec, limit: topK, with_payload: true })
    });
^ref-e1056831-140-0
  },

  // PostgREST: simple SELECT on docs (adjust schema/columns later)
  pgDocs: (limit = 50) =>
^ref-e1056831-172-0
    doFetch(`/rag/pg/docs?select=id,title&order=id.desc&limit=${limit}`)
};
^ref-e1056831-172-0
``` ^ref-e1056831-181-0
^ref-e1056831-172-0

## 2c) RAG Panel component

### `services/ts/webapp/src/components/rag-panel.ts`

```ts
import { RAG } from "../lib/api";

const css = `
:host { display:block; padding:16px; color:#eaeaea; background:#0b0f14; }
.wrap { max-width:1100px; margin:0 auto; }
h2 { margin:16px 0 8px; }
.card { background:#11161e; border:1px solid #1e2633; border-radius:16px; padding:16px; margin:12px 0; }
.row { display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
input[type=text], select, textarea {
  background:#0d131a; color:#eaeaea; border:1px solid #243041; border-radius:10px; padding:10px;
}
button { background:#1b2636; color:#fff; border:1px solid #2e3d52; border-radius:10px; padding:10px 14px; cursor:pointer; }
pre { white-space:pre-wrap; word-break:break-word; background:#0d131a; padding:10px; border-radius:10px; border:1px solid #243041; }
table { width:100%; border-collapse:collapse; }
th, td { text-align:left; padding:8px; border-bottom:1px solid #1e2633; }
.badge { display:inline-block; padding:2px 8px; border-radius:999px; border:1px solid #2e3d52; font-size:12px; }
small { opacity:.7; }
`;

export class RagPanel extends HTMLElement {
  root: ShadowRoot;
  constructor(){ super(); this.root = this.attachShadow({mode:"open"})}
  connectedCallback(){ this.render(); this.loadCollections(); this.loadDocs(); }

  private render(){
    this.root.innerHTML = `
      <style>${css}</style>
      <div class="wrap">
        <h2>RAG Panel <span class="badge">Qdrant · Postgres</span></h2>

        <div class="card" id="qdrant">
          <h3>Qdrant Collections</h3>
          <div class="row">
            <button id="refreshQ">Refresh</button>
            <select id="coll"></select>
          </div>
          <div class="row" style="margin-top:8px;">
            <input id="qtext" type="text" placeholder="Semantic search text…" style="flex:1; min-width:260px;">
            <input id="qtopk" type="text" value="5" style="width:90px;">
            <button id="qsearch">Search</button>
          </div>
          <pre id="qout"></pre>
        </div>

        <div class="card" id="pg">
          <h3>Postgres (via PostgREST)</h3>
          <div class="row">
            <button id="refreshPg">List docs</button>
            <input id="limit" type="text" value="50" style="width:90px;">
          </div>
          <table>
            <thead><tr><th>ID</th><th>Title</th></tr></thead>
            <tbody id="pgrows"><tr><td colspan="2"><small>Loading…</small></td></tr></tbody>
          </table>
        </div>
      </div>
    `;

    this.$<HTMLButtonElement>("#refreshQ").onclick = () => this.loadCollections();
    this.$<HTMLButtonElement>("#qsearch").onclick = () => this.searchQdrant();
    this.$<HTMLButtonElement>("#refreshPg").onclick = () => this.loadDocs();
  }

  private async loadCollections(){
    const sel = this.$<HTMLSelectElement>("#coll");
    const out = this.$<HTMLElement>("#qout");
    sel.innerHTML = `<option>Loading…</option>`;
    try {
      const data = await RAG.qdrantCollections();
      const cols = data?.result?.collections ?? [];
      sel.innerHTML = cols.map((c:any)=>`<option value="${c.name}">${c.name}</option>`).join("") || `<option>(no collections)</option>`;
      out.textContent = JSON.stringify({ count: cols.length, names: cols.map((c:any)=>c.name) }, null, 2);
    } catch(e:any){
      out.textContent = `Qdrant error: ${e?.message || e}`;
      sel.innerHTML = `<option>(error)</option>`;
    }
  }

  private async searchQdrant(){
    const col = this.$<HTMLSelectElement>("#coll").value;
    const text = this.$<HTMLInputElement>("#qtext").value.trim();
    const k = parseInt(this.$<HTMLInputElement>("#qtopk").value || "5", 10);
    const out = this.$<HTMLElement>("#qout");
    if (!col || !text){ out.textContent = "Pick a collection and enter text."; return; }
    out.textContent = "Searching… (embedding via TEI nomic)";
    try {
      const res = await RAG.qdrantSearchByText(col, text, k);
      const items = (res?.result ?? []).map((r:any)=>({
        id: r.id, score: r.score, payload: r.payload
      }));
      out.textContent = JSON.stringify(items, null, 2);
    } catch(e:any){
      out.textContent = `Search error: ${e?.message || e}`;
    }
  }

  private async loadDocs(){
    const tbody = this.$<HTMLElement>("#pgrows");
    const limit = parseInt(this.$<HTMLInputElement>("#limit").value || "50", 10);
    tbody.innerHTML = `<tr><td colspan="2"><small>Loading…</small></td></tr>`;
    try {
      const rows = await RAG.pgDocs(limit);
      if (!Array.isArray(rows) || rows.length === 0) {
        tbody.innerHTML = `<tr><td colspan="2"><small>No rows</small></td></tr>`;
        return;
      }
      tbody.innerHTML = rows.map((r:any)=>`<tr><td>${r.id}</td><td>${escapeHtml(r.title ?? "")}</td></tr>`).join("");
    } catch(e:any){
      tbody.innerHTML = `<tr><td colspan="2">PG error: ${escapeHtml(e?.message || String(e))}</td></tr>`;
    }
  }

^ref-e1056831-172-0
  private $<T extends HTMLElement>(sel:string){ return this.root.querySelector(sel) as T; }
}
customElements.define("rag-panel", RagPanel);

^ref-e1056831-300-0
function escapeHtml(s:string){
  return s.replace(/[&<>"']/g, (c)=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c] as string));
^ref-e1056831-300-0
}
^ref-e1056831-300-0
^ref-e1056831-187-0
```

--- ^ref-abe9ec8d-316-0
 ^ref-e1056831-316-0
# 3) Optional: seed some data ^ref-abe9ec8d-318-0
 ^ref-e1056831-316-0
## Qdrant (create a demo collection)

```bash
curl -s -H "X-API-Key: CHANGEME" -H "Content-Type: application/json" \
  -d '{ "vectors": { "size": 768, "distance": "Cosine" }, "on_disk": true }' \
  
^ref-e1056831-300-0

# upsert two points
curl -s -H "X-API-Key: CHANGEME" -H "Content-Type: application/json" \
  -d '{ "points":[
        {"id":1,"vector":[0.01,0.02,0.03], "payload":{"title":"stub1"}},
        {"id":2,"vector":[0.02,0.03,0.04], "payload":{"title":"stub2"}}
^ref-e1056831-316-0 ^ref-e1056831-325-0
^ref-e1056831-327-0 ^ref-e1056831-329-0
^ref-e1056831-325-0 ^ref-e1056831-330-0
^ref-e1056831-316-0
      ] }' \
^ref-e1056831-330-0
^ref-e1056831-329-0 ^ref-e1056831-336-0
^ref-e1056831-327-0
^ref-e1056831-325-0
  
``` ^ref-abe9ec8d-343-0
 ^ref-e1056831-343-0
## Postgres (insert a doc) ^ref-e1056831-325-0 ^ref-abe9ec8d-345-0
^ref-e1056831-330-0 ^ref-e1056831-345-0
^ref-e1056831-329-0
^ref-e1056831-336-0
^ref-e1056831-342-0 ^ref-e1056831-349-0
^ref-e1056831-327-0 ^ref-e1056831-349-0

```bash ^ref-e1056831-327-0
docker compose -f docker-compose.yaml -f docker-compose.rag.yaml exec -T pg psql -U rag -d rag -c \ ^ref-e1056831-336-0
^ref-e1056831-349-0
  "insert into docs(title, content, embedding) values ('Hello RAG','content here', array_fill(0.01::float, array[768])::vector);" ^ref-e1056831-329-0
``` ^ref-e1056831-330-0 ^ref-e1056831-352-0
^ref-e1056831-351-0

--- ^ref-e1056831-354-0
 ^ref-e1056831-355-0
# 4) Use it ^ref-e1056831-356-0
 ^ref-e1056831-357-0
1. Open ` ^ref-e1056831-358-0
2. Paste your `X-API-Key` in the top card. ^ref-e1056831-352-0
3. Scroll to **RAG Panel**:
 ^ref-e1056831-354-0
   * **Qdrant**: Refresh collections, pick one, type text (we auto-embed with nomic TEI), hit **Search**. ^ref-e1056831-355-0
   * **Postgres**: Click **List docs** to view IDs/titles via PostgREST.

---

# 5) (Optional) Diagram

^ref-e1056831-336-0
```mermaid

flowchart LR
^ref-e1056831-358-0
^ref-e1056831-357-0
^ref-e1056831-356-0
^ref-e1056831-355-0
^ref-e1056831-354-0
^ref-e1056831-352-0
  B[Browser /ui/*] --> E[edge:80]
^ref-e1056831-358-0
^ref-e1056831-357-0 ^ref-e1056831-374-0
^ref-e1056831-356-0
^ref-e1056831-374-0
  subgraph Edge (NGINX) ^ref-e1056831-352-0 ^ref-e1056831-384-0
    E -->|/rag/qdrant/* + X-API-Key| Q[qdrant:6333]
    E -->|/rag/pg/* + X-API-Key| P[postgrest:3000 → pg:5432] ^ref-e1056831-354-0
    E -->|/embed/nomic/* + X-API-Key| TEI[tei-nomic:80] ^ref-e1056831-355-0
  end ^ref-e1056831-356-0
  B -->|/ui/* (no token)| W[web:80] ^ref-e1056831-357-0
``` ^ref-e1056831-358-0

--- ^ref-e1056831-374-0 ^ref-e1056831-384-0

## Notes / tweaks

* **Embedding dim**: I assumed `768` (fits `nomic-embed-text-v1.5`). If you switch TEI models, update:

  * Qdrant collection `vectors.size`
  * PG `embedding vector(DIM)`
* **Security**: The UI still loads without a token; all `/rag/*`, `/embed/*`, etc. remain gated by `X-API-Key`.
* **Schema**: If you’ve got a richer PG schema, expose read-only views and grant `select` to `web_anon`, then point the UI at those endpoints (e.g., `/rag/pg/my_view?select=...`).
* **Next**: I can add a **chunker + upsert** panel (drop files → split → embed → write to PG and/or Qdrant) if you want ingest from the browser.
ref-e1056831-357-0 ^ref-e1056831-374-0
^ref-e1056831-356-0
^ref-e1056831-374-0
  subgraph Edge (NGINX) ^ref-e1056831-352-0 ^ref-e1056831-384-0
    E -->|/rag/qdrant/* + X-API-Key| Q[qdrant:6333]
    E -->|/rag/pg/* + X-API-Key| P[postgrest:3000 → pg:5432] ^ref-e1056831-354-0
    E -->|/embed/nomic/* + X-API-Key| TEI[tei-nomic:80] ^ref-e1056831-355-0
  end ^ref-e1056831-356-0
  B -->|/ui/* (no token)| W[web:80] ^ref-e1056831-357-0
``` ^ref-e1056831-358-0

--- ^ref-e1056831-374-0 ^ref-e1056831-384-0

## Notes / tweaks

* **Embedding dim**: I assumed `768` (fits `nomic-embed-text-v1.5`). If you switch TEI models, update:

  * Qdrant collection `vectors.size`
  * PG `embedding vector(DIM)`
* **Security**: The UI still loads without a token; all `/rag/*`, `/embed/*`, etc. remain gated by `X-API-Key`.
* **Schema**: If you’ve got a richer PG schema, expose read-only views and grant `select` to `web_anon`, then point the UI at those endpoints (e.g., `/rag/pg/my_view?select=...`).
* **Next**: I can add a **chunker + upsert** panel (drop files → split → embed → write to PG and/or Qdrant) if you want ingest from the browser.
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [git-commit-ollama-semantic-grouping](2025.09.03.10.57.39.md)
- [Git Intelligence for Strategic Code Management](2025.09.03.11.31.26.md)
- [sibilant-meta-string-templating-runtime](sibilant-meta-string-templating-runtime.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [Voice Access Layer Design](voice-access-layer-design.md)
- [System Scheduler with Resource-Aware DAG](system-scheduler-with-resource-aware-dag.md)
- [Pure-Node Crawl Stack with Playwright and Crawlee](pure-node-crawl-stack-with-playwright-and-crawlee.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [i3-config-validation-methods](i3-config-validation-methods.md)
- [Local-Offline-Model-Deployment-Strategy](local-offline-model-deployment-strategy.md)
- [State Snapshots API and Transactional Projector](state-snapshots-api-and-transactional-projector.md)
- [Pure TypeScript Search Microservice](pure-typescript-search-microservice.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [Stateful Partitions and Rebalancing](stateful-partitions-and-rebalancing.md)
- [schema-evolution-workflow](schema-evolution-workflow.md)
- [plan-update-confirmation](plan-update-confirmation.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
- [Docops Feature Updates](docops-feature-updates-3.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [Ghostly Smoke Interference](ghostly-smoke-interference.md)
- [Event Bus MVP](event-bus-mvp.md)
- [Refactor 05-footers.ts](refactor-05-footers-ts.md)
- [prom ui bootstrap](promethean-web-ui-setup.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
## Sources
- [git-commit-ollama-semantic-grouping — L103](2025.09.03.10.57.39.md#^ref-26bd1c45-103-0) (line 103, col 0, score 1)
- [git-commit-ollama-semantic-grouping — L284](2025.09.03.10.57.39.md#^ref-26bd1c45-284-0) (line 284, col 0, score 1)
- [Git Intelligence for Strategic Code Management — L1](2025.09.03.11.31.26.md#^ref-e108b8dd-1-0) (line 1, col 0, score 1)
- [Git Intelligence for Strategic Code Management — L6](2025.09.03.11.31.26.md#^ref-e108b8dd-6-0) (line 6, col 0, score 1)
- [git-commit-ollama-semantic-grouping — L108](2025.09.03.10.57.39.md#^ref-26bd1c45-108-0) (line 108, col 0, score 0.94)
- [git-commit-ollama-semantic-grouping — L289](2025.09.03.10.57.39.md#^ref-26bd1c45-289-0) (line 289, col 0, score 0.94)
- [sibilant-meta-string-templating-runtime — L92](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-92-0) (line 92, col 0, score 0.88)
- [ecs-scheduler-and-prefabs — L379](ecs-scheduler-and-prefabs.md#^ref-c62a1815-379-0) (line 379, col 0, score 0.86)
- [Voice Access Layer Design — L280](voice-access-layer-design.md#^ref-543ed9b3-280-0) (line 280, col 0, score 0.85)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
