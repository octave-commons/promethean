---
uuid: 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
created_at: 2025.08.31.10.09.07.md
filename: Promethean Full-Stack Docker Setup
description: >-
  A production-grade Docker Compose configuration for a full-stack AI service
  with edge routing via NGINX, GPU-accelerated LLMs (Qwen3, Qwen2.5-Coder,
  Gemma), embeddings (Nomic), CLIP ViT, Whisper ASR, and OpenVINO model server.
  No host ports exposed except NGINX on port 80.
tags:
  - docker
  - compose
  - ai
  - llm
  - gpu
  - embeddings
  - clip
  - whisper
  - ovms
  - nomic
related_to_title: []
related_to_uuid: []
references: []
---
### `docker-compose.yaml` (full stack; no host ports except NGINX)

```yaml
version: "3.9"

networks:
  prom-net:
    driver: bridge

x-env-defaults: &env_defaults
  HF_TOKEN: ${HF_TOKEN:-}
  TEI_MODEL: ${TEI_MODEL:-nomic-ai/nomic-embed-text-v1.5}
  CLIP_MODEL: ${CLIP_MODEL:-openai/clip-vit-large-patch14}
  VLLM_MAX_TOKENS: ${VLLM_MAX_TOKENS:-32768}

services:
  # ---------- Edge (the only exposed port) ----------
  edge:
    image: nginx:1.27-alpine
    container_name: edge
    ports: ["80:80"]
    volumes:
      - ./infra/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./infra/nginx/secrets:/etc/nginx/secrets:ro
    networks: [ prom-net ]
    restart: unless-stopped
    depends_on:
      - ollama
      - vllm-qwen3-8b
      - vllm-qwen25-coder-7b
      - vllm-gemma-2b
      - tei-nomic
      - clip-vit
      - whisper-faster-openai
      - ovms-npu

  # ---------- LLMs (GPU) ----------
  vllm-qwen3-8b:
    image: vllm/vllm-openai:latest
    command: >
      --model Qwen/Qwen3-8B-Instruct
      --dtype auto --max-num-batched-tokens ${VLLM_MAX_TOKENS:-32768}
    environment:
      <<: *env_defaults
    networks: [ prom-net ]
    gpus: all
    restart: unless-stopped

  vllm-qwen25-coder-7b:
    image: vllm/vllm-openai:latest
    command: >
      --model Qwen/Qwen2.5-Coder-7B-Instruct
      --dtype auto --max-num-batched-tokens ${VLLM_MAX_TOKENS:-32768}
    environment:
      <<: *env_defaults
    networks: [ prom-net ]
    gpus: all
    restart: unless-stopped

  vllm-gemma-2b:
    image: vllm/vllm-openai:latest
    command: >
      --model google/gemma-2-2b-it
      --dtype auto --max-num-batched-tokens ${VLLM_MAX_TOKENS:-32768}
    environment:
      <<: *env_defaults
    networks: [ prom-net ]
    gpus: all
    restart: unless-stopped

  # ---------- Ollama (GPU optional) ----------
  ollama:
    image: ollama/ollama:latest
    environment:
      OLLAMA_KEEP_ALIVE: 5m
    volumes:
      - ${HOME}/.ollama:/root/.ollama
    networks: [ prom-net ]
    gpus: all
    restart: unless-stopped

  # ---------- Embeddings (nomic) ----------
  tei-nomic:
    image: ghcr.io/huggingface/text-embeddings-inference:89-1.8
    command: --model-id ${TEI_MODEL:-nomic-ai/nomic-embed-text-v1.5} --port 80
    environment:
      <<: *env_defaults
    volumes:
      - ${HOME}/.cache/huggingface:/root/.cache/huggingface
    networks: [ prom-net ]
    restart: unless-stopped

  # ---------- CLIP ViT (HTTP or gRPC on 51000) ----------
  clip-vit:
    image: jinaai/clip-server:latest
    environment:
      CLIP_MODEL: ${CLIP_MODEL:-openai/clip-vit-large-patch14}
    volumes:
      - ${HOME}/.cache:/home/cas/.cache
    networks: [ prom-net ]
    gpus: all
    restart: unless-stopped

  # ---------- Whisper (CUDA) ----------
  whisper-faster-openai:
    image: fedirz/faster-whisper-server:latest-cuda
    environment:
      ASR_ENGINE: whisper
      ASR_MODEL: medium
      ASR_BEAM_SIZE: 5
    volumes:
      - ${HOME}/.cache/huggingface:/root/.cache/huggingface
    networks: [ prom-net ]
    gpus: all
    restart: unless-stopped

  # ---------- OVMS (Intel iGPU/NPU) ----------
  ovms-npu:
    image: openvino/model_server:latest
    command: --config_path /config/config.json --rest_port 9000 --port 9000
    volumes:
      - ./infra/ovms/config.json:/config/config.json:ro
      - ./models/ov:/opt/models:ro
    networks: [ prom-net ]
    restart: unless-stopped
```
^ref-2c2b48ca-3-0

---

### `docker-compose.stealth.yaml` (host overlay: dGPU + iGPU + NPU)
 ^ref-2c2b48ca-132-0
```yaml
version: "3.9"
services:
  vllm-qwen3-8b:
    environment:
      NVIDIA_VISIBLE_DEVICES: all
      NVIDIA_DRIVER_CAPABILITIES: compute,utility
  vllm-qwen25-coder-7b:
    environment:
      NVIDIA_VISIBLE_DEVICES: all
      NVIDIA_DRIVER_CAPABILITIES: compute,utility
  vllm-gemma-2b:
    environment:
      NVIDIA_VISIBLE_DEVICES: all
      NVIDIA_DRIVER_CAPABILITIES: compute,utility
  clip-vit:
    environment:
      NVIDIA_VISIBLE_DEVICES: all
      NVIDIA_DRIVER_CAPABILITIES: compute,utility
  whisper-faster-openai:
    environment:
      NVIDIA_VISIBLE_DEVICES: all
      NVIDIA_DRIVER_CAPABILITIES: compute,utility
  ollama:
    environment:
      NVIDIA_VISIBLE_DEVICES: all
      NVIDIA_DRIVER_CAPABILITIES: compute,utility
  ovms-npu:
    devices:
      - /dev/dri:/dev/dri      # Intel iGPU
      - /dev/accel:/dev/accel  # Intel NPU (host must have driver)
^ref-2c2b48ca-132-0
```

