---
title: prom ui bootstrap
uuid: bc5172ca-7a09-42ad-b418-8e42bb14d089
created_at: 2025.08.31.10.45.56.md
filename: Promethean Web UI Setup
description: >-
  Configures a TypeScript Web Components UI that runs behind NGINX, with
  token-gated API access and containerized separation of concerns.
tags:
  - TypeScript
  - Web Components
  - NGINX
  - API Key
  - Docker
  - Containerization
related_to_title:
  - Promethean Full-Stack Docker Setup
  - Pure TypeScript Search Microservice
  - RAG UI Panel with Qdrant and PostgREST
  - Promethean Infrastructure Setup
  - shared-package-layout-clarification
  - Pure-Node Crawl Stack with Playwright and Crawlee
  - Prometheus Observability Stack
  - Per-Domain Policy System for JS Crawler
  - api-gateway-versioning
  - Migrate to Provider-Tenant Architecture
  - Dynamic Context Model for Web Components
  - Local-Only-LLM-Workflow
  - Debugging Broker Connections and Agent Behavior
  - ecs-offload-workers
  - i3-config-validation-methods
  - Post-Linguistic Transhuman Design Frameworks
related_to_uuid:
  - 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
  - d17d3a96-c84d-4738-a403-6c733b874da2
  - e1056831-ae0c-460b-95fa-4cf09b3398c6
  - 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
  - 36c8882a-badc-4e18-838d-2c54d7038141
  - d527c05d-22e8-4493-8f29-ae3cb67f035b
  - e90b5a16-d58f-424d-bd36-70e9bd2861ad
  - c03020e1-e3e7-48bf-aa7e-aa740c601b63
  - 0580dcd3-533d-4834-8a2f-eae3771960a9
  - 54382370-1931-4a19-a634-46735708a9ea
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
  - 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
  - 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
  - d28090ac-f746-4958-aab5-ed1315382c04
  - 6bcff92c-4224-453d-9993-1be8d37d47c3
references:
  - uuid: 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
    line: 169
    col: 1
    score: 0.99
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 73
    col: 1
    score: 0.9
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 139
    col: 1
    score: 0.9
  - uuid: e1056831-ae0c-460b-95fa-4cf09b3398c6
    line: 172
    col: 1
    score: 0.89
  - uuid: 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
    line: 388
    col: 1
    score: 0.91
  - uuid: e1056831-ae0c-460b-95fa-4cf09b3398c6
    line: 336
    col: 1
    score: 0.9
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 589
    col: 1
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 589
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
  - uuid: e1056831-ae0c-460b-95fa-4cf09b3398c6
    line: 362
    col: 1
    score: 1
  - uuid: e1056831-ae0c-460b-95fa-4cf09b3398c6
    line: 362
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
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 510
    col: 1
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 510
    col: 3
    score: 1
  - uuid: 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
    line: 437
    col: 1
    score: 1
  - uuid: 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
    line: 437
    col: 3
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 578
    col: 1
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 578
    col: 3
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 522
    col: 1
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 522
    col: 3
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 534
    col: 1
    score: 0.94
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 534
    col: 3
    score: 0.94
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
  - uuid: d28090ac-f746-4958-aab5-ed1315382c04
    line: 55
    col: 1
    score: 1
  - uuid: d28090ac-f746-4958-aab5-ed1315382c04
    line: 55
    col: 3
    score: 1
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 182
    col: 1
    score: 1
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 182
    col: 3
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 278
    col: 1
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 278
    col: 3
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 91
    col: 1
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 91
    col: 3
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 471
    col: 1
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 471
    col: 3
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 580
    col: 1
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 580
    col: 3
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 509
    col: 1
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 509
    col: 3
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 488
    col: 1
    score: 0.95
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 488
    col: 3
    score: 0.95
  - uuid: e1056831-ae0c-460b-95fa-4cf09b3398c6
    line: 368
    col: 1
    score: 0.99
  - uuid: e1056831-ae0c-460b-95fa-4cf09b3398c6
    line: 368
    col: 3
    score: 0.99
  - uuid: e1056831-ae0c-460b-95fa-4cf09b3398c6
    line: 370
    col: 1
    score: 0.99
  - uuid: e1056831-ae0c-460b-95fa-4cf09b3398c6
    line: 370
    col: 3
    score: 0.99
  - uuid: e1056831-ae0c-460b-95fa-4cf09b3398c6
    line: 372
    col: 1
    score: 0.99
  - uuid: e1056831-ae0c-460b-95fa-4cf09b3398c6
    line: 372
    col: 3
    score: 0.99
  - uuid: e1056831-ae0c-460b-95fa-4cf09b3398c6
    line: 374
    col: 1
    score: 0.99
  - uuid: e1056831-ae0c-460b-95fa-4cf09b3398c6
    line: 374
    col: 3
    score: 0.99
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 530
    col: 1
    score: 0.98
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 530
    col: 3
    score: 0.98
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 601
    col: 1
    score: 0.98
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 601
    col: 3
    score: 0.98
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 533
    col: 1
    score: 0.98
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 533
    col: 3
    score: 0.98
  - uuid: 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
    line: 445
    col: 1
    score: 0.99
  - uuid: 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
    line: 445
    col: 3
    score: 0.99
