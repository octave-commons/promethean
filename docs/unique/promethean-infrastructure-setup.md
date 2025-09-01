---
uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
created_at: 2025.08.31.12.08.28.md
filename: Promethean Infrastructure Setup
description: >-
  Configures a production-grade infrastructure using Docker Compose with NGINX,
  Ollama, Qdrant, and Tor/Privoxy for secure, JS/TS-only services. All services
  are containerized with minimal dependencies and hidden behind NGINX.
tags:
  - Docker
  - NGINX
  - Ollama
  - Qdrant
  - Tor
  - Privoxy
  - TS
  - API
  - Crawler
  - Embeddings
related_to_title:
  - api-gateway-versioning
  - Dynamic Context Model for Web Components
  - ecs-offload-workers
  - ecs-scheduler-and-prefabs
  - System Scheduler with Resource-Aware DAG
  - markdown-to-org-transpiler
  - Ollama-LLM-Provider-for-Pseudo-Code-Transpiler
  - observability-infrastructure-setup
  - shared-package-layout-clarification
  - eidolon-field-math-foundations
  - RAG UI Panel with Qdrant and PostgREST
  - Local-Only-LLM-Workflow
  - Pure-Node Crawl Stack with Playwright and Crawlee
  - Shared Package Structure
  - Per-Domain Policy System for JS Crawler
  - Chroma Toolkit Consolidation Plan
  - Pure TypeScript Search Microservice
  - Promethean Web UI Setup
  - Prometheus Observability Stack
  - Debugging Broker Connections and Agent Behavior
  - Promethean-native config design
  - Promethean Full-Stack Docker Setup
  - Performance-Optimized-Polyglot-Bridge
  - Promethean Agent DSL TS Scaffold
  - archetype-ecs
  - 'Agent Tasks: Persistence Migration to DualStore'
  - Migrate to Provider-Tenant Architecture
  - Board Walk – 2025-08-11
  - Voice Access Layer Design
  - js-to-lisp-reverse-compiler
  - Cross-Target Macro System in Sibilant
  - JavaScript
  - Local-First Intention→Code Loop with Free Models
  - aionian-circuit-math
  - Math Fundamentals
  - Local-Offline-Model-Deployment-Strategy
  - AI-Centric OS with MCP Layer
  - i3-config-validation-methods
  - Post-Linguistic Transhuman Design Frameworks
  - Admin Dashboard for User Management
  - Mongo Outbox Implementation
  - 'Polyglot S-expr Bridge: Python-JS-Lisp Interop'
  - universal-intention-code-fabric
  - Sibilant Meta-Prompt DSL
related_to_uuid:
  - 0580dcd3-533d-4834-8a2f-eae3771960a9
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
  - c62a1815-c43b-4a3b-88e6-d7fa008a155e
  - ba244286-4e84-425b-8bf6-b80c4eb783fc
  - ab54cdd8-13ce-4dcb-a9cd-da2d86e0305f
  - b362e12e-2802-4e41-9a21-6e0c7ad419a2
  - b4e64f8c-4dc9-4941-a877-646c5ada068e
  - 36c8882a-badc-4e18-838d-2c54d7038141
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - e1056831-ae0c-460b-95fa-4cf09b3398c6
  - 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
  - d527c05d-22e8-4493-8f29-ae3cb67f035b
  - 66a72fc3-4153-41fc-84bd-d6164967a6ff
  - c03020e1-e3e7-48bf-aa7e-aa740c601b63
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - d17d3a96-c84d-4738-a403-6c733b874da2
  - bc5172ca-7a09-42ad-b418-8e42bb14d089
  - e90b5a16-d58f-424d-bd36-70e9bd2861ad
  - 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
  - ab748541-020e-4a7e-b07d-28173bd5bea2
  - 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
  - f5579967-762d-4cfd-851e-4f71b4cb77a1
  - 5158f742-4a3b-466e-bfc3-d83517b64200
  - 8f4c1e86-1236-4936-84ca-6ed7082af6b7
  - 93d2ba51-8689-49ee-94e2-296092e48058
  - 54382370-1931-4a19-a634-46735708a9ea
  - 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
  - 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
  - 58191024-d04a-4520-8aae-a18be7b94263
  - 5f210ca2-54e9-445b-afe4-fb340d4992c5
  - c1618c66-f73a-4e04-9bfa-ef38755f7acc
  - 871490c7-a050-429b-88b2-55dfeaa1f8d5
  - f2d83a77-7f86-4c56-8538-1350167a0c6c
  - c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
  - ad7f1ed3-c9bf-4e85-9eeb-6cc4b53155f3
  - 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
  - d28090ac-f746-4958-aab5-ed1315382c04
  - 6bcff92c-4224-453d-9993-1be8d37d47c3
  - 2901a3e9-96f0-497c-ae2c-775f28a702dd
  - 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
  - 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
  - c14edce7-0656-45b2-aaf3-51f042451b7d
  - af5d2824-faad-476c-a389-e912d9bc672c
