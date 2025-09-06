---
uuid: a8102163-2539-435b-9877-414aede5da7c
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
related_to_uuid:
  - b22d79c6-825b-4cd3-b0d3-1cef0532bb54
  - 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
  - e979c50f-69bb-48b0-8417-e1ee1b31c0c0
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - 5e8b2388-022b-46cf-952c-36ae9b8f0037
  - 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
  - a4d90289-798d-44a0-a8e8-a055ae12fb52
  - b09141b7-544f-4c8e-8f49-bf76cecaacbb
  - fc21f824-4244-4030-a48e-c4170160ea1d
  - 5e408692-0e74-400e-a617-84247c7353ad
  - 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
  - 71726f04-eb1c-42a5-a5fe-d8209de6e159
  - 6620e2f2-de6d-45d8-a722-5d26e160b370
  - c03020e1-e3e7-48bf-aa7e-aa740c601b63
  - d17d3a96-c84d-4738-a403-6c733b874da2
  - 6bcff92c-4224-453d-9993-1be8d37d47c3
  - dd00677a-2280-45a7-91af-0728b21af3ad
  - c5c9a5c6-427d-4864-8084-c083cd55faa0
  - 23df6ddb-05cf-4639-8201-f8291f8a6026
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - 13951643-1741-46bb-89dc-1beebb122633
  - 03a5578f-d689-45db-95e9-11300e5eee6f
  - 10d98225-12e0-4212-8e15-88b57cf7bee5
  - 18344cf9-0c49-4a71-b6c8-b8d84d660fca
  - d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
related_to_title:
  - plan-update-confirmation
  - Debugging Broker Connections and Agent Behavior
  - DuckDuckGoSearchPipeline
  - Dynamic Context Model for Web Components
  - Eidolon Field Abstract Model
  - eidolon-node-lifecycle
  - Factorio AI with External Agents
  - field-interaction-equations
  - Fnord Tracer Protocol
  - i3-bluetooth-setup
  - field-dynamics-math-blocks
  - Duck's Self-Referential Perceptual Loop
  - graph-ds
  - Per-Domain Policy System for JS Crawler
  - Pure TypeScript Search Microservice
  - Post-Linguistic Transhuman Design Frameworks
  - heartbeat-fragment-demo
  - sibilant-macro-targets
  - Promethean State Format
  - eidolon-field-math-foundations
  - Duck's Attractor States
  - Promethean Dev Workflow Update
  - Creative Moments
  - Promethean Chat Activity Report
  - schema-evolution-workflow
references:
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 94
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 63
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 66
    col: 0
    score: 1
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 93
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 73
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 403
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 270
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 221
    col: 0
    score: 1
  - uuid: 86a691ec-ca1f-4350-824c-0ded1f8ebe70
    line: 80
    col: 0
    score: 1
  - uuid: b5e0183e-c34b-44b2-8fc9-a740a1a8d4e2
    line: 86
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 342
    col: 0
    score: 1
  - uuid: 40185d05-010e-45e7-8c2d-2f879bf14218
    line: 22
    col: 0
    score: 1
  - uuid: 5f65dfa5-dc97-4a6c-ad93-c45c1312e156
    line: 21
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 133
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 98
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 61
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 99
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 80
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 405
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 216
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 189
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 172
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 175
    col: 0
    score: 1
  - uuid: 86a691ec-ca1f-4350-824c-0ded1f8ebe70
    line: 90
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 298
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 48
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 75
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 74
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 145
    col: 0
    score: 1
  - uuid: 9b694a91-dec5-4708-9462-3f71000ba925
    line: 47
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 146
    col: 0
    score: 1
  - uuid: 5c152b08-6b69-4bb8-a1a7-66745789c169
    line: 63
    col: 0
    score: 1
  - uuid: 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
    line: 72
    col: 0
    score: 1
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 36
    col: 0
    score: 1
  - uuid: 95205cd3-c3d5-4047-9c33-9c5ca2b49597
    line: 49
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 126
    col: 0
    score: 1
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 51
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 44
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 8
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 38
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 56
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 75
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 104
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 46
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 64
    col: 0
    score: 1
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 40
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 137
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 82
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 454
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 412
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 261
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 181
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 90
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 157
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 205
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 203
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 95
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 371
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 141
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 222
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 107
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 28
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 65
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 86
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 123
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 34
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 442
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 218
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 176
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 70
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 148
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 36
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 166
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 148
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 153
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 118
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 168
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 103
    col: 0
    score: 1
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 380
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 194
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 85
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 93
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 64
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 153
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 141
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 35
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 94
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 53
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 424
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 209
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 142
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 39
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 50
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 89
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 32
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 49
    col: 0
    score: 1
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 95
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 133
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 59
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 252
    col: 0
    score: 1
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
}) ^ref-6deed6ac-415-0
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
    ...init, ^ref-6deed6ac-716-0
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
^ref-6deed6ac-739-0
^ref-6deed6ac-738-0
import { api } from '../http.js'
^ref-6deed6ac-439-0 ^ref-6deed6ac-744-0

