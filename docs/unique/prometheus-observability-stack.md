---
uuid: aa437a1f-eb7e-4096-a6cc-98d2eeeef8c5
created_at: prometheus-observability-stack.md
filename: Prometheus Observability Stack
title: Prometheus Observability Stack
description: >-
  A Docker Compose setup for monitoring and observability with profiles to
  enable selective service deployment. Uses a single internal network and
  supports optional reverse proxies like Traefik or Nginx. Includes Prometheus,
  Grafana, Loki, Tempo, and other tools for comprehensive observability.
tags:
  - docker-compose
  - observability
  - prometheus
  - grafana
  - loki
  - tempo
  - node-exporter
  - traefik
  - nginx
related_to_uuid:
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - 0f6f8f38-98d0-438f-9601-58f478acc0b7
  - f5579967-762d-4cfd-851e-4f71b4cb77a1
  - ae24a280-678e-4c0b-8cc4-56667fa04172
  - fc21f824-4244-4030-a48e-c4170160ea1d
  - a4a25141-6380-40b9-9cd7-b554b246b303
  - 6620e2f2-de6d-45d8-a722-5d26e160b370
  - 5e408692-0e74-400e-a617-84247c7353ad
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - 45cd25b5-ed36-49ab-82c8-10d0903e34db
  - e87bc036-1570-419e-a558-f45b9c0db698
  - c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
  - f1add613-656e-4bec-b52b-193fd78c4642
  - 623a55f7-685c-486b-abaf-469da1bbbb69
  - 9c79206d-4cb9-4f00-87e0-782dcea37bc7
  - d144aa62-348c-4e5d-ae8f-38084c67ceca
  - 5e8b2388-022b-46cf-952c-36ae9b8f0037
  - 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
  - b09141b7-544f-4c8e-8f49-bf76cecaacbb
  - 62bec6f0-4e13-4f38-aca4-72c84ba02367
  - 71726f04-eb1c-42a5-a5fe-d8209de6e159
  - a4d90289-798d-44a0-a8e8-a055ae12fb52
  - 6cb4943e-8267-4e27-8618-2ce0a464d173
  - e979c50f-69bb-48b0-8417-e1ee1b31c0c0
  - ca8e1399-77bf-4f77-82a3-3f703b68706d
related_to_title:
  - Dynamic Context Model for Web Components
  - windows-tiling-with-autohotkey
  - Performance-Optimized-Polyglot-Bridge
  - Promethean-Copilot-Intent-Engine
  - Fnord Tracer Protocol
  - Functional Embedding Pipeline Refactor
  - graph-ds
  - i3-bluetooth-setup
  - Chroma Toolkit Consolidation Plan
  - Diagrams
  - DSL
  - Math Fundamentals
  - Operations
  - Shared
  - polyglot-repl-interface-layer
  - Model Selection for Lightweight Conversational Tasks
  - Eidolon Field Abstract Model
  - field-dynamics-math-blocks
  - field-interaction-equations
  - zero-copy-snapshots-and-workers
  - Duck's Self-Referential Perceptual Loop
  - Factorio AI with External Agents
  - Tooling
  - DuckDuckGoSearchPipeline
  - Obsidian ChatGPT Plugin Integration
