---
uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
created_at: 2025.08.31.11.04.15.md
filename: Prometheus Observability Stack
description: >-
  A Docker Compose setup for observability tools (Prometheus, Grafana, Loki,
  Tempo, Cadvisor, Node Exporter) with profile-based profiles for flexible
  deployment.
tags:
  - docker
  - compose
  - observability
  - prometheus
  - grafana
  - loki
  - tempo
  - cadvisor
  - node-exporter
related_to_title:
  - observability-infrastructure-setup
  - Promethean Infrastructure Setup
  - Promethean Full-Stack Docker Setup
  - Migrate to Provider-Tenant Architecture
  - Local-Offline-Model-Deployment-Strategy
  - Pure-Node Crawl Stack with Playwright and Crawlee
  - Pure TypeScript Search Microservice
  - AI-Centric OS with MCP Layer
  - Per-Domain Policy System for JS Crawler
  - plan-update-confirmation
  - Promethean Agent Config DSL
  - Promethean Web UI Setup
  - ecs-offload-workers
  - api-gateway-versioning
  - Debugging Broker Connections and Agent Behavior
  - Dynamic Context Model for Web Components
  - RAG UI Panel with Qdrant and PostgREST
  - Cross-Target Macro System in Sibilant
  - 'Agent Tasks: Persistence Migration to DualStore'
  - Chroma Toolkit Consolidation Plan
  - Mongo Outbox Implementation
  - i3-bluetooth-setup
related_to_uuid:
  - b4e64f8c-4dc9-4941-a877-646c5ada068e
  - 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
  - 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
  - 54382370-1931-4a19-a634-46735708a9ea
  - ad7f1ed3-c9bf-4e85-9eeb-6cc4b53155f3
  - d527c05d-22e8-4493-8f29-ae3cb67f035b
  - d17d3a96-c84d-4738-a403-6c733b874da2
  - 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
  - c03020e1-e3e7-48bf-aa7e-aa740c601b63
  - b22d79c6-825b-4cd3-b0d3-1cef0532bb54
  - 2c00ce45-08cf-4b81-9883-6157f30b7fae
  - bc5172ca-7a09-42ad-b418-8e42bb14d089
  - 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
  - 0580dcd3-533d-4834-8a2f-eae3771960a9
  - 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - e1056831-ae0c-460b-95fa-4cf09b3398c6
  - 5f210ca2-54e9-445b-afe4-fb340d4992c5
  - 93d2ba51-8689-49ee-94e2-296092e48058
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
  - 5e408692-0e74-400e-a617-84247c7353ad
references:
  - uuid: b4e64f8c-4dc9-4941-a877-646c5ada068e
    line: 357
    col: 1
    score: 0.9
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 286
    col: 1
    score: 1
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 286
    col: 3
    score: 1
  - uuid: 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
    line: 560
    col: 1
    score: 1
  - uuid: 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
    line: 560
    col: 3
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 575
    col: 1
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 575
    col: 3
    score: 1
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 292
    col: 1
    score: 0.93
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 292
    col: 3
    score: 0.93
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
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 589
    col: 1
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 589
    col: 3
    score: 1
  - uuid: bc5172ca-7a09-42ad-b418-8e42bb14d089
    line: 602
    col: 1
    score: 1
  - uuid: bc5172ca-7a09-42ad-b418-8e42bb14d089
    line: 602
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
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 131
    col: 1
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 131
    col: 3
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 169
    col: 1
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 169
    col: 3
    score: 1
  - uuid: 5f210ca2-54e9-445b-afe4-fb340d4992c5
    line: 175
    col: 1
    score: 1
  - uuid: 5f210ca2-54e9-445b-afe4-fb340d4992c5
    line: 175
    col: 3
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 392
    col: 1
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 392
    col: 3
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 103
    col: 1
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 103
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
  - uuid: bc5172ca-7a09-42ad-b418-8e42bb14d089
    line: 607
    col: 1
    score: 1
  - uuid: bc5172ca-7a09-42ad-b418-8e42bb14d089
    line: 607
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
  - uuid: bc5172ca-7a09-42ad-b418-8e42bb14d089
    line: 603
    col: 1
    score: 1
  - uuid: bc5172ca-7a09-42ad-b418-8e42bb14d089
    line: 603
    col: 3
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 994
    col: 1
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 994
    col: 3
    score: 1
  - uuid: 2c00ce45-08cf-4b81-9883-6157f30b7fae
    line: 315
    col: 1
    score: 1
  - uuid: 2c00ce45-08cf-4b81-9883-6157f30b7fae
    line: 315
    col: 3
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 594
    col: 1
    score: 0.99
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 594
    col: 3
    score: 0.99
---
got it. here’s a plug-and-play `docker-compose.yaml` that wires up everything with **profiles** so you can bring up only what you need. it assumes your infra lives under `./infra/**` (kept away from app source), and everything sits on one internal network `prom-net`. reverse proxy is optional (`traefik` or `nginx`—pick one).

> start examples
> `docker compose --profile observability up -d`
> `docker compose --profile ai --profile data --profile edge up -d`

