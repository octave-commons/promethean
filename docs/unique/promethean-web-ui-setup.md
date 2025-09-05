---
uuid: aa88652d-c8e5-4a1b-850e-afdf7fe15dae
created_at: promethean-web-ui-setup.md
filename: Promethean Web UI Setup
title: Promethean Web UI Setup
description: >-
  Configures a TypeScript-based Web Components UI that runs behind NGINX,
  requiring an X-API-Key for API calls but not for UI loading. The setup
  separates container management from source code using Docker and keeps token
  authentication gated to API routes.
tags:
  - TypeScript
  - Web Components
  - NGINX
  - Docker
  - API Authentication
  - Token-Gated
related_to_uuid:
  - 0580dcd3-533d-4834-8a2f-eae3771960a9
  - bb90903a-4723-44f7-850e-a71415ef6224
  - 18138627-a348-4fbb-b447-410dfb400564
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
  - 618198f4-cfad-4677-9df6-0640d8a97bae
  - 0f6f8f38-98d0-438f-9601-58f478acc0b7
  - f2d83a77-7f86-4c56-8538-1350167a0c6c
  - 1c4046b5-742d-4004-aec6-b47251fef5d6
  - 18344cf9-0c49-4a71-b6c8-b8d84d660fca
  - d3e7db72-2e07-4dae-8920-0e07c499a1e5
  - 1b1338fc-bb4d-41df-828f-e219cc9442eb
  - 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
  - cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
  - c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
  - 37b5d236-2b3e-4a95-a4e8-31655c3023ef
  - c14edce7-0656-45b2-aaf3-51f042451b7d
  - b4e64f8c-4dc9-4941-a877-646c5ada068e
  - 9c79206d-4cb9-4f00-87e0-782dcea37bc7
  - 01b21543-7e03-4129-8fe4-b6306be69dee
  - 13951643-1741-46bb-89dc-1beebb122633
  - fc21f824-4244-4030-a48e-c4170160ea1d
  - c62a1815-c43b-4a3b-88e6-d7fa008a155e
  - 2aafc801-c3e1-4e4f-999d-adb52af3fc41
  - 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
related_to_title:
  - api-gateway-versioning
  - AGENTS.md
  - The Jar of Echoes
  - eidolon-field-math-foundations
  - Promethean Full-Stack Docker Setup
  - AI-First-OS-Model-Context-Protocol
  - windows-tiling-with-autohotkey
  - aionian-circuit-math
  - Promethean Notes
  - Promethean Chat Activity Report
  - balanced-bst
  - Canonical Org-Babel Matplotlib Animation Template
  - Mongo Outbox Implementation
  - Docops Feature Updates
  - Math Fundamentals
  - homeostasis-decay-formulas
  - universal-intention-code-fabric
  - observability-infrastructure-setup
  - polyglot-repl-interface-layer
  - compiler-kit-foundations
  - Duck's Attractor States
  - Fnord Tracer Protocol
  - ecs-scheduler-and-prefabs
  - sibilant-meta-string-templating-runtime
  - Unique Info Dump Index