references:
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 226
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 705
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 719
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 601
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 1060
    col: 0
    score: 1
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 726
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 996
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 667
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 736
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 645
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 739
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 816
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 1002
    col: 0
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 522
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 469
    col: 0
    score: 1
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 508
    col: 0
    score: 1
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 454
    col: 0
    score: 1
  - uuid: f1add613-656e-4bec-b52b-193fd78c4642
    line: 181
    col: 0
    score: 1
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 440
    col: 0
    score: 1
  - uuid: 623a55f7-685c-486b-abaf-469da1bbbb69
    line: 370
    col: 0
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 408
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 48
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 44
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
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 16
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 23
    col: 0
    score: 1
  - uuid: f1add613-656e-4bec-b52b-193fd78c4642
    line: 74
    col: 0
    score: 1
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 16
    col: 0
    score: 1
  - uuid: 623a55f7-685c-486b-abaf-469da1bbbb69
    line: 7
    col: 0
    score: 1
  - uuid: 557309a3-c906-4e97-8867-89ffe151790c
    line: 9
    col: 0
    score: 1
  - uuid: 6cb4943e-8267-4e27-8618-2ce0a464d173
    line: 8
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 38
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 51
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 79
    col: 0
    score: 1
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 77
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 115
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 61
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 212
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 150
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 86
    col: 0
    score: 1
  - uuid: 5a02283e-4281-4930-9ca7-e27849de11bd
    line: 49
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 59
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 76
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 80
    col: 0
    score: 1
  - uuid: 9b694a91-dec5-4708-9462-3f71000ba925
    line: 48
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 120
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 169
    col: 0
    score: 1
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 74
    col: 0
    score: 1
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 171
    col: 0
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 63
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 47
    col: 0
    score: 1
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 70
    col: 0
    score: 1
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 53
    col: 0
    score: 1
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 48
    col: 0
    score: 1
  - uuid: 623a55f7-685c-486b-abaf-469da1bbbb69
    line: 13
    col: 0
    score: 1
  - uuid: 557309a3-c906-4e97-8867-89ffe151790c
    line: 44
    col: 0
    score: 1
  - uuid: 6cb4943e-8267-4e27-8618-2ce0a464d173
    line: 45
    col: 0
    score: 1
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 47
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 88
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 262
    col: 0
    score: 1
  - uuid: b5e0183e-c34b-44b2-8fc9-a740a1a8d4e2
    line: 84
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 314
    col: 0
    score: 1
  - uuid: 40185d05-010e-45e7-8c2d-2f879bf14218
    line: 26
    col: 0
    score: 1
  - uuid: 5a02283e-4281-4930-9ca7-e27849de11bd
    line: 10
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 43
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 82
    col: 0
    score: 1
  - uuid: 9b694a91-dec5-4708-9462-3f71000ba925
    line: 37
    col: 0
    score: 1
  - uuid: 5c152b08-6b69-4bb8-a1a7-66745789c169
    line: 68
    col: 0
    score: 1
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 294
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 532
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 456
    col: 0
    score: 1
  - uuid: e2135d9f-c69d-47ee-9b17-0b05e98dc748
    line: 17
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1035
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 313
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 255
    col: 0
    score: 1
  - uuid: 86a691ec-ca1f-4350-824c-0ded1f8ebe70
    line: 93
    col: 0
    score: 1
  - uuid: b5e0183e-c34b-44b2-8fc9-a740a1a8d4e2
    line: 98
    col: 0
    score: 1
  - uuid: 40185d05-010e-45e7-8c2d-2f879bf14218
    line: 65
    col: 0
    score: 1
  - uuid: 5f65dfa5-dc97-4a6c-ad93-c45c1312e156
    line: 63
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 226
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 123
    col: 0
    score: 1
  - uuid: e2135d9f-c69d-47ee-9b17-0b05e98dc748
    line: 38
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1090
    col: 0
    score: 1
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 366
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 219
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 258
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 161
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 267
    col: 0
    score: 1
  - uuid: b5e0183e-c34b-44b2-8fc9-a740a1a8d4e2
    line: 100
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 388
    col: 0
    score: 1
---
got it. here’s a plug-and-play `docker-compose.yaml` that wires up everything with **profiles** so you can bring up only what you need. it assumes your infra lives under `./infra/**` (kept away from app source), and everything sits on one internal network `prom-net`. reverse proxy is optional (`traefik` or `nginx`—pick one). ^ref-e90b5a16-1-0

> start examples ^ref-e90b5a16-3-0
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
    image: mcr.microsoft.com/playwright:v1.47.2-jammy
    shm_size: 1gb
    environment:
      - PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
    volumes:
      - ./infra/playwright:/work
    networks: [prom-net]
    restart: unless-stopped

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
      - DRONE_GITEA_SERVER=
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
      - OAUTH2_PROXY_UPSTREAMS=
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
^ref-e90b5a16-7-0 ^ref-e90b5a16-480-0

### minimal config files you’ll likely want (sane defaults)
 ^ref-e90b5a16-483-0
* `./infra/prometheus/prometheus.yml` → scrape `prometheus`, `cadvisor`, `node_exporter`, `loki`
* `./infra/loki/loki-config.yaml` → boltdb-shipper + filesystem ^ref-e90b5a16-485-0
* `./infra/promtail/config.yaml` → `__path__` for `/var/log/*` and docker container logs
* `./infra/nginx/nginx.conf` or traefik labels on target services ^ref-e90b5a16-487-0
* `./infra/mosquitto/mosquitto.conf` → listener 1883 + persistence ^ref-e90b5a16-488-0
* (optional) `./infra/grafana/provisioning/*` → datasources (Prometheus, Loki, Tempo) pre-wired

### quick wins (bring-up order)
 ^ref-e90b5a16-492-0
1. `--profile data` (postgres/redis/minio/meili) ^ref-e90b5a16-493-0
2. `--profile observability` (grafana/prometheus/loki/promtail/cadvisor) ^ref-e90b5a16-494-0
3. `--profile edge` (traefik or nginx) ^ref-e90b5a16-495-0
4. `--profile ai` (ollama + tei) ^ref-e90b5a16-496-0
5. add `--profile messaging`, `--profile workflows`, `--profile crawl` as you need them.
 ^ref-e90b5a16-498-0
if you want, I can also drop in **ready-to-use** sample configs for Prometheus/Loki/Promtail + pre-provisioned Grafana dashboards so you get graphs on first boot.
 ^ref-e90b5a16-500-0
\#docker #docker-compose #infrastructure #observability #ai #rag #search #devtools #security #messaging #workflows #prometheus #grafana #loki #ollama #traefik #nginx #postgres #redis #meilisearch #minio
