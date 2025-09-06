---
uuid: d495e48a-cfd4-4dc6-b6cc-e31d2f554571
created_at: promethean-full-stack-docker-setup.md
filename: promethean-full-stack-docker-setup
title: promethean-full-stack-docker-setup
description: >-
  A Docker Compose setup for a full-stack AI application with multiple services
  including Nginx, LLMs (Qwen, Gemma), embeddings, CLIP, Whisper, and OpenVINO
  model server. The configuration supports GPU acceleration for LLMs and uses a
  custom network for isolation.
tags:
  - docker-compose
  - full-stack
  - ai-services
  - gpu-acceleration
  - llm
  - embeddings
  - clip
  - whisper
  - openvino
  - nginx
related_to_uuid:
  - 2c9f86e6-9b63-44d7-902d-84b10b0bdbe3
  - e811123d-5841-4e52-bf8c-978f26db4230
  - 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
  - 31a2df46-9dbc-4066-b3e3-d3e860099fd0
  - e0d3201b-826a-4976-ab01-36aae28882be
  - bc5172ca-7a09-42ad-b418-8e42bb14d089
  - 975de447-e9ae-4abe-97a8-46e04f83629b
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
  - 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - cdf2c6e4-0dbd-4f19-b645-ac619a6f267d
  - 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
related_to_title:
  - Field Node Diagrams
  - WebSocket Gateway Implementation
  - Voice Access Layer Design
  - field-node-diagram-set
  - prom ui bootstrap
  - Eidolon Node Lifecycle
  - eidolon-field-math-foundations
  - field-node-diagram-outline
  - homeostasis-decay-formulas
  - graph-ds
  - eidolon-node-lifecycle
  - field-dynamics-math-blocks
  - field-interaction-equations
  - field-node-diagram-visualizations
  - heartbeat-fragment-demo
  - Migrate to Provider-Tenant Architecture
  - i3-bluetooth-setup
  - Prometheus Observability Stack
  - Per-Domain Policy System for JS Crawler
  - Unique Info Dump Index
  - Dynamic Context Model for Web Components
  - Mongo Outbox Implementation
references:
  - uuid: 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
    line: 280
    col: 0
    score: 1
  - uuid: e811123d-5841-4e52-bf8c-978f26db4230
    line: 631
    col: 0
    score: 1
  - uuid: 2c9f86e6-9b63-44d7-902d-84b10b0bdbe3
    line: 1
    col: 0
    score: 1
  - uuid: 31a2df46-9dbc-4066-b3e3-d3e860099fd0
    line: 1
    col: 0
    score: 1
  - uuid: e0d3201b-826a-4976-ab01-36aae28882be
    line: 1
    col: 0
    score: 0.99
  - uuid: 975de447-e9ae-4abe-97a8-46e04f83629b
    line: 1
    col: 0
    score: 0.9
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 5262
    col: 0
    score: 0.89
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
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 3264
    col: 0
    score: 0.87
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 2859
    col: 0
    score: 0.87
  - uuid: cdf2c6e4-0dbd-4f19-b645-ac619a6f267d
    line: 47
    col: 0
    score: 0.87
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
  - uuid: cdf2c6e4-0dbd-4f19-b645-ac619a6f267d
    line: 59
    col: 0
    score: 0.86
  - uuid: bc5172ca-7a09-42ad-b418-8e42bb14d089
    line: 45
    col: 0
    score: 0.85
  - uuid: babdb9eb-3b15-48a7-8a22-ecc53af7d397
    line: 147
    col: 0
    score: 0.85
  - uuid: ab54cdd8-13ce-4dcb-a9cd-da2d86e0305f
    line: 272
    col: 0
    score: 0.85
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
^ref-50ac7389-3-0
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

#docker #compose #nginx #reverseproxy #ollama #vllm #tei #clip #whisper #ovms #npu #homelab #mlops
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

