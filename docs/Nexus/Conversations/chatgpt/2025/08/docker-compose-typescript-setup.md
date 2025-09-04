---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Docker compose Typescript setup"
conversation_id: 68b48066-eb34-832f-9b9f-6951cd388de8
create_time: 08/31/2025 at 12:03 PM
update_time: 08/31/2025 at 12:15 PM
---

# Title: Docker compose Typescript setup

Created: 08/31/2025 at 12:03 PM
Last Updated: 08/31/2025 at 12:15 PM
Chat URL: https://chat.openai.com/c/68b48066-eb34-832f-9b9f-6951cd388de8


>[!nexus_user] **User** - 08/31/2025 at 12:03 PM
> The other chats were starting to lag. Where were we at on the docker compose + typescript interface setup?
<!-- UID: 58a0abcb-2227-451e-bbf0-1aa293faef4e -->




>[!nexus_agent] **Assistant** - 08/31/2025 at 12:03 PM
> Nice—picking it back up. Last we aligned on: **all ports hidden behind NGINX**, **no SaaS/tokens**, **JS/TS-only services**, **Dockerfiles live in `./images/`**, and **infra kept out of source**. We also said to include **Ollama**, **Qdrant** (local vector DB), **Tor (+Privoxy)** for optional crawler routing, a **TS crawler**, a **TS embeddings service** (no Python; `@xenova/transformers`), and a tiny **TS API Gateway** to give you a clean interface. Here’s the concrete drop:
> 
> # 📁 File tree (where to put things)
> ```
> /images/
>  ts-service.docker
>  nginx.docker
> /infrastructure/compose/
>  stack.yml
>  nginx.conf
> /services/ts/
>  api-gateway/
>  package.json
>  src/server.ts
>  crawler/
>  package.json
>  src/main.ts
>  embeddings/
>  package.json
>  src/server.ts
> /shared/ts/
>  package.json
>  src/http.ts
>  src/clients/ollama.ts
>  src/clients/qdrant.ts
>  src/clients/crawler.ts
>  src/clients/embeddings.ts
> ```
> 
> # 🐳 `./images/ts-service.docker`
> ```dockerfile
> # Minimal, reproducible TS base (no Python)
> FROM node:22-slim
> 
> ENV NODE_ENV=production \
>  PNPM_HOME=/usr/local/share/pnpm \
>  PATH=/usr/local/share/pnpm:$PATH
> 
> RUN corepack enable && apt-get update && apt-get install -y --no-install-recommends \
>  dumb-init ca-certificates tini \
>  && rm -rf /var/lib/apt/lists/*
> 
> WORKDIR /app
> USER node
> # Services copy their own files in their image build (multi-stage or on top of this)
> ENTRYPOINT ["dumb-init", "--"]
> CMD ["node", "dist/server.js"]
> ```
> 
> # 🧰 `./images/nginx.docker`
> ```dockerfile
> FROM nginx:1.27-alpine
> COPY nginx.conf /etc/nginx/nginx.conf
> ```
> 
> # 🌐 `./infrastructure/compose/nginx.conf`
> ```nginx
> worker_processes auto;
> events { worker_connections 1024; }
> http {
>  sendfile on;
>  upstream api_gateway { server api-gateway:8080; }
>  upstream ollama_up { server ollama:11434; }
>  upstream qdrant_up { server qdrant:6333; }
>  upstream crawler_up { server crawler:3000; }
>  upstream embeds_up { server embeddings:7070; }
> 
>  server {
>  listen 80;
> 
>  # flat API surface
>  location /api/ {
>  proxy_pass http://api_gateway/;
>  proxy_set_header Host $host;
>  proxy_http_version 1.1;
>  }
> 
>  # direct service mounts (optional; can be hidden behind /api if you prefer)
>  location /ollama/ { proxy_pass http://ollama_up/; }
>  location /qdrant/ { proxy_pass http://qdrant_up/; }
>  location /crawler/ { proxy_pass http://crawler_up/; }
>  location /embeddings/ { proxy_pass http://embeds_up/; }
>  }
> }
> ```
> 
> # 🧩 `./infrastructure/compose/stack.yml`
> ```yaml
> version: "3.9"
> 
> networks:
>  prom-net: { driver: bridge }
> 
> volumes:
>  ollama-data:
>  qdrant-data:
> 
> services:
>  nginx:
>  build:
>  context: ../../
>  dockerfile: images/nginx.docker
>  image: promethean/nginx:local
>  depends_on:
>  - api-gateway
>  ports:
>  - "80:80" # only exposed host port
>  networks: [prom-net]
> 
>  ollama:
>  image: ollama/ollama:latest
>  restart: unless-stopped
>  environment:
>  - OLLAMA_HOST=0.0.0.0
>  volumes:
>  - ollama-data:/root/.ollama
>  # Optional NVIDIA GPU:
>  deploy:
>  resources:
>  reservations:
>  devices:
>  - capabilities: ["gpu"]
>  networks: [prom-net]
> 
>  qdrant:
>  image: qdrant/qdrant:latest
>  restart: unless-stopped
>  volumes:
>  - qdrant-data:/qdrant/storage
>  networks: [prom-net]
> 
>  tor:
>  image: dperson/torproxy
>  restart: unless-stopped
>  networks: [prom-net]
> 
>  privoxy:
>  image: vimagick/privoxy
>  restart: unless-stopped
>  environment:
>  - FORWARD_SOCKS5=tor:9050
>  networks: [prom-net]
>  depends_on: [tor]
> 
>  crawler:
>  build:
>  context: ../../
>  dockerfile: images/ts-service.docker
>  image: promethean/crawler:local
>  working_dir: /app
>  volumes:
>  - ../../services/ts/crawler:/app
>  command: ["node", "--enable-source-maps", "dist/main.js"]
>  environment:
>  - HTTP_PROXY=http://privoxy:8118
>  - HTTPS_PROXY=http://privoxy:8118
>  - NO_PROXY=nginx,api-gateway,qdrant,ollama,embeddings,localhost,127.0.0.1
>  networks: [prom-net]
>  depends_on: [privoxy]
> 
>  embeddings:
>  build:
>  context: ../../
>  dockerfile: images/ts-service.docker
>  image: promethean/embeddings:local
>  working_dir: /app
>  volumes:
>  - ../../services/ts/embeddings:/app
>  command: ["node", "--enable-source-maps", "dist/server.js"]
>  environment:
>  - MODEL_ID=${MODEL_ID:-Xenova/nomic-embed-text-v1.5}
>  # Alternative CLIP: "Xenova/clip-vit-large-patch14"
>  networks: [prom-net]
> 
>  api-gateway:
>  build:
>  context: ../../
>  dockerfile: images/ts-service.docker
>  image: promethean/api-gateway:local
>  working_dir: /app
>  volumes:
>  - ../../services/ts/api-gateway:/app
>  command: ["node", "--enable-source-maps", "dist/server.js"]
>  environment:
>  - UPSTREAM_OLLAMA=http://ollama:11434
>  - UPSTREAM_QDRANT=http://qdrant:6333
>  - UPSTREAM_CRAWLER=http://crawler:3000
>  - UPSTREAM_EMBEDDINGS=http://embeddings:7070
>  depends_on: [ollama, qdrant]
>  networks: [prom-net]
> ```
> 
> # 🧪 `services/ts/api-gateway/package.json`
> ```json
> {
>  "name": "api-gateway",
>  "type": "module",
>  "private": true,
>  "scripts": {
>  "dev": "tsx watch src/server.ts",
>  "build": "tsc -p .",
>  "start": "node dist/server.js"
>  },
>  "dependencies": {
>  "hono": "^4.5.7",
>  "undici": "^6.19.8",
>  "zod": "^3.23.8"
>  },
>  "devDependencies": {
>  "tsx": "^4.19.2",
>  "typescript": "^5.5.4"
>  }
> }
> ```
> 
> # 🔌 `services/ts/api-gateway/src/server.ts`
> ```ts
> import { Hono } from 'hono'
> import { serve } from '@hono/node-server'
> import { fetch as f } from 'undici'
> 
> const app = new Hono()
> 
> const OLLAMA = process.env.UPSTREAM_OLLAMA!
> const QDRANT = process.env.UPSTREAM_QDRANT!
> const CRAWLER = process.env.UPSTREAM_CRAWLER!
> const EMBEDS = process.env.UPSTREAM_EMBEDDINGS!
> 
> app.get('/health', c => c.json({ ok: true }))
> 
> // Example: proxy chat to Ollama
> app.post('/llm/chat', async (c) => {
>  const body = await c.req.json()
>  const r = await f(`${OLLAMA}/api/chat`, {
>  method: 'POST',
>  body: JSON.stringify(body),
>  headers: { 'content-type': 'application/json' }
>  })
>  return c.newResponse(r.body, r)
> })
> 
> // Example: embeddings
> app.post('/embeddings', async (c) => {
>  const body = await c.req.json()
>  const r = await f(`${EMBEDS}/embeddings`, {
>  method: 'POST',
>  body: JSON.stringify(body),
>  headers: { 'content-type': 'application/json' }
>  })
>  return c.newResponse(r.body, r)
> })
> 
> // Example: vector upsert to Qdrant
> app.post('/vectors/upsert', async (c) => {
>  const body = await c.req.json()
>  const r = await f(`${QDRANT}/collections/${body.collection}/points?wait=true`, {
>  method: 'PUT',
>  body: JSON.stringify({ points: body.points }),
>  headers: { 'content-type': 'application/json' }
>  })
>  return c.newResponse(r.body, r)
> })
> 
> // Example: crawl
> app.post('/crawl', async (c) => {
>  const body = await c.req.json()
>  const r = await f(`${CRAWLER}/crawl`, {
>  method: 'POST',
>  body: JSON.stringify(body),
>  headers: { 'content-type': 'application/json' }
>  })
>  return c.newResponse(r.body, r)
> })
> 
> serve({ fetch: app.fetch, port: 8080 })
> ```
> 
> # 🕷️ `services/ts/crawler/package.json`
> ```json
> {
>  "name": "crawler",
>  "type": "module",
>  "private": true,
>  "scripts": {
>  "dev": "tsx watch src/main.ts",
>  "build": "tsc -p .",
>  "start": "node dist/main.js"
>  },
>  "dependencies": {
>  "got": "^14.4.2",
>  "cheerio": "^1.0.0-rc.12",
>  "hono": "^4.5.7"
>  },
>  "devDependencies": {
>  "tsx": "^4.19.2",
>  "typescript": "^5.5.4"
>  }
> }
> ```
> 
> # 🌐 `services/ts/crawler/src/main.ts`
> ```ts
> import { Hono } from 'hono'
> import { serve } from '@hono/node-server'
> import got from 'got'
> import * as cheerio from 'cheerio'
> 
> const app = new Hono()
> 
> app.post('/crawl', async (c) => {
>  const { url } = await c.req.json() as { url: string }
>  const html = await got(url, { timeout: { request: 15000 } }).text()
>  const $ = cheerio.load(html)
> 
>  const title = $('title').first().text()
>  const text = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 20000)
> 
>  return c.json({ url, title, text })
> })
> 
> serve({ fetch: app.fetch, port: 3000 })
> ```
> 
> # 🧠 `services/ts/embeddings/package.json`
> ```json
> {
>  "name": "embeddings",
>  "type": "module",
>  "private": true,
>  "scripts": {
>  "dev": "tsx watch src/server.ts",
>  "build": "tsc -p .",
>  "start": "node dist/server.js"
>  },
>  "dependencies": {
>  "@xenova/transformers": "^2.17.2",
>  "hono": "^4.5.7"
>  },
>  "devDependencies": {
>  "tsx": "^4.19.2",
>  "typescript": "^5.5.4"
>  }
> }
> ```
> 
> # 🔡 `services/ts/embeddings/src/server.ts`
> ```ts
> import { Hono } from 'hono'
> import { serve } from '@hono/node-server'
> import { pipeline } from '@xenova/transformers'
> 
> const MODEL_ID = process.env.MODEL_ID || 'Xenova/nomic-embed-text-v1.5'
> 
> let embedder: any
> async function getEmbedder() {
>  if (!embedder) {
>  embedder = await pipeline('feature-extraction', MODEL_ID)
>  }
>  return embedder
> }
> 
> const app = new Hono()
> 
> app.post('/embeddings', async (c) => {
>  const { input } = await c.req.json() as { input: string[] | string }
>  const run = await getEmbedder()
>  const arr = Array.isArray(input) ? input : [input]
>  const outputs = await Promise.all(arr.map(async (t) => (await run(t)).data))
>  return c.json({ embeddings: outputs })
> })
> 
> serve({ fetch: app.fetch, port: 7070 })
> ```
> 
> # 🧱 Shared TS interface (SDK)
> 
> > Note: per your rule, imports should look like `@shared/ts/dist/...` after build. Here I show source; your build should output to `@shared/ts/dist/...`.
> 
> ## `shared/ts/package.json`
> ```json
> {
>  "name": "@shared/ts",
>  "type": "module",
>  "private": true,
>  "exports": {
>  "./dist/*": "./dist/*"
>  },
>  "scripts": {
>  "build": "tsc -p ."
>  },
>  "devDependencies": {
>  "typescript": "^5.5.4",
>  "zod": "^3.23.8"
>  },
>  "dependencies": {
>  "undici": "^6.19.8"
>  }
> }
> ```
> 
> ## `shared/ts/src/http.ts`
> ```ts
> import { fetch } from 'undici'
> 
> export async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
>  const res = await fetch(url, {
>  ...init,
>  headers: { 'content-type': 'application/json', ...(init?.headers || {}) }
>  })
>  if (!res.ok) {
>  const text = await res.text().catch(() => '')
>  throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`)
>  }
>  return res.json() as Promise<T>
> }
> 
> export const api = (base = '') => ({
>  get: <T>(p: string) => jsonFetch<T>(base + p),
>  post: <T>(p: string, body: unknown) =>
>  jsonFetch<T>(base + p, { method: 'POST', body: JSON.stringify(body) }),
> })
> ```
> 
> ## `shared/ts/src/clients/ollama.ts`
> ```ts
> import { api } from '../http.js'
> 
> export type ChatMsg = { role: 'system' | 'user' | 'assistant'; content: string }
> export type ChatReq = { model: string; messages: ChatMsg[] }
> export type ChatResp = { message: ChatMsg; done: boolean }
> 
> export const createOllamaClient = (base = '/api') => {
>  const a = api(base)
>  return {
>  chat: (req: ChatReq) => a.post<ChatResp>('/llm/chat', req)
>  }
> }
> ```
> 
> ## `shared/ts/src/clients/qdrant.ts`
> ```ts
> import { api } from '../http.js'
> type Point = { id: string | number; vector: number[]; payload?: Record<string, unknown> }
> 
> export const createQdrantClient = (base = '/api') => {
>  const a = api(base)
>  return {
>  upsert: (collection: string, points: Point[]) =>
>  a.post(`/vectors/upsert`, { collection, points })
>  }
> }
> ```
> 
> ## `shared/ts/src/clients/crawler.ts`
> ```ts
> import { api } from '../http.js'
> export type CrawlResult = { url: string; title: string; text: string }
> 
> export const createCrawlerClient = (base = '/api') => {
>  const a = api(base)
>  return {
>  crawl: (url: string) => a.post<CrawlResult>('/crawl', { url })
>  }
> }
> ```
> 
> ## `shared/ts/src/clients/embeddings.ts`
> ```ts
> import { api } from '../http.js'
> 
> export type EmbeddingsResp = { embeddings: number[][] }
> 
> export const createEmbeddingsClient = (base = '/api') => {
>  const a = api(base)
>  return {
>  embed: (input: string[] | string) =>
>  a.post<EmbeddingsResp>('/embeddings', { input })
>  }
> }
> ```
> 
> # 🗺️ Mermaid (you like diagrams)
> ```mermaid
> flowchart LR
>  subgraph Host[Host]
>  NGINX["NGINX :80"]
>  end
> 
>  subgraph prom-net
>  AG["api-gateway :8080"]
>  OLLAMA["ollama :11434"]
>  QD["qdrant :6333"]
>  CRAWL["crawler :3000"]
>  EMB["embeddings :7070"]
>  TOR["tor :9050"]
>  PRX["privoxy :8118"]
>  end
> 
>  NGINX -->|/api/*| AG
>  NGINX -->|/ollama/*| OLLAMA
>  NGINX -->|/qdrant/*| QD
>  NGINX -->|/crawler/*| CRAWL
>  NGINX -->|/embeddings/*| EMB
> 
>  CRAWL -->|HTTP(S) via| PRX --> TOR
>  AG --> OLLAMA
>  AG --> QD
>  AG --> CRAWL
>  AG --> EMB
> ```
> 
> ---
> 
> ## How to run
> 
> 1) Build once from repo root:
> ```bash
> docker compose -f infrastructure/compose/stack.yml build
> ```
> 
> 2) Dev mode (hot-reload with volumes already set):
> - In each TS service folder, run `pnpm i && pnpm build` (or `pnpm dev` if you prefer local runs).
> - Then:
> ```bash
> docker compose -f infrastructure/compose/stack.yml up -d
> ```
> 
> 3) Test endpoints (all via NGINX, single port :80):
> - Health: `curl http://localhost/ api/health` (note the space removed → `/api/health`)
> - Chat: `curl -X POST http://localhost/api/llm/chat -d '{"model":"qwen2.5-coder:7b","messages":[{"role":"user","content":"hello"}]}' -H 'content-type: application/json'`
> - Crawl: `curl -X POST http://localhost/api/crawl -d '{"url":"https://example.com"}' -H 'content-type: application/json'`
> - Embeddings: `curl -X POST http://localhost/api/embeddings -d '{"input":["hello world"]}' -H 'content-type: application/json'`
> 
> ---
> 
> If you want, I can also add:
> - a **/rag/query** route in the gateway (crawl → embed → similarity search in Qdrant → optional LLM answer),
> - a **WS** endpoint for streaming LLM tokens,
> - or fold `/ollama`, `/qdrant`, `/crawler`, `/embeddings` behind `/api/*` only (fully opaque services).
> 
> What do you want next—RAG flow wired end-to-end or WS streaming?
<!-- UID: 535fb670-9de6-4353-bc68-18074b793b9a -->

