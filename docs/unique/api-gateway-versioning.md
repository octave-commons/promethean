---
uuid: 1fcb8421-46eb-4813-ba66-f79b25ef5db7
created_at: api-gateway-versioning.md
filename: api-gateway-versioning
title: api-gateway-versioning
description: >-
  Configures versioned API routing with NGINX and OpenAPI documentation for the
  gateway service, including back-compat redirects and Swagger UI integration.
tags:
  - api-gateway
  - nginx
  - openapi
  - versioning
  - swagger
  - backcompat
  - redirects
---
Got it. Here’s the **versioned API (`/api/v1`)** plus **OpenAPI (JSON) + Swagger UI** for the gateway. ^ref-0580dcd3-1-0

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
      proxy_pass 
      proxy_set_header Host $host;
      proxy_http_version 1.1;
    }

    # Back-compat: redirect /api/* → /api/v1/*
    location ~ ^/api/(?!v\d+/)(.*)$ {
      return 308 /api/v1/$1;
    }

    # Serve Swagger UI and its assets from the gateway
    location /docs/ { proxy_pass  }
    location = /docs { return 308 /docs/; }

    # Optional direct mounts (keep or remove as you like)
    location /ollama/      { proxy_pass  }
    location /qdrant/      { proxy_pass  }
    location /crawler/     { proxy_pass  }
    location /embeddings/  { proxy_pass  }
  }
}
```
^ref-0580dcd3-7-0 ^ref-0580dcd3-46-0

# 2) Gateway deps (add OpenAPI + Swagger UI)

`services/ts/api-gateway/package.json` ^ref-0580dcd3-50-0
 ^ref-0580dcd3-51-0
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
^ref-0580dcd3-51-0
```
^ref-0580dcd3-52-0

# 3) Gateway server with `/api/v1/openapi.json` + `/docs`
 ^ref-0580dcd3-79-0
`services/ts/api-gateway/src/server.ts` ^ref-0580dcd3-79-0
 ^ref-0580dcd3-81-0
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

^ref-0580dcd3-79-0
serve({ fetch: app.fetch, port: 8080 })
^ref-0580dcd3-81-0 ^ref-0580dcd3-270-0
```
 ^ref-0580dcd3-270-0 ^ref-0580dcd3-272-0
# 4) How to use ^ref-0580dcd3-271-0
 ^ref-0580dcd3-272-0
* **OpenAPI JSON:** `GET 
* **Swagger UI:** ` ^ref-0580dcd3-274-0
* **Versioned endpoints:** ^ref-0580dcd3-275-0
 ^ref-0580dcd3-276-0 ^ref-0580dcd3-278-0
  * Health: `GET  ^ref-0580dcd3-277-0
  * Chat: `POST  ^ref-0580dcd3-278-0 ^ref-0580dcd3-280-0
  * Crawl: `POST 
  * Embeddings: `POST  ^ref-0580dcd3-280-0
  * Upsert: `POST 
 ^ref-0580dcd3-282-0
If you want multiple versions side-by-side (e.g., `/api/v2`), we’ll clone the `OpenAPIHono()` block to `v2`, mount at `/api/v2`, and publish `/api/v2/openapi.json`.
