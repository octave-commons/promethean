---
uuid: f0528a41-be17-4213-b5bc-7d37fcbef0e0
created_at: local-offline-model-deployment-strategy.md
filename: local-offline-model-deployment-strategy
title: local-offline-model-deployment-strategy
description: >-
  A fully-local, air-gapped deployment strategy that eliminates SaaS
  dependencies and telemetry. Models are served from a local volume, with TEI
  and Haystack configured to run offline using local model paths. Ollama is
  preloaded with models to avoid external pulls.
tags:
  - local
  - air-gapped
  - offline
  - model-deployment
  - tei
  - haystack
  - ollama
  - self-hosted
---
Absolutely. Here’s a **fully-local, air-gapped** revision: no SaaS hooks, no tokens, no phone-home where we can disable it. Models served from a **local `/models`** volume; TEI/Haystack run **offline**. If you haven’t cached models yet, drop them into `./infra/models/**` before starting. ^ref-ad7f1ed3-1-0

---

# 1) Compose deltas — purge SaaS & lock down telemetry

### Remove these services entirely

* `oauth2-proxy` (GitHub provider = SaaS) ^ref-ad7f1ed3-9-0
* Any OpenAI/remote LLM refs (none were in compose, keep it that way) ^ref-ad7f1ed3-10-0

### Keep these (all self-hosted/local): Traefik/NGINX, Grafana, Prometheus, Loki, Tempo, Promtail, cAdvisor, node\_exporter, Portainer, Postgres, Mongo, Redis, Meili, MinIO, OpenSearch, Ollama, TEI, Haystack, SonarQube, Gitea, Drone (with Gitea), Keycloak, CrowdSec, NATS/RabbitMQ/Mosquitto, Temporal, Airflow, Scrapy/Playwright/Selenium, code-server.

### Add a shared models volume

```yaml
volumes:
  models:
```
^ref-ad7f1ed3-16-0

### Mount models + force offline on AI services
 ^ref-ad7f1ed3-23-0
**TEI (embeddings & CLIP)**
 ^ref-ad7f1ed3-25-0
```yaml
  tei-embeddings:
    profiles: ["ai"]
    image: ghcr.io/huggingface/text-embeddings-inference:1.6
    environment:
      - MODEL_ID=/models/nomic-embed-text-v1.5        # local path, not HF id
      - NUM_SHARD=1
      - HF_HUB_OFFLINE=1
      - TRANSFORMERS_OFFLINE=1
    volumes:
      - models:/models:ro
    ports: ["8081:80"]
    networks: [prom-net]
    restart: unless-stopped

  tei-clip:
    profiles: ["ai","vision"]
    image: ghcr.io/huggingface/text-embeddings-inference:1.6
    environment:
      - MODEL_ID=/models/openai-clip-vit-large-patch14  # local path mirror
      - TASK=feature-extraction
      - HF_HUB_OFFLINE=1
      - TRANSFORMERS_OFFLINE=1
    volumes:
      - models:/models:ro
    ports: ["8082:80"]
    networks: [prom-net]
    restart: unless-stopped
^ref-ad7f1ed3-25-0
```

**Haystack (no external pulls)** ^ref-ad7f1ed3-57-0

```yaml
  haystack:
    profiles: ["ai","rag"]
    image: deepset/haystack:base
    environment:
      - PIPELINE_YAML=/app/pipelines/default.yaml
      - HF_HUB_OFFLINE=1
      - TRANSFORMERS_OFFLINE=1
      - TORCH_HOME=/models/torch
      - TRANSFORMERS_CACHE=/models/transformers
    volumes:
      - ./infra/haystack:/app/pipelines
      - models:/models:ro
    ports: ["8000:8000"]
    networks: [prom-net]
    restart: unless-stopped
^ref-ad7f1ed3-57-0
    depends_on: [opensearch, meilisearch, postgres] ^ref-ad7f1ed3-76-0
```
 ^ref-ad7f1ed3-78-0
**Ollama (local only)**
 ^ref-ad7f1ed3-80-0
> To keep it offline, preload models to `./infra/ollama` (modelfiles and blobs) and avoid `ollama pull`.

```yaml
  ollama:
    profiles: ["ai"]
    image: ollama/ollama:0.3.14
    environment:
      - OLLAMA_KEEP_ALIVE=24h
      - OLLAMA_OFFLINE=1
      - NVIDIA_VISIBLE_DEVICES=all
      - NVIDIA_DRIVER_CAPABILITIES=compute,utility
    deploy:
      resources:
        reservations:
          devices:
            - capabilities: ["gpu"]
              driver: "nvidia"
    volumes:
      - ./infra/ollama:/root/.ollama   # local model store
      - /usr/share/fonts:/usr/share/fonts:ro
    ports: ["11434:11434"]
^ref-ad7f1ed3-80-0
    networks: [prom-net]
    restart: unless-stopped
```
^ref-ad7f1ed3-105-0

