---
uuid: 7842d43c-7d13-46f0-bdf1-561f5e4c6f53
created_at: promethean-infrastructure-setup.md
filename: promethean-infrastructure-setup
title: promethean-infrastructure-setup
description: >-
  This document outlines the setup for a secure, production-grade infrastructure
  using Docker and NGINX. It includes a TypeScript-based API gateway, crawler,
  embeddings service, and Ollama/Qdrant integration with Tor/Privoxy for
  optional crawler routing.
tags:
  - docker
  - nginx
  - typescript
  - ollama
  - qdrant
  - tor
  - privoxy
  - api-gateway
  - embeddings
  - crawler
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
      proxy_pass 
      proxy_set_header Host $host;
      proxy_http_version 1.1;
    }

    # direct service mounts (optional; can be hidden behind /api if you prefer)
    location /ollama/   { proxy_pass  }
    location /qdrant/   { proxy_pass  }
    location /crawler/  { proxy_pass  }
    location /embeddings/ { proxy_pass  }
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
      - HTTP_PROXY=
      - HTTPS_PROXY=
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
      - UPSTREAM_OLLAMA=
      - UPSTREAM_QDRANT=
      - UPSTREAM_CRAWLER=
^ref-6deed6ac-93-0
      - UPSTREAM_EMBEDDINGS=
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
^ref-6deed6ac-207-0
^ref-6deed6ac-224-0

# 🔌 `services/ts/api-gateway/src/server.ts`
 ^ref-6deed6ac-235-0
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
^ref-6deed6ac-235-0
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

## `shared/ts/package.json` ^ref-6deed6ac-424-0

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
^ref-6deed6ac-424-0
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

* Health: `curl  api/health` (note the space removed → `/api/health`) ^ref-6deed6ac-589-0 ^ref-6deed6ac-660-0
* Chat: `curl -X POST  -d '{"model":"qwen2.5-coder:7b","messages":[{"role":"user","content":"hello"}]}' -H 'content-type: application/json'`
* Crawl: `curl -X POST  -d '{"url":" -H 'content-type: application/json'`
* Embeddings: `curl -X POST  -d '{"input":["hello world"]}' -H 'content-type: application/json'` ^ref-6deed6ac-592-0
 ^ref-6deed6ac-574-0
---
 ^ref-6deed6ac-576-0 ^ref-6deed6ac-626-0
If you want, I can also add: ^ref-6deed6ac-577-0
 ^ref-6deed6ac-578-0 ^ref-6deed6ac-597-0 ^ref-6deed6ac-628-0 ^ref-6deed6ac-665-0
* a **/rag/query** route in the gateway (crawl → embed → similarity search in Qdrant → optional LLM answer), ^ref-6deed6ac-579-0
* a **WS** endpoint for streaming LLM tokens,
* or fold `/ollama`, `/qdrant`, `/crawler`, `/embeddings` behind `/api/*` only (fully opaque services).
 ^ref-6deed6ac-582-0
What do you want next—RAG flow wired end-to-end or WS streaming?
