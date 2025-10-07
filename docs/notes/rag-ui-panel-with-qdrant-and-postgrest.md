---
$$
uuid: e1056831-ae0c-460b-95fa-4cf09b3398c6
$$
$$
created_at: 2025.08.31.10.49.42.md
$$
filename: RAG UI Panel with Qdrant and PostgREST
$$
description: >-
$$
  A drop-in RAG UI panel that integrates with Qdrant (HTTP API) and Postgres via
  PostgREST, using NGINX for token-gated access. Includes collection browser,
  vector search with TEI nomic embeddings, and a Postgres table viewer.
tags:
  - RAG
  - Qdrant
  - PostgREST
  - PostgreSQL
  - NGINX
  - TEI
  - vector search
$$
related_to_title:
$$
  - Promethean Full-Stack Docker Setup
  - Promethean Infrastructure Setup
  - Promethean Web UI Setup
  - Pure TypeScript Search Microservice
  - Pure-Node Crawl Stack with Playwright and Crawlee
  - Dynamic Context Model for Web Components
  - api-gateway-versioning
  - ecs-offload-workers
  - Debugging Broker Connections and Agent Behavior
  - Prometheus Observability Stack
  - eidolon-field-math-foundations
  - shared-package-layout-clarification
  - Local-Only-LLM-Workflow
$$
related_to_uuid:
$$
  - 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
  - 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
  - bc5172ca-7a09-42ad-b418-8e42bb14d089
  - d17d3a96-c84d-4738-a403-6c733b874da2
  - d527c05d-22e8-4493-8f29-ae3cb67f035b
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - 0580dcd3-533d-4834-8a2f-eae3771960a9
  - 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
  - 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
  - e90b5a16-d58f-424d-bd36-70e9bd2861ad
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - 36c8882a-badc-4e18-838d-2c54d7038141
  - 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
references:
  - uuid: 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
    line: 404
    col: 1
    score: 0.96
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 545
    col: 1
    score: 0.9
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 62
    col: 1
    score: 0.88
  - uuid: bc5172ca-7a09-42ad-b418-8e42bb14d089
    line: 415
    col: 1
    score: 0.89
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 468
    col: 1
    score: 0.85
  - uuid: bc5172ca-7a09-42ad-b418-8e42bb14d089
    line: 581
    col: 1
    score: 0.9
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 496
    col: 1
    score: 0.88
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 589
    col: 1
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 589
    col: 3
    score: 1
  - uuid: bc5172ca-7a09-42ad-b418-8e42bb14d089
    line: 602
    col: 1
    score: 1
  - uuid: bc5172ca-7a09-42ad-b418-8e42bb14d089
    line: 602
    col: 3
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 506
    col: 1
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 506
    col: 3
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 526
    col: 1
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 526
    col: 3
    score: 1
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 284
    col: 1
    score: 1
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 284
    col: 3
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 40
    col: 1
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 40
    col: 3
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 384
    col: 1
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 384
    col: 3
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 458
    col: 1
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 458
    col: 3
    score: 1
  - uuid: 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
    line: 436
    col: 1
    score: 1
  - uuid: 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
    line: 436
    col: 3
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 585
    col: 1
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 585
    col: 3
    score: 1
  - uuid: d527c05d-22e8-4493-8f29-ae3cb67f035b
    line: 428
    col: 1
    score: 1
  - uuid: d527c05d-22e8-4493-8f29-ae3cb67f035b
    line: 428
    col: 3
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 521
    col: 1
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 521
    col: 3
    score: 1
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 288
    col: 1
    score: 1
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 288
    col: 3
    score: 1
  - uuid: 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
    line: 440
    col: 1
    score: 1
  - uuid: 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
    line: 440
    col: 3
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 584
    col: 1
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 584
    col: 3
    score: 1
  - uuid: bc5172ca-7a09-42ad-b418-8e42bb14d089
    line: 603
    col: 1
    score: 1
  - uuid: bc5172ca-7a09-42ad-b418-8e42bb14d089
    line: 603
    col: 3
    score: 1
  - uuid: bc5172ca-7a09-42ad-b418-8e42bb14d089
    line: 614
    col: 1
    score: 0.99
  - uuid: bc5172ca-7a09-42ad-b418-8e42bb14d089
    line: 614
    col: 3
    score: 0.99
  - uuid: bc5172ca-7a09-42ad-b418-8e42bb14d089
    line: 610
    col: 1
    score: 0.99
  - uuid: bc5172ca-7a09-42ad-b418-8e42bb14d089
    line: 610
    col: 3
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 153
    col: 1
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 153
    col: 3
    score: 1
  - uuid: 36c8882a-badc-4e18-838d-2c54d7038141
    line: 178
    col: 1
    score: 0.99
  - uuid: 36c8882a-badc-4e18-838d-2c54d7038141
    line: 178
    col: 3
    score: 0.99
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 189
    col: 1
    score: 0.99
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 189
    col: 3
    score: 0.99
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 476
    col: 1
    score: 0.99
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 476
    col: 3
    score: 0.99
  - uuid: bc5172ca-7a09-42ad-b418-8e42bb14d089
    line: 612
    col: 1
    score: 0.99
  - uuid: bc5172ca-7a09-42ad-b418-8e42bb14d089
    line: 612
    col: 3
    score: 0.99
  - uuid: bc5172ca-7a09-42ad-b418-8e42bb14d089
    line: 611
    col: 1
    score: 0.99
  - uuid: bc5172ca-7a09-42ad-b418-8e42bb14d089
    line: 611
    col: 3
    score: 0.99
  - uuid: 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
    line: 443
    col: 1
    score: 0.99
  - uuid: 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
    line: 443
    col: 3
    score: 0.99
  - uuid: 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
    line: 444
    col: 1
    score: 0.99
  - uuid: 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
    line: 444
    col: 3
    score: 0.99
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 531
    col: 1
    score: 0.98
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 531
    col: 3
    score: 0.98
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 532
    col: 1
    score: 0.98
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 532
    col: 3
    score: 0.98