---




>[!nexus_user] **User** - 08/31/2025 at 12:09 PM
> I want to version the api, and provide an openapi swagger json doc thing.
<!-- UID: e23e1f00-e217-4e8e-ac8d-f12c7c8e8b11 -->




>[!nexus_agent] **Assistant** - 08/31/2025 at 12:09 PM
> Got it. Here’s the **versioned API (`/api/v1`)** plus **OpenAPI (JSON) + Swagger UI** for the gateway.
> 
> # 1) NGINX: route `/api/v1/*` (+ redirect `/api/* → /api/v1/*`) and expose `/docs`
> `infrastructure/compose/nginx.conf`
> ```nginx
> worker_processes auto;
> events { worker_connections 1024; }
> http {
>  sendfile on;
> 
>  upstream api_gateway { server api-gateway:8080; }
>  upstream ollama_up { server ollama:11434; }
>  upstream qdrant_up { server qdrant:6333; }
>  upstream crawler_up { server crawler:3000; }
>  upstream embeds_up { server embeddings:7070; }
> 
>  server {
>  listen 80;
> 
>  # Hard versioning
>  location ~ ^/api/(v\d+/.*)$ {
>  proxy_pass http://api_gateway/$1;
>  proxy_set_header Host $host;
>  proxy_http_version 1.1;
>  }
> 
>  # Back-compat: redirect /api/* → /api/v1/*
>  location ~ ^/api/(?!v\d+/)(.*)$ {
>  return 308 /api/v1/$1;
>  }
> 
>  # Serve Swagger UI and its assets from the gateway
>  location /docs/ { proxy_pass http://api_gateway/docs/; }
>  location = /docs { return 308 /docs/; }
> 
>  # Optional direct mounts (keep or remove as you like)
>  location /ollama/ { proxy_pass http://ollama_up/; }
>  location /qdrant/ { proxy_pass http://qdrant_up/; }
>  location /crawler/ { proxy_pass http://crawler_up/; }
>  location /embeddings/ { proxy_pass http://embeds_up/; }
>  }
> }
> ```
> 
> # 2) Gateway deps (add OpenAPI + Swagger UI)
> `services/ts/api-gateway/package.json`
> ```json
> {
>  "name": "api-gateway",
>  "type": "module",
>  "private": true,
>  "scripts": {
>  "dev": "tsx watch src/server.ts",
>  "build": "tsc -p .",
>  "start": "node dist/server.js"
>  },
>  "dependencies": {
>  "@hono/zod-openapi": "^0.16.4",
>  "hono": "^4.5.7",
>  "swagger-ui-dist": "^5.17.14",
>  "undici": "^6.19.8",
>  "zod": "^3.23.8"
>  },
>  "devDependencies": {
>  "tsx": "^4.19.2",
>  "typescript": "^5.5.4"
>  }
> }
> ```
> 
> # 3) Gateway server with `/api/v1/openapi.json` + `/docs`
> `services/ts/api-gateway/src/server.ts`
> ```ts
> import { Hono } from 'hono'
> import { serve } from '@hono/node-server'
> import { fetch as f } from 'undici'
> 
> import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
> import { serveStatic } from '@hono/node-server/serve-static'
> import { getAbsoluteFSPath as swaggerDist } from 'swagger-ui-dist'
> 
> // Upstreams
> const OLLAMA = process.env.UPSTREAM_OLLAMA!
> const QDRANT = process.env.UPSTREAM_QDRANT!
> const CRAWLER = process.env.UPSTREAM_CRAWLER!
> const EMBEDS = process.env.UPSTREAM_EMBEDDINGS!
> 
> // ---- OpenAPI (v1) app ----
> const v1 = new OpenAPIHono()
> 
> v1.use('*', async (c, next) => {
>  c.header('x-api-version', 'v1')
>  await next()
> })
> 
> /** Schemas */
> const ChatMsg = z.object({
>  role: z.enum(['system', 'user', 'assistant']),
>  content: z.string()
> })
> const ChatReq = z.object({
>  model: z.string(),
>  messages: z.array(ChatMsg)
> })
> const ChatResp = z.object({
>  message: ChatMsg,
>  done: z.boolean()
> })
> 
> const EmbeddingsReq = z.object({
>  input: z.union([z.string(), z.array(z.string())])
> })
> const EmbeddingsResp = z.object({
>  embeddings: z.array(z.array(z.number()))
> })
> 
> const PointSchema = z.object({
>  id: z.union([z.string(), z.number()]),
>  vector: z.array(z.number()),
>  payload: z.record(z.any()).optional()
> })
> const UpsertReq = z.object({
>  collection: z.string(),
>  points: z.array(PointSchema)
> })
> 
> const CrawlReq = z.object({ url: z.string().url() })
> const CrawlResp = z.object({
>  url: z.string(),
>  title: z.string().optional(),
>  text: z.string().optional()
> })
> 
> /** Routes (documented + validated) */
> const healthRoute = createRoute({
>  method: 'get',
>  path: '/health',
>  tags: ['system'],
>  responses: {
>  200: { description: 'OK', content: { 'application/json': { schema: z.object({ ok: z.boolean() }) } } }
>  }
> })
> v1.openapi(healthRoute, (c) => c.json({ ok: true }))
> 
> const chatRoute = createRoute({
>  method: 'post',
>  path: '/llm/chat',
>  tags: ['llm'],
>  request: { body: { content: { 'application/json': { schema: ChatReq } } } },
>  responses: {
>  200: { description: 'Chat response', content: { 'application/json': { schema: ChatResp } } }
>  }
> })
> v1.openapi(chatRoute, async (c) => {
>  const body = await c.req.json()
>  const r = await f(`${OLLAMA}/api/chat`, {
>  method: 'POST',
>  body: JSON.stringify(body),
>  headers: { 'content-type': 'application/json' }
>  })
>  return c.newResponse(r.body, r)
> })
> 
> const embedsRoute = createRoute({
>  method: 'post',
>  path: '/embeddings',
>  tags: ['embeddings'],
>  request: { body: { content: { 'application/json': { schema: EmbeddingsReq } } } },
>  responses: {
>  200: { description: 'Embeddings', content: { 'application/json': { schema: EmbeddingsResp } } }
>  }
> })
> v1.openapi(embedsRoute, async (c) => {
>  const body = await c.req.json()
>  const r = await f(`${EMBEDS}/embeddings`, {
>  method: 'POST',
>  body: JSON.stringify(body),
>  headers: { 'content-type': 'application/json' }
>  })
>  return c.newResponse(r.body, r)
> })
> 
> const upsertRoute = createRoute({
>  method: 'post',
>  path: '/vectors/upsert',
>  tags: ['vectors'],
>  request: { body: { content: { 'application/json': { schema: UpsertReq } } } },
>  responses: { 200: { description: 'Upserted', content: { 'application/json': { schema: z.any() } } } }
> })
> v1.openapi(upsertRoute, async (c) => {
>  const body = await c.req.json() as z.infer<typeof UpsertReq>
>  const r = await f(`${QDRANT}/collections/${body.collection}/points?wait=true`, {
>  method: 'PUT',
>  body: JSON.stringify({ points: body.points }),
>  headers: { 'content-type': 'application/json' }
>  })
>  return c.newResponse(r.body, r)
> })
> 
> const crawlRoute = createRoute({
>  method: 'post',
>  path: '/crawl',
>  tags: ['crawler'],
>  request: { body: { content: { 'application/json': { schema: CrawlReq } } } },
>  responses: { 200: { description: 'Crawl result', content: { 'application/json': { schema: CrawlResp } } } }
> })
> v1.openapi(crawlRoute, async (c) => {
>  const body = await c.req.json()
>  const r = await f(`${CRAWLER}/crawl`, {
>  method: 'POST',
>  body: JSON.stringify(body),
>  headers: { 'content-type': 'application/json' }
>  })
>  return c.newResponse(r.body, r)
> })
> 
> /** OpenAPI JSON under /api/v1/openapi.json */
> v1.doc('/openapi.json', {
>  openapi: '3.1.0',
>  info: { title: 'Promethean API', version: '1.0.0' },
>  servers: [{ url: '/api/v1' }],
>  tags: [
>  { name: 'system' }, { name: 'llm' }, { name: 'embeddings' }, { name: 'vectors' }, { name: 'crawler' }
>  ]
> })
> 
> // ---- Root app mounts v1 and serves Swagger UI ----
> const app = new Hono()
> 
> // Mount versioned API
> app.route('/api/v1', v1)
> 
> // Swagger UI static assets from node_modules
> app.use('/docs/*', serveStatic({ root: swaggerDist() }))
> 
> // Minimal Swagger UI index that points to our spec
> app.get('/docs', (c) =>
>  c.html(`<!doctype html>
> <html>
>  <head>
>  <meta charset="utf-8" />
>  <title>Promethean API Docs</title>
>  <link rel="stylesheet" href="/docs/swagger-ui.css" />
>  </head>
>  <body>
>  <div id="swagger-ui"></div>
>  <script src="/docs/swagger-ui-bundle.js"></script>
>  <script>
>  window.ui = SwaggerUIBundle({
>  url: '/api/v1/openapi.json',
>  dom_id: '#swagger-ui',
>  deepLinking: true,
>  presets: [SwaggerUIBundle.presets.apis],
>  })
>  </script>
>  </body>
> </html>`))
> 
> serve({ fetch: app.fetch, port: 8080 })
> ```
> 
> # 4) How to use
> - **OpenAPI JSON:** `GET http://localhost/api/v1/openapi.json`
> - **Swagger UI:** `http://localhost/docs`
> - **Versioned endpoints:**
>  - Health: `GET http://localhost/api/v1/health`
>  - Chat: `POST http://localhost/api/v1/llm/chat`
>  - Crawl: `POST http://localhost/api/v1/crawl`
>  - Embeddings: `POST http://localhost/api/v1/embeddings`
>  - Upsert: `POST http://localhost/api/v1/vectors/upsert`
> 
> If you want multiple versions side-by-side (e.g., `/api/v2`), we’ll clone the `OpenAPIHono()` block to `v2`, mount at `/api/v2`, and publish `/api/v2/openapi.json`.
<!-- UID: 8401a8b7-fad1-4ee1-a6a1-118796133d08 -->

---


