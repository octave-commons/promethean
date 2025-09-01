---
uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
created_at: 2025.08.31.12.15.37.md
filename: api-gateway-versioning
description: >-
  Configures versioned API routing with NGINX and gateway services for OpenAPI
  and Swagger UI support.
tags:
  - api
  - versioning
  - nginx
  - gateway
  - openapi
  - swagger
related_to_title:
  - Promethean Infrastructure Setup
  - Dynamic Context Model for Web Components
  - observability-infrastructure-setup
  - Debugging Broker Connections and Agent Behavior
  - Pure TypeScript Search Microservice
  - Chroma Toolkit Consolidation Plan
  - Board Walk – 2025-08-11
  - Cross-Target Macro System in Sibilant
  - Exception Layer Analysis
  - ecs-offload-workers
  - ecs-scheduler-and-prefabs
  - Promethean Web UI Setup
  - Mongo Outbox Implementation
  - Promethean Full-Stack Docker Setup
  - Prometheus Observability Stack
  - markdown-to-org-transpiler
  - Ollama-LLM-Provider-for-Pseudo-Code-Transpiler
  - Promethean-native config design
  - Local-Only-LLM-Workflow
  - eidolon-field-math-foundations
  - Sibilant Meta-Prompt DSL
related_to_uuid:
  - 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - b4e64f8c-4dc9-4941-a877-646c5ada068e
  - 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
  - d17d3a96-c84d-4738-a403-6c733b874da2
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
  - 5f210ca2-54e9-445b-afe4-fb340d4992c5
  - 21d5cc09-b005-4ede-8f69-00b4b0794540
  - 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
  - c62a1815-c43b-4a3b-88e6-d7fa008a155e
  - bc5172ca-7a09-42ad-b418-8e42bb14d089
  - 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
  - 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
  - e90b5a16-d58f-424d-bd36-70e9bd2861ad
  - ab54cdd8-13ce-4dcb-a9cd-da2d86e0305f
  - b362e12e-2802-4e41-9a21-6e0c7ad419a2
  - ab748541-020e-4a7e-b07d-28173bd5bea2
  - 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - af5d2824-faad-476c-a389-e912d9bc672c
references: []
---
Got it. Here’s the **versioned API (`/api/v1`)** plus **OpenAPI (JSON) + Swagger UI** for the gateway.

# 1) NGINX: route `/api/v1/*` (+ redirect `/api/* → /api/v1/*`) and expose `/docs`

`infrastructure/compose/nginx.conf`

```nginx
worker_processes auto;
events { worker_connections 1024; }
http {
  sendfile on;

  upstream api_gateway { server api-gateway:8080; }
  upstream ollama_up   { server ollama:11434; }
  upstream qdrant_up   { server qdrant:6333; }
  upstream crawler_up  { server crawler:3000; }
  upstream embeds_up   { server embeddings:7070; }

  server {
    listen 80;

    # Hard versioning
    location ~ ^/api/(v\d+/.*)$ {
      proxy_pass http://api_gateway/$1;
      proxy_set_header Host $host;
      proxy_http_version 1.1;
    }

    # Back-compat: redirect /api/* → /api/v1/*
    location ~ ^/api/(?!v\d+/)(.*)$ {
      return 308 /api/v1/$1;
    }

    # Serve Swagger UI and its assets from the gateway
    location /docs/ { proxy_pass http://api_gateway/docs/; }
    location = /docs { return 308 /docs/; }

    # Optional direct mounts (keep or remove as you like)
    location /ollama/      { proxy_pass http://ollama_up/; }
    location /qdrant/      { proxy_pass http://qdrant_up/; }
    location /crawler/     { proxy_pass http://crawler_up/; }
    location /embeddings/  { proxy_pass http://embeds_up/; }
  }
}
```

# 2) Gateway deps (add OpenAPI + Swagger UI)

`services/ts/api-gateway/package.json`

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
    "@hono/zod-openapi": "^0.16.4",
    "hono": "^4.5.7",
    "swagger-ui-dist": "^5.17.14",
    "undici": "^6.19.8",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "tsx": "^4.19.2",
    "typescript": "^5.5.4"
  }
}
```

# 3) Gateway server with `/api/v1/openapi.json` + `/docs`

`services/ts/api-gateway/src/server.ts`

```ts
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { fetch as f } from 'undici'

import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { serveStatic } from '@hono/node-server/serve-static'
import { getAbsoluteFSPath as swaggerDist } from 'swagger-ui-dist'

// Upstreams
const OLLAMA = process.env.UPSTREAM_OLLAMA!
const QDRANT = process.env.UPSTREAM_QDRANT!
const CRAWLER = process.env.UPSTREAM_CRAWLER!
const EMBEDS = process.env.UPSTREAM_EMBEDDINGS!

// ---- OpenAPI (v1) app ----
const v1 = new OpenAPIHono()

v1.use('*', async (c, next) => {
  c.header('x-api-version', 'v1')
  await next()
})

/** Schemas */
const ChatMsg = z.object({
  role: z.enum(['system', 'user', 'assistant']),
  content: z.string()
})
const ChatReq = z.object({
  model: z.string(),
  messages: z.array(ChatMsg)
})
const ChatResp = z.object({
  message: ChatMsg,
  done: z.boolean()
})

const EmbeddingsReq = z.object({
  input: z.union([z.string(), z.array(z.string())])
})
const EmbeddingsResp = z.object({
  embeddings: z.array(z.array(z.number()))
})