references:
  - uuid: bb90903a-4723-44f7-850e-a71415ef6224
    line: 274
    col: 0
    score: 1
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 346
    col: 0
    score: 1
  - uuid: bb90903a-4723-44f7-850e-a71415ef6224
    line: 275
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 3292
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 2787
    col: 0
    score: 1
  - uuid: 618198f4-cfad-4677-9df6-0640d8a97bae
    line: 191
    col: 0
    score: 0.98
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 3354
    col: 0
    score: 0.98
  - uuid: 618198f4-cfad-4677-9df6-0640d8a97bae
    line: 190
    col: 0
    score: 0.98
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 276
    col: 0
    score: 0.98
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 1059
    col: 0
    score: 0.98
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 1192
    col: 0
    score: 0.98
  - uuid: bb90903a-4723-44f7-850e-a71415ef6224
    line: 262
    col: 0
    score: 0.97
  - uuid: 618198f4-cfad-4677-9df6-0640d8a97bae
    line: 115
    col: 0
    score: 0.97
  - uuid: 618198f4-cfad-4677-9df6-0640d8a97bae
    line: 227
    col: 0
    score: 0.97
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 2625
    col: 0
    score: 0.97
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 2464
    col: 0
    score: 0.97
  - uuid: d3e7db72-2e07-4dae-8920-0e07c499a1e5
    line: 363
    col: 0
    score: 0.97
  - uuid: 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
    line: 610
    col: 0
    score: 0.95
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 189
    col: 0
    score: 0.95
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 194
    col: 0
    score: 0.95
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 328
    col: 0
    score: 0.95
  - uuid: c14edce7-0656-45b2-aaf3-51f042451b7d
    line: 388
    col: 0
    score: 0.92
  - uuid: b4e64f8c-4dc9-4941-a877-646c5ada068e
    line: 348
    col: 0
    score: 0.91
  - uuid: 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
    line: 171
    col: 0
    score: 0.9
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 291
    col: 0
    score: 0.9
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 590
    col: 0
    score: 0.88
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 379
    col: 0
    score: 0.87
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 15616
    col: 0
    score: 0.87
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 13864
    col: 0
    score: 0.87
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 7868
    col: 0
    score: 0.87
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 13178
    col: 0
    score: 0.87
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 15006
    col: 0
    score: 0.87
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 15236
    col: 0
    score: 0.87
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 12067
    col: 0
    score: 0.87
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 2507
    col: 0
    score: 0.87
  - uuid: 2aafc801-c3e1-4e4f-999d-adb52af3fc41
    line: 92
    col: 0
    score: 0.86
  - uuid: 681a4ab2-8fef-4833-a09d-bceb62d114da
    line: 30
    col: 0
    score: 0.86
  - uuid: cfbdca2f-5ee8-4cad-a75e-0e017e8d9b77
    line: 11
    col: 0
    score: 0.86
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 296
    col: 0
    score: 0.86
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 171
    col: 0
    score: 0.86
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 1356
    col: 0
    score: 0.86
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 881
    col: 0
    score: 0.86
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 808
    col: 0
    score: 0.86
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 611
    col: 0
    score: 0.86
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 17764
    col: 0
    score: 0.86
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 21424
    col: 0
    score: 0.86
  - uuid: 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
    line: 280
    col: 0
    score: 0.85
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 137
    col: 0
    score: 0.85
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 158
    col: 0
    score: 0.85
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 275
    col: 0
    score: 0.85
---
Nice stack. Here’s a clean way to bolt on a **TypeScript + Web Components** UI that lives behind your existing NGINX “edge”, requires **X-API-Key for API calls** (but not for loading the UI), and keeps container bits separate from source (Dockerfile in `./images`, code in `./services/ts/webapp`). ^ref-bc5172ca-1-0

---

# 1) Add a `web` service

### `docker-compose.yaml` (additions only)

```yaml
services:
  edge:
    # ...
    depends_on:
      - ollama
      - vllm-qwen3-8b
      - vllm-qwen25-coder-7b
      - vllm-gemma-2b
      - tei-nomic
      - clip-vit
      - whisper-faster-openai
      - ovms-npu
      - web           # <— add

  web:
    build:
      context: .
      dockerfile: ./images/web.docker
      args:
        APP_DIR: services/ts/webapp
    image: promethean-web:latest
    container_name: web
    networks: [ prom-net ]
    restart: unless-stopped
```
^ref-bc5172ca-9-0 ^ref-bc5172ca-35-0

---

# 2) Let the UI load **without** a token, but keep token-gated APIs
 ^ref-bc5172ca-40-0
Replace your `infra/nginx/nginx.conf` with this adjusted version (adds a small `map` to bypass auth for `/ui/*`, proxies `/ui/*` to the `web` container, and keeps token auth on API routes):

### `infra/nginx/nginx.conf`
 ^ref-bc5172ca-44-0
