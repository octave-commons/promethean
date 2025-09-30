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
  - Promethean Web UI Setup
  - RAG UI Panel with Qdrant and PostgREST
  - Promethean Infrastructure Setup
  - Prometheus Observability Stack
  - Pure TypeScript Search Microservice
  - Local-Offline-Model-Deployment-Strategy
  - Pure-Node Crawl Stack with Playwright and Crawlee
  - api-gateway-versioning
  - observability-infrastructure-setup
  - Dynamic Context Model for Web Components
  - Migrate to Provider-Tenant Architecture
  - AI-Centric OS with MCP Layer
  - Debugging Broker Connections and Agent Behavior
  - ecs-offload-workers
related_to_uuid:
  - bc5172ca-7a09-42ad-b418-8e42bb14d089
  - e1056831-ae0c-460b-95fa-4cf09b3398c6
  - 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
  - e90b5a16-d58f-424d-bd36-70e9bd2861ad
  - d17d3a96-c84d-4738-a403-6c733b874da2
  - ad7f1ed3-c9bf-4e85-9eeb-6cc4b53155f3
  - d527c05d-22e8-4493-8f29-ae3cb67f035b
  - 0580dcd3-533d-4834-8a2f-eae3771960a9
  - b4e64f8c-4dc9-4941-a877-646c5ada068e
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - 54382370-1931-4a19-a634-46735708a9ea
  - 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
  - 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
  - 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
references:
  - uuid: bc5172ca-7a09-42ad-b418-8e42bb14d089
    line: 44
    col: 1
    score: 0.99
  - uuid: bc5172ca-7a09-42ad-b418-8e42bb14d089
    line: 563
    col: 1
    score: 0.91
  - uuid: e1056831-ae0c-460b-95fa-4cf09b3398c6
    line: 9
    col: 1
    score: 0.96
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 585
    col: 1
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 585
    col: 3
    score: 1
  - uuid: d527c05d-22e8-4493-8f29-ae3cb67f035b
    line: 428
    col: 1
    score: 1
  - uuid: d527c05d-22e8-4493-8f29-ae3cb67f035b
    line: 428
    col: 3
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 521
    col: 1
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 521
    col: 3
    score: 1
  - uuid: e1056831-ae0c-460b-95fa-4cf09b3398c6
    line: 364
    col: 1
    score: 1
  - uuid: e1056831-ae0c-460b-95fa-4cf09b3398c6
    line: 364
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
  - uuid: bc5172ca-7a09-42ad-b418-8e42bb14d089
    line: 604
    col: 1
    score: 1
  - uuid: bc5172ca-7a09-42ad-b418-8e42bb14d089
    line: 604
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
  - uuid: bc5172ca-7a09-42ad-b418-8e42bb14d089
    line: 615
    col: 1
    score: 0.94
  - uuid: bc5172ca-7a09-42ad-b418-8e42bb14d089
    line: 615
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
  - uuid: 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
    line: 403
    col: 1
    score: 1
  - uuid: 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
    line: 403
    col: 3
    score: 1
  - uuid: ad7f1ed3-c9bf-4e85-9eeb-6cc4b53155f3
    line: 293
    col: 1
    score: 1
  - uuid: ad7f1ed3-c9bf-4e85-9eeb-6cc4b53155f3
    line: 293
    col: 3
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 281
    col: 1
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 281
    col: 3
    score: 1
  - uuid: b4e64f8c-4dc9-4941-a877-646c5ada068e
    line: 361
    col: 1
    score: 1
  - uuid: b4e64f8c-4dc9-4941-a877-646c5ada068e
    line: 361
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
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 584
    col: 1
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 584
    col: 3
    score: 1
  - uuid: bc5172ca-7a09-42ad-b418-8e42bb14d089
    line: 603
    col: 1
    score: 1
  - uuid: bc5172ca-7a09-42ad-b418-8e42bb14d089
    line: 603
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
  - uuid: e1056831-ae0c-460b-95fa-4cf09b3398c6
    line: 371
    col: 1
    score: 0.99
  - uuid: e1056831-ae0c-460b-95fa-4cf09b3398c6
    line: 371
    col: 3
    score: 0.99
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 531
    col: 1
    score: 0.99
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 531
    col: 3
    score: 0.99
  - uuid: e1056831-ae0c-460b-95fa-4cf09b3398c6
    line: 373
    col: 1
    score: 0.98
  - uuid: e1056831-ae0c-460b-95fa-4cf09b3398c6
    line: 373
    col: 3
    score: 0.98
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 532
    col: 1
    score: 0.98
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 532
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
  - uuid: bc5172ca-7a09-42ad-b418-8e42bb14d089
    line: 613
    col: 1
    score: 0.98
  - uuid: bc5172ca-7a09-42ad-b418-8e42bb14d089
    line: 613
    col: 3
    score: 0.98
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
  # REST:9000 (nginx /asr/npu/) | gRPC:9001
  ovms-npu:
    image: openvino/model_server:latest
    command: --config_path /config/config.json --rest_port 9000 --port 9001
    volumes:
      - ./infra/ovms/config.json:/config/config.json:ro
      - ./models/ov:/opt/models:ro
    networks: [ prom-net ]
    restart: unless-stopped
