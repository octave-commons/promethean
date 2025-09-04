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
related_to_title:
  - WebSocket Gateway Implementation
  - Voice Access Layer Design
  - Promethean Web UI Setup
  - eidolon-field-math-foundations
  - field-node-diagram-outline
  - homeostasis-decay-formulas
  - graph-ds
  - eidolon-node-lifecycle
  - field-dynamics-math-blocks
  - field-interaction-equations
  - field-node-diagram-set
  - field-node-diagram-visualizations
  - heartbeat-fragment-demo
  - Migrate to Provider-Tenant Architecture
  - i3-bluetooth-setup
  - Prometheus Observability Stack
  - Per-Domain Policy System for JS Crawler
  - JavaScript
  - Unique Info Dump Index
  - Dynamic Context Model for Web Components
  - Mongo Outbox Implementation
  - compiler-kit-foundations
  - Ghostly Smoke Interference
  - Language-Agnostic Mirror System
  - Recursive Prompt Construction Engine
  - markdown-to-org-transpiler
  - Shared Package Structure
  - 'Polyglot S-expr Bridge: Python-JS-Lisp Interop'
  - refactor-relations
  - Event Bus MVP
  - file-watcher-auth-fix
  - ecs-offload-workers
  - Promethean Agent Config DSL
  - Local-Only-LLM-Workflow
  - Cross-Target Macro System in Sibilant
  - Lispy Macros with syntax-rules
  - heartbeat-simulation-snippets
  - set-assignment-in-lisp-ast
  - Matplotlib Animation with Async Execution
  - DSL
  - Math Fundamentals
  - Services
  - Shared
  - Simulation Demo
  - Local-First Intention→Code Loop with Free Models
  - Event Bus Projections Architecture
  - Promethean-native config design
  - TypeScript Patch for Tool Calling Support
  - universal-intention-code-fabric
  - layer-1-uptime-diagrams
  - System Scheduler with Resource-Aware DAG
  - Promethean Infrastructure Setup
  - Pure TypeScript Search Microservice
related_to_uuid:
  - e811123d-5841-4e52-bf8c-978f26db4230
  - 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
  - bc5172ca-7a09-42ad-b418-8e42bb14d089
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - 1f32c94a-4da4-4266-8ac0-6c282cfb401f
  - 37b5d236-2b3e-4a95-a4e8-31655c3023ef
  - 6620e2f2-de6d-45d8-a722-5d26e160b370
  - 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
  - 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
  - b09141b7-544f-4c8e-8f49-bf76cecaacbb
  - 22b989d5-f4aa-4880-8632-709c21830f83
  - e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
  - dd00677a-2280-45a7-91af-0728b21af3ad
  - 54382370-1931-4a19-a634-46735708a9ea
  - 5e408692-0e74-400e-a617-84247c7353ad
  - e90b5a16-d58f-424d-bd36-70e9bd2861ad
  - c03020e1-e3e7-48bf-aa7e-aa740c601b63
  - c1618c66-f73a-4e04-9bfa-ef38755f7acc
  - 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
  - 01b21543-7e03-4129-8fe4-b6306be69dee
  - b6ae7dfa-0c53-4eb9-aea8-65072b825bee
  - d2b3628c-6cad-4664-8551-94ef8280851d
  - babdb9eb-3b15-48a7-8a22-ecc53af7d397
  - ab54cdd8-13ce-4dcb-a9cd-da2d86e0305f
  - 66a72fc3-4153-41fc-84bd-d6164967a6ff
  - 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
  - 41ce0216-f8cc-4eed-8d9a-fcc25be21425
  - 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
  - 9044701b-03c9-4a30-92c4-46b1bd66c11e
  - 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
  - 2c00ce45-08cf-4b81-9883-6157f30b7fae
  - 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
  - 5f210ca2-54e9-445b-afe4-fb340d4992c5
  - cbfe3513-6a4a-4d2e-915d-ddfab583b2de
  - 23e221e9-d4fa-4106-8458-06db2595085f
  - c5fba0a0-9196-468d-a0f3-51c99e987263
  - 687439f9-ad1e-40a4-8a32-3a1b4ac7c017
  - e87bc036-1570-419e-a558-f45b9c0db698
  - c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
  - 75ea4a6a-8270-488d-9d37-799c288e5f70
  - 623a55f7-685c-486b-abaf-469da1bbbb69
  - 557309a3-c906-4e97-8867-89ffe151790c
  - 871490c7-a050-429b-88b2-55dfeaa1f8d5
  - cf6b9b17-bb91-4219-aa5c-172cba02b2da
  - ab748541-020e-4a7e-b07d-28173bd5bea2
  - 7b7ca860-780c-44fa-8d3f-be8bd9496fba
  - c14edce7-0656-45b2-aaf3-51f042451b7d
  - 4127189a-e0ab-436f-8571-cc852b8e9add
  - ba244286-4e84-425b-8bf6-b80c4eb783fc
  - 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
  - d17d3a96-c84d-4738-a403-6c733b874da2
