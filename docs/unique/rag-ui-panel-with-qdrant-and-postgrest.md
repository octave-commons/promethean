---
uuid: e1056831-ae0c-460b-95fa-4cf09b3398c6
created_at: 2025.08.31.10.49.42.md
filename: RAG UI Panel with Qdrant and PostgREST
description: >-
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
related_to_title: []
related_to_uuid: []
references: []
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
^ref-e1056831-9-0

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
^ref-e1056831-81-0
      proxy_pass http://postgrest:3000/; ^ref-e1056831-107-0
    }
```
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
```
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
```

---

# 3) Optional: seed some data
 ^ref-e1056831-316-0
## Qdrant (create a demo collection)

```bash
curl -s -H "X-API-Key: CHANGEME" -H "Content-Type: application/json" \
  -d '{ "vectors": { "size": 768, "distance": "Cosine" }, "on_disk": true }' \
  http://localhost/rag/qdrant/collections/demo
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
  http://localhost/rag/qdrant/collections/demo/points
```

## Postgres (insert a doc) ^ref-e1056831-325-0
^ref-e1056831-330-0
^ref-e1056831-329-0
^ref-e1056831-336-0
^ref-e1056831-342-0
^ref-e1056831-327-0

```bash ^ref-e1056831-327-0
docker compose -f docker-compose.yaml -f docker-compose.rag.yaml exec -T pg psql -U rag -d rag -c \ ^ref-e1056831-336-0
  "insert into docs(title, content, embedding) values ('Hello RAG','content here', array_fill(0.01::float, array[768])::vector);" ^ref-e1056831-329-0