references: []
---
Nice—picking it back up. Last we aligned on: **all ports hidden behind NGINX**, **no SaaS/tokens**, **JS/TS-only services**, **Dockerfiles live in `./images/`**, and **infra kept out of source**. We also said to include **Ollama**, **Qdrant** (local vector DB), **Tor (+Privoxy)** for optional crawler routing, a **TS crawler**, a **TS embeddings service** (no Python; `@xenova/transformers`), and a tiny **TS API Gateway** to give you a clean interface. Here’s the concrete drop:

# 📁 File tree (where to put things)

```
/images/
  ts-service.docker
  nginx.docker
/infrastructure/compose/
  stack.yml
  nginx.conf
/services/ts/
  api-gateway/
    package.json
    src/server.ts
  crawler/
    package.json
    src/main.ts
  embeddings/
    package.json
    src/server.ts
/shared/ts/
  package.json
  src/http.ts
  src/clients/ollama.ts
  src/clients/qdrant.ts
  src/clients/crawler.ts
  src/clients/embeddings.ts
```

# 🐳 `./images/ts-service.docker`

```dockerfile
# Minimal, reproducible TS base (no Python)
FROM node:22-slim

ENV NODE_ENV=production \
    PNPM_HOME=/usr/local/share/pnpm \
    PATH=/usr/local/share/pnpm:$PATH

RUN corepack enable && apt-get update && apt-get install -y --no-install-recommends \
      dumb-init ca-certificates tini \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
USER node
# Services copy their own files in their image build (multi-stage or on top of this)
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
```

# 🧰 `./images/nginx.docker`

```dockerfile
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/nginx.conf
```

# 🌐 `./infrastructure/compose/nginx.conf`

```nginx
worker_processes auto;
events { worker_connections 1024; }
http {
  sendfile on;
  upstream api_gateway  { server api-gateway:8080; }
  upstream ollama_up    { server ollama:11434; }
  upstream qdrant_up    { server qdrant:6333; }
  upstream crawler_up   { server crawler:3000; }
  upstream embeds_up    { server embeddings:7070; }

  server {
    listen 80;

    # flat API surface
    location /api/ {
      proxy_pass http://api_gateway/;
      proxy_set_header Host $host;
      proxy_http_version 1.1;
    }

    # direct service mounts (optional; can be hidden behind /api if you prefer)
    location /ollama/   { proxy_pass http://ollama_up/; }
    location /qdrant/   { proxy_pass http://qdrant_up/; }
    location /crawler/  { proxy_pass http://crawler_up/; }
    location /embeddings/ { proxy_pass http://embeds_up/; }
  }
}
```

# 🧩 `./infrastructure/compose/stack.yml`