const PointSchema = z.object({
  id: z.union([z.string(), z.number()]),
  vector: z.array(z.number()),
  payload: z.record(z.any()).optional()
})
const UpsertReq = z.object({
  collection: z.string(),
  points: z.array(PointSchema)
})

const CrawlReq = z.object({ url: z.string().url() })
const CrawlResp = z.object({
  url: z.string(),
  title: z.string().optional(),
  text: z.string().optional()
})

/** Routes (documented + validated) */
const healthRoute = createRoute({
  method: 'get',
  path: '/health',
  tags: ['system'],
  responses: {
    200: { description: 'OK', content: { 'application/json': { schema: z.object({ ok: z.boolean() }) } } }
  }
})
v1.openapi(healthRoute, (c) => c.json({ ok: true }))

const chatRoute = createRoute({
  method: 'post',
  path: '/llm/chat',
  tags: ['llm'],
  request: { body: { content: { 'application/json': { schema: ChatReq } } } },
  responses: {
    200: { description: 'Chat response', content: { 'application/json': { schema: ChatResp } } }
  }
})
v1.openapi(chatRoute, async (c) => {
  const body = await c.req.json()
  const r = await f(`${OLLAMA}/api/chat`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' }
  })
  return c.newResponse(r.body, r)
})

const embedsRoute = createRoute({
  method: 'post',
  path: '/embeddings',
  tags: ['embeddings'],
  request: { body: { content: { 'application/json': { schema: EmbeddingsReq } } } },
  responses: {
    200: { description: 'Embeddings', content: { 'application/json': { schema: EmbeddingsResp } } }
  }
})
v1.openapi(embedsRoute, async (c) => {
  const body = await c.req.json()
  const r = await f(`${EMBEDS}/embeddings`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' }
  })
  return c.newResponse(r.body, r)
})

const upsertRoute = createRoute({
  method: 'post',
  path: '/vectors/upsert',
  tags: ['vectors'],
  request: { body: { content: { 'application/json': { schema: UpsertReq } } } },
  responses: { 200: { description: 'Upserted', content: { 'application/json': { schema: z.any() } } } }
})
v1.openapi(upsertRoute, async (c) => {
  const body = await c.req.json() as z.infer<typeof UpsertReq>
  const r = await f(`${QDRANT}/collections/${body.collection}/points?wait=true`, {
    method: 'PUT',
    body: JSON.stringify({ points: body.points }),
    headers: { 'content-type': 'application/json' }
  })
  return c.newResponse(r.body, r)
})

const crawlRoute = createRoute({
  method: 'post',
  path: '/crawl',
  tags: ['crawler'],
  request: { body: { content: { 'application/json': { schema: CrawlReq } } } },
  responses: { 200: { description: 'Crawl result', content: { 'application/json': { schema: CrawlResp } } } }
})
v1.openapi(crawlRoute, async (c) => {
  const body = await c.req.json()
  const r = await f(`${CRAWLER}/crawl`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' }
  })
  return c.newResponse(r.body, r)
})

/** OpenAPI JSON under /api/v1/openapi.json */
v1.doc('/openapi.json', {
  openapi: '3.1.0',
  info: { title: 'Promethean API', version: '1.0.0' },
  servers: [{ url: '/api/v1' }],
  tags: [
    { name: 'system' }, { name: 'llm' }, { name: 'embeddings' }, { name: 'vectors' }, { name: 'crawler' }
  ]
})

// ---- Root app mounts v1 and serves Swagger UI ----
const app = new Hono()

// Mount versioned API
app.route('/api/v1', v1)

// Swagger UI static assets from node_modules
app.use('/docs/*', serveStatic({ root: swaggerDist() }))

// Minimal Swagger UI index that points to our spec
app.get('/docs', (c) =>
  c.html(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Promethean API Docs</title>
    <link rel="stylesheet" href="/docs/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="/docs/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: '/api/v1/openapi.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [SwaggerUIBundle.presets.apis],
      })
    </script>
  </body>
</html>`))

serve({ fetch: app.fetch, port: 8080 })
```

# 4) How to use

* **OpenAPI JSON:** `GET http://localhost/api/v1/openapi.json`
* **Swagger UI:** `http://localhost/docs`
* **Versioned endpoints:**

  * Health: `GET http://localhost/api/v1/health`
  * Chat: `POST http://localhost/api/v1/llm/chat`
  * Crawl: `POST http://localhost/api/v1/crawl`
  * Embeddings: `POST http://localhost/api/v1/embeddings`
  * Upsert: `POST http://localhost/api/v1/vectors/upsert`

If you want multiple versions side-by-side (e.g., `/api/v2`), we’ll clone the `OpenAPIHono()` block to `v2`, mount at `/api/v2`, and publish `/api/v2/openapi.json`.<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [observability-infrastructure-setup](observability-infrastructure-setup.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [Pure TypeScript Search Microservice](pure-typescript-search-microservice.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [Promethean Web UI Setup](promethean-web-ui-setup.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [Promethean Full-Stack Docker Setup](promethean-full-stack-docker-setup.md)
- [Prometheus Observability Stack](prometheus-observability-stack.md)
- [markdown-to-org-transpiler](markdown-to-org-transpiler.md)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler](ollama-llm-provider-for-pseudo-code-transpiler.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