```yaml
version: "3.9"

networks:
  prom-net:
    driver: bridge

# central volumes (adjust paths as you like)
volumes:
  grafana_data:
  prometheus_data:
  loki_data:
  tempo_data:
  postgres_data:
  mongo_data:
  redis_data:
  meili_data:
  minio_data:
  portainer_data:
  gitea_data:
  drone_data:
  woodpecker_data:
  sonarqube_data:
  nats_data:
  rabbitmq_data:
  mosquitto_data:
  temporal_data:
  airflow_db_data:
  airflow_dags_data:
  code_server_data:
  opensearch_data:

# ---------- EDGE (choose one) ----------
services:
  traefik:
    profiles: ["edge"]
    image: traefik:v3.1
    command:
      - "--providers.docker=true"
      - "--entrypoints.web.address=:80"
      # uncomment if using tls
      # - "--entrypoints.websecure.address=:443"
      # - "--certificatesresolvers.le.acme.tlschallenge=true"
      # - "--certificatesresolvers.le.acme.email=${ACME_EMAIL}"
      # - "--certificatesresolvers.le.acme.storage=/letsencrypt/acme.json"
    ports:
      - "80:80"
      # - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      # - ./infra/traefik/letsencrypt:/letsencrypt
    networks: [prom-net]
    restart: unless-stopped

  edge-nginx:
    profiles: ["edge"]
    image: nginx:1.27-alpine
    ports: ["80:80"]
    volumes:
      - ./infra/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./infra/nginx/secrets:/etc/nginx/secrets:ro
    networks: [prom-net]
    restart: unless-stopped

# ---------- OBSERVABILITY ----------
  prometheus:
    profiles: ["observability"]
    image: prom/prometheus:v3.0.0
    volumes:
      - prometheus_data:/prometheus
      - ./infra/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro
    networks: [prom-net]
    restart: unless-stopped

  grafana:
    profiles: ["observability"]
    image: grafana/grafana:11.2.0
    environment:
      - GF_SECURITY_ADMIN_USER=${GRAFANA_USER:-admin}
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASS:-admin}
    volumes:
      - grafana_data:/var/lib/grafana
      - ./infra/grafana/provisioning:/etc/grafana/provisioning
    ports:
      - "3000:3000"
    networks: [prom-net]
    restart: unless-stopped

  loki:
    profiles: ["observability"]
    image: grafana/loki:3.1.1
    command: ["-config.file=/etc/loki/loki-config.yaml"]
    volumes:
      - loki_data:/loki
      - ./infra/loki/loki-config.yaml:/etc/loki/loki-config.yaml:ro
    networks: [prom-net]
    restart: unless-stopped

  promtail:
    profiles: ["observability"]
    image: grafana/promtail:3.1.1
    command: ["-config.file=/etc/promtail/config.yaml"]
    volumes:
      - /var/log:/var/log:ro
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - ./infra/promtail/config.yaml:/etc/promtail/config.yaml:ro
    networks: [prom-net]
    restart: unless-stopped

  tempo:
    profiles: ["observability"]
    image: grafana/tempo:2.6.0
    command: ["-config.file=/etc/tempo/tempo.yaml"]
    volumes:
      - tempo_data:/var/tempo
      - ./infra/tempo/tempo.yaml:/etc/tempo/tempo.yaml:ro
    networks: [prom-net]
    restart: unless-stopped

  cadvisor:
    profiles: ["observability"]
    image: gcr.io/cadvisor/cadvisor:v0.49.2
    privileged: true
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:rw
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
    ports:
      - "8080:8080"
    networks: [prom-net]
    restart: unless-stopped

  node_exporter:
    profiles: ["observability"]
    image: prom/node-exporter:v1.8.2
    pid: host
    network_mode: host
    restart: unless-stopped

  portainer:
    profiles: ["observability"]
    image: portainer/portainer-ce:2.21.5
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - portainer_data:/data
    ports:
      - "9443:9443"
    networks: [prom-net]
    restart: unless-stopped

# ---------- DATA LAYER ----------
  postgres:
    profiles: ["data"]
    image: postgres:16-alpine
    environment:
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-postgres}
      - POSTGRES_USER=${POSTGRES_USER:-postgres}
      - POSTGRES_DB=${POSTGRES_DB:-app}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports: ["5432:5432"]
    networks: [prom-net]
    restart: unless-stopped

  mongo:
    profiles: ["data"]
    image: mongo:7
    volumes:
      - mongo_data:/data/db
    ports: ["27017:27017"]
    networks: [prom-net]
    restart: unless-stopped

  redis:
    profiles: ["data"]
    image: redis:7-alpine
    command: ["redis-server","--appendonly","yes"]
    volumes:
      - redis_data:/data
    ports: ["6379:6379"]
    networks: [prom-net]
    restart: unless-stopped

  meilisearch:
    profiles: ["data","search"]
    image: getmeili/meilisearch:v1.12
    environment:
      - MEILI_NO_ANALYTICS=true
      - MEILI_MASTER_KEY=${MEILI_MASTER_KEY:-meili}
    volumes:
      - meili_data:/meili_data
    ports: ["7700:7700"]
    networks: [prom-net]
    restart: unless-stopped

  minio:
    profiles: ["data"]
    image: minio/minio:RELEASE.2025-08-07T14-25-00Z
    command: ["server","/data","--console-address",":9001"]
    environment:
      - MINIO_ROOT_USER=${MINIO_ROOT_USER:-minio}
      - MINIO_ROOT_PASSWORD=${MINIO_ROOT_PASSWORD:-minio123}
    volumes:
      - minio_data:/data
    ports:
      - "9000:9000"
      - "9001:9001"
    networks: [prom-net]
    restart: unless-stopped

  opensearch:
    profiles: ["data","search"]
    image: opensearchproject/opensearch:2.17.0
    environment:
      - discovery.type=single-node
      - plugins.security.disabled=true
      - bootstrap.memory_lock=true
      - OPENSEARCH_JAVA_OPTS=-Xms2g -Xmx2g
    ulimits:
      memlock: { soft: -1, hard: -1 }
      nofile:  { soft: 65535, hard: 65535 }
    volumes:
      - opensearch_data:/usr/share/opensearch/data
    ports: ["9200:9200","9600:9600"]
    networks: [prom-net]
    restart: unless-stopped

# ---------- AI / ML ----------
  ollama:
    profiles: ["ai"]
    image: ollama/ollama:0.3.14
    environment:
      - OLLAMA_KEEP_ALIVE=24h
      # enable one of: NVIDIA, ROCR, CPU, or Intel iGPU/NPU via oneAPI host libs
      - NVIDIA_VISIBLE_DEVICES=all
      - NVIDIA_DRIVER_CAPABILITIES=compute,utility
    deploy:
      resources:
        reservations:
          devices:
            - capabilities: ["gpu"]
              driver: "nvidia"
    volumes:
      - /usr/share/fonts:/usr/share/fonts:ro
      - ./infra/ollama:/root/.ollama
    ports: ["11434:11434"]
    networks: [prom-net]
    restart: unless-stopped

  tei-embeddings:
    profiles: ["ai"]
    image: ghcr.io/huggingface/text-embeddings-inference:1.6
    environment:
      - MODEL_ID=${TEI_MODEL:-nomic-ai/nomic-embed-text-v1.5}
      - NUM_SHARD=1
    ports: ["8081:80"]
    networks: [prom-net]
    restart: unless-stopped

  tei-clip:
    profiles: ["ai","vision"]
    image: ghcr.io/huggingface/text-embeddings-inference:1.6
    environment:
      - MODEL_ID=${CLIP_MODEL:-openai/clip-vit-large-patch14}
      - TASK=feature-extraction
    ports: ["8082:80"]
    networks: [prom-net]
    restart: unless-stopped

  haystack:
    profiles: ["ai","rag"]
    image: deepset/haystack:base
    environment:
      - PIPELINE_YAML=/app/pipelines/default.yaml
    volumes:
      - ./infra/haystack:/app/pipelines
    ports: ["8000:8000"]
    networks: [prom-net]
    restart: unless-stopped
    depends_on: [opensearch, meilisearch, postgres]

# ---------- WEB SEARCH / CRAWLING ----------
  scrapy:
    profiles: ["crawl"]
    image: ghcr.io/scrapy/scrapy:2.11
    working_dir: /workspace
    volumes:
      - ./infra/scrapy:/workspace
    networks: [prom-net]
    restart: unless-stopped

  playwright:
    profiles: ["crawl"]
    image: ${PLAYWRIGHT_IMAGE:-mcr.microsoft.com/playwright}:${PLAYWRIGHT_TAG:-v1.55.0-jammy}
    shm_size: 1gb
    environment:
      - PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
    volumes:
      - ./infra/playwright:/work
    networks: [prom-net]
    restart: unless-stopped

> ℹ️ Pin the Playwright base image once in `config/images/playwright.env` and load it with
> `docker compose --env-file config/images/playwright.env ...` so CI and local stacks stay in sync.

  selenium:
    profiles: ["crawl"]
    image: selenium/standalone-chromium:4.24.0
    shm_size: 2gb
    ports: ["4444:4444","7900:7900"]
    networks: [prom-net]
    restart: unless-stopped

# ---------- DEV TOOLING ----------
  sonarqube:
    profiles: ["devtools"]
    image: sonarqube:lts-community
    environment:
      - SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true
    volumes:
      - sonarqube_data:/opt/sonarqube/data
    ports: ["9002:9000"]
    networks: [prom-net]
    restart: unless-stopped

  gitea:
    profiles: ["devtools"]
    image: gitea/gitea:1.22.3
    environment:
      - USER_UID=1000
      - USER_GID=1000
    volumes:
      - gitea_data:/data
    ports:
      - "3001:3000"
      - "222:22"
    networks: [prom-net]
    restart: unless-stopped

  drone-server:
    profiles: ["devtools","ci"]
    image: drone/drone:2
    environment:
      - DRONE_GITEA_SERVER=http://gitea:3000
      - DRONE_RPC_SECRET=${DRONE_RPC_SECRET:-drone-secret}
      - DRONE_SERVER_HOST=${DRONE_SERVER_HOST:-localhost:3003}
      - DRONE_SERVER_PROTO=http
    volumes:
      - drone_data:/data
    ports: ["3003:80"]
    networks: [prom-net]
    restart: unless-stopped

  code-server:
    profiles: ["devtools"]
    image: ghcr.io/coder/code-server:4.95.3
    environment:
      - PASSWORD=${CODE_SERVER_PASSWORD:-code}
    volumes:
      - code_server_data:/home/coder/project
    ports: ["8443:8443"]
    networks: [prom-net]
    restart: unless-stopped

# ---------- SECURITY ----------
  vaultwarden:
    profiles: ["security"]
    image: vaultwarden/server:1.32.7
    environment:
      - SIGNUPS_ALLOWED=false
    volumes:
      - ./infra/vaultwarden:/data
    ports: ["8083:80"]
    networks: [prom-net]
    restart: unless-stopped

  oauth2-proxy:
    profiles: ["security"]
    image: quay.io/oauth2-proxy/oauth2-proxy:v7.6.0
    environment:
      - OAUTH2_PROXY_PROVIDER=github
      - OAUTH2_PROXY_EMAIL_DOMAINS=*
      - OAUTH2_PROXY_UPSTREAMS=http://grafana:3000
      - OAUTH2_PROXY_CLIENT_ID=${OAUTH_CLIENT_ID}
      - OAUTH2_PROXY_CLIENT_SECRET=${OAUTH_CLIENT_SECRET}
      - OAUTH2_PROXY_COOKIE_SECRET=${OAUTH_COOKIE_SECRET}
    ports: ["4180:4180"]
    networks: [prom-net]
    restart: unless-stopped

  keycloak:
    profiles: ["security"]
    image: quay.io/keycloak/keycloak:26.0
    command: start-dev
    environment:
      - KEYCLOAK_ADMIN=${KEYCLOAK_ADMIN:-admin}
      - KEYCLOAK_ADMIN_PASSWORD=${KEYCLOAK_ADMIN_PASSWORD:-admin}
    ports: ["8084:8080"]
    networks: [prom-net]
    restart: unless-stopped

  crowdsec:
    profiles: ["security"]
    image: crowdsecurity/crowdsec:latest
    volumes:
      - /var/log:/var/log:ro
      - ./infra/crowdsec:/etc/crowdsec
    networks: [prom-net]
    restart: unless-stopped

# ---------- MESSAGING ----------
  nats:
    profiles: ["messaging"]
    image: nats:2.10
    command: ["-js","-sd","/data"]
    volumes:
      - nats_data:/data
    ports: ["4222:4222","8222:8222"]
    networks: [prom-net]
    restart: unless-stopped

  rabbitmq:
    profiles: ["messaging"]
    image: rabbitmq:3.13-management
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    ports:
      - "5672:5672"
      - "15672:15672"
    networks: [prom-net]
    restart: unless-stopped

  mosquitto:
    profiles: ["messaging","iot"]
    image: eclipse-mosquitto:2.0
    volumes:
      - ./infra/mosquitto/mosquitto.conf:/mosquitto/config/mosquitto.conf:ro
      - mosquitto_data:/mosquitto/data
    ports: ["1883:1883","9002:9001"]
    networks: [prom-net]
    restart: unless-stopped

# ---------- WORKFLOWS ----------
  temporal:
    profiles: ["workflows"]
    image: temporalio/auto-setup:1.25.1
    environment:
      - DB=postgresql
      - DB_PORT=5432
      - POSTGRES_USER=${POSTGRES_USER:-postgres}
      - POSTGRES_PWD=${POSTGRES_PASSWORD:-postgres}
      - POSTGRES_SEEDS=postgres
    depends_on: [postgres]
    ports:
      - "7233:7233"
    networks: [prom-net]
    restart: unless-stopped

  airflow:
    profiles: ["workflows"]
    image: apache/airflow:2.10.2
    environment:
      - AIRFLOW__CORE__EXECUTOR=LocalExecutor
      - AIRFLOW__DATABASE__SQL_ALCHEMY_CONN=postgresql+psycopg2://postgres:${POSTGRES_PASSWORD:-postgres}@postgres:5432/airflow
      - _AIRFLOW_WWW_USER_USERNAME=${AIRFLOW_USER:-airflow}
      - _AIRFLOW_WWW_USER_PASSWORD=${AIRFLOW_PASS:-airflow}
    user: "50000:0"
    volumes:
      - airflow_dags_data:/opt/airflow/dags
      - airflow_db_data:/opt/airflow
    depends_on: [postgres]
    ports: ["8085:8080"]
    networks: [prom-net]
    restart: unless-stopped
```