``` ^ref-e1056831-330-0 ^ref-e1056831-352-0

--- ^ref-e1056831-354-0
 ^ref-e1056831-355-0
# 4) Use it ^ref-e1056831-356-0
 ^ref-e1056831-357-0
1. Open `http://localhost/ui/` ^ref-e1056831-358-0
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
* **Next**: I can add a **chunker + upsert** panel (drop files → split → embed → write to PG and/or Qdrant) if you want ingest from the browser.<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Promethean Full-Stack Docker Setup](promethean-full-stack-docker-setup.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [Promethean Web UI Setup](promethean-web-ui-setup.md)
- [Pure TypeScript Search Microservice](pure-typescript-search-microservice.md)
- [Pure-Node Crawl Stack with Playwright and Crawlee](pure-node-crawl-stack-with-playwright-and-crawlee.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [Prometheus Observability Stack](prometheus-observability-stack.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [shared-package-layout-clarification](shared-package-layout-clarification.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [observability-infrastructure-setup](observability-infrastructure-setup.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [Admin Dashboard for User Management](admin-dashboard-for-user-management.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [2d-sandbox-field](2d-sandbox-field.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [archetype-ecs](archetype-ecs.md)
- [Local-Offline-Model-Deployment-Strategy](local-offline-model-deployment-strategy.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [i3-config-validation-methods](i3-config-validation-methods.md)
- [JavaScript](chunks/javascript.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [Event Bus MVP](event-bus-mvp.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [Services](chunks/services.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler](ollama-llm-provider-for-pseudo-code-transpiler.md)
- [prom-lib-rate-limiters-and-replay-api](prom-lib-rate-limiters-and-replay-api.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [Tooling](chunks/tooling.md)
- [Window Management](chunks/window-management.md)
- [Diagrams](chunks/diagrams.md)
- [markdown-to-org-transpiler](markdown-to-org-transpiler.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [AI-First-OS-Model-Context-Protocol](ai-first-os-model-context-protocol.md)
- [balanced-bst](balanced-bst.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [field-interaction-equations](field-interaction-equations.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [EidolonField](eidolonfield.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [DSL](chunks/dsl.md)
- [Shared](chunks/shared.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [Chroma-Embedding-Refactor](chroma-embedding-refactor.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [graph-ds](graph-ds.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [Board Automation Improvements](board-automation-improvements.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [heartbeat-simulation-snippets](heartbeat-simulation-snippets.md)
- [promethean-system-diagrams](promethean-system-diagrams.md)
- [Promethean_Eidolon_Synchronicity_Model](promethean-eidolon-synchronicity-model.md)
- [Lisp-Compiler-Integration](lisp-compiler-integration.md)
- [Lispy Macros with syntax-rules](lispy-macros-with-syntax-rules.md)
- [Creative Moments](creative-moments.md)
- [Post-Linguistic Transhuman Design Frameworks](post-linguistic-transhuman-design-frameworks.md)
- [Obsidian ChatGPT Plugin Integration](obsidian-chatgpt-plugin-integration.md)
- [Obsidian Templating Plugins Integration Guide](obsidian-templating-plugins-integration-guide.md)
- [Operations](chunks/operations.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
- [Fnord Tracer Protocol](fnord-tracer-protocol.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
- [obsidian-ignore-node-modules-regex](obsidian-ignore-node-modules-regex.md)
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
- [Shared Package Structure](shared-package-structure.md)
- [zero-copy-snapshots-and-workers](zero-copy-snapshots-and-workers.md)
- [Provider-Agnostic Chat Panel Implementation](provider-agnostic-chat-panel-implementation.md)
- [Promethean Workflow Optimization](promethean-workflow-optimization.md)
- [Protocol_0_The_Contradiction_Engine](protocol-0-the-contradiction-engine.md)
- [schema-evolution-workflow](schema-evolution-workflow.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [Self-Agency in AI Interaction](self-agency-in-ai-interaction.md)
- [Recursive Prompt Construction Engine](recursive-prompt-construction-engine.md)
- [Redirecting Standard Error](redirecting-standard-error.md)
- [set-assignment-in-lisp-ast](set-assignment-in-lisp-ast.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [Promethean-Copilot-Intent-Engine](promethean-copilot-intent-engine.md)
- [DuckDuckGoSearchPipeline](duckduckgosearchpipeline.md)
- [Promethean Pipelines](promethean-pipelines.md)
- [Promethean Pipelines: Local TypeScript-First Workflow](promethean-pipelines-local-typescript-first-workflow.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [Stateful Partitions and Rebalancing](stateful-partitions-and-rebalancing.md)
- [System Scheduler with Resource-Aware DAG](system-scheduler-with-resource-aware-dag.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [Functional Embedding Pipeline Refactor](functional-embedding-pipeline-refactor.md)
- [State Snapshots API and Transactional Projector](state-snapshots-api-and-transactional-projector.md)
- [Ghostly Smoke Interference](ghostly-smoke-interference.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [refactor-relations](refactor-relations.md)
- [TypeScript Patch for Tool Calling Support](typescript-patch-for-tool-calling-support.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [Refactor Frontmatter Processing](refactor-frontmatter-processing.md)
- [Voice Access Layer Design](voice-access-layer-design.md)
- [Promethean Documentation Pipeline Overview](promethean-documentation-pipeline-overview.md)
- [Functional Refactor of TypeScript Document Processing](functional-refactor-of-typescript-document-processing.md)
- [WebSocket Gateway Implementation](websocket-gateway-implementation.md)
- [Promethean Agent DSL TS Scaffold](promethean-agent-dsl-ts-scaffold.md)
- [Interop and Source Maps](interop-and-source-maps.md)
- [Docops Feature Updates](docops-feature-updates.md)
- [Model Upgrade Calm-Down Guide](model-upgrade-calm-down-guide.md)
- [sibilant-metacompiler-overview](sibilant-metacompiler-overview.md)
- [plan-update-confirmation](plan-update-confirmation.md)
- [unique-templates](templates/unique-templates.md)
- [komorebi-group-window-hack](komorebi-group-window-hack.md)
- [smart-chatgpt-thingy](smart-chatgpt-thingy.md)
- [Matplotlib Animation with Async Execution](matplotlib-animation-with-async-execution.md)
- [polyglot-repl-interface-layer](polyglot-repl-interface-layer.md)
- [Smoke Resonance Visualizations](smoke-resonance-visualizations.md)
- [Vectorial Exception Descent](vectorial-exception-descent.md)
## Sources
- [eidolon-field-math-foundations — L158](eidolon-field-math-foundations.md#^ref-008f2ac0-158-0) (line 158, col 0, score 0.61)
- [observability-infrastructure-setup — L375](observability-infrastructure-setup.md#^ref-b4e64f8c-375-0) (line 375, col 0, score 0.61)
- [Promethean Full-Stack Docker Setup — L435](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-435-0) (line 435, col 0, score 0.61)
- [Promethean Infrastructure Setup — L576](promethean-infrastructure-setup.md#^ref-6deed6ac-576-0) (line 576, col 0, score 0.61)
- [Promethean Web UI Setup — L602](promethean-web-ui-setup.md#^ref-bc5172ca-602-0) (line 602, col 0, score 0.61)
- [Prometheus Observability Stack — L518](prometheus-observability-stack.md#^ref-e90b5a16-518-0) (line 518, col 0, score 0.61)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L436](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-436-0) (line 436, col 0, score 0.61)
- [Pure TypeScript Search Microservice — L520](pure-typescript-search-microservice.md#^ref-d17d3a96-520-0) (line 520, col 0, score 0.76)
- [Promethean Full-Stack Docker Setup — L404](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-404-0) (line 404, col 0, score 0.96)
- [Promethean Infrastructure Setup — L93](promethean-infrastructure-setup.md#^ref-6deed6ac-93-0) (line 93, col 0, score 0.67)
- [Prometheus Observability Stack — L7](prometheus-observability-stack.md#^ref-e90b5a16-7-0) (line 7, col 0, score 0.66)
- [Pure TypeScript Search Microservice — L14](pure-typescript-search-microservice.md#^ref-d17d3a96-14-0) (line 14, col 0, score 0.74)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L9](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-9-0) (line 9, col 0, score 0.7)
- [Promethean Full-Stack Docker Setup — L3](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-3-0) (line 3, col 0, score 0.66)
- [AI-Centric OS with MCP Layer — L185](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-185-0) (line 185, col 0, score 0.65)
- [schema-evolution-workflow — L463](schema-evolution-workflow.md#^ref-d8059b6a-463-0) (line 463, col 0, score 0.66)
- [Agent Tasks: Persistence Migration to DualStore — L70](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-70-0) (line 70, col 0, score 0.66)
- [Mongo Outbox Implementation — L538](mongo-outbox-implementation.md#^ref-9c1acd1e-538-0) (line 538, col 0, score 0.65)
- [Per-Domain Policy System for JS Crawler — L27](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-27-0) (line 27, col 0, score 0.65)
- [Promethean Pipelines: Local TypeScript-First Workflow — L3](promethean-pipelines-local-typescript-first-workflow.md#^ref-6b63edca-3-0) (line 3, col 0, score 0.67)
- [schema-evolution-workflow — L243](schema-evolution-workflow.md#^ref-d8059b6a-243-0) (line 243, col 0, score 0.64)
- [ecs-offload-workers — L434](ecs-offload-workers.md#^ref-6498b9d7-434-0) (line 434, col 0, score 0.64)
- [Stateful Partitions and Rebalancing — L202](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-202-0) (line 202, col 0, score 0.64)
- [Promethean Agent DSL TS Scaffold — L3](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-3-0) (line 3, col 0, score 0.63)
- [Model Upgrade Calm-Down Guide — L29](model-upgrade-calm-down-guide.md#^ref-db74343f-29-0) (line 29, col 0, score 0.63)
- [Local-Offline-Model-Deployment-Strategy — L240](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-240-0) (line 240, col 0, score 0.64)
- [Dynamic Context Model for Web Components — L79](dynamic-context-model-for-web-components.md#^ref-f7702bf8-79-0) (line 79, col 0, score 0.73)
- [Promethean-native config design — L52](promethean-native-config-design.md#^ref-ab748541-52-0) (line 52, col 0, score 0.63)
- [Promethean Full-Stack Docker Setup — L400](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-400-0) (line 400, col 0, score 0.63)
- [Sibilant Meta-Prompt DSL — L10](sibilant-meta-prompt-dsl.md#^ref-af5d2824-10-0) (line 10, col 0, score 0.61)
- [Chroma-Embedding-Refactor — L26](chroma-embedding-refactor.md#^ref-8b256935-26-0) (line 26, col 0, score 0.6)
- [universal-intention-code-fabric — L3](universal-intention-code-fabric.md#^ref-c14edce7-3-0) (line 3, col 0, score 0.6)
- [Agent Tasks: Persistence Migration to DualStore — L8](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-8-0) (line 8, col 0, score 0.6)
- [Shared Package Structure — L146](shared-package-structure.md#^ref-66a72fc3-146-0) (line 146, col 0, score 0.6)
- [Pure TypeScript Search Microservice — L514](pure-typescript-search-microservice.md#^ref-d17d3a96-514-0) (line 514, col 0, score 0.65)
- [Smoke Resonance Visualizations — L1](smoke-resonance-visualizations.md#^ref-ac9d3ac5-1-0) (line 1, col 0, score 0.6)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L3](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-3-0) (line 3, col 0, score 0.6)
- [Promethean Infrastructure Setup — L545](promethean-infrastructure-setup.md#^ref-6deed6ac-545-0) (line 545, col 0, score 0.67)
- [Pure TypeScript Search Microservice — L62](pure-typescript-search-microservice.md#^ref-d17d3a96-62-0) (line 62, col 0, score 0.73)
- [Promethean Infrastructure Setup — L536](promethean-infrastructure-setup.md#^ref-6deed6ac-536-0) (line 536, col 0, score 0.65)
- [Per-Domain Policy System for JS Crawler — L446](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-446-0) (line 446, col 0, score 0.68)
- [Prometheus Observability Stack — L500](prometheus-observability-stack.md#^ref-e90b5a16-500-0) (line 500, col 0, score 0.66)
- [observability-infrastructure-setup — L357](observability-infrastructure-setup.md#^ref-b4e64f8c-357-0) (line 357, col 0, score 0.66)
- [Promethean Web UI Setup — L563](promethean-web-ui-setup.md#^ref-bc5172ca-563-0) (line 563, col 0, score 0.65)
- [Promethean Full-Stack Docker Setup — L432](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-432-0) (line 432, col 0, score 0.64)
- [Per-Domain Policy System for JS Crawler — L439](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-439-0) (line 439, col 0, score 0.7)
- [Promethean Full-Stack Docker Setup — L388](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-388-0) (line 388, col 0, score 0.62)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L389](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-389-0) (line 389, col 0, score 0.62)
- [Prometheus Observability Stack — L485](prometheus-observability-stack.md#^ref-e90b5a16-485-0) (line 485, col 0, score 0.62)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L417](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-417-0) (line 417, col 0, score 0.64)
- [Local-Offline-Model-Deployment-Strategy — L288](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-288-0) (line 288, col 0, score 0.64)
- [Promethean Web UI Setup — L40](promethean-web-ui-setup.md#^ref-bc5172ca-40-0) (line 40, col 0, score 0.65)
- [Promethean Web UI Setup — L44](promethean-web-ui-setup.md#^ref-bc5172ca-44-0) (line 44, col 0, score 0.64)
- [AI-Centric OS with MCP Layer — L178](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-178-0) (line 178, col 0, score 0.64)
- [Lisp-Compiler-Integration — L485](lisp-compiler-integration.md#^ref-cfee6d36-485-0) (line 485, col 0, score 0.63)
- [sibilant-metacompiler-overview — L49](sibilant-metacompiler-overview.md#^ref-61d4086b-49-0) (line 49, col 0, score 0.62)
- [Agent Tasks: Persistence Migration to DualStore — L26](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-26-0) (line 26, col 0, score 0.62)
- [polymorphic-meta-programming-engine — L142](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-142-0) (line 142, col 0, score 0.62)
- [Agent Tasks: Persistence Migration to DualStore — L92](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-92-0) (line 92, col 0, score 0.62)
- [Chroma Toolkit Consolidation Plan — L146](chroma-toolkit-consolidation-plan.md#^ref-5020e892-146-0) (line 146, col 0, score 0.62)
- [plan-update-confirmation — L640](plan-update-confirmation.md#^ref-b22d79c6-640-0) (line 640, col 0, score 0.61)
- [Matplotlib Animation with Async Execution — L38](matplotlib-animation-with-async-execution.md#^ref-687439f9-38-0) (line 38, col 0, score 0.61)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L326](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-326-0) (line 326, col 0, score 0.61)
- [Pure TypeScript Search Microservice — L46](pure-typescript-search-microservice.md#^ref-d17d3a96-46-0) (line 46, col 0, score 0.75)
- [Promethean Full-Stack Docker Setup — L169](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-169-0) (line 169, col 0, score 0.68)
- [api-gateway-versioning — L7](api-gateway-versioning.md#^ref-0580dcd3-7-0) (line 7, col 0, score 0.7)
- [Promethean Infrastructure Setup — L560](promethean-infrastructure-setup.md#^ref-6deed6ac-560-0) (line 560, col 0, score 0.69)
- [Promethean Infrastructure Setup — L61](promethean-infrastructure-setup.md#^ref-6deed6ac-61-0) (line 61, col 0, score 0.69)
- [observability-infrastructure-setup — L44](observability-infrastructure-setup.md#^ref-b4e64f8c-44-0) (line 44, col 0, score 0.68)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L223](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-223-0) (line 223, col 0, score 0.68)
- [Promethean Infrastructure Setup — L540](promethean-infrastructure-setup.md#^ref-6deed6ac-540-0) (line 540, col 0, score 0.73)
- [Chroma-Embedding-Refactor — L64](chroma-embedding-refactor.md#^ref-8b256935-64-0) (line 64, col 0, score 0.61)
- [Chroma-Embedding-Refactor — L109](chroma-embedding-refactor.md#^ref-8b256935-109-0) (line 109, col 0, score 0.61)
- [Chroma-Embedding-Refactor — L258](chroma-embedding-refactor.md#^ref-8b256935-258-0) (line 258, col 0, score 0.61)
- [Chroma Toolkit Consolidation Plan — L72](chroma-toolkit-consolidation-plan.md#^ref-5020e892-72-0) (line 72, col 0, score 0.61)
- [Chroma Toolkit Consolidation Plan — L88](chroma-toolkit-consolidation-plan.md#^ref-5020e892-88-0) (line 88, col 0, score 0.61)
- [Chroma Toolkit Consolidation Plan — L107](chroma-toolkit-consolidation-plan.md#^ref-5020e892-107-0) (line 107, col 0, score 0.61)
- [Chroma Toolkit Consolidation Plan — L148](chroma-toolkit-consolidation-plan.md#^ref-5020e892-148-0) (line 148, col 0, score 0.61)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L156](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-156-0) (line 156, col 0, score 0.67)
- [Chroma Toolkit Consolidation Plan — L162](chroma-toolkit-consolidation-plan.md#^ref-5020e892-162-0) (line 162, col 0, score 0.63)
- [Migrate to Provider-Tenant Architecture — L42](migrate-to-provider-tenant-architecture.md#^ref-54382370-42-0) (line 42, col 0, score 0.66)
- [ecs-scheduler-and-prefabs — L383](ecs-scheduler-and-prefabs.md#^ref-c62a1815-383-0) (line 383, col 0, score 0.66)
- [Promethean Web UI Setup — L1](promethean-web-ui-setup.md#^ref-bc5172ca-1-0) (line 1, col 0, score 0.7)
- [Promethean Web UI Setup — L9](promethean-web-ui-setup.md#^ref-bc5172ca-9-0) (line 9, col 0, score 0.65)
- [Agent Tasks: Persistence Migration to DualStore — L175](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-175-0) (line 175, col 0, score 1)
- [AI-Centric OS with MCP Layer — L409](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-409-0) (line 409, col 0, score 1)
- [Promethean Web UI Setup — L328](promethean-web-ui-setup.md#^ref-bc5172ca-328-0) (line 328, col 0, score 0.84)
- [Dynamic Context Model for Web Components — L352](dynamic-context-model-for-web-components.md#^ref-f7702bf8-352-0) (line 352, col 0, score 0.67)
- [Promethean Web UI Setup — L278](promethean-web-ui-setup.md#^ref-bc5172ca-278-0) (line 278, col 0, score 0.62)
- [i3-bluetooth-setup — L57](i3-bluetooth-setup.md#^ref-5e408692-57-0) (line 57, col 0, score 0.62)
- [shared-package-layout-clarification — L161](shared-package-layout-clarification.md#^ref-36c8882a-161-0) (line 161, col 0, score 0.61)
- [komorebi-group-window-hack — L193](komorebi-group-window-hack.md#^ref-dd89372d-193-0) (line 193, col 0, score 0.61)
- [polyglot-repl-interface-layer — L146](polyglot-repl-interface-layer.md#^ref-9c79206d-146-0) (line 146, col 0, score 0.61)
- [Promethean Web UI Setup — L345](promethean-web-ui-setup.md#^ref-bc5172ca-345-0) (line 345, col 0, score 0.85)
- [Functional Refactor of TypeScript Document Processing — L5](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-5-0) (line 5, col 0, score 0.65)
- [Promethean Web UI Setup — L317](promethean-web-ui-setup.md#^ref-bc5172ca-317-0) (line 317, col 0, score 0.65)
- [Promethean Event Bus MVP v0.1 — L797](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-797-0) (line 797, col 0, score 0.64)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L431](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-431-0) (line 431, col 0, score 0.63)
- [Shared Package Structure — L147](shared-package-structure.md#^ref-66a72fc3-147-0) (line 147, col 0, score 0.64)
- [zero-copy-snapshots-and-workers — L238](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-238-0) (line 238, col 0, score 0.64)
- [Interop and Source Maps — L482](interop-and-source-maps.md#^ref-cdfac40c-482-0) (line 482, col 0, score 0.64)
- [Promethean Web UI Setup — L415](promethean-web-ui-setup.md#^ref-bc5172ca-415-0) (line 415, col 0, score 0.62)
- [Shared Package Structure — L51](shared-package-structure.md#^ref-66a72fc3-51-0) (line 51, col 0, score 0.63)
- [Chroma-Embedding-Refactor — L111](chroma-embedding-refactor.md#^ref-8b256935-111-0) (line 111, col 0, score 0.68)
- [shared-package-layout-clarification — L155](shared-package-layout-clarification.md#^ref-36c8882a-155-0) (line 155, col 0, score 0.63)
- [Shared Package Structure — L58](shared-package-structure.md#^ref-66a72fc3-58-0) (line 58, col 0, score 0.62)
- [Interop and Source Maps — L68](interop-and-source-maps.md#^ref-cdfac40c-68-0) (line 68, col 0, score 0.62)
- [Pure TypeScript Search Microservice — L306](pure-typescript-search-microservice.md#^ref-d17d3a96-306-0) (line 306, col 0, score 0.68)
- [Functional Embedding Pipeline Refactor — L31](functional-embedding-pipeline-refactor.md#^ref-a4a25141-31-0) (line 31, col 0, score 0.69)
- [Promethean Infrastructure Setup — L456](promethean-infrastructure-setup.md#^ref-6deed6ac-456-0) (line 456, col 0, score 0.66)
- [Promethean Web UI Setup — L351](promethean-web-ui-setup.md#^ref-bc5172ca-351-0) (line 351, col 0, score 0.6)
- [Promethean Infrastructure Setup — L485](promethean-infrastructure-setup.md#^ref-6deed6ac-485-0) (line 485, col 0, score 0.69)
- [Pure TypeScript Search Microservice — L378](pure-typescript-search-microservice.md#^ref-d17d3a96-378-0) (line 378, col 0, score 0.69)
- [Promethean Infrastructure Setup — L224](promethean-infrastructure-setup.md#^ref-6deed6ac-224-0) (line 224, col 0, score 0.62)
- [Chroma-Embedding-Refactor — L66](chroma-embedding-refactor.md#^ref-8b256935-66-0) (line 66, col 0, score 0.6)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L178](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-178-0) (line 178, col 0, score 0.71)
- [Chroma-Embedding-Refactor — L260](chroma-embedding-refactor.md#^ref-8b256935-260-0) (line 260, col 0, score 0.61)
- [Promethean Event Bus MVP v0.1 — L733](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-733-0) (line 733, col 0, score 0.67)
- [Promethean Infrastructure Setup — L471](promethean-infrastructure-setup.md#^ref-6deed6ac-471-0) (line 471, col 0, score 0.61)
- [Promethean Event Bus MVP v0.1 — L604](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-604-0) (line 604, col 0, score 0.64)
- [Language-Agnostic Mirror System — L273](language-agnostic-mirror-system.md#^ref-d2b3628c-273-0) (line 273, col 0, score 0.64)
- [zero-copy-snapshots-and-workers — L70](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-70-0) (line 70, col 0, score 0.64)
- [Mongo Outbox Implementation — L381](mongo-outbox-implementation.md#^ref-9c1acd1e-381-0) (line 381, col 0, score 0.58)
- [zero-copy-snapshots-and-workers — L202](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-202-0) (line 202, col 0, score 0.63)
- [prom-lib-rate-limiters-and-replay-api — L45](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-45-0) (line 45, col 0, score 0.63)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L130](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-130-0) (line 130, col 0, score 0.59)
- [Promethean Event Bus MVP v0.1 — L572](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-572-0) (line 572, col 0, score 0.63)
- [Stateful Partitions and Rebalancing — L351](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-351-0) (line 351, col 0, score 0.6)
- [Language-Agnostic Mirror System — L507](language-agnostic-mirror-system.md#^ref-d2b3628c-507-0) (line 507, col 0, score 0.71)
- [Chroma-Embedding-Refactor — L282](chroma-embedding-refactor.md#^ref-8b256935-282-0) (line 282, col 0, score 0.64)
- [Pure TypeScript Search Microservice — L227](pure-typescript-search-microservice.md#^ref-d17d3a96-227-0) (line 227, col 0, score 0.71)
- [AI-Centric OS with MCP Layer — L99](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-99-0) (line 99, col 0, score 0.61)
- [smart-chatgpt-thingy — L10](smart-chatgpt-thingy.md#^ref-2facccf8-10-0) (line 10, col 0, score 0.61)
- [refactor-relations — L10](refactor-relations.md#^ref-41ce0216-10-0) (line 10, col 0, score 0.58)
- [graph-ds — L5](graph-ds.md#^ref-6620e2f2-5-0) (line 5, col 0, score 0.6)
- [Performance-Optimized-Polyglot-Bridge — L10](performance-optimized-polyglot-bridge.md#^ref-f5579967-10-0) (line 10, col 0, score 0.67)
- [schema-evolution-workflow — L467](schema-evolution-workflow.md#^ref-d8059b6a-467-0) (line 467, col 0, score 0.6)
- [Per-Domain Policy System for JS Crawler — L184](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-184-0) (line 184, col 0, score 0.65)
- [State Snapshots API and Transactional Projector — L9](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-9-0) (line 9, col 0, score 0.7)
- [WebSocket Gateway Implementation — L56](websocket-gateway-implementation.md#^ref-e811123d-56-0) (line 56, col 0, score 0.58)
- [Event Bus MVP — L284](event-bus-mvp.md#^ref-534fe91d-284-0) (line 284, col 0, score 0.62)
- [Event Bus MVP — L99](event-bus-mvp.md#^ref-534fe91d-99-0) (line 99, col 0, score 0.62)
- [universal-intention-code-fabric — L277](universal-intention-code-fabric.md#^ref-c14edce7-277-0) (line 277, col 0, score 0.7)
- [TypeScript Patch for Tool Calling Support — L35](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-35-0) (line 35, col 0, score 0.67)
- [js-to-lisp-reverse-compiler — L13](js-to-lisp-reverse-compiler.md#^ref-58191024-13-0) (line 13, col 0, score 0.67)
- [Refactor Frontmatter Processing — L11](refactor-frontmatter-processing.md#^ref-cfbdca2f-11-0) (line 11, col 0, score 0.67)
- [universal-intention-code-fabric — L252](universal-intention-code-fabric.md#^ref-c14edce7-252-0) (line 252, col 0, score 0.69)
- [TypeScript Patch for Tool Calling Support — L67](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-67-0) (line 67, col 0, score 0.69)
- [Promethean Agent DSL TS Scaffold — L747](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-747-0) (line 747, col 0, score 0.65)
- [ripple-propagation-demo — L36](ripple-propagation-demo.md#^ref-8430617b-36-0) (line 36, col 0, score 0.6)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L132](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-132-0) (line 132, col 0, score 0.59)
- [Lispy Macros with syntax-rules — L9](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-9-0) (line 9, col 0, score 0.59)
- [Per-Domain Policy System for JS Crawler — L461](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-461-0) (line 461, col 0, score 0.58)
- [WebSocket Gateway Implementation — L219](websocket-gateway-implementation.md#^ref-e811123d-219-0) (line 219, col 0, score 0.58)
- [Pure TypeScript Search Microservice — L468](pure-typescript-search-microservice.md#^ref-d17d3a96-468-0) (line 468, col 0, score 0.85)
- [api-gateway-versioning — L79](api-gateway-versioning.md#^ref-0580dcd3-79-0) (line 79, col 0, score 0.62)
- [schema-evolution-workflow — L393](schema-evolution-workflow.md#^ref-d8059b6a-393-0) (line 393, col 0, score 0.62)
- [plan-update-confirmation — L585](plan-update-confirmation.md#^ref-b22d79c6-585-0) (line 585, col 0, score 0.62)
- [Promethean Event Bus MVP v0.1 — L143](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-143-0) (line 143, col 0, score 0.61)
- [observability-infrastructure-setup — L96](observability-infrastructure-setup.md#^ref-b4e64f8c-96-0) (line 96, col 0, score 0.61)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L108](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-108-0) (line 108, col 0, score 0.6)
- [schema-evolution-workflow — L29](schema-evolution-workflow.md#^ref-d8059b6a-29-0) (line 29, col 0, score 0.6)
- [Promethean-Copilot-Intent-Engine — L30](promethean-copilot-intent-engine.md#^ref-ae24a280-30-0) (line 30, col 0, score 0.65)
- [Promethean Documentation Pipeline Overview — L16](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-16-0) (line 16, col 0, score 0.67)
- [api-gateway-versioning — L277](api-gateway-versioning.md#^ref-0580dcd3-277-0) (line 277, col 0, score 0.65)
- [Promethean Infrastructure Setup — L554](promethean-infrastructure-setup.md#^ref-6deed6ac-554-0) (line 554, col 0, score 0.65)
- [Pure TypeScript Search Microservice — L6](pure-typescript-search-microservice.md#^ref-d17d3a96-6-0) (line 6, col 0, score 0.64)
- [AI-Centric OS with MCP Layer — L33](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-33-0) (line 33, col 0, score 0.62)
- [Dynamic Context Model for Web Components — L78](dynamic-context-model-for-web-components.md#^ref-f7702bf8-78-0) (line 78, col 0, score 0.62)
- [Voice Access Layer Design — L96](voice-access-layer-design.md#^ref-543ed9b3-96-0) (line 96, col 0, score 0.62)
- [api-gateway-versioning — L270](api-gateway-versioning.md#^ref-0580dcd3-270-0) (line 270, col 0, score 0.61)
- [Dynamic Context Model for Web Components — L165](dynamic-context-model-for-web-components.md#^ref-f7702bf8-165-0) (line 165, col 0, score 0.6)
- [Promethean-native config design — L50](promethean-native-config-design.md#^ref-ab748541-50-0) (line 50, col 0, score 0.58)
- [sibilant-metacompiler-overview — L42](sibilant-metacompiler-overview.md#^ref-61d4086b-42-0) (line 42, col 0, score 0.55)
- [Prompt_Folder_Bootstrap — L105](prompt-folder-bootstrap.md#^ref-bd4f0976-105-0) (line 105, col 0, score 0.5)
- [Self-Agency in AI Interaction — L7](self-agency-in-ai-interaction.md#^ref-49a9a860-7-0) (line 7, col 0, score 0.49)
- [Vectorial Exception Descent — L142](vectorial-exception-descent.md#^ref-d771154e-142-0) (line 142, col 0, score 0.49)
- [Prompt_Folder_Bootstrap — L68](prompt-folder-bootstrap.md#^ref-bd4f0976-68-0) (line 68, col 0, score 0.49)
- [Prompt_Folder_Bootstrap — L174](prompt-folder-bootstrap.md#^ref-bd4f0976-174-0) (line 174, col 0, score 0.49)
- [universal-intention-code-fabric — L23](universal-intention-code-fabric.md#^ref-c14edce7-23-0) (line 23, col 0, score 0.49)
- [prom-lib-rate-limiters-and-replay-api — L367](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-367-0) (line 367, col 0, score 0.48)
- [prompt-programming-language-lisp — L64](prompt-programming-language-lisp.md#^ref-d41a06d1-64-0) (line 64, col 0, score 0.48)
- [Pure TypeScript Search Microservice — L515](pure-typescript-search-microservice.md#^ref-d17d3a96-515-0) (line 515, col 0, score 0.71)
- [Stateful Partitions and Rebalancing — L516](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-516-0) (line 516, col 0, score 0.7)
- [universal-intention-code-fabric — L26](universal-intention-code-fabric.md#^ref-c14edce7-26-0) (line 26, col 0, score 0.67)
- [Promethean-Copilot-Intent-Engine — L10](promethean-copilot-intent-engine.md#^ref-ae24a280-10-0) (line 10, col 0, score 0.67)
- [Migrate to Provider-Tenant Architecture — L160](migrate-to-provider-tenant-architecture.md#^ref-54382370-160-0) (line 160, col 0, score 0.67)
- [Dynamic Context Model for Web Components — L80](dynamic-context-model-for-web-components.md#^ref-f7702bf8-80-0) (line 80, col 0, score 0.65)
- [Agent Reflections and Prompt Evolution — L101](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-101-0) (line 101, col 0, score 0.65)
- [Dynamic Context Model for Web Components — L36](dynamic-context-model-for-web-components.md#^ref-f7702bf8-36-0) (line 36, col 0, score 0.65)
- [State Snapshots API and Transactional Projector — L83](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-83-0) (line 83, col 0, score 0.64)
- [Docops Feature Updates — L13](docops-feature-updates.md#^ref-2792d448-13-0) (line 13, col 0, score 0.64)
- [Promethean Documentation Pipeline Overview — L63](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-63-0) (line 63, col 0, score 0.63)
- [Migrate to Provider-Tenant Architecture — L255](migrate-to-provider-tenant-architecture.md#^ref-54382370-255-0) (line 255, col 0, score 0.63)
- [Agent Tasks: Persistence Migration to DualStore — L120](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-120-0) (line 120, col 0, score 0.62)
- [unique-templates — L3](templates/unique-templates.md#^ref-c26f0044-3-0) (line 3, col 0, score 0.61)
- [Promethean Web UI Setup — L581](promethean-web-ui-setup.md#^ref-bc5172ca-581-0) (line 581, col 0, score 0.9)
- [Promethean Infrastructure Setup — L501](promethean-infrastructure-setup.md#^ref-6deed6ac-501-0) (line 501, col 0, score 0.82)
- [Promethean Pipelines — L58](promethean-pipelines.md#^ref-8b8e6103-58-0) (line 58, col 0, score 0.77)
- [Promethean Pipelines: Local TypeScript-First Workflow — L219](promethean-pipelines-local-typescript-first-workflow.md#^ref-6b63edca-219-0) (line 219, col 0, score 0.75)
- [archetype-ecs — L423](archetype-ecs.md#^ref-8f4c1e86-423-0) (line 423, col 0, score 0.74)
- [Language-Agnostic Mirror System — L11](language-agnostic-mirror-system.md#^ref-d2b3628c-11-0) (line 11, col 0, score 0.73)
- [ecs-scheduler-and-prefabs — L352](ecs-scheduler-and-prefabs.md#^ref-c62a1815-352-0) (line 352, col 0, score 0.72)
- [System Scheduler with Resource-Aware DAG — L350](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-350-0) (line 350, col 0, score 0.72)
- [Duck's Attractor States — L5](ducks-attractor-states.md#^ref-13951643-5-0) (line 5, col 0, score 0.71)
- [Promethean Event Bus MVP v0.1 — L832](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-832-0) (line 832, col 0, score 0.7)
- [Ghostly Smoke Interference — L11](ghostly-smoke-interference.md#^ref-b6ae7dfa-11-0) (line 11, col 0, score 0.7)
- [Dynamic Context Model for Web Components — L51](dynamic-context-model-for-web-components.md#^ref-f7702bf8-51-0) (line 51, col 0, score 0.7)
- [compiler-kit-foundations — L15](compiler-kit-foundations.md#^ref-01b21543-15-0) (line 15, col 0, score 0.69)
- [Fnord Tracer Protocol — L99](fnord-tracer-protocol.md#^ref-fc21f824-99-0) (line 99, col 0, score 0.69)
- [Promethean Agent Config DSL — L239](promethean-agent-config-dsl.md#^ref-2c00ce45-239-0) (line 239, col 0, score 0.69)
- [universal-intention-code-fabric — L9](universal-intention-code-fabric.md#^ref-c14edce7-9-0) (line 9, col 0, score 0.68)
- [Local-Offline-Model-Deployment-Strategy — L25](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-25-0) (line 25, col 0, score 0.7)
- [Voice Access Layer Design — L102](voice-access-layer-design.md#^ref-543ed9b3-102-0) (line 102, col 0, score 0.62)
- [Local-Offline-Model-Deployment-Strategy — L16](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-16-0) (line 16, col 0, score 0.64)
- [Local-Offline-Model-Deployment-Strategy — L23](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-23-0) (line 23, col 0, score 0.63)
- [Provider-Agnostic Chat Panel Implementation — L223](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-223-0) (line 223, col 0, score 0.61)
- [Local-Offline-Model-Deployment-Strategy — L248](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-248-0) (line 248, col 0, score 0.62)
- [Functional Embedding Pipeline Refactor — L24](functional-embedding-pipeline-refactor.md#^ref-a4a25141-24-0) (line 24, col 0, score 0.61)
- [Local-Offline-Model-Deployment-Strategy — L1](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-1-0) (line 1, col 0, score 0.61)
- [Functional Embedding Pipeline Refactor — L302](functional-embedding-pipeline-refactor.md#^ref-a4a25141-302-0) (line 302, col 0, score 0.61)
- [Migrate to Provider-Tenant Architecture — L96](migrate-to-provider-tenant-architecture.md#^ref-54382370-96-0) (line 96, col 0, score 0.61)
- [Promethean Event Bus MVP v0.1 — L94](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-94-0) (line 94, col 0, score 0.74)
- [homeostasis-decay-formulas — L126](homeostasis-decay-formulas.md#^ref-37b5d236-126-0) (line 126, col 0, score 0.61)
- [Dynamic Context Model for Web Components — L331](dynamic-context-model-for-web-components.md#^ref-f7702bf8-331-0) (line 331, col 0, score 0.62)
- [Promethean-native config design — L31](promethean-native-config-design.md#^ref-ab748541-31-0) (line 31, col 0, score 0.62)
- [Promethean-native config design — L32](promethean-native-config-design.md#^ref-ab748541-32-0) (line 32, col 0, score 0.6)
- [Admin Dashboard for User Management — L19](admin-dashboard-for-user-management.md#^ref-2901a3e9-19-0) (line 19, col 0, score 0.69)
- [Migrate to Provider-Tenant Architecture — L24](migrate-to-provider-tenant-architecture.md#^ref-54382370-24-0) (line 24, col 0, score 0.67)
- [Promethean Web UI Setup — L574](promethean-web-ui-setup.md#^ref-bc5172ca-574-0) (line 574, col 0, score 0.67)
- [WebSocket Gateway Implementation — L52](websocket-gateway-implementation.md#^ref-e811123d-52-0) (line 52, col 0, score 0.65)
- [Mongo Outbox Implementation — L535](mongo-outbox-implementation.md#^ref-9c1acd1e-535-0) (line 535, col 0, score 0.64)
- [Migrate to Provider-Tenant Architecture — L73](migrate-to-provider-tenant-architecture.md#^ref-54382370-73-0) (line 73, col 0, score 0.64)
- [AI-Centric OS with MCP Layer — L376](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-376-0) (line 376, col 0, score 0.63)
- [Migrate to Provider-Tenant Architecture — L69](migrate-to-provider-tenant-architecture.md#^ref-54382370-69-0) (line 69, col 0, score 0.63)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L492](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-492-0) (line 492, col 0, score 0.63)
- [AI-Centric OS with MCP Layer — L11](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-11-0) (line 11, col 0, score 0.69)
- [schema-evolution-workflow — L3](schema-evolution-workflow.md#^ref-d8059b6a-3-0) (line 3, col 0, score 0.67)
- [ecs-offload-workers — L435](ecs-offload-workers.md#^ref-6498b9d7-435-0) (line 435, col 0, score 0.66)
- [Promethean Documentation Pipeline Overview — L154](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-154-0) (line 154, col 0, score 0.66)
- [State Snapshots API and Transactional Projector — L3](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-3-0) (line 3, col 0, score 0.64)
- [Promethean Agent Config DSL — L11](promethean-agent-config-dsl.md#^ref-2c00ce45-11-0) (line 11, col 0, score 0.64)
- [Lispy Macros with syntax-rules — L388](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-388-0) (line 388, col 0, score 0.64)
- [Voice Access Layer Design — L87](voice-access-layer-design.md#^ref-543ed9b3-87-0) (line 87, col 0, score 0.67)
- [Stateful Partitions and Rebalancing — L513](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-513-0) (line 513, col 0, score 0.67)
- [Dynamic Context Model for Web Components — L313](dynamic-context-model-for-web-components.md#^ref-f7702bf8-313-0) (line 313, col 0, score 0.66)
- [Promethean Web UI Setup — L598](promethean-web-ui-setup.md#^ref-bc5172ca-598-0) (line 598, col 0, score 0.66)
- [Lispy Macros with syntax-rules — L1](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-1-0) (line 1, col 0, score 0.66)
- [Chroma-Embedding-Refactor — L250](chroma-embedding-refactor.md#^ref-8b256935-250-0) (line 250, col 0, score 0.66)
- [Dynamic Context Model for Web Components — L151](dynamic-context-model-for-web-components.md#^ref-f7702bf8-151-0) (line 151, col 0, score 0.66)
- [Lisp-Compiler-Integration — L521](lisp-compiler-integration.md#^ref-cfee6d36-521-0) (line 521, col 0, score 0.65)
- [api-gateway-versioning — L295](api-gateway-versioning.md#^ref-0580dcd3-295-0) (line 295, col 0, score 1)
- [eidolon-field-math-foundations — L166](eidolon-field-math-foundations.md#^ref-008f2ac0-166-0) (line 166, col 0, score 1)
- [Local-Offline-Model-Deployment-Strategy — L293](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-293-0) (line 293, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L307](migrate-to-provider-tenant-architecture.md#^ref-54382370-307-0) (line 307, col 0, score 1)
- [observability-infrastructure-setup — L364](observability-infrastructure-setup.md#^ref-b4e64f8c-364-0) (line 364, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L492](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-492-0) (line 492, col 0, score 1)
- [api-gateway-versioning — L282](api-gateway-versioning.md#^ref-0580dcd3-282-0) (line 282, col 0, score 1)
- [archetype-ecs — L470](archetype-ecs.md#^ref-8f4c1e86-470-0) (line 470, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L201](chroma-toolkit-consolidation-plan.md#^ref-5020e892-201-0) (line 201, col 0, score 1)
- [Dynamic Context Model for Web Components — L382](dynamic-context-model-for-web-components.md#^ref-f7702bf8-382-0) (line 382, col 0, score 1)
- [ecs-offload-workers — L456](ecs-offload-workers.md#^ref-6498b9d7-456-0) (line 456, col 0, score 1)
- [ecs-scheduler-and-prefabs — L390](ecs-scheduler-and-prefabs.md#^ref-c62a1815-390-0) (line 390, col 0, score 1)
- [eidolon-field-math-foundations — L125](eidolon-field-math-foundations.md#^ref-008f2ac0-125-0) (line 125, col 0, score 1)
- [i3-config-validation-methods — L61](i3-config-validation-methods.md#^ref-d28090ac-61-0) (line 61, col 0, score 1)
- [observability-infrastructure-setup — L360](observability-infrastructure-setup.md#^ref-b4e64f8c-360-0) (line 360, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L163](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-163-0) (line 163, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L472](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-472-0) (line 472, col 0, score 1)
- [api-gateway-versioning — L293](api-gateway-versioning.md#^ref-0580dcd3-293-0) (line 293, col 0, score 1)
- [eidolon-field-math-foundations — L168](eidolon-field-math-foundations.md#^ref-008f2ac0-168-0) (line 168, col 0, score 1)
- [i3-config-validation-methods — L75](i3-config-validation-methods.md#^ref-d28090ac-75-0) (line 75, col 0, score 1)
- [Local-Only-LLM-Workflow — L200](local-only-llm-workflow.md#^ref-9a8ab57e-200-0) (line 200, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L325](migrate-to-provider-tenant-architecture.md#^ref-54382370-325-0) (line 325, col 0, score 1)
- [observability-infrastructure-setup — L377](observability-infrastructure-setup.md#^ref-b4e64f8c-377-0) (line 377, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L475](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-475-0) (line 475, col 0, score 1)
- [Promethean Full-Stack Docker Setup — L434](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-434-0) (line 434, col 0, score 1)
- [api-gateway-versioning — L286](api-gateway-versioning.md#^ref-0580dcd3-286-0) (line 286, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L44](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-44-0) (line 44, col 0, score 1)
- [Dynamic Context Model for Web Components — L410](dynamic-context-model-for-web-components.md#^ref-f7702bf8-410-0) (line 410, col 0, score 1)
- [observability-infrastructure-setup — L373](observability-infrastructure-setup.md#^ref-b4e64f8c-373-0) (line 373, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L65](promethean-copilot-intent-engine.md#^ref-ae24a280-65-0) (line 65, col 0, score 1)
- [Promethean Full-Stack Docker Setup — L438](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-438-0) (line 438, col 0, score 1)
- [Promethean Infrastructure Setup — L582](promethean-infrastructure-setup.md#^ref-6deed6ac-582-0) (line 582, col 0, score 1)
- [Promethean Web UI Setup — L601](promethean-web-ui-setup.md#^ref-bc5172ca-601-0) (line 601, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L149](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-149-0) (line 149, col 0, score 1)
- [eidolon-field-math-foundations — L155](eidolon-field-math-foundations.md#^ref-008f2ac0-155-0) (line 155, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L309](migrate-to-provider-tenant-architecture.md#^ref-54382370-309-0) (line 309, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L469](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-469-0) (line 469, col 0, score 1)
- [Promethean Full-Stack Docker Setup — L440](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-440-0) (line 440, col 0, score 1)
- [Promethean Infrastructure Setup — L578](promethean-infrastructure-setup.md#^ref-6deed6ac-578-0) (line 578, col 0, score 1)
- [Promethean Web UI Setup — L605](promethean-web-ui-setup.md#^ref-bc5172ca-605-0) (line 605, col 0, score 1)
- [Prometheus Observability Stack — L507](prometheus-observability-stack.md#^ref-e90b5a16-507-0) (line 507, col 0, score 1)
- [zero-copy-snapshots-and-workers — L363](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-363-0) (line 363, col 0, score 1)
- [Simulation Demo — L32](chunks/simulation-demo.md#^ref-557309a3-32-0) (line 32, col 0, score 1)
- [Tooling — L26](chunks/tooling.md#^ref-6cb4943e-26-0) (line 26, col 0, score 1)
- [Window Management — L36](chunks/window-management.md#^ref-9e8ae388-36-0) (line 36, col 0, score 1)
- [compiler-kit-foundations — L639](compiler-kit-foundations.md#^ref-01b21543-639-0) (line 639, col 0, score 1)
- [Creative Moments — L10](creative-moments.md#^ref-10d98225-10-0) (line 10, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L258](cross-language-runtime-polymorphism.md#^ref-c34c36a6-258-0) (line 258, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L215](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-215-0) (line 215, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L50](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-50-0) (line 50, col 0, score 1)
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
- [AI-Centric OS with MCP Layer — L401](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-401-0) (line 401, col 0, score 1)
- [api-gateway-versioning — L296](api-gateway-versioning.md#^ref-0580dcd3-296-0) (line 296, col 0, score 1)
- [i3-bluetooth-setup — L110](i3-bluetooth-setup.md#^ref-5e408692-110-0) (line 110, col 0, score 1)
- [Local-Offline-Model-Deployment-Strategy — L291](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-291-0) (line 291, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L279](migrate-to-provider-tenant-architecture.md#^ref-54382370-279-0) (line 279, col 0, score 1)
- [Mongo Outbox Implementation — L574](mongo-outbox-implementation.md#^ref-9c1acd1e-574-0) (line 574, col 0, score 1)
- [observability-infrastructure-setup — L359](observability-infrastructure-setup.md#^ref-b4e64f8c-359-0) (line 359, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L477](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-477-0) (line 477, col 0, score 1)
- [field-node-diagram-outline — L111](field-node-diagram-outline.md#^ref-1f32c94a-111-0) (line 111, col 0, score 1)
- [field-node-diagram-set — L144](field-node-diagram-set.md#^ref-22b989d5-144-0) (line 144, col 0, score 1)
- [field-node-diagram-visualizations — L94](field-node-diagram-visualizations.md#^ref-e9b27b06-94-0) (line 94, col 0, score 1)
- [Fnord Tracer Protocol — L258](fnord-tracer-protocol.md#^ref-fc21f824-258-0) (line 258, col 0, score 1)
- [graph-ds — L398](graph-ds.md#^ref-6620e2f2-398-0) (line 398, col 0, score 1)
- [heartbeat-fragment-demo — L110](heartbeat-fragment-demo.md#^ref-dd00677a-110-0) (line 110, col 0, score 1)
- [heartbeat-simulation-snippets — L99](heartbeat-simulation-snippets.md#^ref-23e221e9-99-0) (line 99, col 0, score 1)
- [homeostasis-decay-formulas — L151](homeostasis-decay-formulas.md#^ref-37b5d236-151-0) (line 151, col 0, score 1)
- [i3-bluetooth-setup — L119](i3-bluetooth-setup.md#^ref-5e408692-119-0) (line 119, col 0, score 1)
- [Chroma-Embedding-Refactor — L328](chroma-embedding-refactor.md#^ref-8b256935-328-0) (line 328, col 0, score 1)
- [Diagrams — L46](chunks/diagrams.md#^ref-45cd25b5-46-0) (line 46, col 0, score 1)
- [i3-config-validation-methods — L53](i3-config-validation-methods.md#^ref-d28090ac-53-0) (line 53, col 0, score 1)
- [Local-Only-LLM-Workflow — L180](local-only-llm-workflow.md#^ref-9a8ab57e-180-0) (line 180, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L276](migrate-to-provider-tenant-architecture.md#^ref-54382370-276-0) (line 276, col 0, score 1)
- [observability-infrastructure-setup — L376](observability-infrastructure-setup.md#^ref-b4e64f8c-376-0) (line 376, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L89](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-89-0) (line 89, col 0, score 1)
- [Promethean Agent Config DSL — L358](promethean-agent-config-dsl.md#^ref-2c00ce45-358-0) (line 358, col 0, score 1)
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
- [AI-Centric OS with MCP Layer — L407](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-407-0) (line 407, col 0, score 1)
- [api-gateway-versioning — L284](api-gateway-versioning.md#^ref-0580dcd3-284-0) (line 284, col 0, score 1)
- [Services — L21](chunks/services.md#^ref-75ea4a6a-21-0) (line 21, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L43](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-43-0) (line 43, col 0, score 1)
- [Dynamic Context Model for Web Components — L407](dynamic-context-model-for-web-components.md#^ref-f7702bf8-407-0) (line 407, col 0, score 1)
- [ecs-offload-workers — L478](ecs-offload-workers.md#^ref-6498b9d7-478-0) (line 478, col 0, score 1)
- [eidolon-field-math-foundations — L167](eidolon-field-math-foundations.md#^ref-008f2ac0-167-0) (line 167, col 0, score 1)
- [i3-bluetooth-setup — L123](i3-bluetooth-setup.md#^ref-5e408692-123-0) (line 123, col 0, score 1)
- [i3-config-validation-methods — L78](i3-config-validation-methods.md#^ref-d28090ac-78-0) (line 78, col 0, score 1)
- [Local-Offline-Model-Deployment-Strategy — L295](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-295-0) (line 295, col 0, score 1)
- [Pure TypeScript Search Microservice — L538](pure-typescript-search-microservice.md#^ref-d17d3a96-538-0) (line 538, col 0, score 1)
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
- [Agent Tasks: Persistence Migration to DualStore — L130](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-130-0) (line 130, col 0, score 1)
- [api-gateway-versioning — L303](api-gateway-versioning.md#^ref-0580dcd3-303-0) (line 303, col 0, score 1)
- [Chroma-Embedding-Refactor — L327](chroma-embedding-refactor.md#^ref-8b256935-327-0) (line 327, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L174](chroma-toolkit-consolidation-plan.md#^ref-5020e892-174-0) (line 174, col 0, score 1)
- [eidolon-field-math-foundations — L134](eidolon-field-math-foundations.md#^ref-008f2ac0-134-0) (line 134, col 0, score 1)
- [i3-config-validation-methods — L82](i3-config-validation-methods.md#^ref-d28090ac-82-0) (line 82, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L267](migrate-to-provider-tenant-architecture.md#^ref-54382370-267-0) (line 267, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L391](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-391-0) (line 391, col 0, score 1)
- [Promethean Agent Config DSL — L333](promethean-agent-config-dsl.md#^ref-2c00ce45-333-0) (line 333, col 0, score 1)
- [2d-sandbox-field — L225](2d-sandbox-field.md#^ref-c710dc93-225-0) (line 225, col 0, score 1)
- [Admin Dashboard for User Management — L49](admin-dashboard-for-user-management.md#^ref-2901a3e9-49-0) (line 49, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L150](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-150-0) (line 150, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L163](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-163-0) (line 163, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L9](ai-first-os-model-context-protocol.md#^ref-618198f4-9-0) (line 9, col 0, score 1)
- [aionian-circuit-math — L179](aionian-circuit-math.md#^ref-f2d83a77-179-0) (line 179, col 0, score 1)
- [api-gateway-versioning — L304](api-gateway-versioning.md#^ref-0580dcd3-304-0) (line 304, col 0, score 1)
- [archetype-ecs — L479](archetype-ecs.md#^ref-8f4c1e86-479-0) (line 479, col 0, score 1)
- [balanced-bst — L295](balanced-bst.md#^ref-d3e7db72-295-0) (line 295, col 0, score 1)
- [Exception Layer Analysis — L172](exception-layer-analysis.md#^ref-21d5cc09-172-0) (line 172, col 0, score 1)
- [field-dynamics-math-blocks — L154](field-dynamics-math-blocks.md#^ref-7cfc230d-154-0) (line 154, col 0, score 1)
- [field-interaction-equations — L164](field-interaction-equations.md#^ref-b09141b7-164-0) (line 164, col 0, score 1)
- [field-node-diagram-outline — L120](field-node-diagram-outline.md#^ref-1f32c94a-120-0) (line 120, col 0, score 1)
- [field-node-diagram-set — L149](field-node-diagram-set.md#^ref-22b989d5-149-0) (line 149, col 0, score 1)
- [field-node-diagram-visualizations — L99](field-node-diagram-visualizations.md#^ref-e9b27b06-99-0) (line 99, col 0, score 1)
- [graph-ds — L365](graph-ds.md#^ref-6620e2f2-365-0) (line 365, col 0, score 1)
- [heartbeat-fragment-demo — L111](heartbeat-fragment-demo.md#^ref-dd00677a-111-0) (line 111, col 0, score 1)
- [heartbeat-simulation-snippets — L101](heartbeat-simulation-snippets.md#^ref-23e221e9-101-0) (line 101, col 0, score 1)
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
- [Agent Tasks: Persistence Migration to DualStore — L181](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-181-0) (line 181, col 0, score 1)
- [AI-Centric OS with MCP Layer — L429](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-429-0) (line 429, col 0, score 1)
- [api-gateway-versioning — L317](api-gateway-versioning.md#^ref-0580dcd3-317-0) (line 317, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L186](chroma-toolkit-consolidation-plan.md#^ref-5020e892-186-0) (line 186, col 0, score 1)
- [Dynamic Context Model for Web Components — L433](dynamic-context-model-for-web-components.md#^ref-f7702bf8-433-0) (line 433, col 0, score 1)
- [Event Bus MVP — L555](event-bus-mvp.md#^ref-534fe91d-555-0) (line 555, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L150](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-150-0) (line 150, col 0, score 1)
- [Local-Offline-Model-Deployment-Strategy — L290](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-290-0) (line 290, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L298](migrate-to-provider-tenant-architecture.md#^ref-54382370-298-0) (line 298, col 0, score 1)
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
- [AI-Centric OS with MCP Layer — L408](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-408-0) (line 408, col 0, score 1)
- [api-gateway-versioning — L316](api-gateway-versioning.md#^ref-0580dcd3-316-0) (line 316, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L213](chroma-toolkit-consolidation-plan.md#^ref-5020e892-213-0) (line 213, col 0, score 1)
- [Event Bus MVP — L581](event-bus-mvp.md#^ref-534fe91d-581-0) (line 581, col 0, score 1)
- [i3-bluetooth-setup — L101](i3-bluetooth-setup.md#^ref-5e408692-101-0) (line 101, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L178](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-178-0) (line 178, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L303](migrate-to-provider-tenant-architecture.md#^ref-54382370-303-0) (line 303, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L140](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-140-0) (line 140, col 0, score 1)
- [AI-Centric OS with MCP Layer — L406](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-406-0) (line 406, col 0, score 1)
- [api-gateway-versioning — L315](api-gateway-versioning.md#^ref-0580dcd3-315-0) (line 315, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L167](chroma-toolkit-consolidation-plan.md#^ref-5020e892-167-0) (line 167, col 0, score 1)
- [Diagrams — L25](chunks/diagrams.md#^ref-45cd25b5-25-0) (line 25, col 0, score 1)
- [Tooling — L24](chunks/tooling.md#^ref-6cb4943e-24-0) (line 24, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L173](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-173-0) (line 173, col 0, score 1)
- [Dynamic Context Model for Web Components — L390](dynamic-context-model-for-web-components.md#^ref-f7702bf8-390-0) (line 390, col 0, score 1)
- [field-interaction-equations — L159](field-interaction-equations.md#^ref-b09141b7-159-0) (line 159, col 0, score 1)
- [i3-bluetooth-setup — L105](i3-bluetooth-setup.md#^ref-5e408692-105-0) (line 105, col 0, score 1)
- [i3-config-validation-methods — L56](i3-config-validation-methods.md#^ref-d28090ac-56-0) (line 56, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L146](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-146-0) (line 146, col 0, score 1)
- [Local-Offline-Model-Deployment-Strategy — L292](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-292-0) (line 292, col 0, score 1)
- [Local-Only-LLM-Workflow — L188](local-only-llm-workflow.md#^ref-9a8ab57e-188-0) (line 188, col 0, score 1)
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
- [Local-First Intention→Code Loop with Free Models — L154](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-154-0) (line 154, col 0, score 1)
- [Local-Only-LLM-Workflow — L179](local-only-llm-workflow.md#^ref-9a8ab57e-179-0) (line 179, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L304](migrate-to-provider-tenant-architecture.md#^ref-54382370-304-0) (line 304, col 0, score 1)
- [observability-infrastructure-setup — L398](observability-infrastructure-setup.md#^ref-b4e64f8c-398-0) (line 398, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L184](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-184-0) (line 184, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L506](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-506-0) (line 506, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L452](performance-optimized-polyglot-bridge.md#^ref-f5579967-452-0) (line 452, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L527](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-527-0) (line 527, col 0, score 1)
- [Promethean_Eidolon_Synchronicity_Model — L74](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-74-0) (line 74, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L929](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-929-0) (line 929, col 0, score 1)
- [Promethean Infrastructure Setup — L597](promethean-infrastructure-setup.md#^ref-6deed6ac-597-0) (line 597, col 0, score 1)
- [Promethean-native config design — L421](promethean-native-config-design.md#^ref-ab748541-421-0) (line 421, col 0, score 1)
- [promethean-system-diagrams — L217](promethean-system-diagrams.md#^ref-b51e19b4-217-0) (line 217, col 0, score 1)
- [Promethean Web UI Setup — L629](promethean-web-ui-setup.md#^ref-bc5172ca-629-0) (line 629, col 0, score 1)
- [Prompt_Folder_Bootstrap — L193](prompt-folder-bootstrap.md#^ref-bd4f0976-193-0) (line 193, col 0, score 1)
- [prompt-programming-language-lisp — L107](prompt-programming-language-lisp.md#^ref-d41a06d1-107-0) (line 107, col 0, score 1)
- [DuckDuckGoSearchPipeline — L16](duckduckgosearchpipeline.md#^ref-e979c50f-16-0) (line 16, col 0, score 1)
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