---

### `infra/nginx/nginx.conf` (token auth + rate limits; clean paths) ^ref-2c2b48ca-169-0

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

  map $http_upgrade $connection_upgrade { default upgrade; '' close; }

  server {
    listen 80;
    server_name _;

    location = /__healthz { return 200 'ok'; }

    client_max_body_size 512m;
    add_header Access-Control-Allow-Origin "*" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Authorization, X-API-Key, Content-Type, Accept, *" always;
    if ($request_method = OPTIONS) { return 204; }

    # global auth gate
    if ($api_key_ok = 0) { return 401; }
    add_header Www-Authenticate 'X-API-Key' always;

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
^ref-2c2b48ca-169-0
}
```

---
 ^ref-2c2b48ca-332-0
### `infra/nginx/secrets/api_keys.map` (allowlist; one token per line)

```text
CHANGEME 1;
^ref-2c2b48ca-332-0
# supersecret123 1;
# another-token 1;
```

--- ^ref-2c2b48ca-342-0

### `infra/ovms/config.json` (example multi-model; edit to your IR paths)

```json
{
  "model_config_list": [
    {
      "config": {
        "name": "whisper_tiny",
        "base_path": "/opt/models/whisper-tiny",
        "target_device": "NPU",
        "nireq": 2
      }
    },
    {
      "config": {
        "name": "silero_vad",
        "base_path": "/opt/models/silero-vad",
        "target_device": "NPU",
        "nireq": 4
      }
    },
    {
      "config": {
        "name": "resnet50",
        "base_path": "/opt/models/resnet50",
        "target_device": "GPU",
        "nireq": 2
      }
^ref-2c2b48ca-342-0
    }
  ]
}
```
 ^ref-2c2b48ca-377-0
---

### `.env` (optional defaults)

```env
^ref-2c2b48ca-377-0
HF_TOKEN=
TEI_MODEL=nomic-ai/nomic-embed-text-v1.5
CLIP_MODEL=openai/clip-vit-large-patch14
VLLM_MAX_TOKENS=32768
```
^ref-2c2b48ca-388-0

---

### Up it

```bash
# create secrets dir + token
mkdir -p infra/nginx/secrets infra/ovms models/ov
echo "CHANGEME 1;" > infra/nginx/secrets/api_keys.map

^ref-2c2b48ca-388-0
# base stack ^ref-2c2b48ca-400-0
docker compose -f docker-compose.yaml up -d

# with Stealth device overlay
docker compose -f docker-compose.yaml -f docker-compose.stealth.yaml up -d
^ref-2c2b48ca-404-0
^ref-2c2b48ca-400-0
```
^ref-2c2b48ca-404-0
^ref-2c2b48ca-400-0

If you want **RAG** infra as well (datastore only), add this snippet:

### `docker-compose.rag.yaml` (optional pgvector + qdrant)

```yaml
version: "3.9"
networks: { prom-net: { external: true } }

services:
  pg:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_DB: rag
      POSTGRES_USER: rag
      POSTGRES_PASSWORD: ragpass
    volumes:
      - ./infra/db/init:/docker-entrypoint-initdb.d
      - pg_data:/var/lib/postgresql/data
    networks: [ prom-net ]
  qdrant:
    image: qdrant/qdrant:latest
    volumes:
^ref-2c2b48ca-404-0
      - qdrant_data:/qdrant/storage ^ref-2c2b48ca-430-0
    networks: [ prom-net ]
 ^ref-2c2b48ca-432-0
volumes:
^ref-2c2b48ca-435-0
^ref-2c2b48ca-434-0 ^ref-2c2b48ca-438-0
^ref-2c2b48ca-432-0
^ref-2c2b48ca-430-0 ^ref-2c2b48ca-440-0
  pg_data: {} ^ref-2c2b48ca-434-0
^ref-2c2b48ca-443-0 ^ref-2c2b48ca-444-0
^ref-2c2b48ca-440-0
^ref-2c2b48ca-438-0
^ref-2c2b48ca-435-0
^ref-2c2b48ca-434-0
^ref-2c2b48ca-432-0
^ref-2c2b48ca-430-0
  qdrant_data: {} ^ref-2c2b48ca-435-0 ^ref-2c2b48ca-451-0