```nginx
worker_processes  1;
events { worker_connections 1024; }

# ---- rate limit zones (per-IP + per-token) ----
limit_req_zone $binary_remote_addr zone=ip_rl_llm:10m   rate=10r/s;
limit_req_zone $binary_remote_addr zone=ip_rl_embed:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=ip_rl_asr:10m   rate=10r/s;
limit_req_zone $binary_remote_addr zone=ip_rl_ollama:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=ip_rl_clip:10m   rate=10r/s;
limit_conn_zone $binary_remote_addr zone=ip_conns:10m;

limit_req_zone $http_x_api_key zone=tok_rl_llm:10m   rate=5r/s;
limit_req_zone $http_x_api_key zone=tok_rl_embed:10m rate=5r/s;
limit_req_zone $http_x_api_key zone=tok_rl_asr:10m   rate=5r/s;
limit_req_zone $http_x_api_key zone=tok_rl_ollama:10m rate=5r/s;
limit_req_zone $http_x_api_key zone=tok_rl_clip:10m   rate=5r/s;

http {
  sendfile on;
  include       mime.types;
  default_type  application/octet-stream;

  # token allowlist (X-API-Key header)
  map $http_x_api_key $api_key_ok {
    default 0;
    include /etc/nginx/secrets/api_keys.map;
  }

  # Allow the UI shell to load without a token
  map $uri $skip_auth {
    default 0;
    ~^/ui/ 1;
    ~^/__healthz$ 1;
  }

  # Compute final auth gate: OK if skip_auth=1 OR token valid
  map "$skip_auth$api_key_ok" $auth_ok {
    default 0;
    ~^10$ 1;  # skip_auth=1
    ~^11$ 1;  # skip_auth=1 and token ok
    ~^01$ 1;  # token ok
  }

  map $http_upgrade $connection_upgrade { default upgrade; '' close; }

  server {
    listen 80;
    server_name _;

    # Health
    location = /__healthz { return 200 'ok'; }

    client_max_body_size 512m;
    add_header Access-Control-Allow-Origin "*" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Authorization, X-API-Key, Content-Type, Accept, *" always;
    if ($request_method = OPTIONS) { return 204; }

    # Global gate (after skip-auth mapping)
    if ($auth_ok = 0) { return 401; }
    add_header Www-Authenticate 'X-API-Key' always;

    # -------- UI (no token required to load shell) --------
    # Redirect root -> /ui/ (explicit UI base)
    location = / { return 301 /ui/; }
    location /ui/ {
      proxy_http_version 1.1; proxy_buffering off;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
      rewrite ^/ui/(.*)$ /$1 break;
      proxy_pass 
    }

    # -------- Ollama --------
    location /ollama/ {
      limit_req zone=ip_rl_ollama  burst=20 nodelay;
      limit_req zone=tok_rl_ollama burst=10 nodelay;
      limit_conn ip_conns 20;

      proxy_http_version 1.1;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
      proxy_set_header Connection $connection_upgrade;
      proxy_set_header Upgrade $http_upgrade;
      proxy_buffering off;
      chunked_transfer_encoding on;
      proxy_read_timeout 3600s; proxy_send_timeout 3600s;

      rewrite ^/ollama/(.*)$ /$1 break;
      proxy_pass 
    }

    # -------- vLLM (OpenAI-compatible) --------
    location /llm/qwen3/ {
      limit_req zone=ip_rl_llm  burst=20 nodelay;
      limit_req zone=tok_rl_llm burst=10 nodelay;
      limit_conn ip_conns 20;
      proxy_http_version 1.1; proxy_buffering off;
      proxy_set_header Host $host; proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
      rewrite ^/llm/qwen3/(.*)$ /$1 break;
      proxy_pass 
    }

    location /llm/qwen25-coder/ {
      limit_req zone=ip_rl_llm  burst=20 nodelay;
      limit_req zone=tok_rl_llm burst=10 nodelay;
      limit_conn ip_conns 20;
      proxy_http_version 1.1; proxy_buffering off;
      proxy_set_header Host $host; proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
      rewrite ^/llm/qwen25-coder/(.*)$ /$1 break;
      proxy_pass 
    }

    location /llm/gemma2/ {
      limit_req zone=ip_rl_llm  burst=20 nodelay;
      limit_req zone=tok_rl_llm burst=10 nodelay;
      limit_conn ip_conns 20;
      proxy_http_version 1.1; proxy_buffering off;
      proxy_set_header Host $host; proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
      rewrite ^/llm/gemma2/(.*)$ /$1 break;
      proxy_pass 
    }

    # -------- Embeddings (TEI) --------
    location /embed/nomic/ {
      limit_req zone=ip_rl_embed  burst=20 nodelay;
      limit_req zone=tok_rl_embed burst=10 nodelay;
      limit_conn ip_conns 40;
      proxy_http_version 1.1; proxy_buffering off;
      proxy_set_header Host $host; proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
      rewrite ^/embed/nomic/(.*)$ /$1 break;
      proxy_pass 
    }

    # -------- ASR --------
    location /asr/gpu/ {
      limit_req zone=ip_rl_asr  burst=10 nodelay;
      limit_req zone=tok_rl_asr burst=5 nodelay;
      limit_conn ip_conns 10;
      proxy_http_version 1.1; proxy_buffering off;
      proxy_set_header Host $host; proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
      rewrite ^/asr/gpu/(.*)$ /$1 break;
      proxy_pass 
    }

    location /asr/npu/ {
      limit_req zone=ip_rl_asr  burst=10 nodelay;
      limit_req zone=tok_rl_asr burst=5 nodelay;
      limit_conn ip_conns 10;
      proxy_http_version 1.1; proxy_buffering off;
      proxy_set_header Host $host; proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
      rewrite ^/asr/npu/(.*)$ /$1 break;
      proxy_pass 
    }

    # -------- CLIP --------
    location /clip/ {
      limit_req zone=ip_rl_clip  burst=20 nodelay;
      limit_req zone=tok_rl_clip burst=10 nodelay;
      limit_conn ip_conns 20;
      proxy_http_version 1.1; proxy_buffering off;
      proxy_set_header Host $host; proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
      rewrite ^/clip/(.*)$ /$1 break;
      proxy_pass 
    }
  }
}
^ref-bc5172ca-44-0
```
^ref-bc5172ca-45-0

