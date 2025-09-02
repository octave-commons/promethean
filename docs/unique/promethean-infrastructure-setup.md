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
related_to_title: []
related_to_uuid: []
references: []
---
Nice—picking it back up. Last we aligned on: **all ports hidden behind NGINX**, **no SaaS/tokens**, **JS/TS-only services**, **Dockerfiles live in `./images/`**, and **infra kept out of source**. We also said to include **Ollama**, **Qdrant** (local vector DB), **Tor (+Privoxy)** for optional crawler routing, a **TS crawler**, a **TS embeddings service** (no Python; `@xenova/transformers`), and a tiny **TS API Gateway** to give you a clean interface. Here’s the concrete drop: ^ref-6deed6ac-1-0

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
^ref-6deed6ac-5-0

# 🐳 `./images/ts-service.docker`
 ^ref-6deed6ac-33-0
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
^ref-6deed6ac-33-0
```

# 🧰 `./images/nginx.docker` ^ref-6deed6ac-54-0

```dockerfile
FROM nginx:1.27-alpine
^ref-6deed6ac-54-0
COPY nginx.conf /etc/nginx/nginx.conf
```
 ^ref-6deed6ac-61-0
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
^ref-6deed6ac-61-0
  }
}
```
^ref-6deed6ac-64-0
^ref-6deed6ac-93-0

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
^ref-6deed6ac-93-0
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
^ref-6deed6ac-224-0
^ref-6deed6ac-224-0
^ref-6deed6ac-206-0
```
^ref-6deed6ac-224-0

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
^ref-6deed6ac-224-0
  return c.newResponse(r.body, r)
})

^ref-6deed6ac-287-0
^ref-6deed6ac-287-0
^ref-6deed6ac-232-0
serve({ fetch: app.fetch, port: 8080 })
^ref-6deed6ac-287-0
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
^ref-6deed6ac-287-0
  "devDependencies": {
    "tsx": "^4.19.2",
    "typescript": "^5.5.4"
^ref-6deed6ac-311-0
  }
^ref-6deed6ac-311-0
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
^ref-6deed6ac-311-0
  const text = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 20000)

  return c.json({ url, title, text })
^ref-6deed6ac-335-0
})
^ref-6deed6ac-335-0

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
^ref-6deed6ac-335-0
    "hono": "^4.5.7"
  },
  "devDependencies": {
^ref-6deed6ac-358-0
    "tsx": "^4.19.2",
^ref-6deed6ac-358-0
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
^ref-6deed6ac-358-0
  const { input } = await c.req.json() as { input: string[] | string }
  const run = await getEmbedder()
  const arr = Array.isArray(input) ? input : [input] ^ref-6deed6ac-388-0
^ref-6deed6ac-392-0
^ref-6deed6ac-388-0
  const outputs = await Promise.all(arr.map(async (t) => (await run(t)).data))
^ref-6deed6ac-392-0
^ref-6deed6ac-388-0
^ref-6deed6ac-392-0
^ref-6deed6ac-388-0
  return c.json({ embeddings: outputs })
})

serve({ fetch: app.fetch, port: 7070 }) ^ref-6deed6ac-415-0
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
^ref-6deed6ac-392-0
  },
  "devDependencies": {
^ref-6deed6ac-415-0
    "typescript": "^5.5.4",
^ref-6deed6ac-415-0
^ref-6deed6ac-439-0
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
^ref-6deed6ac-415-0
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`)
  }
^ref-6deed6ac-439-0
  return res.json() as Promise<T>
^ref-6deed6ac-456-0
^ref-6deed6ac-439-0
^ref-6deed6ac-456-0
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
^ref-6deed6ac-439-0

export type ChatMsg = { role: 'system' | 'user' | 'assistant'; content: string }
^ref-6deed6ac-456-0
^ref-6deed6ac-471-0
export type ChatReq = { model: string; messages: ChatMsg[] }
^ref-6deed6ac-485-0
^ref-6deed6ac-471-0
export type ChatResp = { message: ChatMsg; done: boolean }

export const createOllamaClient = (base = '/api') => {
  const a = api(base)
  return {
    chat: (req: ChatReq) => a.post<ChatResp>('/llm/chat', req)
  }
}
```

## `shared/ts/src/clients/qdrant.ts`
^ref-6deed6ac-456-0

```ts
^ref-6deed6ac-471-0
^ref-6deed6ac-485-0
^ref-6deed6ac-501-0
import { api } from '../http.js'
type Point = { id: string | number; vector: number[]; payload?: Record<string, unknown> }
 ^ref-6deed6ac-485-0
export const createQdrantClient = (base = '/api') => {
  const a = api(base)
  return {
    upsert: (collection: string, points: Point[]) =>
      a.post(`/vectors/upsert`, { collection, points })
  }
}
```
^ref-6deed6ac-471-0

## `shared/ts/src/clients/crawler.ts`
^ref-6deed6ac-501-0

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

^ref-6deed6ac-485-0
## `shared/ts/src/clients/embeddings.ts`

```ts
^ref-6deed6ac-501-0
^ref-6deed6ac-536-0 ^ref-6deed6ac-540-0
^ref-6deed6ac-534-0
import { api } from '../http.js' ^ref-6deed6ac-542-0

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
^ref-6deed6ac-501-0
    TOR["tor :9050"]
    PRX["privoxy :8118"]
  end