---
Heck yeah—here’s a drop-in **RAG UI panel** that talks to **Qdrant** (HTTP API) and **PostgreSQL** via **PostgREST**, all still funneled through your NGINX “edge” with `X-API-Key` gating. It includes: collection browser, vector search $auto-embeds with TEI nomic$, and a simple Postgres table viewer.

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

### `infra/db/init/001-postgrest.sql`

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
```

Bring it up $with your base + RAG overlays$:

```bash
docker compose -f docker-compose.yaml -f docker-compose.rag.yaml up -d
```

---

# 1) NGINX: add RAG routes $token-gated$

Append these **two locations** to your existing `server { ... }` in `infra/nginx/nginx.conf` $keep your auth/limits as-is$:

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
      proxy_pass http://qdrant:6333/;
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
      proxy_pass http://postgrest:3000/;
    }
```

Reload:

```bash
docker compose exec edge nginx -s reload
```

---

# 2) Webapp: add a RAG panel $Qdrant + PG$

## 2a) Wire the panel into the UI

### `services/ts/webapp/index.html` $add `<rag-panel>` below `<prom-ui>`$

```html
<body style="margin:0;font-family:system-ui,Segoe UI,Roboto,Arial">
  <prom-ui></prom-ui>
  <rag-panel></rag-panel>
  <script type="module" src="/src/main.ts"></script>
</body>
```

### `services/ts/webapp/src/main.ts`

```ts
import "./components/prom-ui";
import "./components/rag-panel";   // <— new
```

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
  },

  // PostgREST: simple SELECT on docs (adjust schema/columns later)
  pgDocs: (limit = 50) =>
    doFetch(`/rag/pg/docs?select=id,title&order=id.desc&limit=${limit}`)
};
```

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

  private $<T extends HTMLElement>(sel:string){ return this.root.querySelector(sel) as T; }
}
customElements.define("rag-panel", RagPanel);

function escapeHtml(s:string){
  return s.replace(/[&<>"']/g, (c)=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c] as string));
}
```

---

# 3) Optional: seed some data