---

# 3) Multi-stage Dockerfile (kept in `./images`)

### `images/web.docker` ^ref-bc5172ca-238-0

```dockerfile
# --- build ---
FROM node:22-alpine AS build
ARG APP_DIR
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.9.0 --activate
COPY ${APP_DIR}/package.json ${APP_DIR}/pnpm-lock.yaml* ./ 
RUN pnpm install --frozen-lockfile
COPY ${APP_DIR}/ ./
RUN pnpm build

# --- serve static via nginx ---
FROM nginx:1.27-alpine
COPY --from=build /app/dist/ /usr/share/nginx/html/
# Small hardening
RUN rm -f /etc/nginx/conf.d/default.conf
EXPOSE 80
^ref-bc5172ca-238-0
CMD ["nginx", "-g", "daemon off;"]
```

---
 ^ref-bc5172ca-262-0
# 4) Minimal TS + Web Components app (no framework)

```
services/
  ts/
    webapp/
      index.html
      package.json
      tsconfig.json
      vite.config.ts
      src/
        main.ts
^ref-bc5172ca-262-0
        lib/api.ts
        components/prom-ui.ts
``` ^ref-bc5172ca-279-0
^ref-bc5172ca-278-0

### `services/ts/webapp/package.json`

```json
{
  "name": "promethean-web",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview --port 8080"
  },
  "devDependencies": {
    "typescript": "^5.5.4",
^ref-bc5172ca-278-0
    "vite": "^5.4.0"
  }
}
^ref-bc5172ca-298-0
``` ^ref-bc5172ca-302-0
^ref-bc5172ca-298-0

### `services/ts/webapp/tsconfig.json`
 ^ref-bc5172ca-306-0
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022", "DOM"],
    "strict": true,
    "jsx": "react-jsx",
    "allowJs": false,
    "noEmit": true,
^ref-bc5172ca-298-0
    "types": []
  },
  "include": ["src/**/*"]