---
Nice stack. Here’s a clean way to bolt on a **TypeScript + Web Components** UI that lives behind your existing NGINX “edge”, requires **X-API-Key for API calls** (but not for loading the UI), and keeps container bits separate from source (Dockerfile in `./images`, code in `./services/ts/webapp`).

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

---

# 2) Let the UI load **without** a token, but keep token-gated APIs

Replace your `infra/nginx/nginx.conf` with this adjusted version (adds a small `map` to bypass auth for `/ui/*`, proxies `/ui/*` to the `web` container, and keeps token auth on API routes):

### `infra/nginx/nginx.conf`

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
      proxy_pass http://web/;
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
      proxy_pass http://ollama:11434/;
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
      proxy_pass http://vllm-qwen3-8b:8000/;
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
      proxy_pass http://vllm-qwen25-coder-7b:8000/;
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
      proxy_pass http://vllm-gemma-2b:8000/;
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
      proxy_pass http://tei-nomic:80/;
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
      proxy_pass http://whisper-faster-openai:8000/;
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
      proxy_pass http://ovms-npu:9000/;
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
      proxy_pass http://clip-vit:51000/;
    }
  }
}
```

---

# 3) Multi-stage Dockerfile (kept in `./images`)

### `images/web.docker`

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
CMD ["nginx", "-g", "daemon off;"]
```

---

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
        lib/api.ts
        components/prom-ui.ts
```

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
    "vite": "^5.4.0"
  }
}
```

### `services/ts/webapp/tsconfig.json`

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
    "types": []
  },
  "include": ["src/**/*"]
}
```

### `services/ts/webapp/vite.config.ts`

```ts
import { defineConfig } from "vite";
export default defineConfig({
  server: { port: 5173, strictPort: true },
  build: { outDir: "dist" },
  base: "/" // served behind /ui/ via edge; nginx rewrites /ui/* → /
});
```

### `services/ts/webapp/index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Promethean UI</title>
  </head>
  <body style="margin:0;font-family:system-ui,Segoe UI,Roboto,Arial">
    <prom-ui></prom-ui>
    <script type="module" src="/src/main.ts"></script>
  </body>
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
    form.set("file", file, file.name);
    form.set("model", "whisper-1"); // openai-compatible faster-whisper server
    return doFetch(`/asr/gpu/v1/audio/transcriptions`, {
      method: "POST",
      body: form
    });
  }
};
```

### `services/ts/webapp/src/components/prom-ui.ts`

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
  private $T<T extends HTMLElement>(sel: string) { return this.root.querySelector(sel) as T; }
  private showErr(sel: string, e: any) {
    this.$<HTMLElement>(sel).textContent = `Error: ${e?.message || e}`;
  }
  private setBusy(b: boolean) {
    (b ? document.body.classList.add : document.body.classList.remove).call(document.body.classList, "busy");
  }
}
customElements.define("prom-ui", PromUi);
```

