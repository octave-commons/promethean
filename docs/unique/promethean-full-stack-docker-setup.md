---
uuid: 50ac7389-a75e-476a-ab34-bb24776d4f38
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