references:
  - uuid: bc5172ca-7a09-42ad-b418-8e42bb14d089
    line: 45
    col: 0
    score: 0.85
  - uuid: 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
    line: 610
    col: 0
    score: 0.86
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 590
    col: 0
    score: 0.86
  - uuid: b6ae7dfa-0c53-4eb9-aea8-65072b825bee
    line: 40
    col: 0
    score: 0.86
  - uuid: d2b3628c-6cad-4664-8551-94ef8280851d
    line: 504
    col: 0
    score: 0.86
  - uuid: babdb9eb-3b15-48a7-8a22-ecc53af7d397
    line: 147
    col: 0
    score: 0.85
  - uuid: ab54cdd8-13ce-4dcb-a9cd-da2d86e0305f
    line: 272
    col: 0
    score: 0.85
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 5262
    col: 0
    score: 0.89
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 2365
    col: 0
    score: 0.88
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 2046
    col: 0
    score: 0.88
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 2351
    col: 0
    score: 0.88
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 2381
    col: 0
    score: 0.87
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 1408
    col: 0
    score: 0.87
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 3264
    col: 0
    score: 0.87
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 2859
    col: 0
    score: 0.87
  - uuid: 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
    line: 280
    col: 0
    score: 1
  - uuid: e811123d-5841-4e52-bf8c-978f26db4230
    line: 631
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 5120
    col: 0
    score: 0.89
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 3506
    col: 0
    score: 0.89
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 5625
    col: 0
    score: 0.89
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 6116
    col: 0
    score: 0.89
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 4676
    col: 0
    score: 0.89
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 4420
    col: 0
    score: 0.89
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 3782
    col: 0
    score: 0.89
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 3994
    col: 0
    score: 0.89
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 4095
    col: 0
    score: 0.89
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 6409
    col: 0
    score: 0.89
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
^ref-2c2b48ca-171-0

---
 ^ref-2c2b48ca-332-0
### `infra/nginx/secrets/api_keys.map` (allowlist; one token per line)