### Disable analytics/telemetry where possible

```yaml
  grafana:
    environment:
      - GF_SECURITY_ADMIN_USER=${GRAFANA_USER:-admin}
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASS:-admin}
      - GF_ANALYTICS_REPORTING_DISABLED=true
      - GF_ANALYTICS_CHECK_FOR_UPDATES=false
      - GF_SERVER_ROOT_URL=%(protocol)s://%(domain)s/grafana/

  meilisearch:
    environment:
      - MEILI_NO_ANALYTICS=true

  loki:
    environment:
      - LOKI_DISABLE_LOGS_STORAGE_METRICS=true
    # already set: analytics.reporting_enabled: false (in loki config)

  opensearch:
    environment:
      - discovery.type=single-node
      - plugins.security.disabled=true
      - bootstrap.memory_lock=true
      - OPENSEARCH_JAVA_OPTS=-Xms2g -Xmx2g
      - compatibility.override_main_response_version=true
      - logger.deprecation.level=error
      - plugins.query.stage.threshold=0
    # stays local; no telemetry configured

  code-server:
    environment:
      - PASSWORD=${CODE_SERVER_PASSWORD:-code}
      - DO_NOT_TRACK=1

^ref-ad7f1ed3-105-0
  keycloak:
    # Dev mode is fine inside your LAN; stays local.
    command: start-dev ^ref-ad7f1ed3-146-0
^ref-ad7f1ed3-146-0
```
^ref-ad7f1ed3-146-0

### Traefik labels: keep basic auth local (no IdP)
 ^ref-ad7f1ed3-152-0
Use htpasswd and your own secrets file (no OAuth providers). Nothing external here.
 ^ref-ad7f1ed3-152-0
---
 ^ref-ad7f1ed3-156-0
# 2) Haystack pipeline (BM25 only, no model downloads)

If you want **zero model downloads**, return the top-k passages directly (no LLM/reader). You still get a working API.

`infra/haystack/default.yaml`

```yaml
version: 2
components:
  - name: DocumentStore
    type: OpenSearchDocumentStore
    params:
      host: opensearch
      port: 9200
      scheme: http
      index: documents
      verify_certs: false

  - name: Retriever
    type: BM25Retriever
    params:
      document_store: DocumentStore
      top_k: 10

  - name: Joiner
    type: JoinDocuments
    params:
      join_mode: concatenate
      weights: [1.0]

pipelines:
  - name: indexing
    nodes:
      - name: FileTypeRouter
        type: FileTypeRouter
        inputs: [File]
        params:
          mime_types:
            text/plain: TextConverter
      - name: TextConverter
        type: TextConverter
        inputs: [FileTypeRouter]
        params:
          clean_whitespace: true
          clean_empty_lines: true
      - name: Preprocessor
        type: PreProcessor
        inputs: [TextConverter]
        params:
          split_length: 200
          split_overlap: 20
          split_respect_sentence_boundary: true
      - name: DocumentStore
        inputs: [Preprocessor]

  - name: query
    nodes:
^ref-ad7f1ed3-156-0
      - name: Retriever
        inputs: [Query]
      - name: Joiner ^ref-ad7f1ed3-215-0
^ref-ad7f1ed3-217-0
^ref-ad7f1ed3-215-0
        inputs: [Retriever]
^ref-ad7f1ed3-217-0
^ref-ad7f1ed3-215-0
```
^ref-ad7f1ed3-217-0
^ref-ad7f1ed3-215-0

### Optional: **local reader** (still offline)

If you want answers, add a local reader that points to **pre-downloaded weights** in `/models`. Example:

```yaml
  - name: Reader
    type: FARMReader
    params:
      model_name_or_path: /models/deepset-roberta-base-squad2   # local dir
      use_gpu: false
      no_ans_boost: -10

pipelines:
  - name: query
^ref-ad7f1ed3-217-0
    nodes: ^ref-ad7f1ed3-234-0
      - name: Retriever
^ref-ad7f1ed3-234-0 ^ref-ad7f1ed3-240-0
        inputs: [Query]
^ref-ad7f1ed3-240-0
^ref-ad7f1ed3-234-0 ^ref-ad7f1ed3-246-0
      - name: Reader
^ref-ad7f1ed3-249-0
^ref-ad7f1ed3-248-0
^ref-ad7f1ed3-246-0
^ref-ad7f1ed3-240-0
^ref-ad7f1ed3-234-0
^ref-ad7f1ed3-230-0 ^ref-ad7f1ed3-255-0
        inputs: [Retriever] ^ref-ad7f1ed3-248-0
``` ^ref-ad7f1ed3-249-0
^ref-ad7f1ed3-232-0
 ^ref-ad7f1ed3-240-0