^ref-6deed6ac-545-0
^ref-6deed6ac-543-0
^ref-6deed6ac-542-0 ^ref-6deed6ac-549-0
^ref-6deed6ac-540-0
^ref-6deed6ac-536-0 ^ref-6deed6ac-551-0
^ref-6deed6ac-564-0
^ref-6deed6ac-562-0
^ref-6deed6ac-561-0 ^ref-6deed6ac-567-0
^ref-6deed6ac-560-0
^ref-6deed6ac-558-0
^ref-6deed6ac-554-0
^ref-6deed6ac-553-0
^ref-6deed6ac-552-0
^ref-6deed6ac-551-0
^ref-6deed6ac-549-0
^ref-6deed6ac-545-0
^ref-6deed6ac-543-0
^ref-6deed6ac-576-0 ^ref-6deed6ac-577-0
^ref-6deed6ac-574-0 ^ref-6deed6ac-578-0
^ref-6deed6ac-542-0 ^ref-6deed6ac-579-0
^ref-6deed6ac-540-0
^ref-6deed6ac-536-0
^ref-6deed6ac-592-0
^ref-6deed6ac-589-0 ^ref-6deed6ac-597-0
^ref-6deed6ac-587-0
^ref-6deed6ac-583-0
^ref-6deed6ac-582-0
^ref-6deed6ac-579-0
^ref-6deed6ac-578-0
^ref-6deed6ac-577-0
^ref-6deed6ac-576-0 ^ref-6deed6ac-604-0
^ref-6deed6ac-574-0
^ref-6deed6ac-567-0
^ref-6deed6ac-564-0
^ref-6deed6ac-562-0 ^ref-6deed6ac-608-0
^ref-6deed6ac-561-0
^ref-6deed6ac-560-0
^ref-6deed6ac-558-0
^ref-6deed6ac-554-0
^ref-6deed6ac-553-0
^ref-6deed6ac-552-0
^ref-6deed6ac-551-0
^ref-6deed6ac-549-0
^ref-6deed6ac-545-0
^ref-6deed6ac-543-0 ^ref-6deed6ac-618-0
  NGINX -->|/api/*| AG ^ref-6deed6ac-534-0 ^ref-6deed6ac-552-0 ^ref-6deed6ac-582-0
  NGINX -->|/ollama/*| OLLAMA ^ref-6deed6ac-553-0
  NGINX -->|/qdrant/*| QD ^ref-6deed6ac-554-0
  NGINX -->|/crawler/*| CRAWL ^ref-6deed6ac-622-0
^ref-6deed6ac-583-0 ^ref-6deed6ac-623-0
  NGINX -->|/embeddings/*| EMB ^ref-6deed6ac-587-0
^ref-6deed6ac-536-0
 ^ref-6deed6ac-540-0 ^ref-6deed6ac-558-0 ^ref-6deed6ac-589-0 ^ref-6deed6ac-626-0
  CRAWL -->|HTTP(S) via| PRX --> TOR
  AG --> OLLAMA ^ref-6deed6ac-542-0 ^ref-6deed6ac-560-0 ^ref-6deed6ac-628-0
  AG --> QD ^ref-6deed6ac-543-0 ^ref-6deed6ac-561-0 ^ref-6deed6ac-592-0
  AG --> CRAWL ^ref-6deed6ac-562-0
  AG --> EMB
```

^ref-6deed6ac-545-0 ^ref-6deed6ac-597-0
^ref-6deed6ac-564-0 ^ref-6deed6ac-567-0
--- ^ref-6deed6ac-549-0

## How to run ^ref-6deed6ac-551-0 ^ref-6deed6ac-638-0
 ^ref-6deed6ac-552-0
1. Build once from repo root: ^ref-6deed6ac-553-0
 ^ref-6deed6ac-554-0 ^ref-6deed6ac-604-0
```bash ^ref-6deed6ac-574-0
docker compose -f infrastructure/compose/stack.yml build
``` ^ref-6deed6ac-576-0
 ^ref-6deed6ac-558-0 ^ref-6deed6ac-577-0 ^ref-6deed6ac-608-0
2. Dev mode (hot-reload with volumes already set): ^ref-6deed6ac-578-0
 ^ref-6deed6ac-560-0 ^ref-6deed6ac-579-0
* In each TS service folder, run `pnpm i && pnpm build` (or `pnpm dev` if you prefer local runs). ^ref-6deed6ac-561-0
* Then: ^ref-6deed6ac-562-0 ^ref-6deed6ac-649-0
 ^ref-6deed6ac-582-0
```bash ^ref-6deed6ac-564-0 ^ref-6deed6ac-583-0
docker compose -f infrastructure/compose/stack.yml up -d
```
 ^ref-6deed6ac-567-0
3. Test endpoints (all via NGINX, single port :80): ^ref-6deed6ac-587-0 ^ref-6deed6ac-618-0

* Health: `curl http://localhost/ api/health` (note the space removed → `/api/health`) ^ref-6deed6ac-589-0
* Chat: `curl -X POST http://localhost/api/llm/chat -d '{"model":"qwen2.5-coder:7b","messages":[{"role":"user","content":"hello"}]}' -H 'content-type: application/json'`
* Crawl: `curl -X POST http://localhost/api/crawl -d '{"url":"https://example.com"}' -H 'content-type: application/json'`
* Embeddings: `curl -X POST http://localhost/api/embeddings -d '{"input":["hello world"]}' -H 'content-type: application/json'` ^ref-6deed6ac-592-0
 ^ref-6deed6ac-574-0
---
 ^ref-6deed6ac-576-0 ^ref-6deed6ac-626-0
If you want, I can also add: ^ref-6deed6ac-577-0
 ^ref-6deed6ac-578-0 ^ref-6deed6ac-597-0 ^ref-6deed6ac-628-0 ^ref-6deed6ac-665-0
* a **/rag/query** route in the gateway (crawl → embed → similarity search in Qdrant → optional LLM answer), ^ref-6deed6ac-579-0
* a **WS** endpoint for streaming LLM tokens,
* or fold `/ollama`, `/qdrant`, `/crawler`, `/embeddings` behind `/api/*` only (fully opaque services).
 ^ref-6deed6ac-582-0
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
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [DSL](chunks/dsl.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [Services](chunks/services.md)
- [2d-sandbox-field](2d-sandbox-field.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [Interop and Source Maps](interop-and-source-maps.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [Diagrams](chunks/diagrams.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [AI-First-OS-Model-Context-Protocol](ai-first-os-model-context-protocol.md)
- [balanced-bst](balanced-bst.md)
- [Board Automation Improvements](board-automation-improvements.md)
- [Operations](chunks/operations.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [Event Bus MVP](event-bus-mvp.md)
- [Chroma-Embedding-Refactor](chroma-embedding-refactor.md)
- [Promethean Pipelines](promethean-pipelines.md)
- [State Snapshots API and Transactional Projector](state-snapshots-api-and-transactional-projector.md)
- [sibilant-meta-string-templating-runtime](sibilant-meta-string-templating-runtime.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [sibilant-metacompiler-overview](sibilant-metacompiler-overview.md)
- [template-based-compilation](template-based-compilation.md)
- [ts-to-lisp-transpiler](ts-to-lisp-transpiler.md)
- [typed-struct-compiler](typed-struct-compiler.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [Obsidian ChatGPT Plugin Integration Guide](obsidian-chatgpt-plugin-integration-guide.md)
- [Obsidian ChatGPT Plugin Integration](obsidian-chatgpt-plugin-integration.md)
- [obsidian-ignore-node-modules-regex](obsidian-ignore-node-modules-regex.md)
- [prom-lib-rate-limiters-and-replay-api](prom-lib-rate-limiters-and-replay-api.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [field-interaction-equations](field-interaction-equations.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [Tooling](chunks/tooling.md)
- [Window Management](chunks/window-management.md)
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [Shared](chunks/shared.md)
- [Matplotlib Animation with Async Execution](matplotlib-animation-with-async-execution.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [EidolonField](eidolonfield.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [Lisp-Compiler-Integration](lisp-compiler-integration.md)
- [lisp-dsl-for-window-management](lisp-dsl-for-window-management.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [Promethean Documentation Pipeline Overview](promethean-documentation-pipeline-overview.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [Creative Moments](creative-moments.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [graph-ds](graph-ds.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [heartbeat-simulation-snippets](heartbeat-simulation-snippets.md)
- [Promethean_Eidolon_Synchronicity_Model](promethean-eidolon-synchronicity-model.md)
- [promethean-system-diagrams](promethean-system-diagrams.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [DuckDuckGoSearchPipeline](duckduckgosearchpipeline.md)
- [Optimizing Command Limitations in System Design](optimizing-command-limitations-in-system-design.md)
- [Promethean Chat Activity Report](promethean-chat-activity-report.md)
- [Promethean Documentation Update](promethean-documentation-update.md)
- [plan-update-confirmation](plan-update-confirmation.md)
- [Lispy Macros with syntax-rules](lispy-macros-with-syntax-rules.md)
- [Model Upgrade Calm-Down Guide](model-upgrade-calm-down-guide.md)
- [mystery-lisp-search-session](mystery-lisp-search-session.md)
- [Obsidian Templating Plugins Integration Guide](obsidian-templating-plugins-integration-guide.md)
- [Protocol_0_The_Contradiction_Engine](protocol-0-the-contradiction-engine.md)
- [NPU Voice Code and Sensory Integration](npu-voice-code-and-sensory-integration.md)
- [OpenAPI Validation Report](openapi-validation-report.md)
- [Mindful Prioritization](mindful-prioritization.md)
- [MindfulRobotIntegration](mindfulrobotintegration.md)
- [Fnord Tracer Protocol](fnord-tracer-protocol.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
- [Functional Embedding Pipeline Refactor](functional-embedding-pipeline-refactor.md)
- [Provider-Agnostic Chat Panel Implementation](provider-agnostic-chat-panel-implementation.md)
- [WebSocket Gateway Implementation](websocket-gateway-implementation.md)
- [zero-copy-snapshots-and-workers](zero-copy-snapshots-and-workers.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [layer-1-uptime-diagrams](layer-1-uptime-diagrams.md)
- [Promethean Workflow Optimization](promethean-workflow-optimization.md)
- [set-assignment-in-lisp-ast](set-assignment-in-lisp-ast.md)
- [schema-evolution-workflow](schema-evolution-workflow.md)
- [Self-Agency in AI Interaction](self-agency-in-ai-interaction.md)
- [Promethean-Copilot-Intent-Engine](promethean-copilot-intent-engine.md)
- [Vectorial Exception Descent](vectorial-exception-descent.md)
- [Promethean Pipelines: Local TypeScript-First Workflow](promethean-pipelines-local-typescript-first-workflow.md)
- [TypeScript Patch for Tool Calling Support](typescript-patch-for-tool-calling-support.md)
- [Eidolon-Field-Optimization](eidolon-field-optimization.md)
- [Refactor Frontmatter Processing](refactor-frontmatter-processing.md)
- [file-watcher-auth-fix](file-watcher-auth-fix.md)
- [Functional Refactor of TypeScript Document Processing](functional-refactor-of-typescript-document-processing.md)
- [Promethean Dev Workflow Update](promethean-dev-workflow-update.md)
- [Universal Lisp Interface](universal-lisp-interface.md)
- [pm2-orchestration-patterns](pm2-orchestration-patterns.md)
- [Layer1SurvivabilityEnvelope](layer1survivabilityenvelope.md)
## Sources
- [Promethean Web UI Setup — L1](promethean-web-ui-setup.md#^ref-bc5172ca-1-0) (line 1, col 0, score 0.61)
- [RAG UI Panel with Qdrant and PostgREST — L1](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-1-0) (line 1, col 0, score 0.67)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L1](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-1-0) (line 1, col 0, score 0.69)
- [Promethean Web UI Setup — L563](promethean-web-ui-setup.md#^ref-bc5172ca-563-0) (line 563, col 0, score 0.7)
- [Local-Offline-Model-Deployment-Strategy — L1](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-1-0) (line 1, col 0, score 0.66)
- [observability-infrastructure-setup — L7](observability-infrastructure-setup.md#^ref-b4e64f8c-7-0) (line 7, col 0, score 0.62)
- [Promethean Agent DSL TS Scaffold — L1](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-1-0) (line 1, col 0, score 0.66)
- [Per-Domain Policy System for JS Crawler — L1](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-1-0) (line 1, col 0, score 0.65)
- [Per-Domain Policy System for JS Crawler — L467](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-467-0) (line 467, col 0, score 0.65)
- [Promethean Web UI Setup — L9](promethean-web-ui-setup.md#^ref-bc5172ca-9-0) (line 9, col 0, score 0.68)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L389](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-389-0) (line 389, col 0, score 0.66)
- [Mongo Outbox Implementation — L3](mongo-outbox-implementation.md#^ref-9c1acd1e-3-0) (line 3, col 0, score 0.64)
- [Chroma Toolkit Consolidation Plan — L14](chroma-toolkit-consolidation-plan.md#^ref-5020e892-14-0) (line 14, col 0, score 0.64)
- [Agent Tasks: Persistence Migration to DualStore — L26](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-26-0) (line 26, col 0, score 0.62)
- [Language-Agnostic Mirror System — L513](language-agnostic-mirror-system.md#^ref-d2b3628c-513-0) (line 513, col 0, score 0.64)
- [Promethean Web UI Setup — L262](promethean-web-ui-setup.md#^ref-bc5172ca-262-0) (line 262, col 0, score 0.69)
- [Per-Domain Policy System for JS Crawler — L446](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-446-0) (line 446, col 0, score 0.74)
- [Shared Package Structure — L5](shared-package-structure.md#^ref-66a72fc3-5-0) (line 5, col 0, score 0.67)
- [api-gateway-versioning — L7](api-gateway-versioning.md#^ref-0580dcd3-7-0) (line 7, col 0, score 0.98)
- [shared-package-layout-clarification — L11](shared-package-layout-clarification.md#^ref-36c8882a-11-0) (line 11, col 0, score 0.72)
- [Pure TypeScript Search Microservice — L14](pure-typescript-search-microservice.md#^ref-d17d3a96-14-0) (line 14, col 0, score 0.66)
- [Per-Domain Policy System for JS Crawler — L439](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-439-0) (line 439, col 0, score 0.67)
- [Promethean Full-Stack Docker Setup — L432](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-432-0) (line 432, col 0, score 0.7)
- [Promethean Event Bus MVP v0.1 — L395](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-395-0) (line 395, col 0, score 0.67)
- [Pure TypeScript Search Microservice — L62](pure-typescript-search-microservice.md#^ref-d17d3a96-62-0) (line 62, col 0, score 0.84)
- [Prometheus Observability Stack — L500](prometheus-observability-stack.md#^ref-e90b5a16-500-0) (line 500, col 0, score 0.72)
- [Promethean Full-Stack Docker Setup — L388](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-388-0) (line 388, col 0, score 0.66)
- [Pure TypeScript Search Microservice — L73](pure-typescript-search-microservice.md#^ref-d17d3a96-73-0) (line 73, col 0, score 0.66)
- [Promethean Web UI Setup — L238](promethean-web-ui-setup.md#^ref-bc5172ca-238-0) (line 238, col 0, score 0.78)
- [ecs-offload-workers — L434](ecs-offload-workers.md#^ref-6498b9d7-434-0) (line 434, col 0, score 0.63)
- [Promethean Documentation Pipeline Overview — L119](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-119-0) (line 119, col 0, score 0.68)
- [Per-Domain Policy System for JS Crawler — L463](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-463-0) (line 463, col 0, score 0.68)
- [shared-package-layout-clarification — L145](shared-package-layout-clarification.md#^ref-36c8882a-145-0) (line 145, col 0, score 0.67)
- [Promethean Agent Config DSL — L10](promethean-agent-config-dsl.md#^ref-2c00ce45-10-0) (line 10, col 0, score 0.62)
- [obsidian-ignore-node-modules-regex — L14](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-14-0) (line 14, col 0, score 0.65)
- [api-gateway-versioning — L51](api-gateway-versioning.md#^ref-0580dcd3-51-0) (line 51, col 0, score 0.79)
- [plan-update-confirmation — L637](plan-update-confirmation.md#^ref-b22d79c6-637-0) (line 637, col 0, score 0.66)
- [Universal Lisp Interface — L192](universal-lisp-interface.md#^ref-b01856b4-192-0) (line 192, col 0, score 0.66)
- [Universal Lisp Interface — L137](universal-lisp-interface.md#^ref-b01856b4-137-0) (line 137, col 0, score 0.65)
- [Prometheus Observability Stack — L7](prometheus-observability-stack.md#^ref-e90b5a16-7-0) (line 7, col 0, score 0.62)
- [Prometheus Observability Stack — L494](prometheus-observability-stack.md#^ref-e90b5a16-494-0) (line 494, col 0, score 0.64)
- [Promethean Full-Stack Docker Setup — L3](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-3-0) (line 3, col 0, score 0.64)
- [Chroma Toolkit Consolidation Plan — L162](chroma-toolkit-consolidation-plan.md#^ref-5020e892-162-0) (line 162, col 0, score 0.64)
- [Dynamic Context Model for Web Components — L303](dynamic-context-model-for-web-components.md#^ref-f7702bf8-303-0) (line 303, col 0, score 0.63)
- [Agent Tasks: Persistence Migration to DualStore — L92](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-92-0) (line 92, col 0, score 0.63)
- [Chroma-Embedding-Refactor — L64](chroma-embedding-refactor.md#^ref-8b256935-64-0) (line 64, col 0, score 0.71)
- [observability-infrastructure-setup — L44](observability-infrastructure-setup.md#^ref-b4e64f8c-44-0) (line 44, col 0, score 0.9)
- [Promethean Full-Stack Docker Setup — L169](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-169-0) (line 169, col 0, score 0.66)
- [Promethean Web UI Setup — L44](promethean-web-ui-setup.md#^ref-bc5172ca-44-0) (line 44, col 0, score 0.66)
- [RAG UI Panel with Qdrant and PostgREST — L81](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-81-0) (line 81, col 0, score 0.69)
- [Local-Only-LLM-Workflow — L28](local-only-llm-workflow.md#^ref-9a8ab57e-28-0) (line 28, col 0, score 0.66)
- [Pure TypeScript Search Microservice — L46](pure-typescript-search-microservice.md#^ref-d17d3a96-46-0) (line 46, col 0, score 0.68)
- [observability-infrastructure-setup — L267](observability-infrastructure-setup.md#^ref-b4e64f8c-267-0) (line 267, col 0, score 0.67)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L9](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-9-0) (line 9, col 0, score 0.64)
- [ecs-offload-workers — L435](ecs-offload-workers.md#^ref-6498b9d7-435-0) (line 435, col 0, score 0.67)
- [Promethean Full-Stack Docker Setup — L404](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-404-0) (line 404, col 0, score 0.69)
- [RAG UI Panel with Qdrant and PostgREST — L9](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-9-0) (line 9, col 0, score 0.67)
- [Local-Offline-Model-Deployment-Strategy — L80](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-80-0) (line 80, col 0, score 0.67)
- [Promethean Full-Stack Docker Setup — L132](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-132-0) (line 132, col 0, score 0.71)
- [AI-Centric OS with MCP Layer — L185](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-185-0) (line 185, col 0, score 0.61)
- [api-gateway-versioning — L79](api-gateway-versioning.md#^ref-0580dcd3-79-0) (line 79, col 0, score 0.93)
- [Local-Offline-Model-Deployment-Strategy — L255](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-255-0) (line 255, col 0, score 0.71)
- [Promethean Pipelines: Local TypeScript-First Workflow — L3](promethean-pipelines-local-typescript-first-workflow.md#^ref-6b63edca-3-0) (line 3, col 0, score 0.69)
- [AI-Centric OS with MCP Layer — L397](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-397-0) (line 397, col 0, score 0.69)
- [observability-infrastructure-setup — L96](observability-infrastructure-setup.md#^ref-b4e64f8c-96-0) (line 96, col 0, score 0.69)
- [Chroma-Embedding-Refactor — L311](chroma-embedding-refactor.md#^ref-8b256935-311-0) (line 311, col 0, score 0.7)
- [api-gateway-versioning — L277](api-gateway-versioning.md#^ref-0580dcd3-277-0) (line 277, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L6](functional-embedding-pipeline-refactor.md#^ref-a4a25141-6-0) (line 6, col 0, score 0.66)
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
- [Pure TypeScript Search Microservice — L306](pure-typescript-search-microservice.md#^ref-d17d3a96-306-0) (line 306, col 0, score 0.72)
- [Chroma-Embedding-Refactor — L111](chroma-embedding-refactor.md#^ref-8b256935-111-0) (line 111, col 0, score 0.69)
- [Functional Refactor of TypeScript Document Processing — L5](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-5-0) (line 5, col 0, score 0.7)
- [Per-Domain Policy System for JS Crawler — L184](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-184-0) (line 184, col 0, score 0.77)
- [Shared Package Structure — L51](shared-package-structure.md#^ref-66a72fc3-51-0) (line 51, col 0, score 0.64)
- [Chroma Toolkit Consolidation Plan — L74](chroma-toolkit-consolidation-plan.md#^ref-5020e892-74-0) (line 74, col 0, score 0.64)
- [Shared Package Structure — L147](shared-package-structure.md#^ref-66a72fc3-147-0) (line 147, col 0, score 0.64)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L223](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-223-0) (line 223, col 0, score 0.76)
- [Chroma Toolkit Consolidation Plan — L90](chroma-toolkit-consolidation-plan.md#^ref-5020e892-90-0) (line 90, col 0, score 0.65)
- [plan-update-confirmation — L970](plan-update-confirmation.md#^ref-b22d79c6-970-0) (line 970, col 0, score 0.64)
- [ecs-offload-workers — L149](ecs-offload-workers.md#^ref-6498b9d7-149-0) (line 149, col 0, score 0.68)
- [Chroma Toolkit Consolidation Plan — L109](chroma-toolkit-consolidation-plan.md#^ref-5020e892-109-0) (line 109, col 0, score 0.65)
- [Chroma-Embedding-Refactor — L282](chroma-embedding-refactor.md#^ref-8b256935-282-0) (line 282, col 0, score 0.65)
- [Shared Package Structure — L44](shared-package-structure.md#^ref-66a72fc3-44-0) (line 44, col 0, score 0.7)
- [Promethean Web UI Setup — L351](promethean-web-ui-setup.md#^ref-bc5172ca-351-0) (line 351, col 0, score 0.74)
- [Provider-Agnostic Chat Panel Implementation — L140](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-140-0) (line 140, col 0, score 0.74)
- [TypeScript Patch for Tool Calling Support — L189](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-189-0) (line 189, col 0, score 0.71)
- [TypeScript Patch for Tool Calling Support — L279](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-279-0) (line 279, col 0, score 0.71)
- [Provider-Agnostic Chat Panel Implementation — L84](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-84-0) (line 84, col 0, score 0.72)
- [TypeScript Patch for Tool Calling Support — L368](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-368-0) (line 368, col 0, score 0.68)
- [Functional Embedding Pipeline Refactor — L31](functional-embedding-pipeline-refactor.md#^ref-a4a25141-31-0) (line 31, col 0, score 0.71)
- [Provider-Agnostic Chat Panel Implementation — L26](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-26-0) (line 26, col 0, score 0.71)
- [Cross-Language Runtime Polymorphism — L38](cross-language-runtime-polymorphism.md#^ref-c34c36a6-38-0) (line 38, col 0, score 0.68)
- [prom-lib-rate-limiters-and-replay-api — L106](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-106-0) (line 106, col 0, score 0.7)
- [Refactor Frontmatter Processing — L11](refactor-frontmatter-processing.md#^ref-cfbdca2f-11-0) (line 11, col 0, score 0.73)
- [Cross-Language Runtime Polymorphism — L111](cross-language-runtime-polymorphism.md#^ref-c34c36a6-111-0) (line 111, col 0, score 0.67)
- [Pure TypeScript Search Microservice — L378](pure-typescript-search-microservice.md#^ref-d17d3a96-378-0) (line 378, col 0, score 0.67)
- [WebSocket Gateway Implementation — L533](websocket-gateway-implementation.md#^ref-e811123d-533-0) (line 533, col 0, score 0.7)
- [Cross-Language Runtime Polymorphism — L109](cross-language-runtime-polymorphism.md#^ref-c34c36a6-109-0) (line 109, col 0, score 0.65)
- [WebSocket Gateway Implementation — L387](websocket-gateway-implementation.md#^ref-e811123d-387-0) (line 387, col 0, score 0.64)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L107](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-107-0) (line 107, col 0, score 0.69)
- [Per-Domain Policy System for JS Crawler — L117](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-117-0) (line 117, col 0, score 0.66)
- [Pure TypeScript Search Microservice — L112](pure-typescript-search-microservice.md#^ref-d17d3a96-112-0) (line 112, col 0, score 0.77)
- [file-watcher-auth-fix — L11](file-watcher-auth-fix.md#^ref-9044701b-11-0) (line 11, col 0, score 0.72)
- [shared-package-layout-clarification — L47](shared-package-layout-clarification.md#^ref-36c8882a-47-0) (line 47, col 0, score 0.9)
- [Shared Package Structure — L64](shared-package-structure.md#^ref-66a72fc3-64-0) (line 64, col 0, score 0.86)
- [Agent Tasks: Persistence Migration to DualStore — L149](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-149-0) (line 149, col 0, score 1)
- [eidolon-field-math-foundations — L155](eidolon-field-math-foundations.md#^ref-008f2ac0-155-0) (line 155, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L309](migrate-to-provider-tenant-architecture.md#^ref-54382370-309-0) (line 309, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L469](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-469-0) (line 469, col 0, score 1)
- [Promethean Full-Stack Docker Setup — L440](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-440-0) (line 440, col 0, score 1)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L178](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-178-0) (line 178, col 0, score 0.72)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L130](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-130-0) (line 130, col 0, score 0.73)
- [plan-update-confirmation — L659](plan-update-confirmation.md#^ref-b22d79c6-659-0) (line 659, col 0, score 0.64)
- [shared-package-layout-clarification — L84](shared-package-layout-clarification.md#^ref-36c8882a-84-0) (line 84, col 0, score 0.72)
- [Promethean Web UI Setup — L278](promethean-web-ui-setup.md#^ref-bc5172ca-278-0) (line 278, col 0, score 0.7)
- [Promethean Pipelines — L85](promethean-pipelines.md#^ref-8b8e6103-85-0) (line 85, col 0, score 0.67)
- [Promethean Web UI Setup — L298](promethean-web-ui-setup.md#^ref-bc5172ca-298-0) (line 298, col 0, score 0.65)
- [Promethean Agent DSL TS Scaffold — L3](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-3-0) (line 3, col 0, score 0.65)
- [shared-package-layout-clarification — L161](shared-package-layout-clarification.md#^ref-36c8882a-161-0) (line 161, col 0, score 0.72)
- [State Snapshots API and Transactional Projector — L280](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-280-0) (line 280, col 0, score 0.65)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L194](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-194-0) (line 194, col 0, score 0.65)
- [Event Bus MVP — L258](event-bus-mvp.md#^ref-534fe91d-258-0) (line 258, col 0, score 0.64)
- [shared-package-layout-clarification — L1](shared-package-layout-clarification.md#^ref-36c8882a-1-0) (line 1, col 0, score 0.7)
- [Interop and Source Maps — L482](interop-and-source-maps.md#^ref-cdfac40c-482-0) (line 482, col 0, score 0.7)
- [Shared Package Structure — L1](shared-package-structure.md#^ref-66a72fc3-1-0) (line 1, col 0, score 0.69)
- [shared-package-layout-clarification — L128](shared-package-layout-clarification.md#^ref-36c8882a-128-0) (line 128, col 0, score 0.67)
- [set-assignment-in-lisp-ast — L56](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-56-0) (line 56, col 0, score 0.65)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L423](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-423-0) (line 423, col 0, score 0.65)
- [shared-package-layout-clarification — L112](shared-package-layout-clarification.md#^ref-36c8882a-112-0) (line 112, col 0, score 0.64)
- [shared-package-layout-clarification — L149](shared-package-layout-clarification.md#^ref-36c8882a-149-0) (line 149, col 0, score 0.64)
- [Shared Package Structure — L148](shared-package-structure.md#^ref-66a72fc3-148-0) (line 148, col 0, score 0.62)
- [shared-package-layout-clarification — L31](shared-package-layout-clarification.md#^ref-36c8882a-31-0) (line 31, col 0, score 0.62)
- [Agent Tasks: Persistence Migration to DualStore — L43](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-43-0) (line 43, col 0, score 0.62)
- [Debugging Broker Connections and Agent Behavior — L11](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-11-0) (line 11, col 0, score 0.75)
- [shared-package-layout-clarification — L106](shared-package-layout-clarification.md#^ref-36c8882a-106-0) (line 106, col 0, score 0.62)
- [Language-Agnostic Mirror System — L237](language-agnostic-mirror-system.md#^ref-d2b3628c-237-0) (line 237, col 0, score 0.69)
- [Lispy Macros with syntax-rules — L301](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-301-0) (line 301, col 0, score 0.68)
- [Promethean Pipelines — L14](promethean-pipelines.md#^ref-8b8e6103-14-0) (line 14, col 0, score 0.67)
- [ecs-offload-workers — L209](ecs-offload-workers.md#^ref-6498b9d7-209-0) (line 209, col 0, score 0.67)
- [universal-intention-code-fabric — L252](universal-intention-code-fabric.md#^ref-c14edce7-252-0) (line 252, col 0, score 0.73)
- [Chroma-Embedding-Refactor — L28](chroma-embedding-refactor.md#^ref-8b256935-28-0) (line 28, col 0, score 0.71)
- [Chroma-Embedding-Refactor — L66](chroma-embedding-refactor.md#^ref-8b256935-66-0) (line 66, col 0, score 0.68)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L7](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-7-0) (line 7, col 0, score 0.71)
- [Cross-Target Macro System in Sibilant — L107](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-107-0) (line 107, col 0, score 0.71)
- [Cross-Target Macro System in Sibilant — L121](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-121-0) (line 121, col 0, score 0.7)
- [Shared Package Structure — L103](shared-package-structure.md#^ref-66a72fc3-103-0) (line 103, col 0, score 0.68)
- [TypeScript Patch for Tool Calling Support — L9](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-9-0) (line 9, col 0, score 0.73)
- [Promethean Agent DSL TS Scaffold — L738](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-738-0) (line 738, col 0, score 0.73)
- [compiler-kit-foundations — L31](compiler-kit-foundations.md#^ref-01b21543-31-0) (line 31, col 0, score 0.68)
- [Shared Package Structure — L124](shared-package-structure.md#^ref-66a72fc3-124-0) (line 124, col 0, score 0.71)
- [Promethean Agent DSL TS Scaffold — L247](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-247-0) (line 247, col 0, score 0.71)
- [universal-intention-code-fabric — L127](universal-intention-code-fabric.md#^ref-c14edce7-127-0) (line 127, col 0, score 0.7)
- [WebSocket Gateway Implementation — L322](websocket-gateway-implementation.md#^ref-e811123d-322-0) (line 322, col 0, score 0.7)
- [schema-evolution-workflow — L9](schema-evolution-workflow.md#^ref-d8059b6a-9-0) (line 9, col 0, score 0.7)
- [RAG UI Panel with Qdrant and PostgREST — L140](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-140-0) (line 140, col 0, score 0.65)
- [Mongo Outbox Implementation — L381](mongo-outbox-implementation.md#^ref-9c1acd1e-381-0) (line 381, col 0, score 0.7)
- [Promethean Agent DSL TS Scaffold — L223](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-223-0) (line 223, col 0, score 0.7)
- [AI-Centric OS with MCP Layer — L279](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-279-0) (line 279, col 0, score 0.71)
- [Promethean Web UI Setup — L415](promethean-web-ui-setup.md#^ref-bc5172ca-415-0) (line 415, col 0, score 0.74)
- [Promethean Event Bus MVP v0.1 — L697](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-697-0) (line 697, col 0, score 0.7)
- [Lispy Macros with syntax-rules — L319](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-319-0) (line 319, col 0, score 0.7)
- [RAG UI Panel with Qdrant and PostgREST — L172](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-172-0) (line 172, col 0, score 0.69)
- [Interop and Source Maps — L85](interop-and-source-maps.md#^ref-cdfac40c-85-0) (line 85, col 0, score 0.69)
- [compiler-kit-foundations — L140](compiler-kit-foundations.md#^ref-01b21543-140-0) (line 140, col 0, score 0.68)
- [RAG UI Panel with Qdrant and PostgREST — L336](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-336-0) (line 336, col 0, score 0.82)
- [Promethean Web UI Setup — L581](promethean-web-ui-setup.md#^ref-bc5172ca-581-0) (line 581, col 0, score 0.8)
- [Promethean Pipelines: Local TypeScript-First Workflow — L219](promethean-pipelines-local-typescript-first-workflow.md#^ref-6b63edca-219-0) (line 219, col 0, score 0.76)
- [archetype-ecs — L423](archetype-ecs.md#^ref-8f4c1e86-423-0) (line 423, col 0, score 0.74)
- [Promethean Event Bus MVP v0.1 — L832](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-832-0) (line 832, col 0, score 0.74)
- [Language-Agnostic Mirror System — L11](language-agnostic-mirror-system.md#^ref-d2b3628c-11-0) (line 11, col 0, score 0.72)
- [Promethean Pipelines — L58](promethean-pipelines.md#^ref-8b8e6103-58-0) (line 58, col 0, score 0.71)
- [Promethean Documentation Pipeline Overview — L78](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-78-0) (line 78, col 0, score 0.71)
- [Event Bus Projections Architecture — L5](event-bus-projections-architecture.md#^ref-cf6b9b17-5-0) (line 5, col 0, score 0.71)
- [Promethean Agent Config DSL — L239](promethean-agent-config-dsl.md#^ref-2c00ce45-239-0) (line 239, col 0, score 0.69)
- [prom-lib-rate-limiters-and-replay-api — L92](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-92-0) (line 92, col 0, score 0.68)
- [Dynamic Context Model for Web Components — L51](dynamic-context-model-for-web-components.md#^ref-f7702bf8-51-0) (line 51, col 0, score 0.67)
- [ecs-scheduler-and-prefabs — L352](ecs-scheduler-and-prefabs.md#^ref-c62a1815-352-0) (line 352, col 0, score 0.67)
- [System Scheduler with Resource-Aware DAG — L350](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-350-0) (line 350, col 0, score 0.67)
- [schema-evolution-workflow — L132](schema-evolution-workflow.md#^ref-d8059b6a-132-0) (line 132, col 0, score 0.67)
- [Model Upgrade Calm-Down Guide — L30](model-upgrade-calm-down-guide.md#^ref-db74343f-30-0) (line 30, col 0, score 0.7)
- [Promethean-Copilot-Intent-Engine — L33](promethean-copilot-intent-engine.md#^ref-ae24a280-33-0) (line 33, col 0, score 0.68)
- [Promethean Agent DSL TS Scaffold — L813](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-813-0) (line 813, col 0, score 0.67)
- [Agent Tasks: Persistence Migration to DualStore — L111](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-111-0) (line 111, col 0, score 0.67)
- [universal-intention-code-fabric — L383](universal-intention-code-fabric.md#^ref-c14edce7-383-0) (line 383, col 0, score 0.67)
- [Promethean Dev Workflow Update — L53](promethean-dev-workflow-update.md#^ref-03a5578f-53-0) (line 53, col 0, score 0.66)
- [Dynamic Context Model for Web Components — L23](dynamic-context-model-for-web-components.md#^ref-f7702bf8-23-0) (line 23, col 0, score 0.66)
- [Dynamic Context Model for Web Components — L196](dynamic-context-model-for-web-components.md#^ref-f7702bf8-196-0) (line 196, col 0, score 0.65)
- [Promethean-Copilot-Intent-Engine — L50](promethean-copilot-intent-engine.md#^ref-ae24a280-50-0) (line 50, col 0, score 0.64)
- [field-interaction-equations — L132](field-interaction-equations.md#^ref-b09141b7-132-0) (line 132, col 0, score 0.64)
- [RAG UI Panel with Qdrant and PostgREST — L71](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-71-0) (line 71, col 0, score 0.9)
- [observability-infrastructure-setup — L357](observability-infrastructure-setup.md#^ref-b4e64f8c-357-0) (line 357, col 0, score 0.72)
- [Prometheus Observability Stack — L485](prometheus-observability-stack.md#^ref-e90b5a16-485-0) (line 485, col 0, score 0.67)
- [RAG UI Panel with Qdrant and PostgREST — L109](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-109-0) (line 109, col 0, score 0.66)
- [RAG UI Panel with Qdrant and PostgREST — L316](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-316-0) (line 316, col 0, score 0.67)
- [Local-Offline-Model-Deployment-Strategy — L288](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-288-0) (line 288, col 0, score 0.64)
- [RAG UI Panel with Qdrant and PostgREST — L107](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-107-0) (line 107, col 0, score 0.73)
- [ecs-scheduler-and-prefabs — L383](ecs-scheduler-and-prefabs.md#^ref-c62a1815-383-0) (line 383, col 0, score 0.68)
- [System Scheduler with Resource-Aware DAG — L381](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-381-0) (line 381, col 0, score 0.68)
- [Promethean Agent Config DSL — L300](promethean-agent-config-dsl.md#^ref-2c00ce45-300-0) (line 300, col 0, score 0.68)
- [plan-update-confirmation — L474](plan-update-confirmation.md#^ref-b22d79c6-474-0) (line 474, col 0, score 0.66)
- [plan-update-confirmation — L540](plan-update-confirmation.md#^ref-b22d79c6-540-0) (line 540, col 0, score 0.66)
- [universal-intention-code-fabric — L382](universal-intention-code-fabric.md#^ref-c14edce7-382-0) (line 382, col 0, score 0.65)
- [plan-update-confirmation — L429](plan-update-confirmation.md#^ref-b22d79c6-429-0) (line 429, col 0, score 0.65)
- [Layer1SurvivabilityEnvelope — L84](layer1survivabilityenvelope.md#^ref-64a9f9f9-84-0) (line 84, col 0, score 0.64)
- [Interop and Source Maps — L506](interop-and-source-maps.md#^ref-cdfac40c-506-0) (line 506, col 0, score 0.63)
- [plan-update-confirmation — L556](plan-update-confirmation.md#^ref-b22d79c6-556-0) (line 556, col 0, score 0.63)
- [Local-Only-LLM-Workflow — L128](local-only-llm-workflow.md#^ref-9a8ab57e-128-0) (line 128, col 0, score 0.66)
- [i3-config-validation-methods — L9](i3-config-validation-methods.md#^ref-d28090ac-9-0) (line 9, col 0, score 0.66)
- [pm2-orchestration-patterns — L238](pm2-orchestration-patterns.md#^ref-51932e7b-238-0) (line 238, col 0, score 0.65)
- [file-watcher-auth-fix — L3](file-watcher-auth-fix.md#^ref-9044701b-3-0) (line 3, col 0, score 0.65)
- [Agent Tasks: Persistence Migration to DualStore — L109](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-109-0) (line 109, col 0, score 0.65)
- [Agent Tasks: Persistence Migration to DualStore — L72](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-72-0) (line 72, col 0, score 0.65)
- [shared-package-layout-clarification — L143](shared-package-layout-clarification.md#^ref-36c8882a-143-0) (line 143, col 0, score 0.65)
- [Promethean Agent Config DSL — L292](promethean-agent-config-dsl.md#^ref-2c00ce45-292-0) (line 292, col 0, score 0.64)
- [pm2-orchestration-patterns — L129](pm2-orchestration-patterns.md#^ref-51932e7b-129-0) (line 129, col 0, score 0.64)
- [Pure TypeScript Search Microservice — L96](pure-typescript-search-microservice.md#^ref-d17d3a96-96-0) (line 96, col 0, score 0.62)
- [universal-intention-code-fabric — L417](universal-intention-code-fabric.md#^ref-c14edce7-417-0) (line 417, col 0, score 0.61)
- [Chroma-Embedding-Refactor — L109](chroma-embedding-refactor.md#^ref-8b256935-109-0) (line 109, col 0, score 0.71)
- [Chroma-Embedding-Refactor — L258](chroma-embedding-refactor.md#^ref-8b256935-258-0) (line 258, col 0, score 0.71)
- [Chroma Toolkit Consolidation Plan — L72](chroma-toolkit-consolidation-plan.md#^ref-5020e892-72-0) (line 72, col 0, score 0.71)
- [Chroma Toolkit Consolidation Plan — L88](chroma-toolkit-consolidation-plan.md#^ref-5020e892-88-0) (line 88, col 0, score 0.71)
- [Chroma Toolkit Consolidation Plan — L107](chroma-toolkit-consolidation-plan.md#^ref-5020e892-107-0) (line 107, col 0, score 0.71)
- [Chroma Toolkit Consolidation Plan — L148](chroma-toolkit-consolidation-plan.md#^ref-5020e892-148-0) (line 148, col 0, score 0.71)
- [Dynamic Context Model for Web Components — L331](dynamic-context-model-for-web-components.md#^ref-f7702bf8-331-0) (line 331, col 0, score 0.73)
- [Promethean-native config design — L31](promethean-native-config-design.md#^ref-ab748541-31-0) (line 31, col 0, score 0.73)
- [Chroma Toolkit Consolidation Plan — L157](chroma-toolkit-consolidation-plan.md#^ref-5020e892-157-0) (line 157, col 0, score 0.81)
- [Promethean-native config design — L32](promethean-native-config-design.md#^ref-ab748541-32-0) (line 32, col 0, score 0.8)
- [Promethean-native config design — L33](promethean-native-config-design.md#^ref-ab748541-33-0) (line 33, col 0, score 0.8)
- [Agent Tasks: Persistence Migration to DualStore — L175](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-175-0) (line 175, col 0, score 1)
- [api-gateway-versioning — L272](api-gateway-versioning.md#^ref-0580dcd3-272-0) (line 272, col 0, score 0.69)
- [Promethean Event Bus MVP v0.1 — L354](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-354-0) (line 354, col 0, score 0.64)
- [Language-Agnostic Mirror System — L526](language-agnostic-mirror-system.md#^ref-d2b3628c-526-0) (line 526, col 0, score 0.64)
- [Migrate to Provider-Tenant Architecture — L144](migrate-to-provider-tenant-architecture.md#^ref-54382370-144-0) (line 144, col 0, score 0.63)
- [TypeScript Patch for Tool Calling Support — L181](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-181-0) (line 181, col 0, score 0.61)
- [TypeScript Patch for Tool Calling Support — L271](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-271-0) (line 271, col 0, score 0.61)
- [api-gateway-versioning — L274](api-gateway-versioning.md#^ref-0580dcd3-274-0) (line 274, col 0, score 0.78)
- [Migrate to Provider-Tenant Architecture — L39](migrate-to-provider-tenant-architecture.md#^ref-54382370-39-0) (line 39, col 0, score 0.67)
- [Promethean-native config design — L38](promethean-native-config-design.md#^ref-ab748541-38-0) (line 38, col 0, score 0.66)
- [Promethean-native config design — L37](promethean-native-config-design.md#^ref-ab748541-37-0) (line 37, col 0, score 0.66)
- [Agent Tasks: Persistence Migration to DualStore — L47](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-47-0) (line 47, col 0, score 0.65)
- [Agent Tasks: Persistence Migration to DualStore — L48](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-48-0) (line 48, col 0, score 0.65)
- [Agent Tasks: Persistence Migration to DualStore — L49](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-49-0) (line 49, col 0, score 0.65)
- [Promethean-native config design — L39](promethean-native-config-design.md#^ref-ab748541-39-0) (line 39, col 0, score 0.65)
- [api-gateway-versioning — L275](api-gateway-versioning.md#^ref-0580dcd3-275-0) (line 275, col 0, score 1)
- [Dynamic Context Model for Web Components — L176](dynamic-context-model-for-web-components.md#^ref-f7702bf8-176-0) (line 176, col 0, score 1)
- [Dynamic Context Model for Web Components — L168](dynamic-context-model-for-web-components.md#^ref-f7702bf8-168-0) (line 168, col 0, score 0.79)
- [api-gateway-versioning — L276](api-gateway-versioning.md#^ref-0580dcd3-276-0) (line 276, col 0, score 1)
- [AI-Centric OS with MCP Layer — L10](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-10-0) (line 10, col 0, score 0.71)
- [Debugging Broker Connections and Agent Behavior — L7](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-7-0) (line 7, col 0, score 0.83)
- [Promethean Pipelines — L74](promethean-pipelines.md#^ref-8b8e6103-74-0) (line 74, col 0, score 0.78)
- [Local-Offline-Model-Deployment-Strategy — L23](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-23-0) (line 23, col 0, score 0.76)
- [Promethean-Copilot-Intent-Engine — L30](promethean-copilot-intent-engine.md#^ref-ae24a280-30-0) (line 30, col 0, score 0.75)
- [mystery-lisp-search-session — L26](mystery-lisp-search-session.md#^ref-513dc4c7-26-0) (line 26, col 0, score 0.75)
- [Chroma-Embedding-Refactor — L249](chroma-embedding-refactor.md#^ref-8b256935-249-0) (line 249, col 0, score 0.74)
- [Eidolon-Field-Optimization — L14](eidolon-field-optimization.md#^ref-40e05c14-14-0) (line 14, col 0, score 0.74)
- [Migrate to Provider-Tenant Architecture — L153](migrate-to-provider-tenant-architecture.md#^ref-54382370-153-0) (line 153, col 0, score 0.74)
- [Agent Tasks: Persistence Migration to DualStore — L70](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-70-0) (line 70, col 0, score 0.73)
- [ecs-offload-workers — L446](ecs-offload-workers.md#^ref-6498b9d7-446-0) (line 446, col 0, score 0.98)
- [ecs-scheduler-and-prefabs — L379](ecs-scheduler-and-prefabs.md#^ref-c62a1815-379-0) (line 379, col 0, score 0.98)
- [markdown-to-org-transpiler — L289](markdown-to-org-transpiler.md#^ref-ab54cdd8-289-0) (line 289, col 0, score 0.98)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L153](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-153-0) (line 153, col 0, score 0.98)
- [System Scheduler with Resource-Aware DAG — L377](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-377-0) (line 377, col 0, score 0.98)
- [eidolon-field-math-foundations — L105](eidolon-field-math-foundations.md#^ref-008f2ac0-105-0) (line 105, col 0, score 0.9)
- [Local-Only-LLM-Workflow — L163](local-only-llm-workflow.md#^ref-9a8ab57e-163-0) (line 163, col 0, score 0.87)
- [Performance-Optimized-Polyglot-Bridge — L429](performance-optimized-polyglot-bridge.md#^ref-f5579967-429-0) (line 429, col 0, score 0.81)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L497](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-497-0) (line 497, col 0, score 0.81)
- [Chroma-Embedding-Refactor — L26](chroma-embedding-refactor.md#^ref-8b256935-26-0) (line 26, col 0, score 0.79)
- [Agent Tasks: Persistence Migration to DualStore — L8](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-8-0) (line 8, col 0, score 0.79)
- [2d-sandbox-field — L180](2d-sandbox-field.md#^ref-c710dc93-180-0) (line 180, col 0, score 0.77)
- [Eidolon Field Abstract Model — L176](eidolon-field-abstract-model.md#^ref-5e8b2388-176-0) (line 176, col 0, score 0.77)
- [Exception Layer Analysis — L134](exception-layer-analysis.md#^ref-21d5cc09-134-0) (line 134, col 0, score 0.77)
- [field-dynamics-math-blocks — L117](field-dynamics-math-blocks.md#^ref-7cfc230d-117-0) (line 117, col 0, score 0.77)
- [field-node-diagram-outline — L82](field-node-diagram-outline.md#^ref-1f32c94a-82-0) (line 82, col 0, score 0.77)
- [RAG UI Panel with Qdrant and PostgREST — L327](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-327-0) (line 327, col 0, score 0.68)
- [AI-Centric OS with MCP Layer — L13](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-13-0) (line 13, col 0, score 0.66)
- [AI-Centric OS with MCP Layer — L8](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-8-0) (line 8, col 0, score 0.66)
- [RAG UI Panel with Qdrant and PostgREST — L329](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-329-0) (line 329, col 0, score 0.64)
- [ecs-offload-workers — L443](ecs-offload-workers.md#^ref-6498b9d7-443-0) (line 443, col 0, score 0.64)
- [Dynamic Context Model for Web Components — L311](dynamic-context-model-for-web-components.md#^ref-f7702bf8-311-0) (line 311, col 0, score 0.63)
- [Promethean-Copilot-Intent-Engine — L10](promethean-copilot-intent-engine.md#^ref-ae24a280-10-0) (line 10, col 0, score 0.62)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L1](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-1-0) (line 1, col 0, score 0.68)
- [universal-intention-code-fabric — L24](universal-intention-code-fabric.md#^ref-c14edce7-24-0) (line 24, col 0, score 0.67)
- [Board Walk – 2025-08-11 — L90](board-walk-2025-08-11.md#^ref-7aa1eb92-90-0) (line 90, col 0, score 0.66)
- [universal-intention-code-fabric — L415](universal-intention-code-fabric.md#^ref-c14edce7-415-0) (line 415, col 0, score 0.67)
- [Voice Access Layer Design — L106](voice-access-layer-design.md#^ref-543ed9b3-106-0) (line 106, col 0, score 0.64)
- [sibilant-meta-string-templating-runtime — L107](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-107-0) (line 107, col 0, score 0.62)
- [Dynamic Context Model for Web Components — L330](dynamic-context-model-for-web-components.md#^ref-f7702bf8-330-0) (line 330, col 0, score 0.63)
- [prom-lib-rate-limiters-and-replay-api — L364](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-364-0) (line 364, col 0, score 0.62)
- [Sibilant Meta-Prompt DSL — L140](sibilant-meta-prompt-dsl.md#^ref-af5d2824-140-0) (line 140, col 0, score 0.62)
- [Voice Access Layer Design — L160](voice-access-layer-design.md#^ref-543ed9b3-160-0) (line 160, col 0, score 0.61)
- [JavaScript — L29](chunks/javascript.md#^ref-c1618c66-29-0) (line 29, col 0, score 0.64)
- [Local-Offline-Model-Deployment-Strategy — L306](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-306-0) (line 306, col 0, score 0.64)
- [Migrate to Provider-Tenant Architecture — L326](migrate-to-provider-tenant-architecture.md#^ref-54382370-326-0) (line 326, col 0, score 0.64)
- [Per-Domain Policy System for JS Crawler — L501](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-501-0) (line 501, col 0, score 0.64)
- [pm2-orchestration-patterns — L260](pm2-orchestration-patterns.md#^ref-51932e7b-260-0) (line 260, col 0, score 0.64)
- [prom-lib-rate-limiters-and-replay-api — L390](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-390-0) (line 390, col 0, score 0.64)
- [Promethean Agent Config DSL — L353](promethean-agent-config-dsl.md#^ref-2c00ce45-353-0) (line 353, col 0, score 0.64)
- [Promethean Event Bus MVP v0.1 — L901](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-901-0) (line 901, col 0, score 0.64)
- [Promethean Full-Stack Docker Setup — L451](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-451-0) (line 451, col 0, score 0.64)
- [js-to-lisp-reverse-compiler — L386](js-to-lisp-reverse-compiler.md#^ref-58191024-386-0) (line 386, col 0, score 0.61)
- [Cross-Language Runtime Polymorphism — L133](cross-language-runtime-polymorphism.md#^ref-c34c36a6-133-0) (line 133, col 0, score 0.6)
- [WebSocket Gateway Implementation — L613](websocket-gateway-implementation.md#^ref-e811123d-613-0) (line 613, col 0, score 0.6)
- [Dynamic Context Model for Web Components — L293](dynamic-context-model-for-web-components.md#^ref-f7702bf8-293-0) (line 293, col 0, score 0.59)
- [Provider-Agnostic Chat Panel Implementation — L14](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-14-0) (line 14, col 0, score 0.59)
- [Provider-Agnostic Chat Panel Implementation — L223](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-223-0) (line 223, col 0, score 0.59)
- [zero-copy-snapshots-and-workers — L363](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-363-0) (line 363, col 0, score 1)
- [Simulation Demo — L32](chunks/simulation-demo.md#^ref-557309a3-32-0) (line 32, col 0, score 1)
- [Tooling — L26](chunks/tooling.md#^ref-6cb4943e-26-0) (line 26, col 0, score 1)
- [Window Management — L36](chunks/window-management.md#^ref-9e8ae388-36-0) (line 36, col 0, score 1)
- [compiler-kit-foundations — L639](compiler-kit-foundations.md#^ref-01b21543-639-0) (line 639, col 0, score 1)
- [Creative Moments — L10](creative-moments.md#^ref-10d98225-10-0) (line 10, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L258](cross-language-runtime-polymorphism.md#^ref-c34c36a6-258-0) (line 258, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L215](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-215-0) (line 215, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L50](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-50-0) (line 50, col 0, score 1)
- [Math Fundamentals — L20](chunks/math-fundamentals.md#^ref-c6e87433-20-0) (line 20, col 0, score 1)
- [Services — L20](chunks/services.md#^ref-75ea4a6a-20-0) (line 20, col 0, score 1)
- [compiler-kit-foundations — L620](compiler-kit-foundations.md#^ref-01b21543-620-0) (line 620, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L237](cross-language-runtime-polymorphism.md#^ref-c34c36a6-237-0) (line 237, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L40](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-40-0) (line 40, col 0, score 1)
- [Dynamic Context Model for Web Components — L401](dynamic-context-model-for-web-components.md#^ref-f7702bf8-401-0) (line 401, col 0, score 1)
- [ecs-scheduler-and-prefabs — L386](ecs-scheduler-and-prefabs.md#^ref-c62a1815-386-0) (line 386, col 0, score 1)
- [eidolon-field-math-foundations — L127](eidolon-field-math-foundations.md#^ref-008f2ac0-127-0) (line 127, col 0, score 1)
- [Event Bus MVP — L557](event-bus-mvp.md#^ref-534fe91d-557-0) (line 557, col 0, score 1)
- [Exception Layer Analysis — L172](exception-layer-analysis.md#^ref-21d5cc09-172-0) (line 172, col 0, score 1)
- [field-dynamics-math-blocks — L154](field-dynamics-math-blocks.md#^ref-7cfc230d-154-0) (line 154, col 0, score 1)
- [field-interaction-equations — L164](field-interaction-equations.md#^ref-b09141b7-164-0) (line 164, col 0, score 1)
- [field-node-diagram-outline — L120](field-node-diagram-outline.md#^ref-1f32c94a-120-0) (line 120, col 0, score 1)
- [field-node-diagram-set — L149](field-node-diagram-set.md#^ref-22b989d5-149-0) (line 149, col 0, score 1)
- [field-node-diagram-visualizations — L99](field-node-diagram-visualizations.md#^ref-e9b27b06-99-0) (line 99, col 0, score 1)
- [graph-ds — L365](graph-ds.md#^ref-6620e2f2-365-0) (line 365, col 0, score 1)
- [heartbeat-fragment-demo — L111](heartbeat-fragment-demo.md#^ref-dd00677a-111-0) (line 111, col 0, score 1)
- [heartbeat-simulation-snippets — L101](heartbeat-simulation-snippets.md#^ref-23e221e9-101-0) (line 101, col 0, score 1)
- [archetype-ecs — L453](archetype-ecs.md#^ref-8f4c1e86-453-0) (line 453, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L199](chroma-toolkit-consolidation-plan.md#^ref-5020e892-199-0) (line 199, col 0, score 1)
- [ecs-offload-workers — L453](ecs-offload-workers.md#^ref-6498b9d7-453-0) (line 453, col 0, score 1)
- [ecs-scheduler-and-prefabs — L385](ecs-scheduler-and-prefabs.md#^ref-c62a1815-385-0) (line 385, col 0, score 1)
- [eidolon-field-math-foundations — L128](eidolon-field-math-foundations.md#^ref-008f2ac0-128-0) (line 128, col 0, score 1)
- [Local-Only-LLM-Workflow — L177](local-only-llm-workflow.md#^ref-9a8ab57e-177-0) (line 177, col 0, score 1)
- [markdown-to-org-transpiler — L297](markdown-to-org-transpiler.md#^ref-ab54cdd8-297-0) (line 297, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L162](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-162-0) (line 162, col 0, score 1)
- [Admin Dashboard for User Management — L40](admin-dashboard-for-user-management.md#^ref-2901a3e9-40-0) (line 40, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L156](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-156-0) (line 156, col 0, score 1)
- [api-gateway-versioning — L297](api-gateway-versioning.md#^ref-0580dcd3-297-0) (line 297, col 0, score 1)
- [ecs-offload-workers — L454](ecs-offload-workers.md#^ref-6498b9d7-454-0) (line 454, col 0, score 1)
- [ecs-scheduler-and-prefabs — L388](ecs-scheduler-and-prefabs.md#^ref-c62a1815-388-0) (line 388, col 0, score 1)
- [eidolon-field-math-foundations — L129](eidolon-field-math-foundations.md#^ref-008f2ac0-129-0) (line 129, col 0, score 1)
- [field-interaction-equations — L177](field-interaction-equations.md#^ref-b09141b7-177-0) (line 177, col 0, score 1)
- [js-to-lisp-reverse-compiler — L422](js-to-lisp-reverse-compiler.md#^ref-58191024-422-0) (line 422, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L157](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-157-0) (line 157, col 0, score 1)
- [api-gateway-versioning — L298](api-gateway-versioning.md#^ref-0580dcd3-298-0) (line 298, col 0, score 1)
- [ecs-offload-workers — L455](ecs-offload-workers.md#^ref-6498b9d7-455-0) (line 455, col 0, score 1)
- [ecs-scheduler-and-prefabs — L389](ecs-scheduler-and-prefabs.md#^ref-c62a1815-389-0) (line 389, col 0, score 1)
- [eidolon-field-math-foundations — L130](eidolon-field-math-foundations.md#^ref-008f2ac0-130-0) (line 130, col 0, score 1)
- [i3-config-validation-methods — L63](i3-config-validation-methods.md#^ref-d28090ac-63-0) (line 63, col 0, score 1)
- [Interop and Source Maps — L531](interop-and-source-maps.md#^ref-cdfac40c-531-0) (line 531, col 0, score 1)
- [Language-Agnostic Mirror System — L548](language-agnostic-mirror-system.md#^ref-d2b3628c-548-0) (line 548, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L143](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-143-0) (line 143, col 0, score 1)
- [AI-Centric OS with MCP Layer — L407](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-407-0) (line 407, col 0, score 1)
- [api-gateway-versioning — L284](api-gateway-versioning.md#^ref-0580dcd3-284-0) (line 284, col 0, score 1)
- [Services — L21](chunks/services.md#^ref-75ea4a6a-21-0) (line 21, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L43](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-43-0) (line 43, col 0, score 1)
- [Dynamic Context Model for Web Components — L407](dynamic-context-model-for-web-components.md#^ref-f7702bf8-407-0) (line 407, col 0, score 1)
- [eidolon-field-math-foundations — L167](eidolon-field-math-foundations.md#^ref-008f2ac0-167-0) (line 167, col 0, score 1)
- [i3-bluetooth-setup — L123](i3-bluetooth-setup.md#^ref-5e408692-123-0) (line 123, col 0, score 1)
- [i3-config-validation-methods — L78](i3-config-validation-methods.md#^ref-d28090ac-78-0) (line 78, col 0, score 1)
- [Local-Offline-Model-Deployment-Strategy — L295](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-295-0) (line 295, col 0, score 1)
- [Chroma-Embedding-Refactor — L328](chroma-embedding-refactor.md#^ref-8b256935-328-0) (line 328, col 0, score 1)
- [Diagrams — L46](chunks/diagrams.md#^ref-45cd25b5-46-0) (line 46, col 0, score 1)
- [i3-config-validation-methods — L53](i3-config-validation-methods.md#^ref-d28090ac-53-0) (line 53, col 0, score 1)
- [Local-Only-LLM-Workflow — L180](local-only-llm-workflow.md#^ref-9a8ab57e-180-0) (line 180, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L276](migrate-to-provider-tenant-architecture.md#^ref-54382370-276-0) (line 276, col 0, score 1)
- [observability-infrastructure-setup — L376](observability-infrastructure-setup.md#^ref-b4e64f8c-376-0) (line 376, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L89](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-89-0) (line 89, col 0, score 1)
- [Promethean Agent Config DSL — L358](promethean-agent-config-dsl.md#^ref-2c00ce45-358-0) (line 358, col 0, score 1)
- [field-node-diagram-outline — L111](field-node-diagram-outline.md#^ref-1f32c94a-111-0) (line 111, col 0, score 1)
- [field-node-diagram-set — L144](field-node-diagram-set.md#^ref-22b989d5-144-0) (line 144, col 0, score 1)
- [field-node-diagram-visualizations — L94](field-node-diagram-visualizations.md#^ref-e9b27b06-94-0) (line 94, col 0, score 1)
- [Fnord Tracer Protocol — L258](fnord-tracer-protocol.md#^ref-fc21f824-258-0) (line 258, col 0, score 1)
- [graph-ds — L398](graph-ds.md#^ref-6620e2f2-398-0) (line 398, col 0, score 1)
- [heartbeat-fragment-demo — L110](heartbeat-fragment-demo.md#^ref-dd00677a-110-0) (line 110, col 0, score 1)
- [heartbeat-simulation-snippets — L99](heartbeat-simulation-snippets.md#^ref-23e221e9-99-0) (line 99, col 0, score 1)
- [homeostasis-decay-formulas — L151](homeostasis-decay-formulas.md#^ref-37b5d236-151-0) (line 151, col 0, score 1)
- [i3-bluetooth-setup — L119](i3-bluetooth-setup.md#^ref-5e408692-119-0) (line 119, col 0, score 1)
- [eidolon-field-math-foundations — L158](eidolon-field-math-foundations.md#^ref-008f2ac0-158-0) (line 158, col 0, score 1)
- [observability-infrastructure-setup — L375](observability-infrastructure-setup.md#^ref-b4e64f8c-375-0) (line 375, col 0, score 1)
- [Promethean Full-Stack Docker Setup — L435](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-435-0) (line 435, col 0, score 1)
- [Promethean Web UI Setup — L602](promethean-web-ui-setup.md#^ref-bc5172ca-602-0) (line 602, col 0, score 1)
- [Prometheus Observability Stack — L518](prometheus-observability-stack.md#^ref-e90b5a16-518-0) (line 518, col 0, score 1)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L436](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-436-0) (line 436, col 0, score 1)
- [Pure TypeScript Search Microservice — L520](pure-typescript-search-microservice.md#^ref-d17d3a96-520-0) (line 520, col 0, score 1)
- [shared-package-layout-clarification — L188](shared-package-layout-clarification.md#^ref-36c8882a-188-0) (line 188, col 0, score 1)
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
- [Promethean Web UI Setup — L605](promethean-web-ui-setup.md#^ref-bc5172ca-605-0) (line 605, col 0, score 1)
- [Prometheus Observability Stack — L507](prometheus-observability-stack.md#^ref-e90b5a16-507-0) (line 507, col 0, score 1)
- [Pure TypeScript Search Microservice — L530](pure-typescript-search-microservice.md#^ref-d17d3a96-530-0) (line 530, col 0, score 1)
- [Chroma-Embedding-Refactor — L326](chroma-embedding-refactor.md#^ref-8b256935-326-0) (line 326, col 0, score 1)
- [i3-config-validation-methods — L67](i3-config-validation-methods.md#^ref-d28090ac-67-0) (line 67, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L274](migrate-to-provider-tenant-architecture.md#^ref-54382370-274-0) (line 274, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L489](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-489-0) (line 489, col 0, score 1)
- [Promethean Agent Config DSL — L326](promethean-agent-config-dsl.md#^ref-2c00ce45-326-0) (line 326, col 0, score 1)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L441](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-441-0) (line 441, col 0, score 1)
- [shared-package-layout-clarification — L164](shared-package-layout-clarification.md#^ref-36c8882a-164-0) (line 164, col 0, score 1)
- [Vectorial Exception Descent — L175](vectorial-exception-descent.md#^ref-d771154e-175-0) (line 175, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L130](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-130-0) (line 130, col 0, score 1)
- [api-gateway-versioning — L303](api-gateway-versioning.md#^ref-0580dcd3-303-0) (line 303, col 0, score 1)
- [Chroma-Embedding-Refactor — L327](chroma-embedding-refactor.md#^ref-8b256935-327-0) (line 327, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L174](chroma-toolkit-consolidation-plan.md#^ref-5020e892-174-0) (line 174, col 0, score 1)
- [eidolon-field-math-foundations — L134](eidolon-field-math-foundations.md#^ref-008f2ac0-134-0) (line 134, col 0, score 1)
- [i3-config-validation-methods — L82](i3-config-validation-methods.md#^ref-d28090ac-82-0) (line 82, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L267](migrate-to-provider-tenant-architecture.md#^ref-54382370-267-0) (line 267, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L391](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-391-0) (line 391, col 0, score 1)
- [Promethean Agent Config DSL — L333](promethean-agent-config-dsl.md#^ref-2c00ce45-333-0) (line 333, col 0, score 1)
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
- [api-gateway-versioning — L286](api-gateway-versioning.md#^ref-0580dcd3-286-0) (line 286, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L44](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-44-0) (line 44, col 0, score 1)
- [Dynamic Context Model for Web Components — L410](dynamic-context-model-for-web-components.md#^ref-f7702bf8-410-0) (line 410, col 0, score 1)
- [observability-infrastructure-setup — L373](observability-infrastructure-setup.md#^ref-b4e64f8c-373-0) (line 373, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L65](promethean-copilot-intent-engine.md#^ref-ae24a280-65-0) (line 65, col 0, score 1)
- [Promethean Full-Stack Docker Setup — L438](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-438-0) (line 438, col 0, score 1)
- [Promethean Web UI Setup — L601](promethean-web-ui-setup.md#^ref-bc5172ca-601-0) (line 601, col 0, score 1)
- [Prometheus Observability Stack — L508](prometheus-observability-stack.md#^ref-e90b5a16-508-0) (line 508, col 0, score 1)
- [api-gateway-versioning — L293](api-gateway-versioning.md#^ref-0580dcd3-293-0) (line 293, col 0, score 1)
- [eidolon-field-math-foundations — L168](eidolon-field-math-foundations.md#^ref-008f2ac0-168-0) (line 168, col 0, score 1)
- [i3-config-validation-methods — L75](i3-config-validation-methods.md#^ref-d28090ac-75-0) (line 75, col 0, score 1)
- [Local-Only-LLM-Workflow — L200](local-only-llm-workflow.md#^ref-9a8ab57e-200-0) (line 200, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L325](migrate-to-provider-tenant-architecture.md#^ref-54382370-325-0) (line 325, col 0, score 1)
- [observability-infrastructure-setup — L377](observability-infrastructure-setup.md#^ref-b4e64f8c-377-0) (line 377, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L475](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-475-0) (line 475, col 0, score 1)
- [Promethean Full-Stack Docker Setup — L434](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-434-0) (line 434, col 0, score 1)
- [AI-Centric OS with MCP Layer — L401](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-401-0) (line 401, col 0, score 1)
- [api-gateway-versioning — L296](api-gateway-versioning.md#^ref-0580dcd3-296-0) (line 296, col 0, score 1)
- [i3-bluetooth-setup — L110](i3-bluetooth-setup.md#^ref-5e408692-110-0) (line 110, col 0, score 1)
- [Local-Offline-Model-Deployment-Strategy — L291](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-291-0) (line 291, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L279](migrate-to-provider-tenant-architecture.md#^ref-54382370-279-0) (line 279, col 0, score 1)
- [Mongo Outbox Implementation — L574](mongo-outbox-implementation.md#^ref-9c1acd1e-574-0) (line 574, col 0, score 1)
- [observability-infrastructure-setup — L359](observability-infrastructure-setup.md#^ref-b4e64f8c-359-0) (line 359, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L477](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-477-0) (line 477, col 0, score 1)
- [markdown-to-org-transpiler — L318](markdown-to-org-transpiler.md#^ref-ab54cdd8-318-0) (line 318, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L322](migrate-to-provider-tenant-architecture.md#^ref-54382370-322-0) (line 322, col 0, score 1)
- [Mongo Outbox Implementation — L579](mongo-outbox-implementation.md#^ref-9c1acd1e-579-0) (line 579, col 0, score 1)
- [observability-infrastructure-setup — L369](observability-infrastructure-setup.md#^ref-b4e64f8c-369-0) (line 369, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L183](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-183-0) (line 183, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L483](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-483-0) (line 483, col 0, score 1)
- [polymorphic-meta-programming-engine — L241](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-241-0) (line 241, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L415](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-415-0) (line 415, col 0, score 1)
- [Promethean Agent Config DSL — L352](promethean-agent-config-dsl.md#^ref-2c00ce45-352-0) (line 352, col 0, score 1)
- [Board Walk – 2025-08-11 — L132](board-walk-2025-08-11.md#^ref-7aa1eb92-132-0) (line 132, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L166](chroma-toolkit-consolidation-plan.md#^ref-5020e892-166-0) (line 166, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L207](cross-language-runtime-polymorphism.md#^ref-c34c36a6-207-0) (line 207, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L193](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-193-0) (line 193, col 0, score 1)
- [Dynamic Context Model for Web Components — L381](dynamic-context-model-for-web-components.md#^ref-f7702bf8-381-0) (line 381, col 0, score 1)
- [Exception Layer Analysis — L154](exception-layer-analysis.md#^ref-21d5cc09-154-0) (line 154, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L265](migrate-to-provider-tenant-architecture.md#^ref-54382370-265-0) (line 265, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L130](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-130-0) (line 130, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L39](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-39-0) (line 39, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L38](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-38-0) (line 38, col 0, score 1)
- [AI-Centric OS with MCP Layer — L409](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-409-0) (line 409, col 0, score 1)
- [api-gateway-versioning — L295](api-gateway-versioning.md#^ref-0580dcd3-295-0) (line 295, col 0, score 1)
- [eidolon-field-math-foundations — L166](eidolon-field-math-foundations.md#^ref-008f2ac0-166-0) (line 166, col 0, score 1)
- [Local-Offline-Model-Deployment-Strategy — L293](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-293-0) (line 293, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L307](migrate-to-provider-tenant-architecture.md#^ref-54382370-307-0) (line 307, col 0, score 1)
- [observability-infrastructure-setup — L364](observability-infrastructure-setup.md#^ref-b4e64f8c-364-0) (line 364, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L492](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-492-0) (line 492, col 0, score 1)
- [Admin Dashboard for User Management — L39](admin-dashboard-for-user-management.md#^ref-2901a3e9-39-0) (line 39, col 0, score 1)
- [archetype-ecs — L471](archetype-ecs.md#^ref-8f4c1e86-471-0) (line 471, col 0, score 1)
- [Board Walk – 2025-08-11 — L141](board-walk-2025-08-11.md#^ref-7aa1eb92-141-0) (line 141, col 0, score 1)
- [JavaScript — L31](chunks/javascript.md#^ref-c1618c66-31-0) (line 31, col 0, score 1)
- [ecs-offload-workers — L459](ecs-offload-workers.md#^ref-6498b9d7-459-0) (line 459, col 0, score 1)
- [ecs-scheduler-and-prefabs — L395](ecs-scheduler-and-prefabs.md#^ref-c62a1815-395-0) (line 395, col 0, score 1)
- [eidolon-field-math-foundations — L156](eidolon-field-math-foundations.md#^ref-008f2ac0-156-0) (line 156, col 0, score 1)
- [i3-config-validation-methods — L64](i3-config-validation-methods.md#^ref-d28090ac-64-0) (line 64, col 0, score 1)
- [Diagrams — L26](chunks/diagrams.md#^ref-45cd25b5-26-0) (line 26, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L295](migrate-to-provider-tenant-architecture.md#^ref-54382370-295-0) (line 295, col 0, score 1)
- [Promethean Agent Config DSL — L316](promethean-agent-config-dsl.md#^ref-2c00ce45-316-0) (line 316, col 0, score 1)
- [shared-package-layout-clarification — L173](shared-package-layout-clarification.md#^ref-36c8882a-173-0) (line 173, col 0, score 1)
- [Shared Package Structure — L165](shared-package-structure.md#^ref-66a72fc3-165-0) (line 165, col 0, score 1)
- [Unique Info Dump Index — L140](unique-info-dump-index.md#^ref-30ec3ba6-140-0) (line 140, col 0, score 1)
- [Voice Access Layer Design — L323](voice-access-layer-design.md#^ref-543ed9b3-323-0) (line 323, col 0, score 1)
- [WebSocket Gateway Implementation — L640](websocket-gateway-implementation.md#^ref-e811123d-640-0) (line 640, col 0, score 1)
- [Pure TypeScript Search Microservice — L538](pure-typescript-search-microservice.md#^ref-d17d3a96-538-0) (line 538, col 0, score 1)
- [RAG UI Panel with Qdrant and PostgREST — L374](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-374-0) (line 374, col 0, score 1)
- [ripple-propagation-demo — L120](ripple-propagation-demo.md#^ref-8430617b-120-0) (line 120, col 0, score 1)
- [schema-evolution-workflow — L502](schema-evolution-workflow.md#^ref-d8059b6a-502-0) (line 502, col 0, score 1)
- [Self-Agency in AI Interaction — L53](self-agency-in-ai-interaction.md#^ref-49a9a860-53-0) (line 53, col 0, score 1)
- [set-assignment-in-lisp-ast — L161](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-161-0) (line 161, col 0, score 1)
- [shared-package-layout-clarification — L185](shared-package-layout-clarification.md#^ref-36c8882a-185-0) (line 185, col 0, score 1)
- [Shared Package Structure — L181](shared-package-structure.md#^ref-66a72fc3-181-0) (line 181, col 0, score 1)
- [sibilant-macro-targets — L173](sibilant-macro-targets.md#^ref-c5c9a5c6-173-0) (line 173, col 0, score 1)
- [Sibilant Meta-Prompt DSL — L194](sibilant-meta-prompt-dsl.md#^ref-af5d2824-194-0) (line 194, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L129](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-129-0) (line 129, col 0, score 1)
- [api-gateway-versioning — L315](api-gateway-versioning.md#^ref-0580dcd3-315-0) (line 315, col 0, score 1)
- [Chroma-Embedding-Refactor — L331](chroma-embedding-refactor.md#^ref-8b256935-331-0) (line 331, col 0, score 1)
- [Diagrams — L25](chunks/diagrams.md#^ref-45cd25b5-25-0) (line 25, col 0, score 1)
- [Tooling — L24](chunks/tooling.md#^ref-6cb4943e-24-0) (line 24, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L214](cross-language-runtime-polymorphism.md#^ref-c34c36a6-214-0) (line 214, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L173](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-173-0) (line 173, col 0, score 1)
- [Dynamic Context Model for Web Components — L390](dynamic-context-model-for-web-components.md#^ref-f7702bf8-390-0) (line 390, col 0, score 1)
- [eidolon-field-math-foundations — L147](eidolon-field-math-foundations.md#^ref-008f2ac0-147-0) (line 147, col 0, score 1)
- [Event Bus MVP — L553](event-bus-mvp.md#^ref-534fe91d-553-0) (line 553, col 0, score 1)
- [field-interaction-equations — L159](field-interaction-equations.md#^ref-b09141b7-159-0) (line 159, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L315](functional-embedding-pipeline-refactor.md#^ref-a4a25141-315-0) (line 315, col 0, score 1)
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
- [Agent Tasks: Persistence Migration to DualStore — L158](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-158-0) (line 158, col 0, score 1)
- [Chroma-Embedding-Refactor — L329](chroma-embedding-refactor.md#^ref-8b256935-329-0) (line 329, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L196](chroma-toolkit-consolidation-plan.md#^ref-5020e892-196-0) (line 196, col 0, score 1)
- [Dynamic Context Model for Web Components — L414](dynamic-context-model-for-web-components.md#^ref-f7702bf8-414-0) (line 414, col 0, score 1)
- [Event Bus MVP — L550](event-bus-mvp.md#^ref-534fe91d-550-0) (line 550, col 0, score 1)
- [i3-bluetooth-setup — L102](i3-bluetooth-setup.md#^ref-5e408692-102-0) (line 102, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L142](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-142-0) (line 142, col 0, score 1)
- [Local-Only-LLM-Workflow — L195](local-only-llm-workflow.md#^ref-9a8ab57e-195-0) (line 195, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L153](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-153-0) (line 153, col 0, score 1)
- [archetype-ecs — L468](archetype-ecs.md#^ref-8f4c1e86-468-0) (line 468, col 0, score 1)
- [DSL — L17](chunks/dsl.md#^ref-e87bc036-17-0) (line 17, col 0, score 1)
- [compiler-kit-foundations — L619](compiler-kit-foundations.md#^ref-01b21543-619-0) (line 619, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L217](cross-language-runtime-polymorphism.md#^ref-c34c36a6-217-0) (line 217, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L177](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-177-0) (line 177, col 0, score 1)
- [Dynamic Context Model for Web Components — L387](dynamic-context-model-for-web-components.md#^ref-f7702bf8-387-0) (line 387, col 0, score 1)
- [ecs-offload-workers — L472](ecs-offload-workers.md#^ref-6498b9d7-472-0) (line 472, col 0, score 1)
- [eidolon-field-math-foundations — L145](eidolon-field-math-foundations.md#^ref-008f2ac0-145-0) (line 145, col 0, score 1)
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
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L529](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-529-0) (line 529, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L138](protocol-0-the-contradiction-engine.md#^ref-9a93a756-138-0) (line 138, col 0, score 1)
- [Promethean_Eidolon_Synchronicity_Model — L74](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-74-0) (line 74, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L929](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-929-0) (line 929, col 0, score 1)
- [Promethean-native config design — L421](promethean-native-config-design.md#^ref-ab748541-421-0) (line 421, col 0, score 1)
- [promethean-system-diagrams — L217](promethean-system-diagrams.md#^ref-b51e19b4-217-0) (line 217, col 0, score 1)
- [Promethean Web UI Setup — L629](promethean-web-ui-setup.md#^ref-bc5172ca-629-0) (line 629, col 0, score 1)
- [Prompt_Folder_Bootstrap — L193](prompt-folder-bootstrap.md#^ref-bd4f0976-193-0) (line 193, col 0, score 1)
- [prompt-programming-language-lisp — L107](prompt-programming-language-lisp.md#^ref-d41a06d1-107-0) (line 107, col 0, score 1)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L457](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-457-0) (line 457, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L214](chroma-toolkit-consolidation-plan.md#^ref-5020e892-214-0) (line 214, col 0, score 1)
- [Tooling — L18](chunks/tooling.md#^ref-6cb4943e-18-0) (line 18, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L226](cross-language-runtime-polymorphism.md#^ref-c34c36a6-226-0) (line 226, col 0, score 1)
- [ecs-offload-workers — L473](ecs-offload-workers.md#^ref-6498b9d7-473-0) (line 473, col 0, score 1)
- [ecs-scheduler-and-prefabs — L399](ecs-scheduler-and-prefabs.md#^ref-c62a1815-399-0) (line 399, col 0, score 1)
- [eidolon-field-math-foundations — L146](eidolon-field-math-foundations.md#^ref-008f2ac0-146-0) (line 146, col 0, score 1)
- [Event Bus MVP — L556](event-bus-mvp.md#^ref-534fe91d-556-0) (line 556, col 0, score 1)
- [i3-bluetooth-setup — L106](i3-bluetooth-setup.md#^ref-5e408692-106-0) (line 106, col 0, score 1)
- [Diagrams — L13](chunks/diagrams.md#^ref-45cd25b5-13-0) (line 13, col 0, score 1)
- [DSL — L15](chunks/dsl.md#^ref-e87bc036-15-0) (line 15, col 0, score 1)
- [JavaScript — L18](chunks/javascript.md#^ref-c1618c66-18-0) (line 18, col 0, score 1)
- [Math Fundamentals — L14](chunks/math-fundamentals.md#^ref-c6e87433-14-0) (line 14, col 0, score 1)
- [Services — L14](chunks/services.md#^ref-75ea4a6a-14-0) (line 14, col 0, score 1)
- [Shared — L7](chunks/shared.md#^ref-623a55f7-7-0) (line 7, col 0, score 1)
- [Simulation Demo — L10](chunks/simulation-demo.md#^ref-557309a3-10-0) (line 10, col 0, score 1)
- [Tooling — L9](chunks/tooling.md#^ref-6cb4943e-9-0) (line 9, col 0, score 1)
- [Window Management — L15](chunks/window-management.md#^ref-9e8ae388-15-0) (line 15, col 0, score 1)
- [markdown-to-org-transpiler — L313](markdown-to-org-transpiler.md#^ref-ab54cdd8-313-0) (line 313, col 0, score 1)
- [Matplotlib Animation with Async Execution — L79](matplotlib-animation-with-async-execution.md#^ref-687439f9-79-0) (line 79, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L299](migrate-to-provider-tenant-architecture.md#^ref-54382370-299-0) (line 299, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L151](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-151-0) (line 151, col 0, score 1)
- [Mongo Outbox Implementation — L587](mongo-outbox-implementation.md#^ref-9c1acd1e-587-0) (line 587, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L77](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-77-0) (line 77, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L179](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-179-0) (line 179, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L282](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-282-0) (line 282, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L480](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-480-0) (line 480, col 0, score 1)
- [AI-Centric OS with MCP Layer — L408](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-408-0) (line 408, col 0, score 1)
- [api-gateway-versioning — L316](api-gateway-versioning.md#^ref-0580dcd3-316-0) (line 316, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L213](chroma-toolkit-consolidation-plan.md#^ref-5020e892-213-0) (line 213, col 0, score 1)
- [Event Bus MVP — L581](event-bus-mvp.md#^ref-534fe91d-581-0) (line 581, col 0, score 1)
- [i3-bluetooth-setup — L101](i3-bluetooth-setup.md#^ref-5e408692-101-0) (line 101, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L178](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-178-0) (line 178, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L303](migrate-to-provider-tenant-architecture.md#^ref-54382370-303-0) (line 303, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L140](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-140-0) (line 140, col 0, score 1)
- [Mongo Outbox Implementation — L585](mongo-outbox-implementation.md#^ref-9c1acd1e-585-0) (line 585, col 0, score 1)
- [2d-sandbox-field — L225](2d-sandbox-field.md#^ref-c710dc93-225-0) (line 225, col 0, score 1)
- [Admin Dashboard for User Management — L49](admin-dashboard-for-user-management.md#^ref-2901a3e9-49-0) (line 49, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L150](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-150-0) (line 150, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L163](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-163-0) (line 163, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L9](ai-first-os-model-context-protocol.md#^ref-618198f4-9-0) (line 9, col 0, score 1)
- [aionian-circuit-math — L179](aionian-circuit-math.md#^ref-f2d83a77-179-0) (line 179, col 0, score 1)
- [api-gateway-versioning — L304](api-gateway-versioning.md#^ref-0580dcd3-304-0) (line 304, col 0, score 1)
- [archetype-ecs — L479](archetype-ecs.md#^ref-8f4c1e86-479-0) (line 479, col 0, score 1)
- [balanced-bst — L295](balanced-bst.md#^ref-d3e7db72-295-0) (line 295, col 0, score 1)
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
- [Promethean Web UI Setup — L615](promethean-web-ui-setup.md#^ref-bc5172ca-615-0) (line 615, col 0, score 1)
- [Pure TypeScript Search Microservice — L536](pure-typescript-search-microservice.md#^ref-d17d3a96-536-0) (line 536, col 0, score 1)
- [shared-package-layout-clarification — L169](shared-package-layout-clarification.md#^ref-36c8882a-169-0) (line 169, col 0, score 1)
- [Shared Package Structure — L177](shared-package-structure.md#^ref-66a72fc3-177-0) (line 177, col 0, score 1)
- [eidolon-node-lifecycle — L63](eidolon-node-lifecycle.md#^ref-938eca9c-63-0) (line 63, col 0, score 1)
- [EidolonField — L269](eidolonfield.md#^ref-49d1e1e5-269-0) (line 269, col 0, score 1)
- [Event Bus MVP — L566](event-bus-mvp.md#^ref-534fe91d-566-0) (line 566, col 0, score 1)
- [Event Bus Projections Architecture — L185](event-bus-projections-architecture.md#^ref-cf6b9b17-185-0) (line 185, col 0, score 1)
- [Exception Layer Analysis — L165](exception-layer-analysis.md#^ref-21d5cc09-165-0) (line 165, col 0, score 1)
- [Factorio AI with External Agents — L160](factorio-ai-with-external-agents.md#^ref-a4d90289-160-0) (line 160, col 0, score 1)
- [field-dynamics-math-blocks — L165](field-dynamics-math-blocks.md#^ref-7cfc230d-165-0) (line 165, col 0, score 1)
- [field-interaction-equations — L184](field-interaction-equations.md#^ref-b09141b7-184-0) (line 184, col 0, score 1)
- [field-node-diagram-outline — L132](field-node-diagram-outline.md#^ref-1f32c94a-132-0) (line 132, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L152](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-152-0) (line 152, col 0, score 1)
- [api-gateway-versioning — L294](api-gateway-versioning.md#^ref-0580dcd3-294-0) (line 294, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L191](chroma-toolkit-consolidation-plan.md#^ref-5020e892-191-0) (line 191, col 0, score 1)
- [Services — L11](chunks/services.md#^ref-75ea4a6a-11-0) (line 11, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L228](cross-language-runtime-polymorphism.md#^ref-c34c36a6-228-0) (line 228, col 0, score 1)
- [ecs-offload-workers — L465](ecs-offload-workers.md#^ref-6498b9d7-465-0) (line 465, col 0, score 1)
- [Event Bus MVP — L547](event-bus-mvp.md#^ref-534fe91d-547-0) (line 547, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L312](migrate-to-provider-tenant-architecture.md#^ref-54382370-312-0) (line 312, col 0, score 1)
- [Admin Dashboard for User Management — L46](admin-dashboard-for-user-management.md#^ref-2901a3e9-46-0) (line 46, col 0, score 1)
- [DSL — L22](chunks/dsl.md#^ref-e87bc036-22-0) (line 22, col 0, score 1)
- [compiler-kit-foundations — L609](compiler-kit-foundations.md#^ref-01b21543-609-0) (line 609, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L229](cross-language-runtime-polymorphism.md#^ref-c34c36a6-229-0) (line 229, col 0, score 1)
- [ecs-offload-workers — L460](ecs-offload-workers.md#^ref-6498b9d7-460-0) (line 460, col 0, score 1)
- [ecs-scheduler-and-prefabs — L396](ecs-scheduler-and-prefabs.md#^ref-c62a1815-396-0) (line 396, col 0, score 1)
- [eidolon-field-math-foundations — L157](eidolon-field-math-foundations.md#^ref-008f2ac0-157-0) (line 157, col 0, score 1)
- [i3-config-validation-methods — L57](i3-config-validation-methods.md#^ref-d28090ac-57-0) (line 57, col 0, score 1)
- [Interop and Source Maps — L516](interop-and-source-maps.md#^ref-cdfac40c-516-0) (line 516, col 0, score 1)
- [Language-Agnostic Mirror System — L536](language-agnostic-mirror-system.md#^ref-d2b3628c-536-0) (line 536, col 0, score 1)
- [Local-Only-LLM-Workflow — L169](local-only-llm-workflow.md#^ref-9a8ab57e-169-0) (line 169, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L169](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-169-0) (line 169, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L437](performance-optimized-polyglot-bridge.md#^ref-f5579967-437-0) (line 437, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L506](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-506-0) (line 506, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L12](promethean-copilot-intent-engine.md#^ref-ae24a280-12-0) (line 12, col 0, score 0.67)
- [universal-intention-code-fabric — L22](universal-intention-code-fabric.md#^ref-c14edce7-22-0) (line 22, col 0, score 0.67)
- [Math Fundamentals — L34](chunks/math-fundamentals.md#^ref-c6e87433-34-0) (line 34, col 0, score 1)
- [Services — L22](chunks/services.md#^ref-75ea4a6a-22-0) (line 22, col 0, score 1)
- [Shared — L29](chunks/shared.md#^ref-623a55f7-29-0) (line 29, col 0, score 1)
- [Simulation Demo — L23](chunks/simulation-demo.md#^ref-557309a3-23-0) (line 23, col 0, score 1)
- [Tooling — L16](chunks/tooling.md#^ref-6cb4943e-16-0) (line 16, col 0, score 1)
- [Window Management — L25](chunks/window-management.md#^ref-9e8ae388-25-0) (line 25, col 0, score 1)
- [compiler-kit-foundations — L627](compiler-kit-foundations.md#^ref-01b21543-627-0) (line 627, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L171](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-171-0) (line 171, col 0, score 1)
- [Duck's Attractor States — L81](ducks-attractor-states.md#^ref-13951643-81-0) (line 81, col 0, score 1)
- [Language-Agnostic Mirror System — L538](language-agnostic-mirror-system.md#^ref-d2b3628c-538-0) (line 538, col 0, score 1)
- [layer-1-uptime-diagrams — L178](layer-1-uptime-diagrams.md#^ref-4127189a-178-0) (line 178, col 0, score 1)
- [Lisp-Compiler-Integration — L550](lisp-compiler-integration.md#^ref-cfee6d36-550-0) (line 550, col 0, score 1)
- [lisp-dsl-for-window-management — L223](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-223-0) (line 223, col 0, score 1)
- [Lispy Macros with syntax-rules — L406](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-406-0) (line 406, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L168](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-168-0) (line 168, col 0, score 1)
- [Local-Only-LLM-Workflow — L201](local-only-llm-workflow.md#^ref-9a8ab57e-201-0) (line 201, col 0, score 1)
- [markdown-to-org-transpiler — L323](markdown-to-org-transpiler.md#^ref-ab54cdd8-323-0) (line 323, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L496](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-496-0) (line 496, col 0, score 1)
- [ripple-propagation-demo — L118](ripple-propagation-demo.md#^ref-8430617b-118-0) (line 118, col 0, score 1)
- [DuckDuckGoSearchPipeline — L16](duckduckgosearchpipeline.md#^ref-e979c50f-16-0) (line 16, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L172](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-172-0) (line 172, col 0, score 1)
- [AI-Centric OS with MCP Layer — L424](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-424-0) (line 424, col 0, score 1)
- [aionian-circuit-math — L183](aionian-circuit-math.md#^ref-f2d83a77-183-0) (line 183, col 0, score 1)
- [api-gateway-versioning — L310](api-gateway-versioning.md#^ref-0580dcd3-310-0) (line 310, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L211](chroma-toolkit-consolidation-plan.md#^ref-5020e892-211-0) (line 211, col 0, score 1)
- [Diagrams — L23](chunks/diagrams.md#^ref-45cd25b5-23-0) (line 23, col 0, score 1)
- [DSL — L27](chunks/dsl.md#^ref-e87bc036-27-0) (line 27, col 0, score 1)
- [Math Fundamentals — L39](chunks/math-fundamentals.md#^ref-c6e87433-39-0) (line 39, col 0, score 1)
- [Shared — L28](chunks/shared.md#^ref-623a55f7-28-0) (line 28, col 0, score 1)
- [Simulation Demo — L29](chunks/simulation-demo.md#^ref-557309a3-29-0) (line 29, col 0, score 1)
- [Tooling — L14](chunks/tooling.md#^ref-6cb4943e-14-0) (line 14, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L231](cross-language-runtime-polymorphism.md#^ref-c34c36a6-231-0) (line 231, col 0, score 1)
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
- [sibilant-macro-targets — L172](sibilant-macro-targets.md#^ref-c5c9a5c6-172-0) (line 172, col 0, score 1)
- [Sibilant Meta-Prompt DSL — L205](sibilant-meta-prompt-dsl.md#^ref-af5d2824-205-0) (line 205, col 0, score 1)
- [sibilant-meta-string-templating-runtime — L137](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-137-0) (line 137, col 0, score 1)
- [sibilant-metacompiler-overview — L90](sibilant-metacompiler-overview.md#^ref-61d4086b-90-0) (line 90, col 0, score 1)
- [State Snapshots API and Transactional Projector — L366](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-366-0) (line 366, col 0, score 1)
- [System Scheduler with Resource-Aware DAG — L394](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-394-0) (line 394, col 0, score 1)
- [template-based-compilation — L104](template-based-compilation.md#^ref-f8877e5e-104-0) (line 104, col 0, score 1)
- [ts-to-lisp-transpiler — L8](ts-to-lisp-transpiler.md#^ref-ba11486b-8-0) (line 8, col 0, score 1)
- [typed-struct-compiler — L384](typed-struct-compiler.md#^ref-78eeedf7-384-0) (line 384, col 0, score 1)
- [Language-Agnostic Mirror System — L532](language-agnostic-mirror-system.md#^ref-d2b3628c-532-0) (line 532, col 0, score 1)
- [Lispy Macros with syntax-rules — L399](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-399-0) (line 399, col 0, score 1)
- [Local-Only-LLM-Workflow — L183](local-only-llm-workflow.md#^ref-9a8ab57e-183-0) (line 183, col 0, score 1)
- [markdown-to-org-transpiler — L306](markdown-to-org-transpiler.md#^ref-ab54cdd8-306-0) (line 306, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L314](migrate-to-provider-tenant-architecture.md#^ref-54382370-314-0) (line 314, col 0, score 1)
- [mystery-lisp-search-session — L127](mystery-lisp-search-session.md#^ref-513dc4c7-127-0) (line 127, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L171](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-171-0) (line 171, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L255](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-255-0) (line 255, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L448](performance-optimized-polyglot-bridge.md#^ref-f5579967-448-0) (line 448, col 0, score 1)
- [archetype-ecs — L456](archetype-ecs.md#^ref-8f4c1e86-456-0) (line 456, col 0, score 1)
- [DSL — L18](chunks/dsl.md#^ref-e87bc036-18-0) (line 18, col 0, score 1)
- [JavaScript — L27](chunks/javascript.md#^ref-c1618c66-27-0) (line 27, col 0, score 1)
- [compiler-kit-foundations — L616](compiler-kit-foundations.md#^ref-01b21543-616-0) (line 616, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L198](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-198-0) (line 198, col 0, score 1)
- [Dynamic Context Model for Web Components — L408](dynamic-context-model-for-web-components.md#^ref-f7702bf8-408-0) (line 408, col 0, score 1)
- [ecs-offload-workers — L489](ecs-offload-workers.md#^ref-6498b9d7-489-0) (line 489, col 0, score 1)
- [ecs-scheduler-and-prefabs — L415](ecs-scheduler-and-prefabs.md#^ref-c62a1815-415-0) (line 415, col 0, score 1)
- [aionian-circuit-math — L165](aionian-circuit-math.md#^ref-f2d83a77-165-0) (line 165, col 0, score 1)
- [api-gateway-versioning — L319](api-gateway-versioning.md#^ref-0580dcd3-319-0) (line 319, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L116](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-116-0) (line 116, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L209](chroma-toolkit-consolidation-plan.md#^ref-5020e892-209-0) (line 209, col 0, score 1)
- [DSL — L13](chunks/dsl.md#^ref-e87bc036-13-0) (line 13, col 0, score 1)
- [Math Fundamentals — L16](chunks/math-fundamentals.md#^ref-c6e87433-16-0) (line 16, col 0, score 1)
- [Services — L16](chunks/services.md#^ref-75ea4a6a-16-0) (line 16, col 0, score 1)
- [Shared — L5](chunks/shared.md#^ref-623a55f7-5-0) (line 5, col 0, score 1)
- [Simulation Demo — L12](chunks/simulation-demo.md#^ref-557309a3-12-0) (line 12, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L181](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-181-0) (line 181, col 0, score 1)
- [AI-Centric OS with MCP Layer — L429](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-429-0) (line 429, col 0, score 1)
- [api-gateway-versioning — L317](api-gateway-versioning.md#^ref-0580dcd3-317-0) (line 317, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L186](chroma-toolkit-consolidation-plan.md#^ref-5020e892-186-0) (line 186, col 0, score 1)
- [Dynamic Context Model for Web Components — L433](dynamic-context-model-for-web-components.md#^ref-f7702bf8-433-0) (line 433, col 0, score 1)
- [Event Bus MVP — L555](event-bus-mvp.md#^ref-534fe91d-555-0) (line 555, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L150](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-150-0) (line 150, col 0, score 1)
- [Local-Offline-Model-Deployment-Strategy — L290](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-290-0) (line 290, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L298](migrate-to-provider-tenant-architecture.md#^ref-54382370-298-0) (line 298, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L209](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-209-0) (line 209, col 0, score 1)
- [Duck's Attractor States — L67](ducks-attractor-states.md#^ref-13951643-67-0) (line 67, col 0, score 1)
- [Factorio AI with External Agents — L150](factorio-ai-with-external-agents.md#^ref-a4d90289-150-0) (line 150, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L63](model-upgrade-calm-down-guide.md#^ref-db74343f-63-0) (line 63, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L10](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-10-0) (line 10, col 0, score 1)
- [observability-infrastructure-setup — L391](observability-infrastructure-setup.md#^ref-b4e64f8c-391-0) (line 391, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L56](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-56-0) (line 56, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L111](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-111-0) (line 111, col 0, score 1)
- [OpenAPI Validation Report — L29](openapi-validation-report.md#^ref-5c152b08-29-0) (line 29, col 0, score 1)
- [Optimizing Command Limitations in System Design — L36](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-36-0) (line 36, col 0, score 1)
- [plan-update-confirmation — L1013](plan-update-confirmation.md#^ref-b22d79c6-1013-0) (line 1013, col 0, score 1)
- [Admin Dashboard for User Management — L55](admin-dashboard-for-user-management.md#^ref-2901a3e9-55-0) (line 55, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L10](ai-first-os-model-context-protocol.md#^ref-618198f4-10-0) (line 10, col 0, score 1)
- [Window Management — L23](chunks/window-management.md#^ref-9e8ae388-23-0) (line 23, col 0, score 1)
- [Creative Moments — L7](creative-moments.md#^ref-10d98225-7-0) (line 7, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L210](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-210-0) (line 210, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L47](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-47-0) (line 47, col 0, score 1)
- [DuckDuckGoSearchPipeline — L11](duckduckgosearchpipeline.md#^ref-e979c50f-11-0) (line 11, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L44](ducks-self-referential-perceptual-loop.md#^ref-71726f04-44-0) (line 44, col 0, score 1)
- [Dynamic Context Model for Web Components — L424](dynamic-context-model-for-web-components.md#^ref-f7702bf8-424-0) (line 424, col 0, score 1)
- [Event Bus Projections Architecture — L170](event-bus-projections-architecture.md#^ref-cf6b9b17-170-0) (line 170, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L96](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-96-0) (line 96, col 0, score 1)
- [Promethean Chat Activity Report — L22](promethean-chat-activity-report.md#^ref-18344cf9-22-0) (line 22, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L165](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-165-0) (line 165, col 0, score 1)
- [Promethean Documentation Update — L5](promethean-documentation-update.md#^ref-c0392040-5-0) (line 5, col 0, score 1)
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
- [Agent Tasks: Persistence Migration to DualStore — L159](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-159-0) (line 159, col 0, score 1)
- [AI-Centric OS with MCP Layer — L400](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-400-0) (line 400, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L197](chroma-toolkit-consolidation-plan.md#^ref-5020e892-197-0) (line 197, col 0, score 1)
- [Diagrams — L45](chunks/diagrams.md#^ref-45cd25b5-45-0) (line 45, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L222](cross-language-runtime-polymorphism.md#^ref-c34c36a6-222-0) (line 222, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L167](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-167-0) (line 167, col 0, score 1)
- [Dynamic Context Model for Web Components — L385](dynamic-context-model-for-web-components.md#^ref-f7702bf8-385-0) (line 385, col 0, score 1)
- [i3-config-validation-methods — L86](i3-config-validation-methods.md#^ref-d28090ac-86-0) (line 86, col 0, score 1)
- [js-to-lisp-reverse-compiler — L408](js-to-lisp-reverse-compiler.md#^ref-58191024-408-0) (line 408, col 0, score 1)
- [Lisp-Compiler-Integration — L542](lisp-compiler-integration.md#^ref-cfee6d36-542-0) (line 542, col 0, score 1)
- [lisp-dsl-for-window-management — L227](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-227-0) (line 227, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L145](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-145-0) (line 145, col 0, score 1)
- [Local-Only-LLM-Workflow — L212](local-only-llm-workflow.md#^ref-9a8ab57e-212-0) (line 212, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L291](migrate-to-provider-tenant-architecture.md#^ref-54382370-291-0) (line 291, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L155](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-155-0) (line 155, col 0, score 1)
- [Mongo Outbox Implementation — L550](mongo-outbox-implementation.md#^ref-9c1acd1e-550-0) (line 550, col 0, score 1)
- [observability-infrastructure-setup — L368](observability-infrastructure-setup.md#^ref-b4e64f8c-368-0) (line 368, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L72](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-72-0) (line 72, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L201](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-201-0) (line 201, col 0, score 1)
- [polymorphic-meta-programming-engine — L246](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-246-0) (line 246, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L384](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-384-0) (line 384, col 0, score 1)
- [Promethean Agent Config DSL — L329](promethean-agent-config-dsl.md#^ref-2c00ce45-329-0) (line 329, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L182](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-182-0) (line 182, col 0, score 1)
- [aionian-circuit-math — L184](aionian-circuit-math.md#^ref-f2d83a77-184-0) (line 184, col 0, score 1)
- [Board Walk – 2025-08-11 — L154](board-walk-2025-08-11.md#^ref-7aa1eb92-154-0) (line 154, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L208](chroma-toolkit-consolidation-plan.md#^ref-5020e892-208-0) (line 208, col 0, score 1)
- [Dynamic Context Model for Web Components — L437](dynamic-context-model-for-web-components.md#^ref-f7702bf8-437-0) (line 437, col 0, score 1)
- [eidolon-field-math-foundations — L175](eidolon-field-math-foundations.md#^ref-008f2ac0-175-0) (line 175, col 0, score 1)
- [eidolon-node-lifecycle — L64](eidolon-node-lifecycle.md#^ref-938eca9c-64-0) (line 64, col 0, score 1)
- [Exception Layer Analysis — L173](exception-layer-analysis.md#^ref-21d5cc09-173-0) (line 173, col 0, score 1)
- [Factorio AI with External Agents — L162](factorio-ai-with-external-agents.md#^ref-a4d90289-162-0) (line 162, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L317](functional-embedding-pipeline-refactor.md#^ref-a4a25141-317-0) (line 317, col 0, score 1)
- [api-gateway-versioning — L320](api-gateway-versioning.md#^ref-0580dcd3-320-0) (line 320, col 0, score 1)
- [Optimizing Command Limitations in System Design — L52](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-52-0) (line 52, col 0, score 1)
- [Promethean Pipelines: Local TypeScript-First Workflow — L259](promethean-pipelines-local-typescript-first-workflow.md#^ref-6b63edca-259-0) (line 259, col 0, score 0.83)
- [Agent Tasks: Persistence Migration to DualStore — L146](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-146-0) (line 146, col 0, score 0.78)
- [api-gateway-versioning — L282](api-gateway-versioning.md#^ref-0580dcd3-282-0) (line 282, col 0, score 0.78)
- [archetype-ecs — L470](archetype-ecs.md#^ref-8f4c1e86-470-0) (line 470, col 0, score 0.78)
- [Chroma Toolkit Consolidation Plan — L201](chroma-toolkit-consolidation-plan.md#^ref-5020e892-201-0) (line 201, col 0, score 0.78)
- [Diagrams — L27](chunks/diagrams.md#^ref-45cd25b5-27-0) (line 27, col 0, score 0.78)
- [Debugging Broker Connections and Agent Behavior — L38](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-38-0) (line 38, col 0, score 0.78)
- [ecs-scheduler-and-prefabs — L390](ecs-scheduler-and-prefabs.md#^ref-c62a1815-390-0) (line 390, col 0, score 0.78)
- [eidolon-field-math-foundations — L125](eidolon-field-math-foundations.md#^ref-008f2ac0-125-0) (line 125, col 0, score 0.78)
- [DSL — L44](chunks/dsl.md#^ref-e87bc036-44-0) (line 44, col 0, score 1)
- [JavaScript — L48](chunks/javascript.md#^ref-c1618c66-48-0) (line 48, col 0, score 1)
- [Math Fundamentals — L43](chunks/math-fundamentals.md#^ref-c6e87433-43-0) (line 43, col 0, score 1)
- [Operations — L15](chunks/operations.md#^ref-f1add613-15-0) (line 15, col 0, score 1)
- [Services — L43](chunks/services.md#^ref-75ea4a6a-43-0) (line 43, col 0, score 1)
- [Shared — L31](chunks/shared.md#^ref-623a55f7-31-0) (line 31, col 0, score 1)
- [Simulation Demo — L34](chunks/simulation-demo.md#^ref-557309a3-34-0) (line 34, col 0, score 1)
- [Tooling — L28](chunks/tooling.md#^ref-6cb4943e-28-0) (line 28, col 0, score 1)
- [Window Management — L38](chunks/window-management.md#^ref-9e8ae388-38-0) (line 38, col 0, score 1)
- [compiler-kit-foundations — L651](compiler-kit-foundations.md#^ref-01b21543-651-0) (line 651, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L263](cross-language-runtime-polymorphism.md#^ref-c34c36a6-263-0) (line 263, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L219](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-219-0) (line 219, col 0, score 1)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