^ref-bc5172ca-317-0
}
^ref-bc5172ca-317-0
^ref-bc5172ca-306-0 ^ref-bc5172ca-325-0
```
^ref-bc5172ca-317-0

### `services/ts/webapp/vite.config.ts`

```ts
import { defineConfig } from "vite";
^ref-bc5172ca-317-0
export default defineConfig({
  server: { port: 5173, strictPort: true },
  build: { outDir: "dist" },
^ref-bc5172ca-328-0
  base: "/" // served behind /ui/ via edge; nginx rewrites /ui/* → /
^ref-bc5172ca-328-0
});
^ref-bc5172ca-328-0
```

### `services/ts/webapp/index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Promethean UI</title>
^ref-bc5172ca-328-0
  </head>
  <body style="margin:0;font-family:system-ui,Segoe UI,Roboto,Arial">
    <prom-ui></prom-ui>
    <script type="module" src="/src/main.ts"></script>
  </body> ^ref-bc5172ca-351-0
^ref-bc5172ca-351-0
^ref-bc5172ca-345-0
^ref-bc5172ca-351-0
^ref-bc5172ca-345-0
</html>
```

### `services/ts/webapp/src/main.ts`

```ts
import "./components/prom-ui";
```

### `services/ts/webapp/src/lib/api.ts`

```ts
export function getApiKey(): string | null {
  return localStorage.getItem("X_API_KEY");
}

export function setApiKey(key: string) {
  localStorage.setItem("X_API_KEY", key);
}

async function doFetch(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {});
  const key = getApiKey();
  if (key) headers.set("X-API-Key", key);
  headers.set("Accept", "application/json");
  // NOTE: UI is served at /ui/, API paths are absolute (/llm/*, /embed/*, etc)
  const res = await fetch(path, { ...init, headers });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${txt || res.statusText}`);
  }
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

export const API = {
  chat: (which: "qwen3" | "qwen25-coder" | "gemma2", prompt: string) =>
    doFetch(`/llm/${which}/v1/chat/completions`, {
      method: "POST",
      body: JSON.stringify({
        model: "auto",
        messages: [{ role: "user", content: prompt }],
        stream: false
      }),
      headers: { "Content-Type": "application/json" }
    }),

  embedNomic: (input: string | string[]) =>
    doFetch(`/embed/nomic/v1/embeddings`, {
      method: "POST",
      body: JSON.stringify({ input }),
      headers: { "Content-Type": "application/json" }
    }),

  ollamaGenerate: (model: string, prompt: string) =>
    doFetch(`/ollama/api/generate`, {
      method: "POST",
      body: JSON.stringify({ model, prompt, stream: false }),
      headers: { "Content-Type": "application/json" }
    }),

  asrGpuTranscribe: (file: File) => {
    const form = new FormData();
^ref-bc5172ca-351-0
    form.set("file", file, file.name);
    form.set("model", "whisper-1"); // openai-compatible faster-whisper server
    return doFetch(`/asr/gpu/v1/audio/transcriptions`, {
      method: "POST",
      body: form
^ref-bc5172ca-415-0
^ref-bc5172ca-415-0
^ref-bc5172ca-415-0
    });
  }
};
```

### `services/ts/webapp/src/components/prom-ui.ts` ^ref-bc5172ca-440-0