### minimal config files you’ll likely want (sane defaults)

* `./infra/prometheus/prometheus.yml` → scrape `prometheus`, `cadvisor`, `node_exporter`, `loki`
* `./infra/loki/loki-config.yaml` → boltdb-shipper + filesystem
* `./infra/promtail/config.yaml` → `__path__` for `/var/log/*` and docker container logs
* `./infra/nginx/nginx.conf` or traefik labels on target services
* `./infra/mosquitto/mosquitto.conf` → listener 1883 + persistence
* (optional) `./infra/grafana/provisioning/*` → datasources (Prometheus, Loki, Tempo) pre-wired

### quick wins (bring-up order)

1. `--profile data` (postgres/redis/minio/meili)
2. `--profile observability` (grafana/prometheus/loki/promtail/cadvisor)
3. `--profile edge` (traefik or nginx)
4. `--profile ai` (ollama + tei)
5. add `--profile messaging`, `--profile workflows`, `--profile crawl` as you need them.

if you want, I can also drop in **ready-to-use** sample configs for Prometheus/Loki/Promtail + pre-provisioned Grafana dashboards so you get graphs on first boot.

\#docker #docker-compose #infrastructure #observability #ai #rag #search #devtools #security #messaging #workflows #prometheus #grafana #loki #ollama #traefik #nginx #postgres #redis #meilisearch #minio
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
<<<<<<< HEAD
- [[dynamic-context-model-for-web-components|Dynamic Context Model for Web Components]]
- [[windows-tiling-with-autohotkey]]
- [[performance-optimized-polyglot-bridge]]
- [[promethean-copilot-intent-engine]]
- [[fnord-tracer-protocol|Fnord Tracer Protocol]]
- [[functional-embedding-pipeline-refactor|Functional Embedding Pipeline Refactor]]
- [[graph-ds]]
- [[i3-bluetooth-setup]]
- [[chroma-toolkit-consolidation-plan|Chroma Toolkit Consolidation Plan]]
- [[polyglot-repl-interface-layer]]
- [[model-selection-for-lightweight-conversational-tasks|Model Selection for Lightweight Conversational Tasks]]
- [[eidolon-field-abstract-model|Eidolon Field Abstract Model]]
- [[docs/unique/field-dynamics-math-blocks|field-dynamics-math-blocks]]
- [[docs/unique/field-interaction-equations|field-interaction-equations]]
- [[docs/unique/zero-copy-snapshots-and-workers|zero-copy-snapshots-and-workers]]
- [[ducks-self-referential-perceptual-loop|Duck's Self-Referential Perceptual Loop]]
- [[factorio-ai-with-external-agents|Factorio AI with External Agents]]
- [DuckDuckGoSearchPipeline](duckduckgosearchpipeline.md)
- [[obsidian-chatgpt-plugin-integration|Obsidian ChatGPT Plugin Integration]]
- [[obsidian-templating-plugins-integration-guide|Obsidian Templating Plugins Integration Guide]]
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [[eidolon-node-lifecycle]]
- [[docs/unique/typed-struct-compiler|typed-struct-compiler]]
- [[typescript-patch-for-tool-calling-support|TypeScript Patch for Tool Calling Support]]
- [[promethean-infrastructure-setup|Promethean Infrastructure Setup]]
## Sources
- [[docops-feature-updates#^ref-2792d448-226-0|Docops Feature Updates — L226]] (line 226, col 0, score 1)
- [[field-node-diagram-outline#^ref-1f32c94a-705-0|field-node-diagram-outline — L705]] (line 705, col 0, score 1)
- [[field-node-diagram-set#^ref-22b989d5-719-0|field-node-diagram-set — L719]] (line 719, col 0, score 1)
- [field-node-diagram-visualizations — L601](field-node-diagram-visualizations.md#^ref-e9b27b06-601-0) (line 601, col 0, score 1)
- [[fnord-tracer-protocol#^ref-fc21f824-1060-0|Fnord Tracer Protocol — L1060]] (line 1060, col 0, score 1)
- [[functional-embedding-pipeline-refactor#^ref-a4a25141-726-0|Functional Embedding Pipeline Refactor — L726]] (line 726, col 0, score 1)
- [[graph-ds#^ref-6620e2f2-996-0|graph-ds — L996]] (line 996, col 0, score 1)
- [[heartbeat-fragment-demo#^ref-dd00677a-667-0|heartbeat-fragment-demo — L667]] (line 667, col 0, score 1)
- [[i3-bluetooth-setup#^ref-5e408692-736-0|i3-bluetooth-setup — L736]] (line 736, col 0, score 1)
- [[ice-box-reorganization#^ref-291c7d91-645-0|Ice Box Reorganization — L645]] (line 645, col 0, score 1)
- [komorebi-group-window-hack — L739](komorebi-group-window-hack.md#^ref-dd89372d-739-0) (line 739, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L816](layer1survivabilityenvelope.md#^ref-64a9f9f9-816-0) (line 816, col 0, score 1)
- [Docops Feature Updates — L44](docops-feature-updates-3.md#^ref-cdbd21ee-44-0) (line 44, col 0, score 1)
- [[docops-feature-updates#^ref-2792d448-61-0|Docops Feature Updates — L61]] (line 61, col 0, score 1)
- [[ducks-attractor-states#^ref-13951643-99-0|Duck's Attractor States — L99]] (line 99, col 0, score 1)
- [[ducks-self-referential-perceptual-loop#^ref-71726f04-80-0|Duck's Self-Referential Perceptual Loop — L80]] (line 80, col 0, score 1)
- [[dynamic-context-model-for-web-components#^ref-f7702bf8-405-0|Dynamic Context Model for Web Components — L405]] (line 405, col 0, score 1)
- [[eidolon-field-abstract-model#^ref-5e8b2388-216-0|Eidolon Field Abstract Model — L216]] (line 216, col 0, score 1)
- [[factorio-ai-with-external-agents#^ref-a4d90289-189-0|Factorio AI with External Agents — L189]] (line 189, col 0, score 1)
- [[docs/unique/field-interaction-equations#^ref-b09141b7-172-0|field-interaction-equations — L172]] (line 172, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L175](layer1survivabilityenvelope.md#^ref-64a9f9f9-175-0) (line 175, col 0, score 1)
- [[mathematical-samplers#^ref-86a691ec-90-0|Mathematical Samplers — L90]] (line 90, col 0, score 1)
- [[migrate-to-provider-tenant-architecture#^ref-54382370-298-0|Migrate to Provider-Tenant Architecture — L298]] (line 298, col 0, score 1)
- [[promethean-chat-activity-report#^ref-18344cf9-48-0|Promethean Chat Activity Report — L48]] (line 48, col 0, score 1)
- [[creative-moments#^ref-10d98225-38-0|Creative Moments — L38]] (line 38, col 0, score 1)
- [Docops Feature Updates — L51](docops-feature-updates-3.md#^ref-cdbd21ee-51-0) (line 51, col 0, score 1)
- [[docops-feature-updates#^ref-2792d448-79-0|Docops Feature Updates — L79]] (line 79, col 0, score 1)
- [DuckDuckGoSearchPipeline — L77](duckduckgosearchpipeline.md#^ref-e979c50f-77-0) (line 77, col 0, score 1)
- [[ducks-attractor-states#^ref-13951643-115-0|Duck's Attractor States — L115]] (line 115, col 0, score 1)
- [[ducks-self-referential-perceptual-loop#^ref-71726f04-61-0|Duck's Self-Referential Perceptual Loop — L61]] (line 61, col 0, score 1)
- [[eidolon-field-abstract-model#^ref-5e8b2388-212-0|Eidolon Field Abstract Model — L212]] (line 212, col 0, score 1)
- [[docs/unique/eidolon-field-math-foundations#^ref-008f2ac0-150-0|eidolon-field-math-foundations — L150]] (line 150, col 0, score 1)
- [[model-upgrade-calm-down-guide#^ref-db74343f-86-0|Model Upgrade Calm-Down Guide — L86]] (line 86, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L49](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-49-0) (line 49, col 0, score 1)
- [[obsidian-chatgpt-plugin-integration-guide#^ref-1d3d6c3a-59-0|Obsidian ChatGPT Plugin Integration Guide — L59]] (line 59, col 0, score 1)
- [[obsidian-chatgpt-plugin-integration#^ref-ca8e1399-76-0|Obsidian ChatGPT Plugin Integration — L76]] (line 76, col 0, score 1)
- [[docs/unique/obsidian-ignore-node-modules-regex#^ref-ffb9b2a9-80-0|obsidian-ignore-node-modules-regex — L80]] (line 80, col 0, score 1)
- [[obsidian-task-generation#^ref-9b694a91-48-0|Obsidian Task Generation — L48]] (line 48, col 0, score 1)
- [[obsidian-templating-plugins-integration-guide#^ref-b39dc9d4-120-0|Obsidian Templating Plugins Integration Guide — L120]] (line 120, col 0, score 1)
- [[reawakening-duck#^ref-59b5670f-169-0|Reawakening Duck — L169]] (line 169, col 0, score 1)
- [[redirecting-standard-error#^ref-b3555ede-74-0|Redirecting Standard Error — L74]] (line 74, col 0, score 1)
- [[docs/unique/ripple-propagation-demo#^ref-8430617b-171-0|ripple-propagation-demo — L171]] (line 171, col 0, score 1)
- [komorebi-group-window-hack — L262](komorebi-group-window-hack.md#^ref-dd89372d-262-0) (line 262, col 0, score 1)
- [[mathematics-sampler#^ref-b5e0183e-84-0|Mathematics Sampler — L84]] (line 84, col 0, score 1)
- [[migrate-to-provider-tenant-architecture#^ref-54382370-314-0|Migrate to Provider-Tenant Architecture — L314]] (line 314, col 0, score 1)
- [[mindful-prioritization#^ref-40185d05-26-0|Mindful Prioritization — L26]] (line 26, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L10](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-10-0) (line 10, col 0, score 1)
- [[obsidian-chatgpt-plugin-integration#^ref-ca8e1399-43-0|Obsidian ChatGPT Plugin Integration — L43]] (line 43, col 0, score 1)
- [[docs/unique/obsidian-ignore-node-modules-regex#^ref-ffb9b2a9-82-0|obsidian-ignore-node-modules-regex — L82]] (line 82, col 0, score 1)
- [[obsidian-task-generation#^ref-9b694a91-37-0|Obsidian Task Generation — L37]] (line 37, col 0, score 1)
- [[openapi-validation-report#^ref-5c152b08-68-0|OpenAPI Validation Report — L68]] (line 68, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L294](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-294-0) (line 294, col 0, score 1)
- [[per-domain-policy-system-for-js-crawler#^ref-c03020e1-532-0|Per-Domain Policy System for JS Crawler — L532]] (line 532, col 0, score 1)
- [[performance-optimized-polyglot-bridge#^ref-f5579967-456-0|Performance-Optimized-Polyglot-Bridge — L456]] (line 456, col 0, score 1)
- [[pipeline-enhancements#^ref-e2135d9f-17-0|Pipeline Enhancements — L17]] (line 17, col 0, score 1)
- [plan-update-confirmation — L1035](plan-update-confirmation.md#^ref-b22d79c6-1035-0) (line 1035, col 0, score 1)
- [komorebi-group-window-hack — L313](komorebi-group-window-hack.md#^ref-dd89372d-313-0) (line 313, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L255](layer1survivabilityenvelope.md#^ref-64a9f9f9-255-0) (line 255, col 0, score 1)
- [[mathematical-samplers#^ref-86a691ec-93-0|Mathematical Samplers — L93]] (line 93, col 0, score 1)
- [[mathematics-sampler#^ref-b5e0183e-98-0|Mathematics Sampler — L98]] (line 98, col 0, score 1)
- [[mindful-prioritization#^ref-40185d05-65-0|Mindful Prioritization — L65]] (line 65, col 0, score 1)
- [MindfulRobotIntegration — L63](mindfulrobotintegration.md#^ref-5f65dfa5-63-0) (line 63, col 0, score 1)
- [[model-selection-for-lightweight-conversational-tasks#^ref-d144aa62-226-0|Model Selection for Lightweight Conversational Tasks — L226]] (line 226, col 0, score 1)
- [[model-upgrade-calm-down-guide#^ref-db74343f-123-0|Model Upgrade Calm-Down Guide — L123]] (line 123, col 0, score 1)
- [[pipeline-enhancements#^ref-e2135d9f-38-0|Pipeline Enhancements — L38]] (line 38, col 0, score 1)
- [plan-update-confirmation — L1090](plan-update-confirmation.md#^ref-b22d79c6-1090-0) (line 1090, col 0, score 1)
- [[functional-embedding-pipeline-refactor#^ref-a4a25141-366-0|Functional Embedding Pipeline Refactor — L366]] (line 366, col 0, score 1)
- [[heartbeat-fragment-demo#^ref-dd00677a-219-0|heartbeat-fragment-demo — L219]] (line 219, col 0, score 1)
- [[homeostasis-decay-formulas#^ref-37b5d236-258-0|homeostasis-decay-formulas — L258]] (line 258, col 0, score 1)
- [[ice-box-reorganization#^ref-291c7d91-161-0|Ice Box Reorganization — L161]] (line 161, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L267](layer1survivabilityenvelope.md#^ref-64a9f9f9-267-0) (line 267, col 0, score 1)
- [[mathematics-sampler#^ref-b5e0183e-100-0|Mathematics Sampler — L100]] (line 100, col 0, score 1)
- [[migrate-to-provider-tenant-architecture#^ref-54382370-388-0|Migrate to Provider-Tenant Architecture — L388]] (line 388, col 0, score 1)
- [[mindful-prioritization#^ref-40185d05-69-0|Mindful Prioritization — L69]] (line 69, col 0, score 1)
- [MindfulRobotIntegration — L67](mindfulrobotintegration.md#^ref-5f65dfa5-67-0) (line 67, col 0, score 1)
- [[model-selection-for-lightweight-conversational-tasks#^ref-d144aa62-234-0|Model Selection for Lightweight Conversational Tasks — L234]] (line 234, col 0, score 1)
- [[model-upgrade-calm-down-guide#^ref-db74343f-129-0|Model Upgrade Calm-Down Guide — L129]] (line 129, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L74](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-74-0) (line 74, col 0, score 1)
- [[obsidian-chatgpt-plugin-integration-guide#^ref-1d3d6c3a-130-0|Obsidian ChatGPT Plugin Integration Guide — L130]] (line 130, col 0, score 1)
- [[obsidian-chatgpt-plugin-integration#^ref-ca8e1399-131-0|Obsidian ChatGPT Plugin Integration — L131]] (line 131, col 0, score 1)
- [Docops Feature Updates — L85](docops-feature-updates-3.md#^ref-cdbd21ee-85-0) (line 85, col 0, score 1)
- [[ducks-attractor-states#^ref-13951643-93-0|Duck's Attractor States — L93]] (line 93, col 0, score 1)
- [[ducks-self-referential-perceptual-loop#^ref-71726f04-64-0|Duck's Self-Referential Perceptual Loop — L64]] (line 64, col 0, score 1)
- [[factorio-ai-with-external-agents#^ref-a4d90289-153-0|Factorio AI with External Agents — L153]] (line 153, col 0, score 1)
- [[docs/unique/field-dynamics-math-blocks#^ref-7cfc230d-141-0|field-dynamics-math-blocks — L141]] (line 141, col 0, score 1)
- [[creative-moments#^ref-10d98225-28-0|Creative Moments — L28]] (line 28, col 0, score 1)
- [Docops Feature Updates — L65](docops-feature-updates-3.md#^ref-cdbd21ee-65-0) (line 65, col 0, score 1)
- [[docops-feature-updates#^ref-2792d448-86-0|Docops Feature Updates — L86]] (line 86, col 0, score 1)
- [[ducks-attractor-states#^ref-13951643-123-0|Duck's Attractor States — L123]] (line 123, col 0, score 1)
- [[ducks-self-referential-perceptual-loop#^ref-71726f04-34-0|Duck's Self-Referential Perceptual Loop — L34]] (line 34, col 0, score 1)
- [[dynamic-context-model-for-web-components#^ref-f7702bf8-442-0|Dynamic Context Model for Web Components — L442]] (line 442, col 0, score 1)
- [[eidolon-field-abstract-model#^ref-5e8b2388-218-0|Eidolon Field Abstract Model — L218]] (line 218, col 0, score 1)
- [[docs/unique/eidolon-field-math-foundations#^ref-008f2ac0-176-0|eidolon-field-math-foundations — L176]] (line 176, col 0, score 1)
- [[eidolon-node-lifecycle#^ref-938eca9c-70-0|eidolon-node-lifecycle — L70]] (line 70, col 0, score 1)
- [[docs/unique/eidolon-field-math-foundations#^ref-008f2ac0-148-0|eidolon-field-math-foundations — L148]] (line 148, col 0, score 1)
- [[eidolon-node-lifecycle#^ref-938eca9c-36-0|eidolon-node-lifecycle — L36]] (line 36, col 0, score 1)
- [[factorio-ai-with-external-agents#^ref-a4d90289-166-0|Factorio AI with External Agents — L166]] (line 166, col 0, score 1)
- [[docs/unique/field-dynamics-math-blocks#^ref-7cfc230d-148-0|field-dynamics-math-blocks — L148]] (line 148, col 0, score 1)
- [[docs/unique/field-interaction-equations#^ref-b09141b7-153-0|field-interaction-equations — L153]] (line 153, col 0, score 1)
- [[field-node-diagram-outline#^ref-1f32c94a-118-0|field-node-diagram-outline — L118]] (line 118, col 0, score 1)
=======
- [[observability-infrastructure-setup]]
- [[promethean-infrastructure-setup|Promethean Infrastructure Setup]]
- [[promethean-full-stack-docker-setup|Promethean Full-Stack Docker Setup]]
- [[migrate-to-provider-tenant-architecture|Migrate to Provider-Tenant Architecture]]
- [[local-offline-model-deployment-strategy]]
- [[pure-node-crawl-stack-with-playwright-and-crawlee|Pure-Node Crawl Stack with Playwright and Crawlee]]
- [[pure-typescript-search-microservice|Pure TypeScript Search Microservice]]
- [[ai-centric-os-with-mcp-layer|AI-Centric OS with MCP Layer]]
- [[per-domain-policy-system-for-js-crawler|Per-Domain Policy System for JS Crawler]]
- [plan-update-confirmation](plan-update-confirmation.md)
- [[promethean-agent-config-dsl|Promethean Agent Config DSL]]
- [[promethean-web-ui-setup|Promethean Web UI Setup]]
- [[docs/unique/ecs-offload-workers|ecs-offload-workers]]
- [[api-gateway-versioning]]
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [[dynamic-context-model-for-web-components|Dynamic Context Model for Web Components]]
- [[rag-ui-panel-with-qdrant-and-postgrest|RAG UI Panel with Qdrant and PostgREST]]
- [[cross-target-macro-system-in-sibilant|Cross-Target Macro System in Sibilant]]
- [[docs/unique/agent-tasks-persistence-migration-to-dualstore|Agent Tasks: Persistence Migration to DualStore]]
- [[chroma-toolkit-consolidation-plan|Chroma Toolkit Consolidation Plan]]
- [[mongo-outbox-implementation|Mongo Outbox Implementation]]
- [[i3-bluetooth-setup]]

## Sources
- [[observability-infrastructure-setup#L357|observability-infrastructure-setup — L357]] (line 357, col 1, score 0.9)
- [[api-gateway-versioning#L286|api-gateway-versioning — L286]] (line 286, col 1, score 1)
- [[api-gateway-versioning#L286|api-gateway-versioning — L286]] (line 286, col 3, score 1)
- [[mongo-outbox-implementation#L560|Mongo Outbox Implementation — L560]] (line 560, col 1, score 1)
- [[mongo-outbox-implementation#L560|Mongo Outbox Implementation — L560]] (line 560, col 3, score 1)
- [[promethean-infrastructure-setup#L575|Promethean Infrastructure Setup — L575]] (line 575, col 1, score 1)
- [[promethean-infrastructure-setup#L575|Promethean Infrastructure Setup — L575]] (line 575, col 3, score 1)
- [[api-gateway-versioning#L292|api-gateway-versioning — L292]] (line 292, col 1, score 0.93)
- [[api-gateway-versioning#L292|api-gateway-versioning — L292]] (line 292, col 3, score 0.93)
- [[api-gateway-versioning#L284|api-gateway-versioning — L284]] (line 284, col 1, score 1)
- [[api-gateway-versioning#L284|api-gateway-versioning — L284]] (line 284, col 3, score 1)
- [Debugging Broker Connections and Agent Behavior — L40](debugging-broker-connections-and-agent-behavior.md#L40) (line 40, col 1, score 1)
- [Debugging Broker Connections and Agent Behavior — L40](debugging-broker-connections-and-agent-behavior.md#L40) (line 40, col 3, score 1)
- [[dynamic-context-model-for-web-components#L384|Dynamic Context Model for Web Components — L384]] (line 384, col 1, score 1)
- [[dynamic-context-model-for-web-components#L384|Dynamic Context Model for Web Components — L384]] (line 384, col 3, score 1)
- [[docs/unique/ecs-offload-workers#L458|ecs-offload-workers — L458]] (line 458, col 1, score 1)
- [[docs/unique/ecs-offload-workers#L458|ecs-offload-workers — L458]] (line 458, col 3, score 1)
- [[promethean-infrastructure-setup#L589|Promethean Infrastructure Setup — L589]] (line 589, col 1, score 1)
- [[promethean-infrastructure-setup#L589|Promethean Infrastructure Setup — L589]] (line 589, col 3, score 1)
- [[promethean-web-ui-setup#L602|Promethean Web UI Setup — L602]] (line 602, col 1, score 1)
- [[promethean-web-ui-setup#L602|Promethean Web UI Setup — L602]] (line 602, col 3, score 1)
- [[pure-typescript-search-microservice#L526|Pure TypeScript Search Microservice — L526]] (line 526, col 1, score 1)
- [[pure-typescript-search-microservice#L526|Pure TypeScript Search Microservice — L526]] (line 526, col 3, score 1)
- [[rag-ui-panel-with-qdrant-and-postgrest#L362|RAG UI Panel with Qdrant and PostgREST — L362]] (line 362, col 1, score 1)
- [[rag-ui-panel-with-qdrant-and-postgrest#L362|RAG UI Panel with Qdrant and PostgREST — L362]] (line 362, col 3, score 1)
- [[docs/unique/agent-tasks-persistence-migration-to-dualstore#L131|Agent Tasks: Persistence Migration to DualStore — L131]] (line 131, col 1, score 1)
- [[docs/unique/agent-tasks-persistence-migration-to-dualstore#L131|Agent Tasks: Persistence Migration to DualStore — L131]] (line 131, col 3, score 1)
- [[chroma-toolkit-consolidation-plan#L169|Chroma Toolkit Consolidation Plan — L169]] (line 169, col 1, score 1)
- [[chroma-toolkit-consolidation-plan#L169|Chroma Toolkit Consolidation Plan — L169]] (line 169, col 3, score 1)
- [[cross-target-macro-system-in-sibilant#L175|Cross-Target Macro System in Sibilant — L175]] (line 175, col 1, score 1)
- [[cross-target-macro-system-in-sibilant#L175|Cross-Target Macro System in Sibilant — L175]] (line 175, col 3, score 1)
- [[dynamic-context-model-for-web-components#L392|Dynamic Context Model for Web Components — L392]] (line 392, col 1, score 1)
- [[dynamic-context-model-for-web-components#L392|Dynamic Context Model for Web Components — L392]] (line 392, col 3, score 1)
- [[i3-bluetooth-setup#L103|i3-bluetooth-setup — L103]] (line 103, col 1, score 1)
- [[i3-bluetooth-setup#L103|i3-bluetooth-setup — L103]] (line 103, col 3, score 1)
- [[per-domain-policy-system-for-js-crawler#L471|Per-Domain Policy System for JS Crawler — L471]] (line 471, col 1, score 1)
- [[per-domain-policy-system-for-js-crawler#L471|Per-Domain Policy System for JS Crawler — L471]] (line 471, col 3, score 1)
- [[promethean-infrastructure-setup#L580|Promethean Infrastructure Setup — L580]] (line 580, col 1, score 1)
- [[promethean-infrastructure-setup#L580|Promethean Infrastructure Setup — L580]] (line 580, col 3, score 1)
- [[promethean-web-ui-setup#L607|Promethean Web UI Setup — L607]] (line 607, col 1, score 1)
- [[promethean-web-ui-setup#L607|Promethean Web UI Setup — L607]] (line 607, col 3, score 1)
- [[per-domain-policy-system-for-js-crawler#L488|Per-Domain Policy System for JS Crawler — L488]] (line 488, col 1, score 0.95)
- [[per-domain-policy-system-for-js-crawler#L488|Per-Domain Policy System for JS Crawler — L488]] (line 488, col 3, score 0.95)
- [[api-gateway-versioning#L288|api-gateway-versioning — L288]] (line 288, col 1, score 1)
- [[api-gateway-versioning#L288|api-gateway-versioning — L288]] (line 288, col 3, score 1)
- [[promethean-full-stack-docker-setup#L440|Promethean Full-Stack Docker Setup — L440]] (line 440, col 1, score 1)
- [[promethean-full-stack-docker-setup#L440|Promethean Full-Stack Docker Setup — L440]] (line 440, col 3, score 1)
- [[promethean-infrastructure-setup#L584|Promethean Infrastructure Setup — L584]] (line 584, col 1, score 1)
- [[promethean-infrastructure-setup#L584|Promethean Infrastructure Setup — L584]] (line 584, col 3, score 1)
- [[promethean-web-ui-setup#L603|Promethean Web UI Setup — L603]] (line 603, col 1, score 1)
- [[promethean-web-ui-setup#L603|Promethean Web UI Setup — L603]] (line 603, col 3, score 1)
- [plan-update-confirmation — L994](plan-update-confirmation.md#L994) (line 994, col 1, score 1)
- [plan-update-confirmation — L994](plan-update-confirmation.md#L994) (line 994, col 3, score 1)
- [[promethean-agent-config-dsl#L315|Promethean Agent Config DSL — L315]] (line 315, col 1, score 1)
- [[promethean-agent-config-dsl#L315|Promethean Agent Config DSL — L315]] (line 315, col 3, score 1)
- [[promethean-infrastructure-setup#L594|Promethean Infrastructure Setup — L594]] (line 594, col 1, score 0.99)
- [[promethean-infrastructure-setup#L594|Promethean Infrastructure Setup — L594]] (line 594, col 3, score 0.99)
>>>>>>> stealth/obsidian
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
