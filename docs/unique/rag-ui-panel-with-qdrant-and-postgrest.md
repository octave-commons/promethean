---
uuid: abe9ec8d-5a0f-42c5-b2ab-a2080c86d70c
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
^ref-e1056831-9-0 ^ref-e1056831-47-0

### `infra/db/init/001-postgrest.sql`
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

---
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
```
 ^ref-e1056831-137-0
^ref-e1056831-131-0
### `services/ts/webapp/src/main.ts`

```ts
import "./components/prom-ui";
^ref-e1056831-140-0
import "./components/rag-panel";   // <— new
```
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

---
 ^ref-e1056831-316-0
# 3) Optional: seed some data
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
  
```
 ^ref-e1056831-343-0
## Postgres (insert a doc) ^ref-e1056831-325-0
^ref-e1056831-330-0 ^ref-e1056831-345-0
^ref-e1056831-329-0
^ref-e1056831-336-0
^ref-e1056831-342-0
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