```ts
import { API, getApiKey, setApiKey } from "../lib/api";

const css = `
:host { display:block; padding:16px; color:#eaeaea; background:#0b0f14; min-height:100vh; }
.card { background:#11161e; border:1px solid #1e2633; border-radius:16px; padding:16px; margin:12px 0; }
.row { display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
input[type=text], textarea, select {
  background:#0d131a; color:#eaeaea; border:1px solid #243041; border-radius:10px; padding:10px; width:100%;
}
button { background:#1b2636; color:#fff; border:1px solid #2e3d52; border-radius:10px; padding:10px 14px; cursor:pointer; }
button:hover { filter:brightness(1.1); }
pre { white-space:pre-wrap; word-break:break-word; background:#0d131a; padding:10px; border-radius:10px; border:1px solid #243041;}
h2 { margin:6px 0 12px; }
small { opacity:.7; }
`;

export class PromUi extends HTMLElement {
  root: ShadowRoot;
  constructor() {
    super();
    this.root = this.attachShadow({ mode: "open" });
  }

  connectedCallback() { this.render(); }

  private render() {
    const key = getApiKey() || "";
    this.root.innerHTML = `
      <style>${css}</style>
      <div class="card">
        <h2>API Key</h2>
        <div class="row">
          <input id="key" type="text" placeholder="X-API-Key" value="${key}"/>
          <button id="save">Save</button>
        </div>
        <small>UI loads without a key, but API calls require it.</small>
      </div>

      <div class="card">
        <h2>Chat (vLLM)</h2>
        <div class="row">
          <select id="model">
            <option value="qwen3">Qwen3-8B</option>
            <option value="qwen25-coder">Qwen2.5-Coder-7B</option>
            <option value="gemma2">Gemma 2 2B</option>
          </select>
        </div>
        <textarea id="prompt" rows="4" placeholder="Say hello…"></textarea>
        <div class="row"><button id="send">Send</button></div>
        <pre id="chatOut"></pre>
      </div>

      <div class="card">
        <h2>Embeddings (TEI nomic)</h2>
        <input id="embedText" type="text" placeholder="Text to embed…"/>
        <div class="row"><button id="embedBtn">Embed</button></div>
        <pre id="embedOut"></pre>
      </div>

      <div class="card">
        <h2>ASR (GPU faster-whisper)</h2>
        <input id="asrFile" type="file" accept="audio/*"/>
        <div class="row"><button id="asrBtn">Transcribe</button></div>
        <pre id="asrOut"></pre>
      </div>

      <div class="card">
        <h2>Ollama</h2>
        <input id="ollamaModel" type="text" placeholder="e.g., llama3.1:8b"/>
        <textarea id="ollamaPrompt" rows="3" placeholder="Prompt…"></textarea>
        <div class="row"><button id="ollamaBtn">Generate</button></div>
        <pre id="ollamaOut"></pre>
      </div>
    `;

    // wire up
    this.$<HTMLButtonElement>("#save").onclick = () => {
      const value = this.$<HTMLInputElement>("#key").value.trim();
      setApiKey(value);
      alert("Saved.");
    };

    this.$<HTMLButtonElement>("#send").onclick = async () => {
      this.setBusy(true);
      try {
        const which = this.$<HTMLSelectElement>("#model").value as any;
        const prompt = this.$<HTMLTextAreaElement>("#prompt").value;
        const out = this.$<HTMLElement>("#chatOut");
        const resp = await API.chat(which, prompt);
        // OpenAI-style response
        const text = resp?.choices?.[0]?.message?.content ?? JSON.stringify(resp, null, 2);
        out.textContent = text;
      } catch (e:any) { this.showErr("#chatOut", e); } finally { this.setBusy(false); }
    };

    this.$<HTMLButtonElement>("#embedBtn").onclick = async () => {
      this.setBusy(true);
      try {
        const txt = this.$<HTMLInputElement>("#embedText").value;
        const resp = await API.embedNomic(txt);
        const vec = resp?.data?.[0]?.embedding ?? resp?.embeddings?.[0] ?? resp;
        this.$<HTMLElement>("#embedOut").textContent = JSON.stringify(
          { dim: Array.isArray(vec) ? vec.length : undefined, preview: Array.isArray(vec) ? vec.slice(0,8) : vec },
          null, 2
        );
      } catch (e:any) { this.showErr("#embedOut", e); } finally { this.setBusy(false); }
    };

    this.$<HTMLButtonElement>("#asrBtn").onclick = async () => {
      this.setBusy(true);
      try {
        const file = this.$<HTMLInputElement>("#asrFile").files?.[0];
        if (!file) throw new Error("Pick an audio file");
        const resp = await API.asrGpuTranscribe(file);
        const text = resp?.text ?? JSON.stringify(resp, null, 2);
        this.$<HTMLElement>("#asrOut").textContent = text;
      } catch (e:any) { this.showErr("#asrOut", e); } finally { this.setBusy(false); }
    };

    this.$<HTMLButtonElement>("#ollamaBtn").onclick = async () => {
      this.setBusy(true);
      try {
        const model = this.$<HTMLInputElement>("#ollamaModel").value.trim();
        const prompt = this.$<HTMLTextAreaElement>("#ollamaPrompt").value;
        const resp = await API.ollamaGenerate(model, prompt);
        const text = resp?.response ?? JSON.stringify(resp, null, 2);
        this.$<HTMLElement>("#ollamaOut").textContent = text;
      } catch (e:any) { this.showErr("#ollamaOut", e); } finally { this.setBusy(false); }
    };
  }

  private $(sel: string) { return this.root.querySelector(sel)!; }
^ref-bc5172ca-415-0
  private $T<T extends HTMLElement>(sel: string) { return this.root.querySelector(sel) as T; }
  private showErr(sel: string, e: any) {
    this.$<HTMLElement>(sel).textContent = `Error: ${e?.message || e}`;
  }
  private setBusy(b: boolean) {
^ref-bc5172ca-563-0
^ref-bc5172ca-574-0
^ref-bc5172ca-563-0
^ref-bc5172ca-581-0
^ref-bc5172ca-574-0
^ref-bc5172ca-563-0
^ref-bc5172ca-435-0
    (b ? document.body.classList.add : document.body.classList.remove).call(document.body.classList, "busy");
  }
}
^ref-bc5172ca-440-0
customElements.define("prom-ui", PromUi);
``` ^ref-bc5172ca-574-0
^ref-bc5172ca-442-0

---

# 5) Bring it up
^ref-bc5172ca-563-0
 ^ref-bc5172ca-574-0
```bash
# as before: secrets + base stack
^ref-bc5172ca-598-0
mkdir -p infra/nginx/secrets infra/ovms models/ov
echo "CHANGEME 1;" > infra/nginx/secrets/api_keys.map ^ref-bc5172ca-601-0
^ref-bc5172ca-581-0 ^ref-bc5172ca-602-0

# build + run with UI
docker compose -f docker-compose.yaml up -d --build ^ref-bc5172ca-605-0
# (or with device overlay)
docker compose -f docker-compose.yaml -f docker-compose.stealth.yaml up -d --build
``` ^ref-bc5172ca-598-0

Open: `
Paste your token (from `infra/nginx/secrets/api_keys.map`) into the UI; try Chat, Embeddings, ASR, or Ollama.

---

# 6) Tiny diagram (you like these)

```mermaid
flowchart LR
^ref-bc5172ca-581-0
  A[Browser /ui/*] -->|no token| E[edge:80]
  E -->|rewrite /ui/* → /| W[web:80 (nginx static)]
  subgraph "token-gated APIs" ^ref-bc5172ca-598-0
    E -->|/llm/* + X-API-Key| V1[vllm-qwen3:8000]
    E -->|/llm/* + X-API-Key| V2[vllm-qwen25:8000]
^ref-bc5172ca-605-0
^ref-bc5172ca-602-0 ^ref-bc5172ca-609-0
^ref-bc5172ca-601-0
^ref-bc5172ca-598-0
^ref-bc5172ca-615-0
^ref-bc5172ca-629-0
^ref-bc5172ca-626-0
^ref-bc5172ca-615-0
^ref-bc5172ca-609-0 ^ref-bc5172ca-633-0
^ref-bc5172ca-605-0
^ref-bc5172ca-602-0
    E -->|/llm/* + X-API-Key| V3[vllm-gemma2:8000] ^ref-bc5172ca-601-0
    E -->|/embed/nomic/* + X-API-Key| TEI[tei-nomic:80] ^ref-bc5172ca-602-0
    E -->|/asr/gpu/* + X-API-Key| FW[whisper-faster-openai:8000]
    E -->|/ollama/* + X-API-Key| OL[ollama:11434] ^ref-bc5172ca-615-0 ^ref-bc5172ca-626-0
    E -->|/clip/* + X-API-Key| CL[clip-vit:51000] ^ref-bc5172ca-605-0
  end
``` ^ref-bc5172ca-629-0

--- ^ref-bc5172ca-609-0

If you want me to wire in **RAG UI panels** (pg/qdrant ping + collection browser) or add **CLIP image encode demo**, say the word and I’ll drop the components + endpoints.