```yaml
version: "3.9"

networks:
  prom-net: { driver: bridge }

volumes:
  ollama-data:
  qdrant-data:

services:
  nginx:
    build:
      context: ../../
      dockerfile: images/nginx.docker
    image: promethean/nginx:local
    depends_on:
      - api-gateway
    ports:
      - "80:80"            # only exposed host port
    networks: [prom-net]

  ollama:
    image: ollama/ollama:latest
    restart: unless-stopped
    environment:
      - OLLAMA_HOST=0.0.0.0
    volumes:
      - ollama-data:/root/.ollama
    # Optional NVIDIA GPU:
    deploy:
      resources:
        reservations:
          devices:
            - capabilities: ["gpu"]
    networks: [prom-net]

  qdrant:
    image: qdrant/qdrant:latest
    restart: unless-stopped
    volumes:
      - qdrant-data:/qdrant/storage
    networks: [prom-net]

  tor:
    image: dperson/torproxy
    restart: unless-stopped
    networks: [prom-net]

  privoxy:
    image: vimagick/privoxy
    restart: unless-stopped
    environment:
      - FORWARD_SOCKS5=tor:9050
    networks: [prom-net]
    depends_on: [tor]

  crawler:
    build:
      context: ../../
      dockerfile: images/ts-service.docker
    image: promethean/crawler:local
    working_dir: /app
    volumes:
      - ../../services/ts/crawler:/app
    command: ["node", "--enable-source-maps", "dist/main.js"]
    environment:
      - HTTP_PROXY=http://privoxy:8118
      - HTTPS_PROXY=http://privoxy:8118
      - NO_PROXY=nginx,api-gateway,qdrant,ollama,embeddings,localhost,127.0.0.1
    networks: [prom-net]
    depends_on: [privoxy]

  embeddings:
    build:
      context: ../../
      dockerfile: images/ts-service.docker
    image: promethean/embeddings:local
    working_dir: /app
    volumes:
      - ../../services/ts/embeddings:/app
    command: ["node", "--enable-source-maps", "dist/server.js"]
    environment:
      - MODEL_ID=${MODEL_ID:-Xenova/nomic-embed-text-v1.5}
      # Alternative CLIP: "Xenova/clip-vit-large-patch14"
    networks: [prom-net]

  api-gateway:
    build:
      context: ../../
      dockerfile: images/ts-service.docker
    image: promethean/api-gateway:local
    working_dir: /app
    volumes:
      - ../../services/ts/api-gateway:/app
    command: ["node", "--enable-source-maps", "dist/server.js"]
    environment:
      - UPSTREAM_OLLAMA=http://ollama:11434
      - UPSTREAM_QDRANT=http://qdrant:6333
      - UPSTREAM_CRAWLER=http://crawler:3000
      - UPSTREAM_EMBEDDINGS=http://embeddings:7070
    depends_on: [ollama, qdrant]
    networks: [prom-net]
```

# 🧪 `services/ts/api-gateway/package.json`

```json
{
  "name": "api-gateway",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc -p .",
    "start": "node dist/server.js"
  },
  "dependencies": {
    "hono": "^4.5.7",
    "undici": "^6.19.8",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "tsx": "^4.19.2",
    "typescript": "^5.5.4"
  }
}
```

# 🔌 `services/ts/api-gateway/src/server.ts`

```typescript
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { fetch as f } from 'undici'

const app = new Hono()

const OLLAMA = process.env.UPSTREAM_OLLAMA!
const QDRANT = process.env.UPSTREAM_QDRANT!
const CRAWLER = process.env.UPSTREAM_CRAWLER!
const EMBEDS = process.env.UPSTREAM_EMBEDDINGS!

app.get('/health', c => c.json({ ok: true }))

// Example: proxy chat to Ollama
app.post('/llm/chat', async (c) => {
  const body = await c.req.json()
  const r = await f(`${OLLAMA}/api/chat`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' }
  })
  return c.newResponse(r.body, r)
})

// Example: embeddings
app.post('/embeddings', async (c) => {
  const body = await c.req.json()
  const r = await f(`${EMBEDS}/embeddings`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' }
  })
  return c.newResponse(r.body, r)
})

// Example: vector upsert to Qdrant
app.post('/vectors/upsert', async (c) => {
  const body = await c.req.json()
  const r = await f(`${QDRANT}/collections/${body.collection}/points?wait=true`, {
    method: 'PUT',
    body: JSON.stringify({ points: body.points }),
    headers: { 'content-type': 'application/json' }
  })
  return c.newResponse(r.body, r)
})

// Example: crawl
app.post('/crawl', async (c) => {
  const body = await c.req.json()
  const r = await f(`${CRAWLER}/crawl`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' }
  })
  return c.newResponse(r.body, r)
})

serve({ fetch: app.fetch, port: 8080 })
```

# 🕷️ `services/ts/crawler/package.json`