---

# 5) Bring it up

```bash
# as before: secrets + base stack
mkdir -p infra/nginx/secrets infra/ovms models/ov
echo "CHANGEME 1;" > infra/nginx/secrets/api_keys.map

# build + run with UI
docker compose -f docker-compose.yaml up -d --build
# (or with device overlay)
docker compose -f docker-compose.yaml -f docker-compose.stealth.yaml up -d --build
```

Open: `http://localhost/ui/`
Paste your token (from `infra/nginx/secrets/api_keys.map`) into the UI; try Chat, Embeddings, ASR, or Ollama.

---

# 6) Tiny diagram (you like these)

```mermaid
flowchart LR
  A[Browser /ui/*] -->|no token| E[edge:80]
  E -->|rewrite /ui/* → /| W[web:80 (nginx static)]
  subgraph "token-gated APIs"
    E -->|/llm/* + X-API-Key| V1[vllm-qwen3:8000]
    E -->|/llm/* + X-API-Key| V2[vllm-qwen25:8000]
    E -->|/llm/* + X-API-Key| V3[vllm-gemma2:8000]
    E -->|/embed/nomic/* + X-API-Key| TEI[tei-nomic:80]
    E -->|/asr/gpu/* + X-API-Key| FW[whisper-faster-openai:8000]
    E -->|/ollama/* + X-API-Key| OL[ollama:11434]
    E -->|/clip/* + X-API-Key| CL[clip-vit:51000]
  end
```

---