``` ^ref-2c2b48ca-443-0
^ref-2c2b48ca-443-0
^ref-2c2b48ca-440-0
^ref-2c2b48ca-438-0
^ref-2c2b48ca-435-0
^ref-2c2b48ca-434-0
^ref-2c2b48ca-432-0
^ref-2c2b48ca-430-0
^ref-2c2b48ca-416-0
 ^ref-2c2b48ca-444-0
From here we want to start serving a typescript/webcomponents based frontend that connects to everything. ^ref-2c2b48ca-438-0

#docker #compose #nginx #reverseproxy #ollama #vllm #tei #clip #whisper #ovms #npu #homelab #mlops<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Promethean Web UI Setup](promethean-web-ui-setup.md)
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [Prometheus Observability Stack](prometheus-observability-stack.md)
- [Pure TypeScript Search Microservice](pure-typescript-search-microservice.md)
- [Local-Offline-Model-Deployment-Strategy](local-offline-model-deployment-strategy.md)
- [Pure-Node Crawl Stack with Playwright and Crawlee](pure-node-crawl-stack-with-playwright-and-crawlee.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [observability-infrastructure-setup](observability-infrastructure-setup.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [Services](chunks/services.md)
- [Admin Dashboard for User Management](admin-dashboard-for-user-management.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [AI-First-OS-Model-Context-Protocol](ai-first-os-model-context-protocol.md)
- [balanced-bst](balanced-bst.md)
- [Board Automation Improvements](board-automation-improvements.md)
- [Operations](chunks/operations.md)
- [archetype-ecs](archetype-ecs.md)
- [Diagrams](chunks/diagrams.md)
- [2d-sandbox-field](2d-sandbox-field.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [Event Bus MVP](event-bus-mvp.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler](ollama-llm-provider-for-pseudo-code-transpiler.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [prom-lib-rate-limiters-and-replay-api](prom-lib-rate-limiters-and-replay-api.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [shared-package-layout-clarification](shared-package-layout-clarification.md)
- [i3-config-validation-methods](i3-config-validation-methods.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [JavaScript](chunks/javascript.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [Tooling](chunks/tooling.md)
- [Window Management](chunks/window-management.md)
- [field-interaction-equations](field-interaction-equations.md)
- [markdown-to-org-transpiler](markdown-to-org-transpiler.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [DSL](chunks/dsl.md)
- [Shared](chunks/shared.md)
- [EidolonField](eidolonfield.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [Chroma-Embedding-Refactor](chroma-embedding-refactor.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [Creative Moments](creative-moments.md)
- [graph-ds](graph-ds.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [heartbeat-simulation-snippets](heartbeat-simulation-snippets.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [Promethean Chat Activity Report](promethean-chat-activity-report.md)
- [Promethean Data Sync Protocol](promethean-data-sync-protocol.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [Lispy Macros with syntax-rules](lispy-macros-with-syntax-rules.md)
- [Obsidian ChatGPT Plugin Integration](obsidian-chatgpt-plugin-integration.md)
- [Obsidian Templating Plugins Integration Guide](obsidian-templating-plugins-integration-guide.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [Protocol_0_The_Contradiction_Engine](protocol-0-the-contradiction-engine.md)
- [Model Upgrade Calm-Down Guide](model-upgrade-calm-down-guide.md)
- [NPU Voice Code and Sensory Integration](npu-voice-code-and-sensory-integration.md)
- [Obsidian ChatGPT Plugin Integration Guide](obsidian-chatgpt-plugin-integration-guide.md)
- [OpenAPI Validation Report](openapi-validation-report.md)
- [Optimizing Command Limitations in System Design](optimizing-command-limitations-in-system-design.md)
- [plan-update-confirmation](plan-update-confirmation.md)
- [Mindful Prioritization](mindful-prioritization.md)
- [MindfulRobotIntegration](mindfulrobotintegration.md)
- [Fnord Tracer Protocol](fnord-tracer-protocol.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
- [Shared Package Structure](shared-package-structure.md)
- [zero-copy-snapshots-and-workers](zero-copy-snapshots-and-workers.md)
- [promethean-system-diagrams](promethean-system-diagrams.md)
- [Promethean Workflow Optimization](promethean-workflow-optimization.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [Provider-Agnostic Chat Panel Implementation](provider-agnostic-chat-panel-implementation.md)
- [schema-evolution-workflow](schema-evolution-workflow.md)
- [Functional Embedding Pipeline Refactor](functional-embedding-pipeline-refactor.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [Self-Agency in AI Interaction](self-agency-in-ai-interaction.md)
- [set-assignment-in-lisp-ast](set-assignment-in-lisp-ast.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [Promethean-Copilot-Intent-Engine](promethean-copilot-intent-engine.md)
- [DuckDuckGoSearchPipeline](duckduckgosearchpipeline.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [Promethean Pipelines: Local TypeScript-First Workflow](promethean-pipelines-local-typescript-first-workflow.md)
- [ChatGPT Custom Prompts](chatgpt-custom-prompts.md)
- [WebSocket Gateway Implementation](websocket-gateway-implementation.md)
- [Functional Refactor of TypeScript Document Processing](functional-refactor-of-typescript-document-processing.md)
- [TypeScript Patch for Tool Calling Support](typescript-patch-for-tool-calling-support.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [Stateful Partitions and Rebalancing](stateful-partitions-and-rebalancing.md)
- [Promethean Documentation Pipeline Overview](promethean-documentation-pipeline-overview.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [windows-tiling-with-autohotkey](windows-tiling-with-autohotkey.md)
## Sources
- [Promethean Infrastructure Setup — L93](promethean-infrastructure-setup.md#^ref-6deed6ac-93-0) (line 93, col 0, score 0.67)
- [Prometheus Observability Stack — L7](prometheus-observability-stack.md#^ref-e90b5a16-7-0) (line 7, col 0, score 0.66)
- [Local-Offline-Model-Deployment-Strategy — L80](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-80-0) (line 80, col 0, score 0.62)
- [Promethean Web UI Setup — L9](promethean-web-ui-setup.md#^ref-bc5172ca-9-0) (line 9, col 0, score 0.66)
- [Local-Offline-Model-Deployment-Strategy — L25](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-25-0) (line 25, col 0, score 0.73)
- [Pure TypeScript Search Microservice — L14](pure-typescript-search-microservice.md#^ref-d17d3a96-14-0) (line 14, col 0, score 0.77)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L9](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-9-0) (line 9, col 0, score 0.71)
- [RAG UI Panel with Qdrant and PostgREST — L9](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-9-0) (line 9, col 0, score 0.96)
- [observability-infrastructure-setup — L7](observability-infrastructure-setup.md#^ref-b4e64f8c-7-0) (line 7, col 0, score 0.66)
- [Promethean Infrastructure Setup — L54](promethean-infrastructure-setup.md#^ref-6deed6ac-54-0) (line 54, col 0, score 0.67)
- [Local-Only-LLM-Workflow — L28](local-only-llm-workflow.md#^ref-9a8ab57e-28-0) (line 28, col 0, score 0.68)
- [Promethean Web UI Setup — L581](promethean-web-ui-setup.md#^ref-bc5172ca-581-0) (line 581, col 0, score 0.63)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L1](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-1-0) (line 1, col 0, score 0.65)
- [Local-First Intention→Code Loop with Free Models — L83](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-83-0) (line 83, col 0, score 0.67)
- [Promethean Web UI Setup — L44](promethean-web-ui-setup.md#^ref-bc5172ca-44-0) (line 44, col 0, score 0.92)
- [AI-Centric OS with MCP Layer — L185](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-185-0) (line 185, col 0, score 0.66)
- [Local-Offline-Model-Deployment-Strategy — L57](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-57-0) (line 57, col 0, score 0.61)
- [Local-Offline-Model-Deployment-Strategy — L255](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-255-0) (line 255, col 0, score 0.59)
- [i3-bluetooth-setup — L7](i3-bluetooth-setup.md#^ref-5e408692-7-0) (line 7, col 0, score 0.61)
- [i3-bluetooth-setup — L57](i3-bluetooth-setup.md#^ref-5e408692-57-0) (line 57, col 0, score 0.6)
- [Promethean-native config design — L71](promethean-native-config-design.md#^ref-ab748541-71-0) (line 71, col 0, score 0.6)
- [Promethean Infrastructure Setup — L61](promethean-infrastructure-setup.md#^ref-6deed6ac-61-0) (line 61, col 0, score 0.66)
- [api-gateway-versioning — L7](api-gateway-versioning.md#^ref-0580dcd3-7-0) (line 7, col 0, score 0.65)
- [observability-infrastructure-setup — L44](observability-infrastructure-setup.md#^ref-b4e64f8c-44-0) (line 44, col 0, score 0.68)
- [Pure TypeScript Search Microservice — L46](pure-typescript-search-microservice.md#^ref-d17d3a96-46-0) (line 46, col 0, score 0.79)
- [RAG UI Panel with Qdrant and PostgREST — L81](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-81-0) (line 81, col 0, score 0.68)
- [Migrate to Provider-Tenant Architecture — L144](migrate-to-provider-tenant-architecture.md#^ref-54382370-144-0) (line 144, col 0, score 0.67)
- [prom-lib-rate-limiters-and-replay-api — L92](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-92-0) (line 92, col 0, score 0.67)
- [prom-lib-rate-limiters-and-replay-api — L45](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-45-0) (line 45, col 0, score 0.66)
- [Per-Domain Policy System for JS Crawler — L27](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-27-0) (line 27, col 0, score 0.63)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L223](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-223-0) (line 223, col 0, score 0.66)
- [Per-Domain Policy System for JS Crawler — L184](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-184-0) (line 184, col 0, score 0.69)
- [universal-intention-code-fabric — L415](universal-intention-code-fabric.md#^ref-c14edce7-415-0) (line 415, col 0, score 0.68)
- [Local-First Intention→Code Loop with Free Models — L47](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-47-0) (line 47, col 0, score 0.66)
- [Local-Offline-Model-Deployment-Strategy — L10](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-10-0) (line 10, col 0, score 0.65)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L389](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-389-0) (line 389, col 0, score 0.7)
- [Chroma Toolkit Consolidation Plan — L162](chroma-toolkit-consolidation-plan.md#^ref-5020e892-162-0) (line 162, col 0, score 0.6)
- [Dynamic Context Model for Web Components — L331](dynamic-context-model-for-web-components.md#^ref-f7702bf8-331-0) (line 331, col 0, score 0.6)
- [Promethean-native config design — L31](promethean-native-config-design.md#^ref-ab748541-31-0) (line 31, col 0, score 0.6)
- [Chroma-Embedding-Refactor — L64](chroma-embedding-refactor.md#^ref-8b256935-64-0) (line 64, col 0, score 0.59)
- [Chroma-Embedding-Refactor — L109](chroma-embedding-refactor.md#^ref-8b256935-109-0) (line 109, col 0, score 0.59)
- [Chroma-Embedding-Refactor — L258](chroma-embedding-refactor.md#^ref-8b256935-258-0) (line 258, col 0, score 0.59)
- [Chroma Toolkit Consolidation Plan — L72](chroma-toolkit-consolidation-plan.md#^ref-5020e892-72-0) (line 72, col 0, score 0.59)
- [Chroma Toolkit Consolidation Plan — L88](chroma-toolkit-consolidation-plan.md#^ref-5020e892-88-0) (line 88, col 0, score 0.59)
- [Chroma Toolkit Consolidation Plan — L107](chroma-toolkit-consolidation-plan.md#^ref-5020e892-107-0) (line 107, col 0, score 0.59)
- [Chroma Toolkit Consolidation Plan — L148](chroma-toolkit-consolidation-plan.md#^ref-5020e892-148-0) (line 148, col 0, score 0.59)
- [Board Walk – 2025-08-11 — L103](board-walk-2025-08-11.md#^ref-7aa1eb92-103-0) (line 103, col 0, score 0.59)
- [Mongo Outbox Implementation — L535](mongo-outbox-implementation.md#^ref-9c1acd1e-535-0) (line 535, col 0, score 0.62)
- [Migrate to Provider-Tenant Architecture — L261](migrate-to-provider-tenant-architecture.md#^ref-54382370-261-0) (line 261, col 0, score 0.64)
- [Shared Package Structure — L159](shared-package-structure.md#^ref-66a72fc3-159-0) (line 159, col 0, score 0.63)
- [schema-evolution-workflow — L467](schema-evolution-workflow.md#^ref-d8059b6a-467-0) (line 467, col 0, score 0.62)
- [shared-package-layout-clarification — L161](shared-package-layout-clarification.md#^ref-36c8882a-161-0) (line 161, col 0, score 0.62)
- [schema-evolution-workflow — L393](schema-evolution-workflow.md#^ref-d8059b6a-393-0) (line 393, col 0, score 0.62)
- [Agent Tasks: Persistence Migration to DualStore — L92](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-92-0) (line 92, col 0, score 0.62)
- [Promethean Web UI Setup — L40](promethean-web-ui-setup.md#^ref-bc5172ca-40-0) (line 40, col 0, score 0.61)
- [Agent Tasks: Persistence Migration to DualStore — L84](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-84-0) (line 84, col 0, score 0.61)
- [Migrate to Provider-Tenant Architecture — L81](migrate-to-provider-tenant-architecture.md#^ref-54382370-81-0) (line 81, col 0, score 0.61)
- [Stateful Partitions and Rebalancing — L524](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-524-0) (line 524, col 0, score 0.61)
- [Migrate to Provider-Tenant Architecture — L59](migrate-to-provider-tenant-architecture.md#^ref-54382370-59-0) (line 59, col 0, score 0.67)
- [Local-Offline-Model-Deployment-Strategy — L217](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-217-0) (line 217, col 0, score 0.62)
- [Local-Offline-Model-Deployment-Strategy — L248](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-248-0) (line 248, col 0, score 0.61)
- [i3-config-validation-methods — L16](i3-config-validation-methods.md#^ref-d28090ac-16-0) (line 16, col 0, score 0.61)
- [Dynamic Context Model for Web Components — L170](dynamic-context-model-for-web-components.md#^ref-f7702bf8-170-0) (line 170, col 0, score 0.61)
- [i3-config-validation-methods — L11](i3-config-validation-methods.md#^ref-d28090ac-11-0) (line 11, col 0, score 0.6)
- [Promethean Documentation Pipeline Overview — L115](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-115-0) (line 115, col 0, score 0.6)
- [Event Bus MVP — L368](event-bus-mvp.md#^ref-534fe91d-368-0) (line 368, col 0, score 0.6)
- [field-node-diagram-set — L102](field-node-diagram-set.md#^ref-22b989d5-102-0) (line 102, col 0, score 0.64)
- [eidolon-node-lifecycle — L3](eidolon-node-lifecycle.md#^ref-938eca9c-3-0) (line 3, col 0, score 0.64)
- [field-node-diagram-visualizations — L45](field-node-diagram-visualizations.md#^ref-e9b27b06-45-0) (line 45, col 0, score 0.63)
- [Agent Tasks: Persistence Migration to DualStore — L8](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-8-0) (line 8, col 0, score 0.63)
- [field-node-diagram-visualizations — L27](field-node-diagram-visualizations.md#^ref-e9b27b06-27-0) (line 27, col 0, score 0.63)
- [Local-Offline-Model-Deployment-Strategy — L23](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-23-0) (line 23, col 0, score 0.63)
- [field-dynamics-math-blocks — L78](field-dynamics-math-blocks.md#^ref-7cfc230d-78-0) (line 78, col 0, score 0.63)
- [Promethean Web UI Setup — L574](promethean-web-ui-setup.md#^ref-bc5172ca-574-0) (line 574, col 0, score 0.63)
- [Local-Offline-Model-Deployment-Strategy — L240](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-240-0) (line 240, col 0, score 0.63)
- [Promethean Web UI Setup — L563](promethean-web-ui-setup.md#^ref-bc5172ca-563-0) (line 563, col 0, score 0.91)
- [Pure TypeScript Search Microservice — L62](pure-typescript-search-microservice.md#^ref-d17d3a96-62-0) (line 62, col 0, score 0.73)
- [Per-Domain Policy System for JS Crawler — L446](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-446-0) (line 446, col 0, score 0.67)
- [Promethean Agent Config DSL — L225](promethean-agent-config-dsl.md#^ref-2c00ce45-225-0) (line 225, col 0, score 0.7)
- [RAG UI Panel with Qdrant and PostgREST — L71](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-71-0) (line 71, col 0, score 0.71)
- [Per-Domain Policy System for JS Crawler — L439](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-439-0) (line 439, col 0, score 0.69)
- [Prometheus Observability Stack — L500](prometheus-observability-stack.md#^ref-e90b5a16-500-0) (line 500, col 0, score 0.77)
- [Promethean Infrastructure Setup — L545](promethean-infrastructure-setup.md#^ref-6deed6ac-545-0) (line 545, col 0, score 0.7)
- [observability-infrastructure-setup — L357](observability-infrastructure-setup.md#^ref-b4e64f8c-357-0) (line 357, col 0, score 0.75)
- [Promethean Infrastructure Setup — L5](promethean-infrastructure-setup.md#^ref-6deed6ac-5-0) (line 5, col 0, score 0.64)
- [Migrate to Provider-Tenant Architecture — L88](migrate-to-provider-tenant-architecture.md#^ref-54382370-88-0) (line 88, col 0, score 0.64)
- [RAG UI Panel with Qdrant and PostgREST — L69](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-69-0) (line 69, col 0, score 0.63)
- [observability-infrastructure-setup — L1](observability-infrastructure-setup.md#^ref-b4e64f8c-1-0) (line 1, col 0, score 0.63)
- [observability-infrastructure-setup — L355](observability-infrastructure-setup.md#^ref-b4e64f8c-355-0) (line 355, col 0, score 0.59)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L73](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-73-0) (line 73, col 0, score 0.59)
- [Shared Package Structure — L146](shared-package-structure.md#^ref-66a72fc3-146-0) (line 146, col 0, score 0.59)
- [Event Bus MVP — L530](event-bus-mvp.md#^ref-534fe91d-530-0) (line 530, col 0, score 0.58)
- [Dynamic Context Model for Web Components — L35](dynamic-context-model-for-web-components.md#^ref-f7702bf8-35-0) (line 35, col 0, score 0.58)
- [Dynamic Context Model for Web Components — L79](dynamic-context-model-for-web-components.md#^ref-f7702bf8-79-0) (line 79, col 0, score 0.58)
- [Prometheus Observability Stack — L1](prometheus-observability-stack.md#^ref-e90b5a16-1-0) (line 1, col 0, score 0.58)
- [Promethean Infrastructure Setup — L558](promethean-infrastructure-setup.md#^ref-6deed6ac-558-0) (line 558, col 0, score 0.58)
- [RAG UI Panel with Qdrant and PostgREST — L327](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-327-0) (line 327, col 0, score 0.57)
- [RAG UI Panel with Qdrant and PostgREST — L1](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-1-0) (line 1, col 0, score 0.67)
- [Promethean Infrastructure Setup — L501](promethean-infrastructure-setup.md#^ref-6deed6ac-501-0) (line 501, col 0, score 0.66)
- [Promethean Pipelines: Local TypeScript-First Workflow — L1](promethean-pipelines-local-typescript-first-workflow.md#^ref-6b63edca-1-0) (line 1, col 0, score 0.65)
- [ChatGPT Custom Prompts — L9](chatgpt-custom-prompts.md#^ref-930054b3-9-0) (line 9, col 0, score 0.64)
- [WebSocket Gateway Implementation — L628](websocket-gateway-implementation.md#^ref-e811123d-628-0) (line 628, col 0, score 0.64)
- [Functional Refactor of TypeScript Document Processing — L1](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-1-0) (line 1, col 0, score 0.63)
- [TypeScript Patch for Tool Calling Support — L1](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-1-0) (line 1, col 0, score 0.62)
- [Dynamic Context Model for Web Components — L1](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1-0) (line 1, col 0, score 0.62)
- [Promethean Web UI Setup — L1](promethean-web-ui-setup.md#^ref-bc5172ca-1-0) (line 1, col 0, score 0.62)
- [Promethean-native config design — L3](promethean-native-config-design.md#^ref-ab748541-3-0) (line 3, col 0, score 0.62)
- [Promethean Documentation Pipeline Overview — L163](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-163-0) (line 163, col 0, score 0.61)
- [Promethean Event Bus MVP v0.1 — L941](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-941-0) (line 941, col 0, score 0.61)
- [windows-tiling-with-autohotkey — L12](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-12-0) (line 12, col 0, score 0.6)
- [Promethean Infrastructure Setup — L392](promethean-infrastructure-setup.md#^ref-6deed6ac-392-0) (line 392, col 0, score 0.6)
- [RAG UI Panel with Qdrant and PostgREST — L109](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-109-0) (line 109, col 0, score 0.71)
- [AI-Centric OS with MCP Layer — L397](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-397-0) (line 397, col 0, score 0.68)
- [Promethean Infrastructure Setup — L536](promethean-infrastructure-setup.md#^ref-6deed6ac-536-0) (line 536, col 0, score 0.68)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L417](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-417-0) (line 417, col 0, score 0.66)
- [Prometheus Observability Stack — L485](prometheus-observability-stack.md#^ref-e90b5a16-485-0) (line 485, col 0, score 0.66)
- [Local-Offline-Model-Deployment-Strategy — L288](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-288-0) (line 288, col 0, score 0.66)
- [api-gateway-versioning — L293](api-gateway-versioning.md#^ref-0580dcd3-293-0) (line 293, col 0, score 1)
- [eidolon-field-math-foundations — L168](eidolon-field-math-foundations.md#^ref-008f2ac0-168-0) (line 168, col 0, score 1)
- [i3-config-validation-methods — L75](i3-config-validation-methods.md#^ref-d28090ac-75-0) (line 75, col 0, score 1)
- [Local-Only-LLM-Workflow — L200](local-only-llm-workflow.md#^ref-9a8ab57e-200-0) (line 200, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L325](migrate-to-provider-tenant-architecture.md#^ref-54382370-325-0) (line 325, col 0, score 1)
- [observability-infrastructure-setup — L377](observability-infrastructure-setup.md#^ref-b4e64f8c-377-0) (line 377, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L475](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-475-0) (line 475, col 0, score 1)
- [Promethean Infrastructure Setup — L583](promethean-infrastructure-setup.md#^ref-6deed6ac-583-0) (line 583, col 0, score 1)
- [eidolon-field-math-foundations — L158](eidolon-field-math-foundations.md#^ref-008f2ac0-158-0) (line 158, col 0, score 1)
- [observability-infrastructure-setup — L375](observability-infrastructure-setup.md#^ref-b4e64f8c-375-0) (line 375, col 0, score 1)
- [Promethean Infrastructure Setup — L576](promethean-infrastructure-setup.md#^ref-6deed6ac-576-0) (line 576, col 0, score 1)
- [Promethean Web UI Setup — L602](promethean-web-ui-setup.md#^ref-bc5172ca-602-0) (line 602, col 0, score 1)
- [Prometheus Observability Stack — L518](prometheus-observability-stack.md#^ref-e90b5a16-518-0) (line 518, col 0, score 1)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L436](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-436-0) (line 436, col 0, score 1)
- [Pure TypeScript Search Microservice — L520](pure-typescript-search-microservice.md#^ref-d17d3a96-520-0) (line 520, col 0, score 1)
- [shared-package-layout-clarification — L188](shared-package-layout-clarification.md#^ref-36c8882a-188-0) (line 188, col 0, score 1)
- [api-gateway-versioning — L282](api-gateway-versioning.md#^ref-0580dcd3-282-0) (line 282, col 0, score 1)
- [archetype-ecs — L470](archetype-ecs.md#^ref-8f4c1e86-470-0) (line 470, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L201](chroma-toolkit-consolidation-plan.md#^ref-5020e892-201-0) (line 201, col 0, score 1)
- [Dynamic Context Model for Web Components — L382](dynamic-context-model-for-web-components.md#^ref-f7702bf8-382-0) (line 382, col 0, score 1)
- [ecs-offload-workers — L456](ecs-offload-workers.md#^ref-6498b9d7-456-0) (line 456, col 0, score 1)
- [ecs-scheduler-and-prefabs — L390](ecs-scheduler-and-prefabs.md#^ref-c62a1815-390-0) (line 390, col 0, score 1)
- [eidolon-field-math-foundations — L125](eidolon-field-math-foundations.md#^ref-008f2ac0-125-0) (line 125, col 0, score 1)
- [i3-config-validation-methods — L61](i3-config-validation-methods.md#^ref-d28090ac-61-0) (line 61, col 0, score 1)
- [observability-infrastructure-setup — L360](observability-infrastructure-setup.md#^ref-b4e64f8c-360-0) (line 360, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L163](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-163-0) (line 163, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L472](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-472-0) (line 472, col 0, score 1)
- [AI-Centric OS with MCP Layer — L401](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-401-0) (line 401, col 0, score 1)
- [api-gateway-versioning — L296](api-gateway-versioning.md#^ref-0580dcd3-296-0) (line 296, col 0, score 1)
- [i3-bluetooth-setup — L110](i3-bluetooth-setup.md#^ref-5e408692-110-0) (line 110, col 0, score 1)
- [Local-Offline-Model-Deployment-Strategy — L291](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-291-0) (line 291, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L279](migrate-to-provider-tenant-architecture.md#^ref-54382370-279-0) (line 279, col 0, score 1)
- [Mongo Outbox Implementation — L574](mongo-outbox-implementation.md#^ref-9c1acd1e-574-0) (line 574, col 0, score 1)
- [observability-infrastructure-setup — L359](observability-infrastructure-setup.md#^ref-b4e64f8c-359-0) (line 359, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L477](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-477-0) (line 477, col 0, score 1)
- [api-gateway-versioning — L286](api-gateway-versioning.md#^ref-0580dcd3-286-0) (line 286, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L44](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-44-0) (line 44, col 0, score 1)
- [Dynamic Context Model for Web Components — L410](dynamic-context-model-for-web-components.md#^ref-f7702bf8-410-0) (line 410, col 0, score 1)
- [observability-infrastructure-setup — L373](observability-infrastructure-setup.md#^ref-b4e64f8c-373-0) (line 373, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L65](promethean-copilot-intent-engine.md#^ref-ae24a280-65-0) (line 65, col 0, score 1)
- [Promethean Infrastructure Setup — L582](promethean-infrastructure-setup.md#^ref-6deed6ac-582-0) (line 582, col 0, score 1)
- [Promethean Web UI Setup — L601](promethean-web-ui-setup.md#^ref-bc5172ca-601-0) (line 601, col 0, score 1)
- [Prometheus Observability Stack — L508](prometheus-observability-stack.md#^ref-e90b5a16-508-0) (line 508, col 0, score 1)
- [AI-Centric OS with MCP Layer — L408](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-408-0) (line 408, col 0, score 1)
- [api-gateway-versioning — L316](api-gateway-versioning.md#^ref-0580dcd3-316-0) (line 316, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L213](chroma-toolkit-consolidation-plan.md#^ref-5020e892-213-0) (line 213, col 0, score 1)
- [Event Bus MVP — L581](event-bus-mvp.md#^ref-534fe91d-581-0) (line 581, col 0, score 1)
- [i3-bluetooth-setup — L101](i3-bluetooth-setup.md#^ref-5e408692-101-0) (line 101, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L178](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-178-0) (line 178, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L303](migrate-to-provider-tenant-architecture.md#^ref-54382370-303-0) (line 303, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L140](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-140-0) (line 140, col 0, score 1)
- [Mongo Outbox Implementation — L585](mongo-outbox-implementation.md#^ref-9c1acd1e-585-0) (line 585, col 0, score 1)
- [observability-infrastructure-setup — L363](observability-infrastructure-setup.md#^ref-b4e64f8c-363-0) (line 363, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L149](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-149-0) (line 149, col 0, score 1)
- [eidolon-field-math-foundations — L155](eidolon-field-math-foundations.md#^ref-008f2ac0-155-0) (line 155, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L309](migrate-to-provider-tenant-architecture.md#^ref-54382370-309-0) (line 309, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L469](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-469-0) (line 469, col 0, score 1)
- [Promethean Infrastructure Setup — L578](promethean-infrastructure-setup.md#^ref-6deed6ac-578-0) (line 578, col 0, score 1)
- [Promethean Web UI Setup — L605](promethean-web-ui-setup.md#^ref-bc5172ca-605-0) (line 605, col 0, score 1)
- [Prometheus Observability Stack — L507](prometheus-observability-stack.md#^ref-e90b5a16-507-0) (line 507, col 0, score 1)
- [Pure TypeScript Search Microservice — L530](pure-typescript-search-microservice.md#^ref-d17d3a96-530-0) (line 530, col 0, score 1)
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
- [AI-Centric OS with MCP Layer — L407](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-407-0) (line 407, col 0, score 1)
- [api-gateway-versioning — L284](api-gateway-versioning.md#^ref-0580dcd3-284-0) (line 284, col 0, score 1)
- [Services — L21](chunks/services.md#^ref-75ea4a6a-21-0) (line 21, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L43](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-43-0) (line 43, col 0, score 1)
- [Dynamic Context Model for Web Components — L407](dynamic-context-model-for-web-components.md#^ref-f7702bf8-407-0) (line 407, col 0, score 1)
- [ecs-offload-workers — L478](ecs-offload-workers.md#^ref-6498b9d7-478-0) (line 478, col 0, score 1)
- [eidolon-field-math-foundations — L167](eidolon-field-math-foundations.md#^ref-008f2ac0-167-0) (line 167, col 0, score 1)
- [i3-bluetooth-setup — L123](i3-bluetooth-setup.md#^ref-5e408692-123-0) (line 123, col 0, score 1)
- [i3-config-validation-methods — L78](i3-config-validation-methods.md#^ref-d28090ac-78-0) (line 78, col 0, score 1)
- [zero-copy-snapshots-and-workers — L363](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-363-0) (line 363, col 0, score 1)
- [Simulation Demo — L32](chunks/simulation-demo.md#^ref-557309a3-32-0) (line 32, col 0, score 1)
- [Tooling — L26](chunks/tooling.md#^ref-6cb4943e-26-0) (line 26, col 0, score 1)
- [Window Management — L36](chunks/window-management.md#^ref-9e8ae388-36-0) (line 36, col 0, score 1)
- [compiler-kit-foundations — L639](compiler-kit-foundations.md#^ref-01b21543-639-0) (line 639, col 0, score 1)
- [Creative Moments — L10](creative-moments.md#^ref-10d98225-10-0) (line 10, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L258](cross-language-runtime-polymorphism.md#^ref-c34c36a6-258-0) (line 258, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L215](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-215-0) (line 215, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L50](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-50-0) (line 50, col 0, score 1)
- [AI-Centric OS with MCP Layer — L406](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-406-0) (line 406, col 0, score 1)
- [Chroma-Embedding-Refactor — L331](chroma-embedding-refactor.md#^ref-8b256935-331-0) (line 331, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L167](chroma-toolkit-consolidation-plan.md#^ref-5020e892-167-0) (line 167, col 0, score 1)
- [Diagrams — L25](chunks/diagrams.md#^ref-45cd25b5-25-0) (line 25, col 0, score 1)
- [Tooling — L24](chunks/tooling.md#^ref-6cb4943e-24-0) (line 24, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L214](cross-language-runtime-polymorphism.md#^ref-c34c36a6-214-0) (line 214, col 0, score 1)
- [Dynamic Context Model for Web Components — L390](dynamic-context-model-for-web-components.md#^ref-f7702bf8-390-0) (line 390, col 0, score 1)
- [eidolon-field-math-foundations — L147](eidolon-field-math-foundations.md#^ref-008f2ac0-147-0) (line 147, col 0, score 1)
- [Event Bus MVP — L553](event-bus-mvp.md#^ref-534fe91d-553-0) (line 553, col 0, score 1)
- [field-interaction-equations — L159](field-interaction-equations.md#^ref-b09141b7-159-0) (line 159, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L315](functional-embedding-pipeline-refactor.md#^ref-a4a25141-315-0) (line 315, col 0, score 1)
- [i3-bluetooth-setup — L105](i3-bluetooth-setup.md#^ref-5e408692-105-0) (line 105, col 0, score 1)
- [2d-sandbox-field — L225](2d-sandbox-field.md#^ref-c710dc93-225-0) (line 225, col 0, score 1)
- [Admin Dashboard for User Management — L49](admin-dashboard-for-user-management.md#^ref-2901a3e9-49-0) (line 49, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L150](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-150-0) (line 150, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L163](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-163-0) (line 163, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L9](ai-first-os-model-context-protocol.md#^ref-618198f4-9-0) (line 9, col 0, score 1)
- [aionian-circuit-math — L179](aionian-circuit-math.md#^ref-f2d83a77-179-0) (line 179, col 0, score 1)
- [api-gateway-versioning — L304](api-gateway-versioning.md#^ref-0580dcd3-304-0) (line 304, col 0, score 1)
- [archetype-ecs — L479](archetype-ecs.md#^ref-8f4c1e86-479-0) (line 479, col 0, score 1)
- [balanced-bst — L295](balanced-bst.md#^ref-d3e7db72-295-0) (line 295, col 0, score 1)
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
- [Agent Tasks: Persistence Migration to DualStore — L130](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-130-0) (line 130, col 0, score 1)
- [api-gateway-versioning — L303](api-gateway-versioning.md#^ref-0580dcd3-303-0) (line 303, col 0, score 1)
- [Chroma-Embedding-Refactor — L327](chroma-embedding-refactor.md#^ref-8b256935-327-0) (line 327, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L174](chroma-toolkit-consolidation-plan.md#^ref-5020e892-174-0) (line 174, col 0, score 1)
- [eidolon-field-math-foundations — L134](eidolon-field-math-foundations.md#^ref-008f2ac0-134-0) (line 134, col 0, score 1)
- [i3-config-validation-methods — L82](i3-config-validation-methods.md#^ref-d28090ac-82-0) (line 82, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L267](migrate-to-provider-tenant-architecture.md#^ref-54382370-267-0) (line 267, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L391](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-391-0) (line 391, col 0, score 1)
- [Promethean Agent Config DSL — L333](promethean-agent-config-dsl.md#^ref-2c00ce45-333-0) (line 333, col 0, score 1)
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
- [DuckDuckGoSearchPipeline — L16](duckduckgosearchpipeline.md#^ref-e979c50f-16-0) (line 16, col 0, score 1)
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
- [AI-Centric OS with MCP Layer — L414](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-414-0) (line 414, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L10](ai-first-os-model-context-protocol.md#^ref-618198f4-10-0) (line 10, col 0, score 1)
- [Board Walk – 2025-08-11 — L144](board-walk-2025-08-11.md#^ref-7aa1eb92-144-0) (line 144, col 0, score 1)
- [Shared — L15](chunks/shared.md#^ref-623a55f7-15-0) (line 15, col 0, score 1)
- [Window Management — L23](chunks/window-management.md#^ref-9e8ae388-23-0) (line 23, col 0, score 1)
- [Creative Moments — L7](creative-moments.md#^ref-10d98225-7-0) (line 7, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L210](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-210-0) (line 210, col 0, score 1)
- [Duck's Attractor States — L68](ducks-attractor-states.md#^ref-13951643-68-0) (line 68, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L44](ducks-self-referential-perceptual-loop.md#^ref-71726f04-44-0) (line 44, col 0, score 1)
- [Dynamic Context Model for Web Components — L424](dynamic-context-model-for-web-components.md#^ref-f7702bf8-424-0) (line 424, col 0, score 1)
- [Promethean Agent Config DSL — L348](promethean-agent-config-dsl.md#^ref-2c00ce45-348-0) (line 348, col 0, score 1)
- [Promethean Chat Activity Report — L22](promethean-chat-activity-report.md#^ref-18344cf9-22-0) (line 22, col 0, score 1)
- [Promethean Data Sync Protocol — L5](promethean-data-sync-protocol.md#^ref-9fab9e76-5-0) (line 5, col 0, score 1)
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
- [aionian-circuit-math — L165](aionian-circuit-math.md#^ref-f2d83a77-165-0) (line 165, col 0, score 1)
- [api-gateway-versioning — L319](api-gateway-versioning.md#^ref-0580dcd3-319-0) (line 319, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L116](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-116-0) (line 116, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L209](chroma-toolkit-consolidation-plan.md#^ref-5020e892-209-0) (line 209, col 0, score 1)
- [DSL — L13](chunks/dsl.md#^ref-e87bc036-13-0) (line 13, col 0, score 1)
- [Math Fundamentals — L16](chunks/math-fundamentals.md#^ref-c6e87433-16-0) (line 16, col 0, score 1)
- [Services — L16](chunks/services.md#^ref-75ea4a6a-16-0) (line 16, col 0, score 1)
- [Shared — L5](chunks/shared.md#^ref-623a55f7-5-0) (line 5, col 0, score 1)
- [Simulation Demo — L12](chunks/simulation-demo.md#^ref-557309a3-12-0) (line 12, col 0, score 1)
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