```json
{
  "name": "crawler",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/main.ts",
    "build": "tsc -p .",
    "start": "node dist/main.js"
  },
  "dependencies": {
    "got": "^14.4.2",
    "cheerio": "^1.0.0-rc.12",
    "hono": "^4.5.7"
  },
  "devDependencies": {
    "tsx": "^4.19.2",
    "typescript": "^5.5.4"
  }
}
```

# 🌐 `services/ts/crawler/src/main.ts`

```ts
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import got from 'got'
import * as cheerio from 'cheerio'

const app = new Hono()

app.post('/crawl', async (c) => {
  const { url } = await c.req.json() as { url: string }
  const html = await got(url, { timeout: { request: 15000 } }).text()
  const $ = cheerio.load(html)

  const title = $('title').first().text()
  const text = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 20000)

  return c.json({ url, title, text })
})

serve({ fetch: app.fetch, port: 3000 })
```

# 🧠 `services/ts/embeddings/package.json`

```json
{
  "name": "embeddings",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc -p .",
    "start": "node dist/server.js"
  },
  "dependencies": {
    "@xenova/transformers": "^2.17.2",
    "hono": "^4.5.7"
  },
  "devDependencies": {
    "tsx": "^4.19.2",
    "typescript": "^5.5.4"
  }
}
```

# 🔡 `services/ts/embeddings/src/server.ts`

```ts
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { pipeline } from '@xenova/transformers'

const MODEL_ID = process.env.MODEL_ID || 'Xenova/nomic-embed-text-v1.5'

let embedder: any
async function getEmbedder() {
  if (!embedder) {
    embedder = await pipeline('feature-extraction', MODEL_ID)
  }
  return embedder
}

const app = new Hono()

app.post('/embeddings', async (c) => {
  const { input } = await c.req.json() as { input: string[] | string }
  const run = await getEmbedder()
  const arr = Array.isArray(input) ? input : [input]
  const outputs = await Promise.all(arr.map(async (t) => (await run(t)).data))
  return c.json({ embeddings: outputs })
})

serve({ fetch: app.fetch, port: 7070 })
```

# 🧱 Shared TS interface (SDK)

> Note: per your rule, imports should look like `@shared/ts/dist/...` after build. Here I show source; your build should output to `@shared/ts/dist/...`.

## `shared/ts/package.json`

```json
{
  "name": "@shared/ts",
  "type": "module",
  "private": true,
  "exports": {
    "./dist/*": "./dist/*"
  },
  "scripts": {
    "build": "tsc -p ."
  },
  "devDependencies": {
    "typescript": "^5.5.4",
    "zod": "^3.23.8"
  },
  "dependencies": {
    "undici": "^6.19.8"
  }
}
```

## `shared/ts/src/http.ts`

```ts
import { fetch } from 'undici'

export async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { 'content-type': 'application/json', ...(init?.headers || {}) }
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`)
  }
  return res.json() as Promise<T>
}

export const api = (base = '') => ({
  get:  <T>(p: string) => jsonFetch<T>(base + p),
  post: <T>(p: string, body: unknown) =>
    jsonFetch<T>(base + p, { method: 'POST', body: JSON.stringify(body) }),
})
```

## `shared/ts/src/clients/ollama.ts`

```ts
import { api } from '../http.js'

export type ChatMsg = { role: 'system' | 'user' | 'assistant'; content: string }
export type ChatReq = { model: string; messages: ChatMsg[] }
export type ChatResp = { message: ChatMsg; done: boolean }

export const createOllamaClient = (base = '/api') => {
  const a = api(base)
  return {
    chat: (req: ChatReq) => a.post<ChatResp>('/llm/chat', req)
  }
}
```

## `shared/ts/src/clients/qdrant.ts`

```ts
import { api } from '../http.js'
type Point = { id: string | number; vector: number[]; payload?: Record<string, unknown> }

export const createQdrantClient = (base = '/api') => {
  const a = api(base)
  return {
    upsert: (collection: string, points: Point[]) =>
      a.post(`/vectors/upsert`, { collection, points })
  }
}
```

## `shared/ts/src/clients/crawler.ts`

```ts
import { api } from '../http.js'
export type CrawlResult = { url: string; title: string; text: string }

