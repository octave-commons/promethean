---
uuid: ad7f1ed3-c9bf-4e85-9eeb-6cc4b53155f3
created_at: 2025.08.31.11.12.41.md
filename: Local-Offline-Model-Deployment-Strategy
description: >-
  A fully-local, air-gapped deployment strategy for AI services using
  self-hosted tools. Models served from a local volume with offline capabilities
  disabled for all external hooks. Key services like TEI, Haystack, and Ollama
  run without SaaS dependencies.
tags:
  - local
  - air-gapped
  - offline
  - models
  - TEI
  - Haystack
  - Ollama
  - self-hosted
  - telemetry
  - SaaS
  - deployment
  - deltas
related_to_title:
  - i3-bluetooth-setup
  - Prometheus Observability Stack
  - Migrate to Provider-Tenant Architecture
  - Promethean Full-Stack Docker Setup
  - AI-Centric OS with MCP Layer
  - observability-infrastructure-setup
  - Model Selection for Lightweight Conversational Tasks
  - AI-First-OS-Model-Context-Protocol
  - balanced-bst
related_to_uuid:
  - 5e408692-0e74-400e-a617-84247c7353ad
  - e90b5a16-d58f-424d-bd36-70e9bd2861ad
  - 54382370-1931-4a19-a634-46735708a9ea
  - 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
  - 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
  - b4e64f8c-4dc9-4941-a877-646c5ada068e
  - d144aa62-348c-4e5d-ae8f-38084c67ceca
  - 618198f4-cfad-4677-9df6-0640d8a97bae
  - d3e7db72-2e07-4dae-8920-0e07c499a1e5
references:
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 134
    col: 1
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 134
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
  - uuid: 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
    line: 439
    col: 1
    score: 1
  - uuid: 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
    line: 439
    col: 3
    score: 1
  - uuid: 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
    line: 406
    col: 1
    score: 1
  - uuid: 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
    line: 406
    col: 3
    score: 1
  - uuid: 618198f4-cfad-4677-9df6-0640d8a97bae
    line: 11
    col: 1
    score: 1
  - uuid: 618198f4-cfad-4677-9df6-0640d8a97bae
    line: 11
    col: 3
    score: 1
  - uuid: 618198f4-cfad-4677-9df6-0640d8a97bae
    line: 14
    col: 1
    score: 1
  - uuid: 618198f4-cfad-4677-9df6-0640d8a97bae
    line: 14
    col: 3
    score: 1
  - uuid: d3e7db72-2e07-4dae-8920-0e07c499a1e5
    line: 297
    col: 1
    score: 1
  - uuid: d3e7db72-2e07-4dae-8920-0e07c499a1e5
    line: 297
    col: 3
    score: 1
---
Absolutely. Here’s a **fully-local, air-gapped** revision: no SaaS hooks, no tokens, no phone-home where we can disable it. Models served from a **local `/models`** volume; TEI/Haystack run **offline**. If you haven’t cached models yet, drop them into `./infra/models/**` before starting.

---

# 1) Compose deltas — purge SaaS & lock down telemetry

### Remove these services entirely

* `oauth2-proxy` (GitHub provider = SaaS)
* Any OpenAI/remote LLM refs (none were in compose, keep it that way)

### Keep these (all self-hosted/local): Traefik/NGINX, Grafana, Prometheus, Loki, Tempo, Promtail, cAdvisor, node\_exporter, Portainer, Postgres, Mongo, Redis, Meili, MinIO, OpenSearch, Ollama, TEI, Haystack, SonarQube, Gitea, Drone (with Gitea), Keycloak, CrowdSec, NATS/RabbitMQ/Mosquitto, Temporal, Airflow, Scrapy/Playwright/Selenium, code-server.

### Add a shared models volume

```yaml
volumes:
  models:
```

### Mount models + force offline on AI services

**TEI (embeddings & CLIP)**

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
```

**Haystack (no external pulls)**

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
    depends_on: [opensearch, meilisearch, postgres]
```

**Ollama (local only)**

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
    networks: [prom-net]
    restart: unless-stopped
```

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

  keycloak:
    # Dev mode is fine inside your LAN; stays local.
    command: start-dev
```

### Traefik labels: keep basic auth local (no IdP)

Use htpasswd and your own secrets file (no OAuth providers). Nothing external here.