Keep `HF_HUB_OFFLINE=1` and ensure `/models/deepset-roberta-base-squad2/**` exists. ^ref-ad7f1ed3-246-0

--- ^ref-ad7f1ed3-248-0
 ^ref-ad7f1ed3-249-0
# 3) TEI with local model dirs (embeddings later) ^ref-ad7f1ed3-255-0
 ^ref-ad7f1ed3-246-0
When you’re ready for vector search, point OpenSearch to embedding fields and **use TEI offline** (above). Your retriever becomes `EmbeddingRetriever` with `embedding_model:  (no tokens needed). Again: models must live under `/models`.
 ^ref-ad7f1ed3-248-0
--- ^ref-ad7f1ed3-249-0
 ^ref-ad7f1ed3-255-0
# 4) Caching models (one-time, offline-friendly)

You have two options:

* **Manual**: copy model directories into `./infra/models/**` so containers see them at `/models/**`.
* **Air-gapped mirror**: on a machine with internet, `git lfs clone` or `huggingface-cli download ...` and then rsync the directories into `./infra/models/`. Inside containers we set `HF_HUB_OFFLINE=1`, so nothing reaches out.

---

# 5) Quick start (local-only)

```bash
# 1) put models in ./infra/models/**
#    e.g. ./infra/models/nomic-embed-text-v1.5, ./infra/models/openai-clip-vit-large-patch14

# 2) bring up core infra
docker compose --profile data --profile observability --profile edge up -d

# 3) bring up AI (offline)
docker compose --profile ai up -d

# 4) bring up RAG API
docker compose --profile rag up -d

# 5) index and query locally
^ref-ad7f1ed3-255-0
docker exec -it haystack bash -lc \
  "haystack pipeline run --pipeline indexing --file /app/pipelines/samples/README.txt"
^ref-ad7f1ed3-283-0
^ref-ad7f1ed3-282-0
^ref-ad7f1ed3-290-0 ^ref-ad7f1ed3-291-0
^ref-ad7f1ed3-288-0 ^ref-ad7f1ed3-292-0
^ref-ad7f1ed3-297-0
^ref-ad7f1ed3-295-0 ^ref-ad7f1ed3-302-0
^ref-ad7f1ed3-293-0
^ref-ad7f1ed3-292-0
^ref-ad7f1ed3-291-0 ^ref-ad7f1ed3-305-0
^ref-ad7f1ed3-290-0 ^ref-ad7f1ed3-306-0
^ref-ad7f1ed3-288-0 ^ref-ad7f1ed3-307-0
^ref-ad7f1ed3-286-0
^ref-ad7f1ed3-283-0
^ref-ad7f1ed3-282-0
^ref-ad7f1ed3-286-0 ^ref-ad7f1ed3-293-0
^ref-ad7f1ed3-283-0
^ref-ad7f1ed3-282-0 ^ref-ad7f1ed3-295-0
 ^ref-ad7f1ed3-286-0
curl -s  \ ^ref-ad7f1ed3-297-0
  -H 'Content-Type: application/json' \ ^ref-ad7f1ed3-288-0
  -d '{"query":"What is in the README?","params":{"Retriever":{"top_k":5}}}' ^ref-ad7f1ed3-282-0
``` ^ref-ad7f1ed3-283-0 ^ref-ad7f1ed3-290-0
 ^ref-ad7f1ed3-291-0
--- ^ref-ad7f1ed3-292-0 ^ref-ad7f1ed3-302-0
 ^ref-ad7f1ed3-286-0 ^ref-ad7f1ed3-293-0
## Sanity notes
 ^ref-ad7f1ed3-288-0 ^ref-ad7f1ed3-295-0 ^ref-ad7f1ed3-305-0
* **No tokens anywhere.** ^ref-ad7f1ed3-306-0
* **No SaaS IdPs.** Use **Keycloak** if you need SSO, all local. ^ref-ad7f1ed3-290-0 ^ref-ad7f1ed3-297-0 ^ref-ad7f1ed3-307-0
* **No model downloads at runtime.** Everything mounted from `/models`. ^ref-ad7f1ed3-291-0
* **Telemetry** disabled where supported. ^ref-ad7f1ed3-292-0
 ^ref-ad7f1ed3-293-0
Want me to spit out a **one-shot script** that validates all mounted model dirs exist (and fails fast) before boot? Or trim the stack further (e.g., drop Portainer/code-server if you want zero optional surfaces)?
 ^ref-ad7f1ed3-295-0 ^ref-ad7f1ed3-302-0
\#infrastructure #airgapped #selfhosted #docker #docker-compose #rag #search #observability #security