## Qdrant (create a demo collection)

```bash
curl -s -H "X-API-Key: CHANGEME" -H "Content-Type: application/json" \
  -d '{ "vectors": { "size": 768, "distance": "Cosine" }, "on_disk": true }' \
  http://localhost/rag/qdrant/collections/demo

# upsert two points
curl -s -H "X-API-Key: CHANGEME" -H "Content-Type: application/json" \
  -d '{ "points":[
        {"id":1,"vector":[0.01,0.02,0.03], "payload":{"title":"stub1"}},
        {"id":2,"vector":[0.02,0.03,0.04], "payload":{"title":"stub2"}}
      ] }' \
  http://localhost/rag/qdrant/collections/demo/points
```

## Postgres (insert a doc)

```bash
docker compose -f docker-compose.yaml -f docker-compose.rag.yaml exec -T pg psql -U rag -d rag -c \
  "insert into docs(title, content, embedding) values ('Hello RAG','content here', array_fill(0.01::float, array[768])::vector);"
```

---

# 4) Use it

1. Open `http://localhost/ui/`
2. Paste your `X-API-Key` in the top card.
$$
3. Scroll to **RAG Panel**:
$$
   * **Qdrant**: Refresh collections, pick one, type text $we auto-embed with nomic TEI$, hit **Search**.
   * **Postgres**: Click **List docs** to view IDs/titles via PostgREST.

---

# 5) (Optional) Diagram

```mermaid

flowchart LR
  B[Browser /ui/*] --> E[edge:80]
  subgraph Edge (NGINX)
    E -->|/rag/qdrant/* + X-API-Key| Q[qdrant:6333]
    E -->|/rag/pg/* + X-API-Key| P[postgrest:3000 → pg:5432]
    E -->|/embed/nomic/* + X-API-Key| TEI[tei-nomic:80]
  end
  B -->|/ui/* (no token)| W[web:80]
```

---

## Notes / tweaks

* **Embedding dim**: I assumed `768` $fits `nomic-embed-text-v1.5`$. If you switch TEI models, update:

  * Qdrant collection `vectors.size`
  * PG `embedding vector(DIM)`
* **Security**: The UI still loads without a token; all `/rag/*`, `/embed/*`, etc. remain gated by `X-API-Key`.
* **Schema**: If you’ve got a richer PG schema, expose read-only views and grant `select` to `web_anon`, then point the UI at those endpoints $e.g., `/rag/pg/my_view?select=...`$.
* **Next**: I can add a **chunker + upsert** panel $drop files → split → embed → write to PG and/or Qdrant$ if you want ingest from the browser.
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- $[promethean-full-stack-docker-setup|Promethean Full-Stack Docker Setup]$
- $[promethean-infrastructure-setup|Promethean Infrastructure Setup]$
- $[promethean-web-ui-setup|Promethean Web UI Setup]$
- $[pure-typescript-search-microservice|Pure TypeScript Search Microservice]$
- $[pure-node-crawl-stack-with-playwright-and-crawlee|Pure-Node Crawl Stack with Playwright and Crawlee]$
- $[dynamic-context-model-for-web-components|Dynamic Context Model for Web Components]$
- $[api-gateway-versioning]$
- $[docs/unique/ecs-offload-workers|ecs-offload-workers]$
- [Debugging Broker Connections and Agent Behavior]$debugging-broker-connections-and-agent-behavior.md$
- $[prometheus-observability-stack|Prometheus Observability Stack]$
- $[docs/unique/eidolon-field-math-foundations|eidolon-field-math-foundations]$
- $[shared-package-layout-clarification]$
- $[local-only-llm-workflow]$