#docker #compose #nginx #reverseproxy #ollama #vllm #tei #clip #whisper #ovms #npu #homelab #mlops
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Field Node Diagrams](field-node-diagram-visualizations.md)
- [WebSocket Gateway Implementation](websocket-gateway-implementation.md)
- [Voice Access Layer Design](voice-access-layer-design.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [Field Node Diagrams](field-node-diagram-outline.md)
- [prom ui bootstrap](promethean-web-ui-setup.md)
- [Eidolon Node Lifecycle](eidolon-node-lifecycle.md)
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
- [Unique Info Dump Index](unique-info-dump-index.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
## Sources
- [Voice Access Layer Design — L280](voice-access-layer-design.md#^ref-543ed9b3-280-0) (line 280, col 0, score 1)
- [WebSocket Gateway Implementation — L631](websocket-gateway-implementation.md#^ref-e811123d-631-0) (line 631, col 0, score 1)
- [Field Node Diagrams — L1](field-node-diagram-visualizations.md#^ref-2c9f86e6-1-0) (line 1, col 0, score 1)
- [field-node-diagram-set — L1](field-node-diagram-set.md#^ref-31a2df46-1-0) (line 1, col 0, score 1)
- [Field Node Diagrams — L1](field-node-diagram-outline.md#^ref-e0d3201b-1-0) (line 1, col 0, score 0.99)
- [Eidolon Node Lifecycle — L1](eidolon-node-lifecycle.md#^ref-975de447-1-0) (line 1, col 0, score 0.9)
- [Migrate to Provider-Tenant Architecture — L5262](migrate-to-provider-tenant-architecture.md#^ref-54382370-5262-0) (line 5262, col 0, score 0.89)
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
- [i3-bluetooth-setup — L2365](i3-bluetooth-setup.md#^ref-5e408692-2365-0) (line 2365, col 0, score 0.88)
- [Per-Domain Policy System for JS Crawler — L2046](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-2046-0) (line 2046, col 0, score 0.88)
- [Prometheus Observability Stack — L2351](prometheus-observability-stack.md#^ref-e90b5a16-2351-0) (line 2351, col 0, score 0.88)
- [i3-bluetooth-setup — L2381](i3-bluetooth-setup.md#^ref-5e408692-2381-0) (line 2381, col 0, score 0.87)
- [Unique Info Dump Index — L3264](unique-info-dump-index.md#^ref-30ec3ba6-3264-0) (line 3264, col 0, score 0.87)
- [Dynamic Context Model for Web Components — L2859](dynamic-context-model-for-web-components.md#^ref-f7702bf8-2859-0) (line 2859, col 0, score 0.87)
- [Unique Info Dump Index — L47](unique-info-dump-index.md#^ref-cdf2c6e4-47-0) (line 47, col 0, score 0.87)
- [Mongo Outbox Implementation — L610](mongo-outbox-implementation.md#^ref-9c1acd1e-610-0) (line 610, col 0, score 0.86)
- [compiler-kit-foundations — L590](compiler-kit-foundations.md#^ref-01b21543-590-0) (line 590, col 0, score 0.86)
- [Ghostly Smoke Interference — L40](ghostly-smoke-interference.md#^ref-b6ae7dfa-40-0) (line 40, col 0, score 0.86)
- [Language-Agnostic Mirror System — L504](language-agnostic-mirror-system.md#^ref-d2b3628c-504-0) (line 504, col 0, score 0.86)
- [Unique Info Dump Index — L59](unique-info-dump-index.md#^ref-cdf2c6e4-59-0) (line 59, col 0, score 0.86)
- [prom ui bootstrap — L45](promethean-web-ui-setup.md#^ref-bc5172ca-45-0) (line 45, col 0, score 0.85)
- [Recursive Prompt Construction Engine — L147](recursive-prompt-construction-engine.md#^ref-babdb9eb-147-0) (line 147, col 0, score 0.85)
- [markdown-to-org-transpiler — L272](markdown-to-org-transpiler.md#^ref-ab54cdd8-272-0) (line 272, col 0, score 0.85)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