```

---

### `docker-compose.stealth.yaml` (host overlay: dGPU + iGPU + NPU)

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
```

---

### `infra/nginx/nginx.conf` (token auth + rate limits; clean paths)

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
}
```

---

### `infra/nginx/secrets/api_keys.map` (allowlist; one token per line)

```text
CHANGEME 1;
# supersecret123 1;
# another-token 1;
```

---

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
    }
  ]
}
```

---

### `.env` (optional defaults)

```env
HF_TOKEN=
TEI_MODEL=nomic-ai/nomic-embed-text-v1.5
CLIP_MODEL=openai/clip-vit-large-patch14
VLLM_MAX_TOKENS=32768
```

---

### Up it

```bash
# create secrets dir + token
mkdir -p infra/nginx/secrets infra/ovms models/ov
echo "CHANGEME 1;" > infra/nginx/secrets/api_keys.map

# base stack
docker compose -f docker-compose.yaml up -d

# with Stealth device overlay
docker compose -f docker-compose.yaml -f docker-compose.stealth.yaml up -d
```

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
      - qdrant_data:/qdrant/storage
    networks: [ prom-net ]

volumes:
  pg_data: {}
  qdrant_data: {}
```

From here we want to start serving a typescript/webcomponents based frontend that connects to everything.

#docker #compose #nginx #reverseproxy #ollama #vllm #tei #clip #whisper #ovms #npu #homelab #mlops
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [[promethean-web-ui-setup|Promethean Web UI Setup]]
- [[rag-ui-panel-with-qdrant-and-postgrest|RAG UI Panel with Qdrant and PostgREST]]
- [[promethean-infrastructure-setup|Promethean Infrastructure Setup]]
- [[prometheus-observability-stack|Prometheus Observability Stack]]
- [[pure-typescript-search-microservice|Pure TypeScript Search Microservice]]
- [[local-offline-model-deployment-strategy]]
- [[pure-node-crawl-stack-with-playwright-and-crawlee|Pure-Node Crawl Stack with Playwright and Crawlee]]
- [[api-gateway-versioning]]
- [[observability-infrastructure-setup]]
- [[dynamic-context-model-for-web-components|Dynamic Context Model for Web Components]]
- [[migrate-to-provider-tenant-architecture|Migrate to Provider-Tenant Architecture]]
- [[ai-centric-os-with-mcp-layer|AI-Centric OS with MCP Layer]]
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [[docs/unique/ecs-offload-workers|ecs-offload-workers]]

## Sources
- [[promethean-web-ui-setup#L44|Promethean Web UI Setup — L44]] (line 44, col 1, score 0.99)
- [[promethean-web-ui-setup#L563|Promethean Web UI Setup — L563]] (line 563, col 1, score 0.91)
- [[rag-ui-panel-with-qdrant-and-postgrest#L9|RAG UI Panel with Qdrant and PostgREST — L9]] (line 9, col 1, score 0.96)
- [[promethean-infrastructure-setup#L585|Promethean Infrastructure Setup — L585]] (line 585, col 1, score 1)
- [[promethean-infrastructure-setup#L585|Promethean Infrastructure Setup — L585]] (line 585, col 3, score 1)
- [[pure-node-crawl-stack-with-playwright-and-crawlee#L428|Pure-Node Crawl Stack with Playwright and Crawlee — L428]] (line 428, col 1, score 1)
- [[pure-node-crawl-stack-with-playwright-and-crawlee#L428|Pure-Node Crawl Stack with Playwright and Crawlee — L428]] (line 428, col 3, score 1)
- [[pure-typescript-search-microservice#L521|Pure TypeScript Search Microservice — L521]] (line 521, col 1, score 1)
- [[pure-typescript-search-microservice#L521|Pure TypeScript Search Microservice — L521]] (line 521, col 3, score 1)
- [[rag-ui-panel-with-qdrant-and-postgrest#L364|RAG UI Panel with Qdrant and PostgREST — L364]] (line 364, col 1, score 1)
- [[rag-ui-panel-with-qdrant-and-postgrest#L364|RAG UI Panel with Qdrant and PostgREST — L364]] (line 364, col 3, score 1)
- [[promethean-infrastructure-setup#L578|Promethean Infrastructure Setup — L578]] (line 578, col 1, score 1)
- [[promethean-infrastructure-setup#L578|Promethean Infrastructure Setup — L578]] (line 578, col 3, score 1)
- [[promethean-web-ui-setup#L604|Promethean Web UI Setup — L604]] (line 604, col 1, score 1)
- [[promethean-web-ui-setup#L604|Promethean Web UI Setup — L604]] (line 604, col 3, score 1)
- [[pure-typescript-search-microservice#L522|Pure TypeScript Search Microservice — L522]] (line 522, col 1, score 1)
- [[pure-typescript-search-microservice#L522|Pure TypeScript Search Microservice — L522]] (line 522, col 3, score 1)
- [[promethean-web-ui-setup#L615|Promethean Web UI Setup — L615]] (line 615, col 1, score 0.94)
- [[promethean-web-ui-setup#L615|Promethean Web UI Setup — L615]] (line 615, col 3, score 0.94)
- [[api-gateway-versioning#L284|api-gateway-versioning — L284]] (line 284, col 1, score 1)
- [[api-gateway-versioning#L284|api-gateway-versioning — L284]] (line 284, col 3, score 1)
- [Debugging Broker Connections and Agent Behavior — L40](debugging-broker-connections-and-agent-behavior.md#L40) (line 40, col 1, score 1)
- [Debugging Broker Connections and Agent Behavior — L40](debugging-broker-connections-and-agent-behavior.md#L40) (line 40, col 3, score 1)
- [[dynamic-context-model-for-web-components#L384|Dynamic Context Model for Web Components — L384]] (line 384, col 1, score 1)
- [[dynamic-context-model-for-web-components#L384|Dynamic Context Model for Web Components — L384]] (line 384, col 3, score 1)
- [[docs/unique/ecs-offload-workers#L458|ecs-offload-workers — L458]] (line 458, col 1, score 1)
- [[docs/unique/ecs-offload-workers#L458|ecs-offload-workers — L458]] (line 458, col 3, score 1)
- [[ai-centric-os-with-mcp-layer#L403|AI-Centric OS with MCP Layer — L403]] (line 403, col 1, score 1)
- [[ai-centric-os-with-mcp-layer#L403|AI-Centric OS with MCP Layer — L403]] (line 403, col 3, score 1)
- [[local-offline-model-deployment-strategy#L293|Local-Offline-Model-Deployment-Strategy — L293]] (line 293, col 1, score 1)
- [[local-offline-model-deployment-strategy#L293|Local-Offline-Model-Deployment-Strategy — L293]] (line 293, col 3, score 1)
- [[migrate-to-provider-tenant-architecture#L281|Migrate to Provider-Tenant Architecture — L281]] (line 281, col 1, score 1)
- [[migrate-to-provider-tenant-architecture#L281|Migrate to Provider-Tenant Architecture — L281]] (line 281, col 3, score 1)
- [[observability-infrastructure-setup#L361|observability-infrastructure-setup — L361]] (line 361, col 1, score 1)
- [[observability-infrastructure-setup#L361|observability-infrastructure-setup — L361]] (line 361, col 3, score 1)
- [[api-gateway-versioning#L288|api-gateway-versioning — L288]] (line 288, col 1, score 1)
- [[api-gateway-versioning#L288|api-gateway-versioning — L288]] (line 288, col 3, score 1)
- [[promethean-infrastructure-setup#L584|Promethean Infrastructure Setup — L584]] (line 584, col 1, score 1)
- [[promethean-infrastructure-setup#L584|Promethean Infrastructure Setup — L584]] (line 584, col 3, score 1)
- [[promethean-web-ui-setup#L603|Promethean Web UI Setup — L603]] (line 603, col 1, score 1)
- [[promethean-web-ui-setup#L603|Promethean Web UI Setup — L603]] (line 603, col 3, score 1)
- [[prometheus-observability-stack#L510|Prometheus Observability Stack — L510]] (line 510, col 1, score 1)
- [[prometheus-observability-stack#L510|Prometheus Observability Stack — L510]] (line 510, col 3, score 1)
- [[rag-ui-panel-with-qdrant-and-postgrest#L371|RAG UI Panel with Qdrant and PostgREST — L371]] (line 371, col 1, score 0.99)
- [[rag-ui-panel-with-qdrant-and-postgrest#L371|RAG UI Panel with Qdrant and PostgREST — L371]] (line 371, col 3, score 0.99)
- [[pure-typescript-search-microservice#L531|Pure TypeScript Search Microservice — L531]] (line 531, col 1, score 0.99)
- [[pure-typescript-search-microservice#L531|Pure TypeScript Search Microservice — L531]] (line 531, col 3, score 0.99)
- [[rag-ui-panel-with-qdrant-and-postgrest#L373|RAG UI Panel with Qdrant and PostgREST — L373]] (line 373, col 1, score 0.98)
- [[rag-ui-panel-with-qdrant-and-postgrest#L373|RAG UI Panel with Qdrant and PostgREST — L373]] (line 373, col 3, score 0.98)
- [[pure-typescript-search-microservice#L532|Pure TypeScript Search Microservice — L532]] (line 532, col 1, score 0.98)
- [[pure-typescript-search-microservice#L532|Pure TypeScript Search Microservice — L532]] (line 532, col 3, score 0.98)
- [[promethean-infrastructure-setup#L601|Promethean Infrastructure Setup — L601]] (line 601, col 1, score 0.98)
- [[promethean-infrastructure-setup#L601|Promethean Infrastructure Setup — L601]] (line 601, col 3, score 0.98)
- [[pure-typescript-search-microservice#L533|Pure TypeScript Search Microservice — L533]] (line 533, col 1, score 0.98)
- [[pure-typescript-search-microservice#L533|Pure TypeScript Search Microservice — L533]] (line 533, col 3, score 0.98)
- [[promethean-web-ui-setup#L613|Promethean Web UI Setup — L613]] (line 613, col 1, score 0.98)
- [[promethean-web-ui-setup#L613|Promethean Web UI Setup — L613]] (line 613, col 3, score 0.98)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