## Sources
- $[promethean-full-stack-docker-setup#L404|Promethean Full-Stack Docker Setup — L404]$ (line 404, col 1, score 0.96)
- $[promethean-infrastructure-setup#L545|Promethean Infrastructure Setup — L545]$ (line 545, col 1, score 0.9)
- $[pure-typescript-search-microservice#L62|Pure TypeScript Search Microservice — L62]$ (line 62, col 1, score 0.88)
- $[promethean-web-ui-setup#L415|Promethean Web UI Setup — L415]$ (line 415, col 1, score 0.89)
- $[pure-typescript-search-microservice#L468|Pure TypeScript Search Microservice — L468]$ (line 468, col 1, score 0.85)
- $[promethean-web-ui-setup#L581|Promethean Web UI Setup — L581]$ (line 581, col 1, score 0.9)
- $[pure-typescript-search-microservice#L496|Pure TypeScript Search Microservice — L496]$ (line 496, col 1, score 0.88)
- $[promethean-infrastructure-setup#L589|Promethean Infrastructure Setup — L589]$ (line 589, col 1, score 1)
- $[promethean-infrastructure-setup#L589|Promethean Infrastructure Setup — L589]$ (line 589, col 3, score 1)
- $[promethean-web-ui-setup#L602|Promethean Web UI Setup — L602]$ (line 602, col 1, score 1)
- $[promethean-web-ui-setup#L602|Promethean Web UI Setup — L602]$ (line 602, col 3, score 1)
- $[prometheus-observability-stack#L506|Prometheus Observability Stack — L506]$ (line 506, col 1, score 1)
- $[prometheus-observability-stack#L506|Prometheus Observability Stack — L506]$ (line 506, col 3, score 1)
- $[pure-typescript-search-microservice#L526|Pure TypeScript Search Microservice — L526]$ (line 526, col 1, score 1)
- $[pure-typescript-search-microservice#L526|Pure TypeScript Search Microservice — L526]$ (line 526, col 3, score 1)
- $[api-gateway-versioning#L284|api-gateway-versioning — L284]$ (line 284, col 1, score 1)
- $[api-gateway-versioning#L284|api-gateway-versioning — L284]$ (line 284, col 3, score 1)
- [Debugging Broker Connections and Agent Behavior — L40]$debugging-broker-connections-and-agent-behavior.md#L40$ (line 40, col 1, score 1)
- [Debugging Broker Connections and Agent Behavior — L40]$debugging-broker-connections-and-agent-behavior.md#L40$ (line 40, col 3, score 1)
- $[dynamic-context-model-for-web-components#L384|Dynamic Context Model for Web Components — L384]$ (line 384, col 1, score 1)
- $[dynamic-context-model-for-web-components#L384|Dynamic Context Model for Web Components — L384]$ (line 384, col 3, score 1)
- $[docs/unique/ecs-offload-workers#L458|ecs-offload-workers — L458]$ (line 458, col 1, score 1)
- $[docs/unique/ecs-offload-workers#L458|ecs-offload-workers — L458]$ (line 458, col 3, score 1)
- $[promethean-full-stack-docker-setup#L436|Promethean Full-Stack Docker Setup — L436]$ (line 436, col 1, score 1)
- $[promethean-full-stack-docker-setup#L436|Promethean Full-Stack Docker Setup — L436]$ (line 436, col 3, score 1)
- $[promethean-infrastructure-setup#L585|Promethean Infrastructure Setup — L585]$ (line 585, col 1, score 1)
- $[promethean-infrastructure-setup#L585|Promethean Infrastructure Setup — L585]$ (line 585, col 3, score 1)
- $[pure-node-crawl-stack-with-playwright-and-crawlee#L428|Pure-Node Crawl Stack with Playwright and Crawlee — L428]$ (line 428, col 1, score 1)
- $[pure-node-crawl-stack-with-playwright-and-crawlee#L428|Pure-Node Crawl Stack with Playwright and Crawlee — L428]$ (line 428, col 3, score 1)
- $[pure-typescript-search-microservice#L521|Pure TypeScript Search Microservice — L521]$ (line 521, col 1, score 1)
- $[pure-typescript-search-microservice#L521|Pure TypeScript Search Microservice — L521]$ (line 521, col 3, score 1)
- $[api-gateway-versioning#L288|api-gateway-versioning — L288]$ (line 288, col 1, score 1)
- $[api-gateway-versioning#L288|api-gateway-versioning — L288]$ (line 288, col 3, score 1)
- $[promethean-full-stack-docker-setup#L440|Promethean Full-Stack Docker Setup — L440]$ (line 440, col 1, score 1)
- $[promethean-full-stack-docker-setup#L440|Promethean Full-Stack Docker Setup — L440]$ (line 440, col 3, score 1)
- $[promethean-infrastructure-setup#L584|Promethean Infrastructure Setup — L584]$ (line 584, col 1, score 1)
- $[promethean-infrastructure-setup#L584|Promethean Infrastructure Setup — L584]$ (line 584, col 3, score 1)
- $[promethean-web-ui-setup#L603|Promethean Web UI Setup — L603]$ (line 603, col 1, score 1)
- $[promethean-web-ui-setup#L603|Promethean Web UI Setup — L603]$ (line 603, col 3, score 1)
- $[promethean-web-ui-setup#L614|Promethean Web UI Setup — L614]$ (line 614, col 1, score 0.99)
- $[promethean-web-ui-setup#L614|Promethean Web UI Setup — L614]$ (line 614, col 3, score 0.99)
- $[promethean-web-ui-setup#L610|Promethean Web UI Setup — L610]$ (line 610, col 1, score 0.99)
- $[promethean-web-ui-setup#L610|Promethean Web UI Setup — L610]$ (line 610, col 3, score 0.99)
- $[docs/unique/eidolon-field-math-foundations#L153|eidolon-field-math-foundations — L153]$ (line 153, col 1, score 1)
- $[docs/unique/eidolon-field-math-foundations#L153|eidolon-field-math-foundations — L153]$ (line 153, col 3, score 1)
- $[shared-package-layout-clarification#L178|shared-package-layout-clarification — L178]$ (line 178, col 1, score 0.99)
- $[shared-package-layout-clarification#L178|shared-package-layout-clarification — L178]$ (line 178, col 3, score 0.99)
- $[local-only-llm-workflow#L189|Local-Only-LLM-Workflow — L189]$ (line 189, col 1, score 0.99)
- $[local-only-llm-workflow#L189|Local-Only-LLM-Workflow — L189]$ (line 189, col 3, score 0.99)
- $[docs/unique/ecs-offload-workers#L476|ecs-offload-workers — L476]$ (line 476, col 1, score 0.99)
- $[docs/unique/ecs-offload-workers#L476|ecs-offload-workers — L476]$ (line 476, col 3, score 0.99)
- $[promethean-web-ui-setup#L612|Promethean Web UI Setup — L612]$ (line 612, col 1, score 0.99)
- $[promethean-web-ui-setup#L612|Promethean Web UI Setup — L612]$ (line 612, col 3, score 0.99)
- $[promethean-web-ui-setup#L611|Promethean Web UI Setup — L611]$ (line 611, col 1, score 0.99)
- $[promethean-web-ui-setup#L611|Promethean Web UI Setup — L611]$ (line 611, col 3, score 0.99)
- $[promethean-full-stack-docker-setup#L443|Promethean Full-Stack Docker Setup — L443]$ (line 443, col 1, score 0.99)
- $[promethean-full-stack-docker-setup#L443|Promethean Full-Stack Docker Setup — L443]$ (line 443, col 3, score 0.99)
- $[promethean-full-stack-docker-setup#L444|Promethean Full-Stack Docker Setup — L444]$ (line 444, col 1, score 0.99)
- $[promethean-full-stack-docker-setup#L444|Promethean Full-Stack Docker Setup — L444]$ (line 444, col 3, score 0.99)
- $[pure-typescript-search-microservice#L531|Pure TypeScript Search Microservice — L531]$ (line 531, col 1, score 0.98)
- $[pure-typescript-search-microservice#L531|Pure TypeScript Search Microservice — L531]$ (line 531, col 3, score 0.98)
- $[pure-typescript-search-microservice#L532|Pure TypeScript Search Microservice — L532]$ (line 532, col 1, score 0.98)
- $[pure-typescript-search-microservice#L532|Pure TypeScript Search Microservice — L532]$ (line 532, col 3, score 0.98)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