---

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
      - name: Retriever
        inputs: [Query]
      - name: Joiner
        inputs: [Retriever]
```

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
    nodes:
      - name: Retriever
        inputs: [Query]
      - name: Reader
        inputs: [Retriever]
```

Keep `HF_HUB_OFFLINE=1` and ensure `/models/deepset-roberta-base-squad2/**` exists.

---

# 3) TEI with local model dirs (embeddings later)

When you’re ready for vector search, point OpenSearch to embedding fields and **use TEI offline** (above). Your retriever becomes `EmbeddingRetriever` with `embedding_model: http://tei-embeddings:80` (no tokens needed). Again: models must live under `/models`.

---

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
docker exec -it haystack bash -lc \
  "haystack pipeline run --pipeline indexing --file /app/pipelines/samples/README.txt"

curl -s http://localhost/haystack/pipelines/query/run \
  -H 'Content-Type: application/json' \
  -d '{"query":"What is in the README?","params":{"Retriever":{"top_k":5}}}'
```

---

## Sanity notes

* **No tokens anywhere.**
* **No SaaS IdPs.** Use **Keycloak** if you need SSO, all local.
* **No model downloads at runtime.** Everything mounted from `/models`.
* **Telemetry** disabled where supported.

Want me to spit out a **one-shot script** that validates all mounted model dirs exist (and fails fast) before boot? Or trim the stack further (e.g., drop Portainer/code-server if you want zero optional surfaces)?

\#infrastructure #airgapped #selfhosted #docker #docker-compose #rag #search #observability #security
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [Prometheus Observability Stack](prometheus-observability-stack.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [Promethean Full-Stack Docker Setup](promethean-full-stack-docker-setup.md)
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [observability-infrastructure-setup](observability-infrastructure-setup.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [AI-First-OS-Model-Context-Protocol](ai-first-os-model-context-protocol.md)
- [balanced-bst](balanced-bst.md)

## Sources
- [Model Selection for Lightweight Conversational Tasks — L134](model-selection-for-lightweight-conversational-tasks.md#L134) (line 134, col 1, score 1)
- [Model Selection for Lightweight Conversational Tasks — L134](model-selection-for-lightweight-conversational-tasks.md#L134) (line 134, col 3, score 1)
- [AI-Centric OS with MCP Layer — L403](ai-centric-os-with-mcp-layer.md#L403) (line 403, col 1, score 1)
- [AI-Centric OS with MCP Layer — L403](ai-centric-os-with-mcp-layer.md#L403) (line 403, col 3, score 1)
- [Migrate to Provider-Tenant Architecture — L281](migrate-to-provider-tenant-architecture.md#L281) (line 281, col 1, score 1)
- [Migrate to Provider-Tenant Architecture — L281](migrate-to-provider-tenant-architecture.md#L281) (line 281, col 3, score 1)
- [observability-infrastructure-setup — L361](observability-infrastructure-setup.md#L361) (line 361, col 1, score 1)
- [observability-infrastructure-setup — L361](observability-infrastructure-setup.md#L361) (line 361, col 3, score 1)
- [Promethean Full-Stack Docker Setup — L439](promethean-full-stack-docker-setup.md#L439) (line 439, col 1, score 1)
- [Promethean Full-Stack Docker Setup — L439](promethean-full-stack-docker-setup.md#L439) (line 439, col 3, score 1)
- [AI-Centric OS with MCP Layer — L406](ai-centric-os-with-mcp-layer.md#L406) (line 406, col 1, score 1)
- [AI-Centric OS with MCP Layer — L406](ai-centric-os-with-mcp-layer.md#L406) (line 406, col 3, score 1)
- [AI-First-OS-Model-Context-Protocol — L11](ai-first-os-model-context-protocol.md#L11) (line 11, col 1, score 1)
- [AI-First-OS-Model-Context-Protocol — L11](ai-first-os-model-context-protocol.md#L11) (line 11, col 3, score 1)
- [AI-First-OS-Model-Context-Protocol — L14](ai-first-os-model-context-protocol.md#L14) (line 14, col 1, score 1)
- [AI-First-OS-Model-Context-Protocol — L14](ai-first-os-model-context-protocol.md#L14) (line 14, col 3, score 1)
- [balanced-bst — L297](balanced-bst.md#L297) (line 297, col 1, score 1)
- [balanced-bst — L297](balanced-bst.md#L297) (line 297, col 3, score 1)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
