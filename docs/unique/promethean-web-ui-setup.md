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
related_to_title: []
related_to_uuid: []
references: []
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
^ref-bc5172ca-9-0

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
^ref-bc5172ca-44-0
```

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
```
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
```
^ref-bc5172ca-298-0

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
^ref-bc5172ca-298-0
    "types": []
  },
  "include": ["src/**/*"]
^ref-bc5172ca-317-0
}
^ref-bc5172ca-317-0
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
customElements.define("prom-ui", PromUi);
``` ^ref-bc5172ca-574-0

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

Open: `http://localhost/ui/`
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

If you want me to wire in **RAG UI panels** (pg/qdrant ping + collection browser) or add **CLIP image encode demo**, say the word and I’ll drop the components + endpoints.<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
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
- [observability-infrastructure-setup](observability-infrastructure-setup.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [Admin Dashboard for User Management](admin-dashboard-for-user-management.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [Local-Offline-Model-Deployment-Strategy](local-offline-model-deployment-strategy.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [archetype-ecs](archetype-ecs.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [JavaScript](chunks/javascript.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [Diagrams](chunks/diagrams.md)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler](ollama-llm-provider-for-pseudo-code-transpiler.md)
- [2d-sandbox-field](2d-sandbox-field.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [Event Bus MVP](event-bus-mvp.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [Services](chunks/services.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [prom-lib-rate-limiters-and-replay-api](prom-lib-rate-limiters-and-replay-api.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [Interop and Source Maps](interop-and-source-maps.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [Tooling](chunks/tooling.md)
- [field-interaction-equations](field-interaction-equations.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [Window Management](chunks/window-management.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [markdown-to-org-transpiler](markdown-to-org-transpiler.md)
- [AI-First-OS-Model-Context-Protocol](ai-first-os-model-context-protocol.md)
- [balanced-bst](balanced-bst.md)
- [EidolonField](eidolonfield.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [DSL](chunks/dsl.md)
- [Shared](chunks/shared.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [Chroma-Embedding-Refactor](chroma-embedding-refactor.md)
- [Board Automation Improvements](board-automation-improvements.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [graph-ds](graph-ds.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [heartbeat-simulation-snippets](heartbeat-simulation-snippets.md)
- [Promethean_Eidolon_Synchronicity_Model](promethean-eidolon-synchronicity-model.md)
- [promethean-system-diagrams](promethean-system-diagrams.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [Lispy Macros with syntax-rules](lispy-macros-with-syntax-rules.md)
- [Creative Moments](creative-moments.md)
- [Obsidian ChatGPT Plugin Integration](obsidian-chatgpt-plugin-integration.md)
- [Obsidian Templating Plugins Integration Guide](obsidian-templating-plugins-integration-guide.md)
- [Protocol_0_The_Contradiction_Engine](protocol-0-the-contradiction-engine.md)
- [Operations](chunks/operations.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
- [Shared Package Structure](shared-package-structure.md)
- [obsidian-ignore-node-modules-regex](obsidian-ignore-node-modules-regex.md)
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
- [Fnord Tracer Protocol](fnord-tracer-protocol.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [Provider-Agnostic Chat Panel Implementation](provider-agnostic-chat-panel-implementation.md)
- [zero-copy-snapshots-and-workers](zero-copy-snapshots-and-workers.md)
- [Promethean Workflow Optimization](promethean-workflow-optimization.md)
- [Functional Embedding Pipeline Refactor](functional-embedding-pipeline-refactor.md)
- [schema-evolution-workflow](schema-evolution-workflow.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [Self-Agency in AI Interaction](self-agency-in-ai-interaction.md)
- [set-assignment-in-lisp-ast](set-assignment-in-lisp-ast.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [Promethean-Copilot-Intent-Engine](promethean-copilot-intent-engine.md)
- [DuckDuckGoSearchPipeline](duckduckgosearchpipeline.md)
- [Promethean Pipelines: Local TypeScript-First Workflow](promethean-pipelines-local-typescript-first-workflow.md)
- [Promethean Pipelines](promethean-pipelines.md)
- [Refactor Frontmatter Processing](refactor-frontmatter-processing.md)
- [TypeScript Patch for Tool Calling Support](typescript-patch-for-tool-calling-support.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [file-watcher-auth-fix](file-watcher-auth-fix.md)
- [Promethean Documentation Pipeline Overview](promethean-documentation-pipeline-overview.md)
- [WebSocket Gateway Implementation](websocket-gateway-implementation.md)
- [plan-update-confirmation](plan-update-confirmation.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [Voice Access Layer Design](voice-access-layer-design.md)
- [Model Upgrade Calm-Down Guide](model-upgrade-calm-down-guide.md)
- [System Scheduler with Resource-Aware DAG](system-scheduler-with-resource-aware-dag.md)
- [Promethean Agent DSL TS Scaffold](promethean-agent-dsl-ts-scaffold.md)
- [pm2-orchestration-patterns](pm2-orchestration-patterns.md)
- [Stateful Partitions and Rebalancing](stateful-partitions-and-rebalancing.md)
- [Universal Lisp Interface](universal-lisp-interface.md)
- [Promethean State Format](promethean-state-format.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [refactor-relations](refactor-relations.md)
- [lisp-dsl-for-window-management](lisp-dsl-for-window-management.md)
- [Optimizing Command Limitations in System Design](optimizing-command-limitations-in-system-design.md)
- [i3-layout-saver](i3-layout-saver.md)
- [polyglot-repl-interface-layer](polyglot-repl-interface-layer.md)
## Sources
- [Promethean Infrastructure Setup — L1](promethean-infrastructure-setup.md#^ref-6deed6ac-1-0) (line 1, col 0, score 0.67)
- [RAG UI Panel with Qdrant and PostgREST — L109](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-109-0) (line 109, col 0, score 0.7)
- [RAG UI Panel with Qdrant and PostgREST — L1](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-1-0) (line 1, col 0, score 0.7)
- [Pure TypeScript Search Microservice — L62](pure-typescript-search-microservice.md#^ref-d17d3a96-62-0) (line 62, col 0, score 0.78)
- [Promethean Infrastructure Setup — L5](promethean-infrastructure-setup.md#^ref-6deed6ac-5-0) (line 5, col 0, score 0.69)
- [WebSocket Gateway Implementation — L628](websocket-gateway-implementation.md#^ref-e811123d-628-0) (line 628, col 0, score 0.65)
- [observability-infrastructure-setup — L7](observability-infrastructure-setup.md#^ref-b4e64f8c-7-0) (line 7, col 0, score 0.7)
- [Promethean Full-Stack Docker Setup — L388](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-388-0) (line 388, col 0, score 0.91)
- [api-gateway-versioning — L51](api-gateway-versioning.md#^ref-0580dcd3-51-0) (line 51, col 0, score 0.64)
- [Mongo Outbox Implementation — L379](mongo-outbox-implementation.md#^ref-9c1acd1e-379-0) (line 379, col 0, score 0.63)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L8](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-8-0) (line 8, col 0, score 0.63)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L389](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-389-0) (line 389, col 0, score 0.72)
- [Dynamic Context Model for Web Components — L1](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1-0) (line 1, col 0, score 0.62)
- [Promethean Pipelines: Local TypeScript-First Workflow — L1](promethean-pipelines-local-typescript-first-workflow.md#^ref-6b63edca-1-0) (line 1, col 0, score 0.62)
- [Pure TypeScript Search Microservice — L14](pure-typescript-search-microservice.md#^ref-d17d3a96-14-0) (line 14, col 0, score 0.67)
- [Promethean Infrastructure Setup — L93](promethean-infrastructure-setup.md#^ref-6deed6ac-93-0) (line 93, col 0, score 0.67)
- [Prometheus Observability Stack — L7](prometheus-observability-stack.md#^ref-e90b5a16-7-0) (line 7, col 0, score 0.67)
- [Promethean Full-Stack Docker Setup — L3](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-3-0) (line 3, col 0, score 0.64)
- [observability-infrastructure-setup — L357](observability-infrastructure-setup.md#^ref-b4e64f8c-357-0) (line 357, col 0, score 0.69)
- [AI-Centric OS with MCP Layer — L185](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-185-0) (line 185, col 0, score 0.69)
- [Prometheus Observability Stack — L500](prometheus-observability-stack.md#^ref-e90b5a16-500-0) (line 500, col 0, score 0.69)
- [Local-Offline-Model-Deployment-Strategy — L80](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-80-0) (line 80, col 0, score 0.67)
- [WebSocket Gateway Implementation — L52](websocket-gateway-implementation.md#^ref-e811123d-52-0) (line 52, col 0, score 0.69)
- [Mongo Outbox Implementation — L535](mongo-outbox-implementation.md#^ref-9c1acd1e-535-0) (line 535, col 0, score 0.69)
- [Agent Tasks: Persistence Migration to DualStore — L8](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-8-0) (line 8, col 0, score 0.65)
- [RAG UI Panel with Qdrant and PostgREST — L79](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-79-0) (line 79, col 0, score 0.65)
- [Agent Tasks: Persistence Migration to DualStore — L84](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-84-0) (line 84, col 0, score 0.64)
- [observability-infrastructure-setup — L96](observability-infrastructure-setup.md#^ref-b4e64f8c-96-0) (line 96, col 0, score 0.64)
- [Promethean Full-Stack Docker Setup — L169](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-169-0) (line 169, col 0, score 0.92)
- [Chroma Toolkit Consolidation Plan — L146](chroma-toolkit-consolidation-plan.md#^ref-5020e892-146-0) (line 146, col 0, score 0.64)
- [Performance-Optimized-Polyglot-Bridge — L375](performance-optimized-polyglot-bridge.md#^ref-f5579967-375-0) (line 375, col 0, score 0.64)
- [plan-update-confirmation — L986](plan-update-confirmation.md#^ref-b22d79c6-986-0) (line 986, col 0, score 0.64)
- [api-gateway-versioning — L1](api-gateway-versioning.md#^ref-0580dcd3-1-0) (line 1, col 0, score 0.64)
- [Promethean Infrastructure Setup — L61](promethean-infrastructure-setup.md#^ref-6deed6ac-61-0) (line 61, col 0, score 0.66)
- [api-gateway-versioning — L7](api-gateway-versioning.md#^ref-0580dcd3-7-0) (line 7, col 0, score 0.65)
- [observability-infrastructure-setup — L44](observability-infrastructure-setup.md#^ref-b4e64f8c-44-0) (line 44, col 0, score 0.68)
- [Pure TypeScript Search Microservice — L46](pure-typescript-search-microservice.md#^ref-d17d3a96-46-0) (line 46, col 0, score 0.8)
- [RAG UI Panel with Qdrant and PostgREST — L81](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-81-0) (line 81, col 0, score 0.74)
- [Migrate to Provider-Tenant Architecture — L144](migrate-to-provider-tenant-architecture.md#^ref-54382370-144-0) (line 144, col 0, score 0.67)
- [prom-lib-rate-limiters-and-replay-api — L92](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-92-0) (line 92, col 0, score 0.65)
- [AI-Centric OS with MCP Layer — L18](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-18-0) (line 18, col 0, score 0.65)
- [Per-Domain Policy System for JS Crawler — L27](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-27-0) (line 27, col 0, score 0.68)
- [prom-lib-rate-limiters-and-replay-api — L45](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-45-0) (line 45, col 0, score 0.65)
- [Migrate to Provider-Tenant Architecture — L82](migrate-to-provider-tenant-architecture.md#^ref-54382370-82-0) (line 82, col 0, score 0.65)
- [Per-Domain Policy System for JS Crawler — L184](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-184-0) (line 184, col 0, score 0.68)
- [Mongo Outbox Implementation — L451](mongo-outbox-implementation.md#^ref-9c1acd1e-451-0) (line 451, col 0, score 0.65)
- [RAG UI Panel with Qdrant and PostgREST — L356](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-356-0) (line 356, col 0, score 0.67)
- [Mongo Outbox Implementation — L307](mongo-outbox-implementation.md#^ref-9c1acd1e-307-0) (line 307, col 0, score 0.68)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L1](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-1-0) (line 1, col 0, score 0.67)
- [Local-Only-LLM-Workflow — L28](local-only-llm-workflow.md#^ref-9a8ab57e-28-0) (line 28, col 0, score 0.64)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L9](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-9-0) (line 9, col 0, score 0.61)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L223](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-223-0) (line 223, col 0, score 0.68)
- [Local-Offline-Model-Deployment-Strategy — L25](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-25-0) (line 25, col 0, score 0.7)
- [Promethean Full-Stack Docker Setup — L377](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-377-0) (line 377, col 0, score 0.67)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L194](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-194-0) (line 194, col 0, score 0.65)
- [Performance-Optimized-Polyglot-Bridge — L170](performance-optimized-polyglot-bridge.md#^ref-f5579967-170-0) (line 170, col 0, score 0.66)
- [Pure TypeScript Search Microservice — L73](pure-typescript-search-microservice.md#^ref-d17d3a96-73-0) (line 73, col 0, score 0.9)
- [Promethean Infrastructure Setup — L54](promethean-infrastructure-setup.md#^ref-6deed6ac-54-0) (line 54, col 0, score 0.62)
- [Promethean Infrastructure Setup — L33](promethean-infrastructure-setup.md#^ref-6deed6ac-33-0) (line 33, col 0, score 0.73)
- [file-watcher-auth-fix — L9](file-watcher-auth-fix.md#^ref-9044701b-9-0) (line 9, col 0, score 0.7)
- [Promethean Documentation Pipeline Overview — L119](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-119-0) (line 119, col 0, score 0.7)
- [plan-update-confirmation — L637](plan-update-confirmation.md#^ref-b22d79c6-637-0) (line 637, col 0, score 0.69)
- [shared-package-layout-clarification — L145](shared-package-layout-clarification.md#^ref-36c8882a-145-0) (line 145, col 0, score 0.66)
- [Promethean Agent DSL TS Scaffold — L813](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-813-0) (line 813, col 0, score 0.65)
- [Promethean Pipelines: Local TypeScript-First Workflow — L3](promethean-pipelines-local-typescript-first-workflow.md#^ref-6b63edca-3-0) (line 3, col 0, score 0.63)
- [Universal Lisp Interface — L74](universal-lisp-interface.md#^ref-b01856b4-74-0) (line 74, col 0, score 0.63)
- [Pure TypeScript Search Microservice — L96](pure-typescript-search-microservice.md#^ref-d17d3a96-96-0) (line 96, col 0, score 0.75)
- [Promethean Event Bus MVP v0.1 — L395](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-395-0) (line 395, col 0, score 0.73)
- [Promethean-native config design — L90](promethean-native-config-design.md#^ref-ab748541-90-0) (line 90, col 0, score 0.7)
- [shared-package-layout-clarification — L11](shared-package-layout-clarification.md#^ref-36c8882a-11-0) (line 11, col 0, score 0.68)
- [Mongo Outbox Implementation — L381](mongo-outbox-implementation.md#^ref-9c1acd1e-381-0) (line 381, col 0, score 0.66)
- [Shared Package Structure — L5](shared-package-structure.md#^ref-66a72fc3-5-0) (line 5, col 0, score 0.67)
- [universal-intention-code-fabric — L53](universal-intention-code-fabric.md#^ref-c14edce7-53-0) (line 53, col 0, score 0.66)
- [shared-package-layout-clarification — L161](shared-package-layout-clarification.md#^ref-36c8882a-161-0) (line 161, col 0, score 0.69)
- [Language-Agnostic Mirror System — L37](language-agnostic-mirror-system.md#^ref-d2b3628c-37-0) (line 37, col 0, score 0.65)
- [plan-update-confirmation — L640](plan-update-confirmation.md#^ref-b22d79c6-640-0) (line 640, col 0, score 0.65)
- [api-gateway-versioning — L79](api-gateway-versioning.md#^ref-0580dcd3-79-0) (line 79, col 0, score 0.63)
- [2d-sandbox-field — L182](2d-sandbox-field.md#^ref-c710dc93-182-0) (line 182, col 0, score 0.7)
- [Promethean Infrastructure Setup — L392](promethean-infrastructure-setup.md#^ref-6deed6ac-392-0) (line 392, col 0, score 0.66)
- [Promethean Infrastructure Setup — L335](promethean-infrastructure-setup.md#^ref-6deed6ac-335-0) (line 335, col 0, score 0.69)
- [Promethean-Copilot-Intent-Engine — L4](promethean-copilot-intent-engine.md#^ref-ae24a280-4-0) (line 4, col 0, score 0.68)
- [Promethean-native config design — L380](promethean-native-config-design.md#^ref-ab748541-380-0) (line 380, col 0, score 0.68)
- [Voice Access Layer Design — L302](voice-access-layer-design.md#^ref-543ed9b3-302-0) (line 302, col 0, score 0.68)
- [Model Upgrade Calm-Down Guide — L29](model-upgrade-calm-down-guide.md#^ref-db74343f-29-0) (line 29, col 0, score 0.68)
- [api-gateway-versioning — L293](api-gateway-versioning.md#^ref-0580dcd3-293-0) (line 293, col 0, score 0.68)
- [eidolon-field-math-foundations — L168](eidolon-field-math-foundations.md#^ref-008f2ac0-168-0) (line 168, col 0, score 0.68)
- [i3-config-validation-methods — L75](i3-config-validation-methods.md#^ref-d28090ac-75-0) (line 75, col 0, score 0.68)
- [Pure TypeScript Search Microservice — L139](pure-typescript-search-microservice.md#^ref-d17d3a96-139-0) (line 139, col 0, score 0.9)
- [shared-package-layout-clarification — L84](shared-package-layout-clarification.md#^ref-36c8882a-84-0) (line 84, col 0, score 0.8)
- [Local-First Intention→Code Loop with Free Models — L100](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-100-0) (line 100, col 0, score 0.6)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L332](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-332-0) (line 332, col 0, score 0.68)
- [Cross-Target Macro System in Sibilant — L160](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-160-0) (line 160, col 0, score 0.68)
- [Promethean Agent DSL TS Scaffold — L3](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-3-0) (line 3, col 0, score 0.66)
- [Interop and Source Maps — L470](interop-and-source-maps.md#^ref-cdfac40c-470-0) (line 470, col 0, score 0.66)
- [sibilant-macro-targets — L153](sibilant-macro-targets.md#^ref-c5c9a5c6-153-0) (line 153, col 0, score 0.67)
- [Lispy Macros with syntax-rules — L3](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-3-0) (line 3, col 0, score 0.67)
- [universal-intention-code-fabric — L186](universal-intention-code-fabric.md#^ref-c14edce7-186-0) (line 186, col 0, score 0.67)
- [Language-Agnostic Mirror System — L151](language-agnostic-mirror-system.md#^ref-d2b3628c-151-0) (line 151, col 0, score 0.66)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L108](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-108-0) (line 108, col 0, score 0.66)
- [Lispy Macros with syntax-rules — L319](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-319-0) (line 319, col 0, score 0.66)
- [Language-Agnostic Mirror System — L147](language-agnostic-mirror-system.md#^ref-d2b3628c-147-0) (line 147, col 0, score 0.66)
- [Event Bus MVP — L457](event-bus-mvp.md#^ref-534fe91d-457-0) (line 457, col 0, score 0.74)
- [Shared Package Structure — L58](shared-package-structure.md#^ref-66a72fc3-58-0) (line 58, col 0, score 0.6)
- [pm2-orchestration-patterns — L131](pm2-orchestration-patterns.md#^ref-51932e7b-131-0) (line 131, col 0, score 0.65)
- [RAG UI Panel with Qdrant and PostgREST — L131](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-131-0) (line 131, col 0, score 0.6)
- [Promethean-native config design — L103](promethean-native-config-design.md#^ref-ab748541-103-0) (line 103, col 0, score 0.63)
- [Event Bus MVP — L370](event-bus-mvp.md#^ref-534fe91d-370-0) (line 370, col 0, score 0.63)
- [Migrate to Provider-Tenant Architecture — L59](migrate-to-provider-tenant-architecture.md#^ref-54382370-59-0) (line 59, col 0, score 0.63)
- [pm2-orchestration-patterns — L117](pm2-orchestration-patterns.md#^ref-51932e7b-117-0) (line 117, col 0, score 0.63)
- [Promethean Agent DSL TS Scaffold — L622](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-622-0) (line 622, col 0, score 0.62)
- [Promethean Agent DSL TS Scaffold — L693](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-693-0) (line 693, col 0, score 0.62)
- [Chroma Toolkit Consolidation Plan — L10](chroma-toolkit-consolidation-plan.md#^ref-5020e892-10-0) (line 10, col 0, score 0.62)
- [plan-update-confirmation — L650](plan-update-confirmation.md#^ref-b22d79c6-650-0) (line 650, col 0, score 0.62)
- [plan-update-confirmation — L662](plan-update-confirmation.md#^ref-b22d79c6-662-0) (line 662, col 0, score 0.62)
- [plan-update-confirmation — L674](plan-update-confirmation.md#^ref-b22d79c6-674-0) (line 674, col 0, score 0.62)
- [RAG UI Panel with Qdrant and PostgREST — L121](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-121-0) (line 121, col 0, score 0.6)
- [Agent Reflections and Prompt Evolution — L85](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-85-0) (line 85, col 0, score 0.68)
- [Promethean-native config design — L3](promethean-native-config-design.md#^ref-ab748541-3-0) (line 3, col 0, score 0.67)
- [Agent Tasks: Persistence Migration to DualStore — L133](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-133-0) (line 133, col 0, score 0.66)
- [Diagrams — L19](chunks/diagrams.md#^ref-45cd25b5-19-0) (line 19, col 0, score 0.66)
- [eidolon-node-lifecycle — L32](eidolon-node-lifecycle.md#^ref-938eca9c-32-0) (line 32, col 0, score 0.66)
- [Event Bus Projections Architecture — L147](event-bus-projections-architecture.md#^ref-cf6b9b17-147-0) (line 147, col 0, score 0.66)
- [field-node-diagram-outline — L101](field-node-diagram-outline.md#^ref-1f32c94a-101-0) (line 101, col 0, score 0.66)
- [field-node-diagram-set — L137](field-node-diagram-set.md#^ref-22b989d5-137-0) (line 137, col 0, score 0.66)
- [Promethean Event Bus MVP v0.1 — L797](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-797-0) (line 797, col 0, score 0.65)
- [Promethean Event Bus MVP v0.1 — L787](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-787-0) (line 787, col 0, score 0.65)
- [Promethean State Format — L18](promethean-state-format.md#^ref-23df6ddb-18-0) (line 18, col 0, score 0.61)
- [file-watcher-auth-fix — L29](file-watcher-auth-fix.md#^ref-9044701b-29-0) (line 29, col 0, score 0.61)
- [Promethean State Format — L71](promethean-state-format.md#^ref-23df6ddb-71-0) (line 71, col 0, score 0.59)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L431](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-431-0) (line 431, col 0, score 0.67)
- [Promethean-native config design — L330](promethean-native-config-design.md#^ref-ab748541-330-0) (line 330, col 0, score 0.6)
- [Chroma-Embedding-Refactor — L282](chroma-embedding-refactor.md#^ref-8b256935-282-0) (line 282, col 0, score 0.6)
- [Promethean-native config design — L371](promethean-native-config-design.md#^ref-ab748541-371-0) (line 371, col 0, score 0.6)
- [Dynamic Context Model for Web Components — L171](dynamic-context-model-for-web-components.md#^ref-f7702bf8-171-0) (line 171, col 0, score 0.6)
- [Promethean Infrastructure Setup — L415](promethean-infrastructure-setup.md#^ref-6deed6ac-415-0) (line 415, col 0, score 0.65)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L178](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-178-0) (line 178, col 0, score 0.64)
- [Promethean Infrastructure Setup — L439](promethean-infrastructure-setup.md#^ref-6deed6ac-439-0) (line 439, col 0, score 0.69)
- [Promethean Infrastructure Setup — L456](promethean-infrastructure-setup.md#^ref-6deed6ac-456-0) (line 456, col 0, score 0.69)
- [Pure TypeScript Search Microservice — L306](pure-typescript-search-microservice.md#^ref-d17d3a96-306-0) (line 306, col 0, score 0.65)
- [Promethean Infrastructure Setup — L471](promethean-infrastructure-setup.md#^ref-6deed6ac-471-0) (line 471, col 0, score 0.69)
- [Promethean Infrastructure Setup — L485](promethean-infrastructure-setup.md#^ref-6deed6ac-485-0) (line 485, col 0, score 0.74)
- [Promethean Infrastructure Setup — L224](promethean-infrastructure-setup.md#^ref-6deed6ac-224-0) (line 224, col 0, score 0.66)
- [prom-lib-rate-limiters-and-replay-api — L106](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-106-0) (line 106, col 0, score 0.72)
- [Chroma-Embedding-Refactor — L66](chroma-embedding-refactor.md#^ref-8b256935-66-0) (line 66, col 0, score 0.73)
- [TypeScript Patch for Tool Calling Support — L189](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-189-0) (line 189, col 0, score 0.7)
- [TypeScript Patch for Tool Calling Support — L279](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-279-0) (line 279, col 0, score 0.7)
- [Shared Package Structure — L124](shared-package-structure.md#^ref-66a72fc3-124-0) (line 124, col 0, score 0.72)
- [universal-intention-code-fabric — L252](universal-intention-code-fabric.md#^ref-c14edce7-252-0) (line 252, col 0, score 0.72)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L7](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-7-0) (line 7, col 0, score 0.65)
- [Local-First Intention→Code Loop with Free Models — L47](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-47-0) (line 47, col 0, score 0.65)
- [TypeScript Patch for Tool Calling Support — L35](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-35-0) (line 35, col 0, score 0.66)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L130](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-130-0) (line 130, col 0, score 0.71)
- [Provider-Agnostic Chat Panel Implementation — L84](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-84-0) (line 84, col 0, score 0.66)
- [Provider-Agnostic Chat Panel Implementation — L26](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-26-0) (line 26, col 0, score 0.7)
- [RAG UI Panel with Qdrant and PostgREST — L140](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-140-0) (line 140, col 0, score 0.7)
- [Functional Embedding Pipeline Refactor — L31](functional-embedding-pipeline-refactor.md#^ref-a4a25141-31-0) (line 31, col 0, score 0.67)
- [RAG UI Panel with Qdrant and PostgREST — L172](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-172-0) (line 172, col 0, score 0.7)
- [Interop and Source Maps — L482](interop-and-source-maps.md#^ref-cdfac40c-482-0) (line 482, col 0, score 0.67)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L445](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-445-0) (line 445, col 0, score 0.66)
- [Event Bus MVP — L7](event-bus-mvp.md#^ref-534fe91d-7-0) (line 7, col 0, score 0.63)
- [Promethean Event Bus MVP v0.1 — L28](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-28-0) (line 28, col 0, score 0.62)
- [Cross-Language Runtime Polymorphism — L141](cross-language-runtime-polymorphism.md#^ref-c34c36a6-141-0) (line 141, col 0, score 0.6)
- [Stateful Partitions and Rebalancing — L351](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-351-0) (line 351, col 0, score 0.59)
- [Dynamic Context Model for Web Components — L91](dynamic-context-model-for-web-components.md#^ref-f7702bf8-91-0) (line 91, col 0, score 0.59)
- [Dynamic Context Model for Web Components — L293](dynamic-context-model-for-web-components.md#^ref-f7702bf8-293-0) (line 293, col 0, score 0.59)
- [Dynamic Context Model for Web Components — L352](dynamic-context-model-for-web-components.md#^ref-f7702bf8-352-0) (line 352, col 0, score 0.59)
- [TypeScript Patch for Tool Calling Support — L145](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-145-0) (line 145, col 0, score 0.69)
- [Dynamic Context Model for Web Components — L274](dynamic-context-model-for-web-components.md#^ref-f7702bf8-274-0) (line 274, col 0, score 0.59)
- [Provider-Agnostic Chat Panel Implementation — L140](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-140-0) (line 140, col 0, score 0.69)
- [TypeScript Patch for Tool Calling Support — L113](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-113-0) (line 113, col 0, score 0.66)
- [TypeScript Patch for Tool Calling Support — L106](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-106-0) (line 106, col 0, score 0.63)
- [Refactor Frontmatter Processing — L11](refactor-frontmatter-processing.md#^ref-cfbdca2f-11-0) (line 11, col 0, score 0.67)
- [Chroma-Embedding-Refactor — L111](chroma-embedding-refactor.md#^ref-8b256935-111-0) (line 111, col 0, score 0.68)
- [Promethean Agent DSL TS Scaffold — L747](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-747-0) (line 747, col 0, score 0.65)
- [Interop and Source Maps — L85](interop-and-source-maps.md#^ref-cdfac40c-85-0) (line 85, col 0, score 0.67)
- [universal-intention-code-fabric — L277](universal-intention-code-fabric.md#^ref-c14edce7-277-0) (line 277, col 0, score 0.66)
- [compiler-kit-foundations — L166](compiler-kit-foundations.md#^ref-01b21543-166-0) (line 166, col 0, score 0.65)
- [sibilant-macro-targets — L64](sibilant-macro-targets.md#^ref-c5c9a5c6-64-0) (line 64, col 0, score 0.61)
- [sibilant-macro-targets — L46](sibilant-macro-targets.md#^ref-c5c9a5c6-46-0) (line 46, col 0, score 0.6)
- [js-to-lisp-reverse-compiler — L372](js-to-lisp-reverse-compiler.md#^ref-58191024-372-0) (line 372, col 0, score 0.6)
- [refactor-relations — L10](refactor-relations.md#^ref-41ce0216-10-0) (line 10, col 0, score 0.59)
- [lisp-dsl-for-window-management — L101](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-101-0) (line 101, col 0, score 0.59)
- [archetype-ecs — L7](archetype-ecs.md#^ref-8f4c1e86-7-0) (line 7, col 0, score 0.59)
- [Optimizing Command Limitations in System Design — L26](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-26-0) (line 26, col 0, score 0.59)
- [Cross-Target Macro System in Sibilant — L141](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-141-0) (line 141, col 0, score 0.59)
- [Dynamic Context Model for Web Components — L363](dynamic-context-model-for-web-components.md#^ref-f7702bf8-363-0) (line 363, col 0, score 0.59)
- [Event Bus MVP — L284](event-bus-mvp.md#^ref-534fe91d-284-0) (line 284, col 0, score 0.58)
- [i3-layout-saver — L72](i3-layout-saver.md#^ref-31f0166e-72-0) (line 72, col 0, score 0.58)
- [polyglot-repl-interface-layer — L96](polyglot-repl-interface-layer.md#^ref-9c79206d-96-0) (line 96, col 0, score 0.58)
- [Language-Agnostic Mirror System — L507](language-agnostic-mirror-system.md#^ref-d2b3628c-507-0) (line 507, col 0, score 0.58)
- [Per-Domain Policy System for JS Crawler — L446](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-446-0) (line 446, col 0, score 0.73)
- [RAG UI Panel with Qdrant and PostgREST — L71](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-71-0) (line 71, col 0, score 0.72)
- [Per-Domain Policy System for JS Crawler — L439](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-439-0) (line 439, col 0, score 0.71)
- [Promethean Infrastructure Setup — L536](promethean-infrastructure-setup.md#^ref-6deed6ac-536-0) (line 536, col 0, score 0.7)
- [Local-Offline-Model-Deployment-Strategy — L255](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-255-0) (line 255, col 0, score 0.7)
- [Promethean Infrastructure Setup — L545](promethean-infrastructure-setup.md#^ref-6deed6ac-545-0) (line 545, col 0, score 0.7)
- [Promethean Full-Stack Docker Setup — L432](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-432-0) (line 432, col 0, score 0.7)
- [Migrate to Provider-Tenant Architecture — L81](migrate-to-provider-tenant-architecture.md#^ref-54382370-81-0) (line 81, col 0, score 0.7)
- [Local-Only-LLM-Workflow — L161](local-only-llm-workflow.md#^ref-9a8ab57e-161-0) (line 161, col 0, score 0.68)
- [Chroma-Embedding-Refactor — L311](chroma-embedding-refactor.md#^ref-8b256935-311-0) (line 311, col 0, score 0.67)
- [Dynamic Context Model for Web Components — L85](dynamic-context-model-for-web-components.md#^ref-f7702bf8-85-0) (line 85, col 0, score 0.66)
- [Dynamic Context Model for Web Components — L39](dynamic-context-model-for-web-components.md#^ref-f7702bf8-39-0) (line 39, col 0, score 0.66)
- [api-gateway-versioning — L275](api-gateway-versioning.md#^ref-0580dcd3-275-0) (line 275, col 0, score 0.66)
- [Dynamic Context Model for Web Components — L176](dynamic-context-model-for-web-components.md#^ref-f7702bf8-176-0) (line 176, col 0, score 0.66)
- [Promethean Infrastructure Setup — L552](promethean-infrastructure-setup.md#^ref-6deed6ac-552-0) (line 552, col 0, score 0.66)
- [RAG UI Panel with Qdrant and PostgREST — L336](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-336-0) (line 336, col 0, score 0.9)
- [Promethean Infrastructure Setup — L501](promethean-infrastructure-setup.md#^ref-6deed6ac-501-0) (line 501, col 0, score 0.8)
- [Promethean Pipelines: Local TypeScript-First Workflow — L219](promethean-pipelines-local-typescript-first-workflow.md#^ref-6b63edca-219-0) (line 219, col 0, score 0.74)
- [Promethean Pipelines — L58](promethean-pipelines.md#^ref-8b8e6103-58-0) (line 58, col 0, score 0.74)
- [archetype-ecs — L423](archetype-ecs.md#^ref-8f4c1e86-423-0) (line 423, col 0, score 0.72)
- [compiler-kit-foundations — L15](compiler-kit-foundations.md#^ref-01b21543-15-0) (line 15, col 0, score 0.7)
- [Promethean Agent Config DSL — L239](promethean-agent-config-dsl.md#^ref-2c00ce45-239-0) (line 239, col 0, score 0.7)
- [Language-Agnostic Mirror System — L11](language-agnostic-mirror-system.md#^ref-d2b3628c-11-0) (line 11, col 0, score 0.69)
- [Promethean Event Bus MVP v0.1 — L832](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-832-0) (line 832, col 0, score 0.69)
- [Dynamic Context Model for Web Components — L51](dynamic-context-model-for-web-components.md#^ref-f7702bf8-51-0) (line 51, col 0, score 0.69)
- [Duck's Attractor States — L5](ducks-attractor-states.md#^ref-13951643-5-0) (line 5, col 0, score 0.69)
- [schema-evolution-workflow — L132](schema-evolution-workflow.md#^ref-d8059b6a-132-0) (line 132, col 0, score 0.68)
- [Event Bus Projections Architecture — L5](event-bus-projections-architecture.md#^ref-cf6b9b17-5-0) (line 5, col 0, score 0.68)
- [ecs-scheduler-and-prefabs — L352](ecs-scheduler-and-prefabs.md#^ref-c62a1815-352-0) (line 352, col 0, score 0.68)
- [System Scheduler with Resource-Aware DAG — L350](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-350-0) (line 350, col 0, score 0.68)
- [RAG UI Panel with Qdrant and PostgREST — L358](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-358-0) (line 358, col 0, score 0.66)
- [eidolon-field-math-foundations — L158](eidolon-field-math-foundations.md#^ref-008f2ac0-158-0) (line 158, col 0, score 1)
- [observability-infrastructure-setup — L375](observability-infrastructure-setup.md#^ref-b4e64f8c-375-0) (line 375, col 0, score 1)
- [Promethean Full-Stack Docker Setup — L435](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-435-0) (line 435, col 0, score 1)
- [Promethean Infrastructure Setup — L576](promethean-infrastructure-setup.md#^ref-6deed6ac-576-0) (line 576, col 0, score 1)
- [Prometheus Observability Stack — L518](prometheus-observability-stack.md#^ref-e90b5a16-518-0) (line 518, col 0, score 1)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L436](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-436-0) (line 436, col 0, score 1)
- [Pure TypeScript Search Microservice — L520](pure-typescript-search-microservice.md#^ref-d17d3a96-520-0) (line 520, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L175](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-175-0) (line 175, col 0, score 1)
- [AI-Centric OS with MCP Layer — L409](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-409-0) (line 409, col 0, score 1)
- [api-gateway-versioning — L295](api-gateway-versioning.md#^ref-0580dcd3-295-0) (line 295, col 0, score 1)
- [eidolon-field-math-foundations — L166](eidolon-field-math-foundations.md#^ref-008f2ac0-166-0) (line 166, col 0, score 1)
- [Local-Offline-Model-Deployment-Strategy — L293](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-293-0) (line 293, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L307](migrate-to-provider-tenant-architecture.md#^ref-54382370-307-0) (line 307, col 0, score 1)
- [observability-infrastructure-setup — L364](observability-infrastructure-setup.md#^ref-b4e64f8c-364-0) (line 364, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L492](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-492-0) (line 492, col 0, score 1)
- [api-gateway-versioning — L286](api-gateway-versioning.md#^ref-0580dcd3-286-0) (line 286, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L44](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-44-0) (line 44, col 0, score 1)
- [Dynamic Context Model for Web Components — L410](dynamic-context-model-for-web-components.md#^ref-f7702bf8-410-0) (line 410, col 0, score 1)
- [observability-infrastructure-setup — L373](observability-infrastructure-setup.md#^ref-b4e64f8c-373-0) (line 373, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L65](promethean-copilot-intent-engine.md#^ref-ae24a280-65-0) (line 65, col 0, score 1)
- [Promethean Full-Stack Docker Setup — L438](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-438-0) (line 438, col 0, score 1)
- [Promethean Infrastructure Setup — L582](promethean-infrastructure-setup.md#^ref-6deed6ac-582-0) (line 582, col 0, score 1)
- [Prometheus Observability Stack — L508](prometheus-observability-stack.md#^ref-e90b5a16-508-0) (line 508, col 0, score 1)
- [shared-package-layout-clarification — L188](shared-package-layout-clarification.md#^ref-36c8882a-188-0) (line 188, col 0, score 1)
- [api-gateway-versioning — L282](api-gateway-versioning.md#^ref-0580dcd3-282-0) (line 282, col 0, score 1)
- [archetype-ecs — L470](archetype-ecs.md#^ref-8f4c1e86-470-0) (line 470, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L201](chroma-toolkit-consolidation-plan.md#^ref-5020e892-201-0) (line 201, col 0, score 1)
- [Dynamic Context Model for Web Components — L382](dynamic-context-model-for-web-components.md#^ref-f7702bf8-382-0) (line 382, col 0, score 1)
- [ecs-offload-workers — L456](ecs-offload-workers.md#^ref-6498b9d7-456-0) (line 456, col 0, score 1)
- [ecs-scheduler-and-prefabs — L390](ecs-scheduler-and-prefabs.md#^ref-c62a1815-390-0) (line 390, col 0, score 1)
- [eidolon-field-math-foundations — L125](eidolon-field-math-foundations.md#^ref-008f2ac0-125-0) (line 125, col 0, score 1)
- [i3-config-validation-methods — L61](i3-config-validation-methods.md#^ref-d28090ac-61-0) (line 61, col 0, score 1)
- [Mongo Outbox Implementation — L572](mongo-outbox-implementation.md#^ref-9c1acd1e-572-0) (line 572, col 0, score 1)
- [observability-infrastructure-setup — L360](observability-infrastructure-setup.md#^ref-b4e64f8c-360-0) (line 360, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L163](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-163-0) (line 163, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L472](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-472-0) (line 472, col 0, score 1)
- [Chroma-Embedding-Refactor — L328](chroma-embedding-refactor.md#^ref-8b256935-328-0) (line 328, col 0, score 1)
- [Diagrams — L46](chunks/diagrams.md#^ref-45cd25b5-46-0) (line 46, col 0, score 1)
- [i3-config-validation-methods — L53](i3-config-validation-methods.md#^ref-d28090ac-53-0) (line 53, col 0, score 1)
- [Local-Only-LLM-Workflow — L180](local-only-llm-workflow.md#^ref-9a8ab57e-180-0) (line 180, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L276](migrate-to-provider-tenant-architecture.md#^ref-54382370-276-0) (line 276, col 0, score 1)
- [observability-infrastructure-setup — L376](observability-infrastructure-setup.md#^ref-b4e64f8c-376-0) (line 376, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L89](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-89-0) (line 89, col 0, score 1)
- [Promethean Agent Config DSL — L358](promethean-agent-config-dsl.md#^ref-2c00ce45-358-0) (line 358, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L149](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-149-0) (line 149, col 0, score 1)
- [eidolon-field-math-foundations — L155](eidolon-field-math-foundations.md#^ref-008f2ac0-155-0) (line 155, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L309](migrate-to-provider-tenant-architecture.md#^ref-54382370-309-0) (line 309, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L469](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-469-0) (line 469, col 0, score 1)
- [Promethean Full-Stack Docker Setup — L440](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-440-0) (line 440, col 0, score 1)
- [Promethean Infrastructure Setup — L578](promethean-infrastructure-setup.md#^ref-6deed6ac-578-0) (line 578, col 0, score 1)
- [Prometheus Observability Stack — L507](prometheus-observability-stack.md#^ref-e90b5a16-507-0) (line 507, col 0, score 1)
- [Pure TypeScript Search Microservice — L530](pure-typescript-search-microservice.md#^ref-d17d3a96-530-0) (line 530, col 0, score 1)
- [AI-Centric OS with MCP Layer — L401](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-401-0) (line 401, col 0, score 1)
- [api-gateway-versioning — L296](api-gateway-versioning.md#^ref-0580dcd3-296-0) (line 296, col 0, score 1)
- [i3-bluetooth-setup — L110](i3-bluetooth-setup.md#^ref-5e408692-110-0) (line 110, col 0, score 1)
- [Local-Offline-Model-Deployment-Strategy — L291](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-291-0) (line 291, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L279](migrate-to-provider-tenant-architecture.md#^ref-54382370-279-0) (line 279, col 0, score 1)
- [Mongo Outbox Implementation — L574](mongo-outbox-implementation.md#^ref-9c1acd1e-574-0) (line 574, col 0, score 1)
- [observability-infrastructure-setup — L359](observability-infrastructure-setup.md#^ref-b4e64f8c-359-0) (line 359, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L477](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-477-0) (line 477, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L130](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-130-0) (line 130, col 0, score 1)
- [api-gateway-versioning — L303](api-gateway-versioning.md#^ref-0580dcd3-303-0) (line 303, col 0, score 1)
- [Chroma-Embedding-Refactor — L327](chroma-embedding-refactor.md#^ref-8b256935-327-0) (line 327, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L174](chroma-toolkit-consolidation-plan.md#^ref-5020e892-174-0) (line 174, col 0, score 1)
- [eidolon-field-math-foundations — L134](eidolon-field-math-foundations.md#^ref-008f2ac0-134-0) (line 134, col 0, score 1)
- [i3-config-validation-methods — L82](i3-config-validation-methods.md#^ref-d28090ac-82-0) (line 82, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L267](migrate-to-provider-tenant-architecture.md#^ref-54382370-267-0) (line 267, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L391](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-391-0) (line 391, col 0, score 1)
- [Promethean Agent Config DSL — L333](promethean-agent-config-dsl.md#^ref-2c00ce45-333-0) (line 333, col 0, score 1)
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
- [api-gateway-versioning — L315](api-gateway-versioning.md#^ref-0580dcd3-315-0) (line 315, col 0, score 1)
- [Chroma-Embedding-Refactor — L331](chroma-embedding-refactor.md#^ref-8b256935-331-0) (line 331, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L167](chroma-toolkit-consolidation-plan.md#^ref-5020e892-167-0) (line 167, col 0, score 1)
- [Diagrams — L25](chunks/diagrams.md#^ref-45cd25b5-25-0) (line 25, col 0, score 1)
- [Tooling — L24](chunks/tooling.md#^ref-6cb4943e-24-0) (line 24, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L173](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-173-0) (line 173, col 0, score 1)
- [Dynamic Context Model for Web Components — L390](dynamic-context-model-for-web-components.md#^ref-f7702bf8-390-0) (line 390, col 0, score 1)
- [eidolon-field-math-foundations — L147](eidolon-field-math-foundations.md#^ref-008f2ac0-147-0) (line 147, col 0, score 1)
- [Event Bus MVP — L553](event-bus-mvp.md#^ref-534fe91d-553-0) (line 553, col 0, score 1)
- [field-interaction-equations — L159](field-interaction-equations.md#^ref-b09141b7-159-0) (line 159, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L315](functional-embedding-pipeline-refactor.md#^ref-a4a25141-315-0) (line 315, col 0, score 1)
- [zero-copy-snapshots-and-workers — L363](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-363-0) (line 363, col 0, score 1)
- [Simulation Demo — L32](chunks/simulation-demo.md#^ref-557309a3-32-0) (line 32, col 0, score 1)
- [Tooling — L26](chunks/tooling.md#^ref-6cb4943e-26-0) (line 26, col 0, score 1)
- [Window Management — L36](chunks/window-management.md#^ref-9e8ae388-36-0) (line 36, col 0, score 1)
- [compiler-kit-foundations — L639](compiler-kit-foundations.md#^ref-01b21543-639-0) (line 639, col 0, score 1)
- [Creative Moments — L10](creative-moments.md#^ref-10d98225-10-0) (line 10, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L258](cross-language-runtime-polymorphism.md#^ref-c34c36a6-258-0) (line 258, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L215](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-215-0) (line 215, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L50](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-50-0) (line 50, col 0, score 1)
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
- [markdown-to-org-transpiler — L318](markdown-to-org-transpiler.md#^ref-ab54cdd8-318-0) (line 318, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L322](migrate-to-provider-tenant-architecture.md#^ref-54382370-322-0) (line 322, col 0, score 1)
- [Mongo Outbox Implementation — L579](mongo-outbox-implementation.md#^ref-9c1acd1e-579-0) (line 579, col 0, score 1)
- [observability-infrastructure-setup — L369](observability-infrastructure-setup.md#^ref-b4e64f8c-369-0) (line 369, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L183](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-183-0) (line 183, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L483](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-483-0) (line 483, col 0, score 1)
- [polymorphic-meta-programming-engine — L241](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-241-0) (line 241, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L415](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-415-0) (line 415, col 0, score 1)
- [Promethean Agent Config DSL — L352](promethean-agent-config-dsl.md#^ref-2c00ce45-352-0) (line 352, col 0, score 1)
- [Math Fundamentals — L20](chunks/math-fundamentals.md#^ref-c6e87433-20-0) (line 20, col 0, score 1)
- [Services — L20](chunks/services.md#^ref-75ea4a6a-20-0) (line 20, col 0, score 1)
- [compiler-kit-foundations — L620](compiler-kit-foundations.md#^ref-01b21543-620-0) (line 620, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L237](cross-language-runtime-polymorphism.md#^ref-c34c36a6-237-0) (line 237, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L40](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-40-0) (line 40, col 0, score 1)
- [Dynamic Context Model for Web Components — L401](dynamic-context-model-for-web-components.md#^ref-f7702bf8-401-0) (line 401, col 0, score 1)
- [ecs-scheduler-and-prefabs — L386](ecs-scheduler-and-prefabs.md#^ref-c62a1815-386-0) (line 386, col 0, score 1)
- [eidolon-field-math-foundations — L127](eidolon-field-math-foundations.md#^ref-008f2ac0-127-0) (line 127, col 0, score 1)
- [Event Bus MVP — L557](event-bus-mvp.md#^ref-534fe91d-557-0) (line 557, col 0, score 1)
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
- [Promethean Infrastructure Setup — L604](promethean-infrastructure-setup.md#^ref-6deed6ac-604-0) (line 604, col 0, score 1)
- [Pure TypeScript Search Microservice — L536](pure-typescript-search-microservice.md#^ref-d17d3a96-536-0) (line 536, col 0, score 1)
- [shared-package-layout-clarification — L169](shared-package-layout-clarification.md#^ref-36c8882a-169-0) (line 169, col 0, score 1)
- [Shared Package Structure — L177](shared-package-structure.md#^ref-66a72fc3-177-0) (line 177, col 0, score 1)
- [AI-Centric OS with MCP Layer — L407](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-407-0) (line 407, col 0, score 1)
- [api-gateway-versioning — L284](api-gateway-versioning.md#^ref-0580dcd3-284-0) (line 284, col 0, score 1)
- [Services — L21](chunks/services.md#^ref-75ea4a6a-21-0) (line 21, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L43](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-43-0) (line 43, col 0, score 1)
- [Dynamic Context Model for Web Components — L407](dynamic-context-model-for-web-components.md#^ref-f7702bf8-407-0) (line 407, col 0, score 1)
- [ecs-offload-workers — L478](ecs-offload-workers.md#^ref-6498b9d7-478-0) (line 478, col 0, score 1)
- [eidolon-field-math-foundations — L167](eidolon-field-math-foundations.md#^ref-008f2ac0-167-0) (line 167, col 0, score 1)
- [i3-bluetooth-setup — L123](i3-bluetooth-setup.md#^ref-5e408692-123-0) (line 123, col 0, score 1)
- [i3-config-validation-methods — L78](i3-config-validation-methods.md#^ref-d28090ac-78-0) (line 78, col 0, score 1)
- [Local-Only-LLM-Workflow — L207](local-only-llm-workflow.md#^ref-9a8ab57e-207-0) (line 207, col 0, score 1)
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
- [field-node-diagram-outline — L111](field-node-diagram-outline.md#^ref-1f32c94a-111-0) (line 111, col 0, score 1)
- [field-node-diagram-set — L144](field-node-diagram-set.md#^ref-22b989d5-144-0) (line 144, col 0, score 1)
- [field-node-diagram-visualizations — L94](field-node-diagram-visualizations.md#^ref-e9b27b06-94-0) (line 94, col 0, score 1)
- [Fnord Tracer Protocol — L258](fnord-tracer-protocol.md#^ref-fc21f824-258-0) (line 258, col 0, score 1)
- [graph-ds — L398](graph-ds.md#^ref-6620e2f2-398-0) (line 398, col 0, score 1)
- [heartbeat-fragment-demo — L110](heartbeat-fragment-demo.md#^ref-dd00677a-110-0) (line 110, col 0, score 1)
- [heartbeat-simulation-snippets — L99](heartbeat-simulation-snippets.md#^ref-23e221e9-99-0) (line 99, col 0, score 1)
- [homeostasis-decay-formulas — L151](homeostasis-decay-formulas.md#^ref-37b5d236-151-0) (line 151, col 0, score 1)
- [i3-bluetooth-setup — L119](i3-bluetooth-setup.md#^ref-5e408692-119-0) (line 119, col 0, score 1)
- [2d-sandbox-field — L225](2d-sandbox-field.md#^ref-c710dc93-225-0) (line 225, col 0, score 1)
- [Admin Dashboard for User Management — L49](admin-dashboard-for-user-management.md#^ref-2901a3e9-49-0) (line 49, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L150](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-150-0) (line 150, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L163](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-163-0) (line 163, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L9](ai-first-os-model-context-protocol.md#^ref-618198f4-9-0) (line 9, col 0, score 1)
- [aionian-circuit-math — L179](aionian-circuit-math.md#^ref-f2d83a77-179-0) (line 179, col 0, score 1)
- [api-gateway-versioning — L304](api-gateway-versioning.md#^ref-0580dcd3-304-0) (line 304, col 0, score 1)
- [archetype-ecs — L479](archetype-ecs.md#^ref-8f4c1e86-479-0) (line 479, col 0, score 1)
- [balanced-bst — L295](balanced-bst.md#^ref-d3e7db72-295-0) (line 295, col 0, score 1)
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
- [Exception Layer Analysis — L172](exception-layer-analysis.md#^ref-21d5cc09-172-0) (line 172, col 0, score 1)
- [field-dynamics-math-blocks — L154](field-dynamics-math-blocks.md#^ref-7cfc230d-154-0) (line 154, col 0, score 1)
- [field-interaction-equations — L164](field-interaction-equations.md#^ref-b09141b7-164-0) (line 164, col 0, score 1)
- [field-node-diagram-outline — L120](field-node-diagram-outline.md#^ref-1f32c94a-120-0) (line 120, col 0, score 1)
- [field-node-diagram-set — L149](field-node-diagram-set.md#^ref-22b989d5-149-0) (line 149, col 0, score 1)
- [field-node-diagram-visualizations — L99](field-node-diagram-visualizations.md#^ref-e9b27b06-99-0) (line 99, col 0, score 1)
- [graph-ds — L365](graph-ds.md#^ref-6620e2f2-365-0) (line 365, col 0, score 1)
- [heartbeat-fragment-demo — L111](heartbeat-fragment-demo.md#^ref-dd00677a-111-0) (line 111, col 0, score 1)
- [heartbeat-simulation-snippets — L101](heartbeat-simulation-snippets.md#^ref-23e221e9-101-0) (line 101, col 0, score 1)
- [AI-Centric OS with MCP Layer — L408](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-408-0) (line 408, col 0, score 1)
- [api-gateway-versioning — L316](api-gateway-versioning.md#^ref-0580dcd3-316-0) (line 316, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L213](chroma-toolkit-consolidation-plan.md#^ref-5020e892-213-0) (line 213, col 0, score 1)
- [Event Bus MVP — L581](event-bus-mvp.md#^ref-534fe91d-581-0) (line 581, col 0, score 1)
- [i3-bluetooth-setup — L101](i3-bluetooth-setup.md#^ref-5e408692-101-0) (line 101, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L178](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-178-0) (line 178, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L303](migrate-to-provider-tenant-architecture.md#^ref-54382370-303-0) (line 303, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L140](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-140-0) (line 140, col 0, score 1)
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
- [Promethean_Eidolon_Synchronicity_Model — L74](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-74-0) (line 74, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L929](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-929-0) (line 929, col 0, score 1)
- [Promethean Infrastructure Setup — L597](promethean-infrastructure-setup.md#^ref-6deed6ac-597-0) (line 597, col 0, score 1)
- [Promethean-native config design — L421](promethean-native-config-design.md#^ref-ab748541-421-0) (line 421, col 0, score 1)
- [promethean-system-diagrams — L217](promethean-system-diagrams.md#^ref-b51e19b4-217-0) (line 217, col 0, score 1)
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
- [aionian-circuit-math — L165](aionian-circuit-math.md#^ref-f2d83a77-165-0) (line 165, col 0, score 1)
- [api-gateway-versioning — L319](api-gateway-versioning.md#^ref-0580dcd3-319-0) (line 319, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L116](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-116-0) (line 116, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L209](chroma-toolkit-consolidation-plan.md#^ref-5020e892-209-0) (line 209, col 0, score 1)
- [DSL — L13](chunks/dsl.md#^ref-e87bc036-13-0) (line 13, col 0, score 1)
- [Math Fundamentals — L16](chunks/math-fundamentals.md#^ref-c6e87433-16-0) (line 16, col 0, score 1)
- [Services — L16](chunks/services.md#^ref-75ea4a6a-16-0) (line 16, col 0, score 1)
- [Shared — L5](chunks/shared.md#^ref-623a55f7-5-0) (line 5, col 0, score 1)
- [Simulation Demo — L12](chunks/simulation-demo.md#^ref-557309a3-12-0) (line 12, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L157](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-157-0) (line 157, col 0, score 1)
- [api-gateway-versioning — L298](api-gateway-versioning.md#^ref-0580dcd3-298-0) (line 298, col 0, score 1)
- [ecs-offload-workers — L455](ecs-offload-workers.md#^ref-6498b9d7-455-0) (line 455, col 0, score 1)
- [ecs-scheduler-and-prefabs — L389](ecs-scheduler-and-prefabs.md#^ref-c62a1815-389-0) (line 389, col 0, score 1)
- [eidolon-field-math-foundations — L130](eidolon-field-math-foundations.md#^ref-008f2ac0-130-0) (line 130, col 0, score 1)
- [i3-config-validation-methods — L63](i3-config-validation-methods.md#^ref-d28090ac-63-0) (line 63, col 0, score 1)
- [Interop and Source Maps — L531](interop-and-source-maps.md#^ref-cdfac40c-531-0) (line 531, col 0, score 1)
- [Language-Agnostic Mirror System — L548](language-agnostic-mirror-system.md#^ref-d2b3628c-548-0) (line 548, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L143](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-143-0) (line 143, col 0, score 1)
- [promethean-system-diagrams — L207](promethean-system-diagrams.md#^ref-b51e19b4-207-0) (line 207, col 0, score 1)
- [Promethean Workflow Optimization — L20](promethean-workflow-optimization.md#^ref-d614d983-20-0) (line 20, col 0, score 1)
- [Prometheus Observability Stack — L543](prometheus-observability-stack.md#^ref-e90b5a16-543-0) (line 543, col 0, score 1)
- [Prompt_Folder_Bootstrap — L216](prompt-folder-bootstrap.md#^ref-bd4f0976-216-0) (line 216, col 0, score 1)
- [prompt-programming-language-lisp — L116](prompt-programming-language-lisp.md#^ref-d41a06d1-116-0) (line 116, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L156](protocol-0-the-contradiction-engine.md#^ref-9a93a756-156-0) (line 156, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L238](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-238-0) (line 238, col 0, score 1)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L445](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-445-0) (line 445, col 0, score 1)
- [Shared Package Structure — L195](shared-package-structure.md#^ref-66a72fc3-195-0) (line 195, col 0, score 1)
- [sibilant-macro-targets — L178](sibilant-macro-targets.md#^ref-c5c9a5c6-178-0) (line 178, col 0, score 1)
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