export const createCrawlerClient = (base = '/api') => {
  const a = api(base)
  return {
    crawl: (url: string) => a.post<CrawlResult>('/crawl', { url })
  }
}
```

## `shared/ts/src/clients/embeddings.ts`

```ts
import { api } from '../http.js'

export type EmbeddingsResp = { embeddings: number[][] }

export const createEmbeddingsClient = (base = '/api') => {
  const a = api(base)
  return {
    embed: (input: string[] | string) =>
      a.post<EmbeddingsResp>('/embeddings', { input })
  }
}
```

# 🗺️ Mermaid (you like diagrams)

```mermaid
flowchart LR
  subgraph Host[Host]
    NGINX["NGINX :80"]
  end

  subgraph prom-net
    AG["api-gateway :8080"]
    OLLAMA["ollama :11434"]
    QD["qdrant :6333"]
    CRAWL["crawler :3000"]
    EMB["embeddings :7070"]
    TOR["tor :9050"]
    PRX["privoxy :8118"]
  end

  NGINX -->|/api/*| AG
  NGINX -->|/ollama/*| OLLAMA
  NGINX -->|/qdrant/*| QD
  NGINX -->|/crawler/*| CRAWL
  NGINX -->|/embeddings/*| EMB

  CRAWL -->|HTTP(S) via| PRX --> TOR
  AG --> OLLAMA
  AG --> QD
  AG --> CRAWL
  AG --> EMB
```

---

## How to run

1. Build once from repo root:

```bash
docker compose -f infrastructure/compose/stack.yml build
```

2. Dev mode (hot-reload with volumes already set):

* In each TS service folder, run `pnpm i && pnpm build` (or `pnpm dev` if you prefer local runs).
* Then:

```bash
docker compose -f infrastructure/compose/stack.yml up -d
```

3. Test endpoints (all via NGINX, single port :80):

* Health: `curl http://localhost/ api/health` (note the space removed → `/api/health`)
* Chat: `curl -X POST http://localhost/api/llm/chat -d '{"model":"qwen2.5-coder:7b","messages":[{"role":"user","content":"hello"}]}' -H 'content-type: application/json'`
* Crawl: `curl -X POST http://localhost/api/crawl -d '{"url":"https://example.com"}' -H 'content-type: application/json'`
* Embeddings: `curl -X POST http://localhost/api/embeddings -d '{"input":["hello world"]}' -H 'content-type: application/json'`

---

If you want, I can also add:

* a **/rag/query** route in the gateway (crawl → embed → similarity search in Qdrant → optional LLM answer),
* a **WS** endpoint for streaming LLM tokens,
* or fold `/ollama`, `/qdrant`, `/crawler`, `/embeddings` behind `/api/*` only (fully opaque services).

What do you want next—RAG flow wired end-to-end or WS streaming?<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [api-gateway-versioning](api-gateway-versioning.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [System Scheduler with Resource-Aware DAG](system-scheduler-with-resource-aware-dag.md)
- [markdown-to-org-transpiler](markdown-to-org-transpiler.md)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler](ollama-llm-provider-for-pseudo-code-transpiler.md)
- [observability-infrastructure-setup](observability-infrastructure-setup.md)
- [shared-package-layout-clarification](shared-package-layout-clarification.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [Pure-Node Crawl Stack with Playwright and Crawlee](pure-node-crawl-stack-with-playwright-and-crawlee.md)
- [Shared Package Structure](shared-package-structure.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [Pure TypeScript Search Microservice](pure-typescript-search-microservice.md)
- [Promethean Web UI Setup](promethean-web-ui-setup.md)
- [Prometheus Observability Stack](prometheus-observability-stack.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [Promethean Full-Stack Docker Setup](promethean-full-stack-docker-setup.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
- [Promethean Agent DSL TS Scaffold](promethean-agent-dsl-ts-scaffold.md)
- [archetype-ecs](archetype-ecs.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [Voice Access Layer Design](voice-access-layer-design.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [JavaScript](chunks/javascript.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [Local-Offline-Model-Deployment-Strategy](local-offline-model-deployment-strategy.md)
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [i3-config-validation-methods](i3-config-validation-methods.md)
- [Post-Linguistic Transhuman Design Frameworks](post-linguistic-transhuman-design-frameworks.md)
- [Admin Dashboard for User Management](admin-dashboard-for-user-management.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