```text
CHANGEME 1;
^ref-2c2b48ca-332-0
# supersecret123 1;
# another-token 1;
```
 ^ref-2c2b48ca-342-0
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
 ^ref-2c2b48ca-416-0
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
^ref-2c2b48ca-416-0
``` ^ref-2c2b48ca-443-0
^ref-2c2b48ca-417-0
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
- [WebSocket Gateway Implementation](websocket-gateway-implementation.md)
- [Voice Access Layer Design](voice-access-layer-design.md)
- [Promethean Web UI Setup](promethean-web-ui-setup.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
- [graph-ds](graph-ds.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [field-interaction-equations](field-interaction-equations.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [Prometheus Observability Stack](prometheus-observability-stack.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [JavaScript](chunks/javascript.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [Ghostly Smoke Interference](ghostly-smoke-interference.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [Recursive Prompt Construction Engine](recursive-prompt-construction-engine.md)
- [markdown-to-org-transpiler](markdown-to-org-transpiler.md)
- [Shared Package Structure](shared-package-structure.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [refactor-relations](refactor-relations.md)
- [Event Bus MVP](event-bus-mvp.md)
- [file-watcher-auth-fix](file-watcher-auth-fix.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [Lispy Macros with syntax-rules](lispy-macros-with-syntax-rules.md)
- [heartbeat-simulation-snippets](heartbeat-simulation-snippets.md)
- [set-assignment-in-lisp-ast](set-assignment-in-lisp-ast.md)
- [Matplotlib Animation with Async Execution](matplotlib-animation-with-async-execution.md)
- [DSL](chunks/dsl.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [Services](chunks/services.md)
- [Shared](chunks/shared.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [TypeScript Patch for Tool Calling Support](typescript-patch-for-tool-calling-support.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [layer-1-uptime-diagrams](layer-1-uptime-diagrams.md)
- [System Scheduler with Resource-Aware DAG](system-scheduler-with-resource-aware-dag.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [Pure TypeScript Search Microservice](pure-typescript-search-microservice.md)
## Sources
- [Promethean Web UI Setup — L45](promethean-web-ui-setup.md#^ref-bc5172ca-45-0) (line 45, col 0, score 0.85)
- [Mongo Outbox Implementation — L610](mongo-outbox-implementation.md#^ref-9c1acd1e-610-0) (line 610, col 0, score 0.86)
- [compiler-kit-foundations — L590](compiler-kit-foundations.md#^ref-01b21543-590-0) (line 590, col 0, score 0.86)
- [Ghostly Smoke Interference — L40](ghostly-smoke-interference.md#^ref-b6ae7dfa-40-0) (line 40, col 0, score 0.86)
- [Language-Agnostic Mirror System — L504](language-agnostic-mirror-system.md#^ref-d2b3628c-504-0) (line 504, col 0, score 0.86)
- [Recursive Prompt Construction Engine — L147](recursive-prompt-construction-engine.md#^ref-babdb9eb-147-0) (line 147, col 0, score 0.85)
- [markdown-to-org-transpiler — L272](markdown-to-org-transpiler.md#^ref-ab54cdd8-272-0) (line 272, col 0, score 0.85)
- [Migrate to Provider-Tenant Architecture — L5262](migrate-to-provider-tenant-architecture.md#^ref-54382370-5262-0) (line 5262, col 0, score 0.89)
- [i3-bluetooth-setup — L2365](i3-bluetooth-setup.md#^ref-5e408692-2365-0) (line 2365, col 0, score 0.88)
- [Per-Domain Policy System for JS Crawler — L2046](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-2046-0) (line 2046, col 0, score 0.88)
- [Prometheus Observability Stack — L2351](prometheus-observability-stack.md#^ref-e90b5a16-2351-0) (line 2351, col 0, score 0.88)
- [i3-bluetooth-setup — L2381](i3-bluetooth-setup.md#^ref-5e408692-2381-0) (line 2381, col 0, score 0.87)
- [JavaScript — L1408](chunks/javascript.md#^ref-c1618c66-1408-0) (line 1408, col 0, score 0.87)
- [Unique Info Dump Index — L3264](unique-info-dump-index.md#^ref-30ec3ba6-3264-0) (line 3264, col 0, score 0.87)
- [Dynamic Context Model for Web Components — L2859](dynamic-context-model-for-web-components.md#^ref-f7702bf8-2859-0) (line 2859, col 0, score 0.87)
- [Voice Access Layer Design — L280](voice-access-layer-design.md#^ref-543ed9b3-280-0) (line 280, col 0, score 1)
- [WebSocket Gateway Implementation — L631](websocket-gateway-implementation.md#^ref-e811123d-631-0) (line 631, col 0, score 1)
- [eidolon-field-math-foundations — L5120](eidolon-field-math-foundations.md#^ref-008f2ac0-5120-0) (line 5120, col 0, score 0.89)
- [eidolon-node-lifecycle — L3506](eidolon-node-lifecycle.md#^ref-938eca9c-3506-0) (line 3506, col 0, score 0.89)
- [field-dynamics-math-blocks — L5625](field-dynamics-math-blocks.md#^ref-7cfc230d-5625-0) (line 5625, col 0, score 0.89)
- [field-interaction-equations — L6116](field-interaction-equations.md#^ref-b09141b7-6116-0) (line 6116, col 0, score 0.89)
- [field-node-diagram-outline — L4676](field-node-diagram-outline.md#^ref-1f32c94a-4676-0) (line 4676, col 0, score 0.89)
- [field-node-diagram-set — L4420](field-node-diagram-set.md#^ref-22b989d5-4420-0) (line 4420, col 0, score 0.89)
- [field-node-diagram-visualizations — L3782](field-node-diagram-visualizations.md#^ref-e9b27b06-3782-0) (line 3782, col 0, score 0.89)
- [graph-ds — L3994](graph-ds.md#^ref-6620e2f2-3994-0) (line 3994, col 0, score 0.89)
- [heartbeat-fragment-demo — L4095](heartbeat-fragment-demo.md#^ref-dd00677a-4095-0) (line 4095, col 0, score 0.89)
- [homeostasis-decay-formulas — L6409](homeostasis-decay-formulas.md#^ref-37b5d236-6409-0) (line 6409, col 0, score 0.89)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