If you want me to wire in **RAG UI panels** (pg/qdrant ping + collection browser) or add **CLIP image encode demo**, say the word and I’ll drop the components + endpoints.
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Promethean Full-Stack Docker Setup](promethean-full-stack-docker-setup.md)
- [Pure TypeScript Search Microservice](pure-typescript-search-microservice.md)
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [shared-package-layout-clarification](shared-package-layout-clarification.md)
- [Pure-Node Crawl Stack with Playwright and Crawlee](pure-node-crawl-stack-with-playwright-and-crawlee.md)
- [Prometheus Observability Stack](prometheus-observability-stack.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [i3-config-validation-methods](i3-config-validation-methods.md)
- [Post-Linguistic Transhuman Design Frameworks](post-linguistic-transhuman-design-frameworks.md)

## Sources
- [Promethean Full-Stack Docker Setup — L169](promethean-full-stack-docker-setup.md#L169) (line 169, col 1, score 0.99)
- [Pure TypeScript Search Microservice — L73](pure-typescript-search-microservice.md#L73) (line 73, col 1, score 0.9)
- [Pure TypeScript Search Microservice — L139](pure-typescript-search-microservice.md#L139) (line 139, col 1, score 0.9)
- [RAG UI Panel with Qdrant and PostgREST — L172](rag-ui-panel-with-qdrant-and-postgrest.md#L172) (line 172, col 1, score 0.89)
- [Promethean Full-Stack Docker Setup — L388](promethean-full-stack-docker-setup.md#L388) (line 388, col 1, score 0.91)
- [RAG UI Panel with Qdrant and PostgREST — L336](rag-ui-panel-with-qdrant-and-postgrest.md#L336) (line 336, col 1, score 0.9)
- [Promethean Infrastructure Setup — L589](promethean-infrastructure-setup.md#L589) (line 589, col 1, score 1)
- [Promethean Infrastructure Setup — L589](promethean-infrastructure-setup.md#L589) (line 589, col 3, score 1)
- [Prometheus Observability Stack — L506](prometheus-observability-stack.md#L506) (line 506, col 1, score 1)
- [Prometheus Observability Stack — L506](prometheus-observability-stack.md#L506) (line 506, col 3, score 1)
- [Pure TypeScript Search Microservice — L526](pure-typescript-search-microservice.md#L526) (line 526, col 1, score 1)
- [Pure TypeScript Search Microservice — L526](pure-typescript-search-microservice.md#L526) (line 526, col 3, score 1)
- [RAG UI Panel with Qdrant and PostgREST — L362](rag-ui-panel-with-qdrant-and-postgrest.md#L362) (line 362, col 1, score 1)
- [RAG UI Panel with Qdrant and PostgREST — L362](rag-ui-panel-with-qdrant-and-postgrest.md#L362) (line 362, col 3, score 1)
- [api-gateway-versioning — L288](api-gateway-versioning.md#L288) (line 288, col 1, score 1)
- [api-gateway-versioning — L288](api-gateway-versioning.md#L288) (line 288, col 3, score 1)
- [Promethean Full-Stack Docker Setup — L440](promethean-full-stack-docker-setup.md#L440) (line 440, col 1, score 1)
- [Promethean Full-Stack Docker Setup — L440](promethean-full-stack-docker-setup.md#L440) (line 440, col 3, score 1)
- [Promethean Infrastructure Setup — L584](promethean-infrastructure-setup.md#L584) (line 584, col 1, score 1)
- [Promethean Infrastructure Setup — L584](promethean-infrastructure-setup.md#L584) (line 584, col 3, score 1)
- [Prometheus Observability Stack — L510](prometheus-observability-stack.md#L510) (line 510, col 1, score 1)
- [Prometheus Observability Stack — L510](prometheus-observability-stack.md#L510) (line 510, col 3, score 1)
- [Promethean Full-Stack Docker Setup — L437](promethean-full-stack-docker-setup.md#L437) (line 437, col 1, score 1)
- [Promethean Full-Stack Docker Setup — L437](promethean-full-stack-docker-setup.md#L437) (line 437, col 3, score 1)
- [Promethean Infrastructure Setup — L578](promethean-infrastructure-setup.md#L578) (line 578, col 1, score 1)
- [Promethean Infrastructure Setup — L578](promethean-infrastructure-setup.md#L578) (line 578, col 3, score 1)
- [Pure TypeScript Search Microservice — L522](pure-typescript-search-microservice.md#L522) (line 522, col 1, score 1)
- [Pure TypeScript Search Microservice — L522](pure-typescript-search-microservice.md#L522) (line 522, col 3, score 1)
- [Pure TypeScript Search Microservice — L534](pure-typescript-search-microservice.md#L534) (line 534, col 1, score 0.94)
- [Pure TypeScript Search Microservice — L534](pure-typescript-search-microservice.md#L534) (line 534, col 3, score 0.94)
- [api-gateway-versioning — L284](api-gateway-versioning.md#L284) (line 284, col 1, score 1)
- [api-gateway-versioning — L284](api-gateway-versioning.md#L284) (line 284, col 3, score 1)
- [Debugging Broker Connections and Agent Behavior — L40](debugging-broker-connections-and-agent-behavior.md#L40) (line 40, col 1, score 1)
- [Debugging Broker Connections and Agent Behavior — L40](debugging-broker-connections-and-agent-behavior.md#L40) (line 40, col 3, score 1)
- [Dynamic Context Model for Web Components — L384](dynamic-context-model-for-web-components.md#L384) (line 384, col 1, score 1)
- [Dynamic Context Model for Web Components — L384](dynamic-context-model-for-web-components.md#L384) (line 384, col 3, score 1)
- [ecs-offload-workers — L458](ecs-offload-workers.md#L458) (line 458, col 1, score 1)
- [ecs-offload-workers — L458](ecs-offload-workers.md#L458) (line 458, col 3, score 1)
- [i3-config-validation-methods — L55](i3-config-validation-methods.md#L55) (line 55, col 1, score 1)
- [i3-config-validation-methods — L55](i3-config-validation-methods.md#L55) (line 55, col 3, score 1)
- [Local-Only-LLM-Workflow — L182](local-only-llm-workflow.md#L182) (line 182, col 1, score 1)
- [Local-Only-LLM-Workflow — L182](local-only-llm-workflow.md#L182) (line 182, col 3, score 1)
- [Migrate to Provider-Tenant Architecture — L278](migrate-to-provider-tenant-architecture.md#L278) (line 278, col 1, score 1)
- [Migrate to Provider-Tenant Architecture — L278](migrate-to-provider-tenant-architecture.md#L278) (line 278, col 3, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L91](post-linguistic-transhuman-design-frameworks.md#L91) (line 91, col 1, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L91](post-linguistic-transhuman-design-frameworks.md#L91) (line 91, col 3, score 1)
- [Per-Domain Policy System for JS Crawler — L471](per-domain-policy-system-for-js-crawler.md#L471) (line 471, col 1, score 1)
- [Per-Domain Policy System for JS Crawler — L471](per-domain-policy-system-for-js-crawler.md#L471) (line 471, col 3, score 1)
- [Promethean Infrastructure Setup — L580](promethean-infrastructure-setup.md#L580) (line 580, col 1, score 1)
- [Promethean Infrastructure Setup — L580](promethean-infrastructure-setup.md#L580) (line 580, col 3, score 1)
- [Prometheus Observability Stack — L509](prometheus-observability-stack.md#L509) (line 509, col 1, score 1)
- [Prometheus Observability Stack — L509](prometheus-observability-stack.md#L509) (line 509, col 3, score 1)
- [Per-Domain Policy System for JS Crawler — L488](per-domain-policy-system-for-js-crawler.md#L488) (line 488, col 1, score 0.95)
- [Per-Domain Policy System for JS Crawler — L488](per-domain-policy-system-for-js-crawler.md#L488) (line 488, col 3, score 0.95)
- [RAG UI Panel with Qdrant and PostgREST — L368](rag-ui-panel-with-qdrant-and-postgrest.md#L368) (line 368, col 1, score 0.99)
- [RAG UI Panel with Qdrant and PostgREST — L368](rag-ui-panel-with-qdrant-and-postgrest.md#L368) (line 368, col 3, score 0.99)
- [RAG UI Panel with Qdrant and PostgREST — L370](rag-ui-panel-with-qdrant-and-postgrest.md#L370) (line 370, col 1, score 0.99)
- [RAG UI Panel with Qdrant and PostgREST — L370](rag-ui-panel-with-qdrant-and-postgrest.md#L370) (line 370, col 3, score 0.99)
- [RAG UI Panel with Qdrant and PostgREST — L372](rag-ui-panel-with-qdrant-and-postgrest.md#L372) (line 372, col 1, score 0.99)
- [RAG UI Panel with Qdrant and PostgREST — L372](rag-ui-panel-with-qdrant-and-postgrest.md#L372) (line 372, col 3, score 0.99)
- [RAG UI Panel with Qdrant and PostgREST — L374](rag-ui-panel-with-qdrant-and-postgrest.md#L374) (line 374, col 1, score 0.99)
- [RAG UI Panel with Qdrant and PostgREST — L374](rag-ui-panel-with-qdrant-and-postgrest.md#L374) (line 374, col 3, score 0.99)
- [Pure TypeScript Search Microservice — L530](pure-typescript-search-microservice.md#L530) (line 530, col 1, score 0.98)
- [Pure TypeScript Search Microservice — L530](pure-typescript-search-microservice.md#L530) (line 530, col 3, score 0.98)
- [Promethean Infrastructure Setup — L601](promethean-infrastructure-setup.md#L601) (line 601, col 1, score 0.98)
- [Promethean Infrastructure Setup — L601](promethean-infrastructure-setup.md#L601) (line 601, col 3, score 0.98)
- [Pure TypeScript Search Microservice — L533](pure-typescript-search-microservice.md#L533) (line 533, col 1, score 0.98)
- [Pure TypeScript Search Microservice — L533](pure-typescript-search-microservice.md#L533) (line 533, col 3, score 0.98)
- [Promethean Full-Stack Docker Setup — L445](promethean-full-stack-docker-setup.md#L445) (line 445, col 1, score 0.99)
- [Promethean Full-Stack Docker Setup — L445](promethean-full-stack-docker-setup.md#L445) (line 445, col 3, score 0.99)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