export type ChatMsg = { role: 'system' | 'user' | 'assistant'; content: string }
^ref-6deed6ac-456-0
^ref-6deed6ac-471-0
export type ChatReq = { model: string; messages: ChatMsg[] }
^ref-6deed6ac-485-0 ^ref-6deed6ac-750-0
^ref-6deed6ac-471-0 ^ref-6deed6ac-751-0
export type ChatResp = { message: ChatMsg; done: boolean }

export const createOllamaClient = (base = '/api') => {
  const a = api(base)
  return {
    chat: (req: ChatReq) => a.post<ChatResp>('/llm/chat', req) ^ref-6deed6ac-757-0
  }
}
```

## `shared/ts/src/clients/qdrant.ts`
^ref-6deed6ac-456-0
 ^ref-6deed6ac-764-0
```ts
^ref-6deed6ac-471-0
^ref-6deed6ac-485-0
^ref-6deed6ac-501-0
import { api } from '../http.js'
type Point = { id: string | number; vector: number[]; payload?: Record<string, unknown> }
 ^ref-6deed6ac-485-0
export const createQdrantClient = (base = '/api') => {
  const a = api(base)
  return { ^ref-6deed6ac-774-0
    upsert: (collection: string, points: Point[]) =>
      a.post(`/vectors/upsert`, { collection, points })
  }
}
```
^ref-6deed6ac-471-0

## `shared/ts/src/clients/crawler.ts`
^ref-6deed6ac-501-0
^ref-6deed6ac-777-0

```ts ^ref-6deed6ac-786-0
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
^ref-6deed6ac-536-0 ^ref-6deed6ac-888-0
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
 ^ref-6deed6ac-1262-0 ^ref-6deed6ac-1270-0 ^ref-6deed6ac-1352-0 ^ref-6deed6ac-1671-0 ^ref-6deed6ac-3436-0 ^ref-6deed6ac-3789-0 ^ref-6deed6ac-6239-0 ^ref-6deed6ac-8092-0
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [plan-update-confirmation](plan-update-confirmation.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [DuckDuckGoSearchPipeline](duckduckgosearchpipeline.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [field-interaction-equations](field-interaction-equations.md)
- [Fnord Tracer Protocol](fnord-tracer-protocol.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [graph-ds](graph-ds.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [Pure TypeScript Search Microservice](pure-typescript-search-microservice.md)
- [Post-Linguistic Transhuman Design Frameworks](post-linguistic-transhuman-design-frameworks.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [Promethean State Format](promethean-state-format.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [Promethean Dev Workflow Update](promethean-dev-workflow-update.md)
- [Creative Moments](creative-moments.md)
- [Promethean Chat Activity Report](promethean-chat-activity-report.md)
- [schema-evolution-workflow](schema-evolution-workflow.md)
## Sources
- [Creative Moments — L94](creative-moments.md#^ref-10d98225-94-0) (line 94, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L63](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-63-0) (line 63, col 0, score 1)
- [Docops Feature Updates — L66](docops-feature-updates-3.md#^ref-cdbd21ee-66-0) (line 66, col 0, score 1)
- [DuckDuckGoSearchPipeline — L93](duckduckgosearchpipeline.md#^ref-e979c50f-93-0) (line 93, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L73](ducks-self-referential-perceptual-loop.md#^ref-71726f04-73-0) (line 73, col 0, score 1)
- [Dynamic Context Model for Web Components — L403](dynamic-context-model-for-web-components.md#^ref-f7702bf8-403-0) (line 403, col 0, score 1)
- [komorebi-group-window-hack — L270](komorebi-group-window-hack.md#^ref-dd89372d-270-0) (line 270, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L221](layer1survivabilityenvelope.md#^ref-64a9f9f9-221-0) (line 221, col 0, score 1)
- [Mathematical Samplers — L80](mathematical-samplers.md#^ref-86a691ec-80-0) (line 80, col 0, score 1)
- [Mathematics Sampler — L86](mathematics-sampler.md#^ref-b5e0183e-86-0) (line 86, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L342](migrate-to-provider-tenant-architecture.md#^ref-54382370-342-0) (line 342, col 0, score 1)
- [Mindful Prioritization — L22](mindful-prioritization.md#^ref-40185d05-22-0) (line 22, col 0, score 1)
- [MindfulRobotIntegration — L21](mindfulrobotintegration.md#^ref-5f65dfa5-21-0) (line 21, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L133](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-133-0) (line 133, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L98](model-upgrade-calm-down-guide.md#^ref-db74343f-98-0) (line 98, col 0, score 1)
- [Docops Feature Updates — L61](docops-feature-updates.md#^ref-2792d448-61-0) (line 61, col 0, score 1)
- [Duck's Attractor States — L99](ducks-attractor-states.md#^ref-13951643-99-0) (line 99, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L80](ducks-self-referential-perceptual-loop.md#^ref-71726f04-80-0) (line 80, col 0, score 1)
- [Dynamic Context Model for Web Components — L405](dynamic-context-model-for-web-components.md#^ref-f7702bf8-405-0) (line 405, col 0, score 1)
- [Eidolon Field Abstract Model — L216](eidolon-field-abstract-model.md#^ref-5e8b2388-216-0) (line 216, col 0, score 1)
- [Factorio AI with External Agents — L189](factorio-ai-with-external-agents.md#^ref-a4d90289-189-0) (line 189, col 0, score 1)
- [field-interaction-equations — L172](field-interaction-equations.md#^ref-b09141b7-172-0) (line 172, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L175](layer1survivabilityenvelope.md#^ref-64a9f9f9-175-0) (line 175, col 0, score 1)
- [Mathematical Samplers — L90](mathematical-samplers.md#^ref-86a691ec-90-0) (line 90, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L298](migrate-to-provider-tenant-architecture.md#^ref-54382370-298-0) (line 298, col 0, score 1)
- [Promethean Chat Activity Report — L48](promethean-chat-activity-report.md#^ref-18344cf9-48-0) (line 48, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L75](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-75-0) (line 75, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L74](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-74-0) (line 74, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L145](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-145-0) (line 145, col 0, score 1)
- [Obsidian Task Generation — L47](obsidian-task-generation.md#^ref-9b694a91-47-0) (line 47, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L146](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-146-0) (line 146, col 0, score 1)
- [OpenAPI Validation Report — L63](openapi-validation-report.md#^ref-5c152b08-63-0) (line 63, col 0, score 1)
- [Optimizing Command Limitations in System Design — L72](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-72-0) (line 72, col 0, score 1)
- [Promethean Notes — L36](promethean-notes.md#^ref-1c4046b5-36-0) (line 36, col 0, score 1)
- [promethean-requirements — L49](promethean-requirements.md#^ref-95205cd3-49-0) (line 49, col 0, score 1)
- [Promethean State Format — L126](promethean-state-format.md#^ref-23df6ddb-126-0) (line 126, col 0, score 1)
- [Promethean Workflow Optimization — L51](promethean-workflow-optimization.md#^ref-d614d983-51-0) (line 51, col 0, score 1)
- [Docops Feature Updates — L44](docops-feature-updates-3.md#^ref-cdbd21ee-44-0) (line 44, col 0, score 1)
- [Creative Moments — L8](creative-moments.md#^ref-10d98225-8-0) (line 8, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L38](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-38-0) (line 38, col 0, score 1)
- [Docops Feature Updates — L56](docops-feature-updates-3.md#^ref-cdbd21ee-56-0) (line 56, col 0, score 1)
- [Creative Moments — L75](creative-moments.md#^ref-10d98225-75-0) (line 75, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L104](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-104-0) (line 104, col 0, score 1)
- [Docops Feature Updates — L46](docops-feature-updates-3.md#^ref-cdbd21ee-46-0) (line 46, col 0, score 1)
- [Docops Feature Updates — L64](docops-feature-updates.md#^ref-2792d448-64-0) (line 64, col 0, score 1)
- [DuckDuckGoSearchPipeline — L40](duckduckgosearchpipeline.md#^ref-e979c50f-40-0) (line 40, col 0, score 1)
- [Duck's Attractor States — L137](ducks-attractor-states.md#^ref-13951643-137-0) (line 137, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L82](ducks-self-referential-perceptual-loop.md#^ref-71726f04-82-0) (line 82, col 0, score 1)
- [Dynamic Context Model for Web Components — L454](dynamic-context-model-for-web-components.md#^ref-f7702bf8-454-0) (line 454, col 0, score 1)
- [Dynamic Context Model for Web Components — L412](dynamic-context-model-for-web-components.md#^ref-f7702bf8-412-0) (line 412, col 0, score 1)
- [Eidolon Field Abstract Model — L261](eidolon-field-abstract-model.md#^ref-5e8b2388-261-0) (line 261, col 0, score 1)
- [eidolon-field-math-foundations — L181](eidolon-field-math-foundations.md#^ref-008f2ac0-181-0) (line 181, col 0, score 1)
- [eidolon-node-lifecycle — L90](eidolon-node-lifecycle.md#^ref-938eca9c-90-0) (line 90, col 0, score 1)
- [Factorio AI with External Agents — L157](factorio-ai-with-external-agents.md#^ref-a4d90289-157-0) (line 157, col 0, score 1)
- [field-dynamics-math-blocks — L205](field-dynamics-math-blocks.md#^ref-7cfc230d-205-0) (line 205, col 0, score 1)
- [field-node-diagram-set — L203](field-node-diagram-set.md#^ref-22b989d5-203-0) (line 203, col 0, score 1)
- [field-node-diagram-visualizations — L95](field-node-diagram-visualizations.md#^ref-e9b27b06-95-0) (line 95, col 0, score 1)
- [graph-ds — L371](graph-ds.md#^ref-6620e2f2-371-0) (line 371, col 0, score 1)
- [heartbeat-fragment-demo — L141](heartbeat-fragment-demo.md#^ref-dd00677a-141-0) (line 141, col 0, score 1)
- [homeostasis-decay-formulas — L222](homeostasis-decay-formulas.md#^ref-37b5d236-222-0) (line 222, col 0, score 1)
- [i3-bluetooth-setup — L107](i3-bluetooth-setup.md#^ref-5e408692-107-0) (line 107, col 0, score 1)
- [Creative Moments — L28](creative-moments.md#^ref-10d98225-28-0) (line 28, col 0, score 1)
- [Docops Feature Updates — L65](docops-feature-updates-3.md#^ref-cdbd21ee-65-0) (line 65, col 0, score 1)
- [Docops Feature Updates — L86](docops-feature-updates.md#^ref-2792d448-86-0) (line 86, col 0, score 1)
- [Duck's Attractor States — L123](ducks-attractor-states.md#^ref-13951643-123-0) (line 123, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L34](ducks-self-referential-perceptual-loop.md#^ref-71726f04-34-0) (line 34, col 0, score 1)
- [Dynamic Context Model for Web Components — L442](dynamic-context-model-for-web-components.md#^ref-f7702bf8-442-0) (line 442, col 0, score 1)
- [Eidolon Field Abstract Model — L218](eidolon-field-abstract-model.md#^ref-5e8b2388-218-0) (line 218, col 0, score 1)
- [eidolon-field-math-foundations — L176](eidolon-field-math-foundations.md#^ref-008f2ac0-176-0) (line 176, col 0, score 1)
- [eidolon-node-lifecycle — L70](eidolon-node-lifecycle.md#^ref-938eca9c-70-0) (line 70, col 0, score 1)
- [eidolon-field-math-foundations — L148](eidolon-field-math-foundations.md#^ref-008f2ac0-148-0) (line 148, col 0, score 1)
- [eidolon-node-lifecycle — L36](eidolon-node-lifecycle.md#^ref-938eca9c-36-0) (line 36, col 0, score 1)
- [Factorio AI with External Agents — L166](factorio-ai-with-external-agents.md#^ref-a4d90289-166-0) (line 166, col 0, score 1)
- [field-dynamics-math-blocks — L148](field-dynamics-math-blocks.md#^ref-7cfc230d-148-0) (line 148, col 0, score 1)
- [field-interaction-equations — L153](field-interaction-equations.md#^ref-b09141b7-153-0) (line 153, col 0, score 1)
- [field-node-diagram-outline — L118](field-node-diagram-outline.md#^ref-1f32c94a-118-0) (line 118, col 0, score 1)
- [field-node-diagram-set — L168](field-node-diagram-set.md#^ref-22b989d5-168-0) (line 168, col 0, score 1)
- [field-node-diagram-visualizations — L103](field-node-diagram-visualizations.md#^ref-e9b27b06-103-0) (line 103, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L380](functional-embedding-pipeline-refactor.md#^ref-a4a25141-380-0) (line 380, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L194](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-194-0) (line 194, col 0, score 1)
- [Docops Feature Updates — L85](docops-feature-updates-3.md#^ref-cdbd21ee-85-0) (line 85, col 0, score 1)
- [Duck's Attractor States — L93](ducks-attractor-states.md#^ref-13951643-93-0) (line 93, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L64](ducks-self-referential-perceptual-loop.md#^ref-71726f04-64-0) (line 64, col 0, score 1)
- [Factorio AI with External Agents — L153](factorio-ai-with-external-agents.md#^ref-a4d90289-153-0) (line 153, col 0, score 1)
- [field-dynamics-math-blocks — L141](field-dynamics-math-blocks.md#^ref-7cfc230d-141-0) (line 141, col 0, score 1)
- [Docops Feature Updates — L35](docops-feature-updates.md#^ref-2792d448-35-0) (line 35, col 0, score 1)
- [Duck's Attractor States — L94](ducks-attractor-states.md#^ref-13951643-94-0) (line 94, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L53](ducks-self-referential-perceptual-loop.md#^ref-71726f04-53-0) (line 53, col 0, score 1)
- [Dynamic Context Model for Web Components — L424](dynamic-context-model-for-web-components.md#^ref-f7702bf8-424-0) (line 424, col 0, score 1)
- [Eidolon Field Abstract Model — L209](eidolon-field-abstract-model.md#^ref-5e8b2388-209-0) (line 209, col 0, score 1)
- [eidolon-field-math-foundations — L142](eidolon-field-math-foundations.md#^ref-008f2ac0-142-0) (line 142, col 0, score 1)
- [eidolon-node-lifecycle — L39](eidolon-node-lifecycle.md#^ref-938eca9c-39-0) (line 39, col 0, score 1)
- [Creative Moments — L50](creative-moments.md#^ref-10d98225-50-0) (line 50, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L89](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-89-0) (line 89, col 0, score 1)
- [Docops Feature Updates — L32](docops-feature-updates-3.md#^ref-cdbd21ee-32-0) (line 32, col 0, score 1)
- [Docops Feature Updates — L49](docops-feature-updates.md#^ref-2792d448-49-0) (line 49, col 0, score 1)
- [DuckDuckGoSearchPipeline — L95](duckduckgosearchpipeline.md#^ref-e979c50f-95-0) (line 95, col 0, score 1)
- [Duck's Attractor States — L133](ducks-attractor-states.md#^ref-13951643-133-0) (line 133, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L59](ducks-self-referential-perceptual-loop.md#^ref-71726f04-59-0) (line 59, col 0, score 1)
- [Eidolon Field Abstract Model — L252](eidolon-field-abstract-model.md#^ref-5e8b2388-252-0) (line 252, col 0, score 1)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
