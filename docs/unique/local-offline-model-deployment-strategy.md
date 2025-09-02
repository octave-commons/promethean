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
related_to_title: []
related_to_uuid: []
references: []
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
 ^ref-ad7f1ed3-240-0
Keep `HF_HUB_OFFLINE=1` and ensure `/models/deepset-roberta-base-squad2/**` exists. ^ref-ad7f1ed3-246-0

--- ^ref-ad7f1ed3-248-0
 ^ref-ad7f1ed3-249-0
# 3) TEI with local model dirs (embeddings later) ^ref-ad7f1ed3-255-0
 ^ref-ad7f1ed3-246-0
When you’re ready for vector search, point OpenSearch to embedding fields and **use TEI offline** (above). Your retriever becomes `EmbeddingRetriever` with `embedding_model: http://tei-embeddings:80` (no tokens needed). Again: models must live under `/models`.
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
curl -s http://localhost/haystack/pipelines/query/run \ ^ref-ad7f1ed3-297-0
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
\#infrastructure #airgapped #selfhosted #docker #docker-compose #rag #search #observability #security<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
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
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [Board Automation Improvements](board-automation-improvements.md)
- [Operations](chunks/operations.md)
- [Services](chunks/services.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [Event Bus MVP](event-bus-mvp.md)
- [Diagrams](chunks/diagrams.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [2d-sandbox-field](2d-sandbox-field.md)
- [Admin Dashboard for User Management](admin-dashboard-for-user-management.md)
- [field-interaction-equations](field-interaction-equations.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler](ollama-llm-provider-for-pseudo-code-transpiler.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [prom-lib-rate-limiters-and-replay-api](prom-lib-rate-limiters-and-replay-api.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [plan-update-confirmation](plan-update-confirmation.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [Tooling](chunks/tooling.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [markdown-to-org-transpiler](markdown-to-org-transpiler.md)
- [EidolonField](eidolonfield.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [DSL](chunks/dsl.md)
- [JavaScript](chunks/javascript.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [Window Management](chunks/window-management.md)
- [Creative Moments](creative-moments.md)
- [DuckDuckGoSearchPipeline](duckduckgosearchpipeline.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [Shared](chunks/shared.md)
- [Post-Linguistic Transhuman Design Frameworks](post-linguistic-transhuman-design-frameworks.md)
- [Promethean Chat Activity Report](promethean-chat-activity-report.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [Protocol_0_The_Contradiction_Engine](protocol-0-the-contradiction-engine.md)
- [Model Upgrade Calm-Down Guide](model-upgrade-calm-down-guide.md)
- [NPU Voice Code and Sensory Integration](npu-voice-code-and-sensory-integration.md)
- [Obsidian Templating Plugins Integration Guide](obsidian-templating-plugins-integration-guide.md)
- [OpenAPI Validation Report](openapi-validation-report.md)
- [Optimizing Command Limitations in System Design](optimizing-command-limitations-in-system-design.md)
- [pm2-orchestration-patterns](pm2-orchestration-patterns.md)
- [Mindful Prioritization](mindful-prioritization.md)
- [MindfulRobotIntegration](mindfulrobotintegration.md)
- [Obsidian ChatGPT Plugin Integration Guide](obsidian-chatgpt-plugin-integration-guide.md)
- [Obsidian ChatGPT Plugin Integration](obsidian-chatgpt-plugin-integration.md)
- [Obsidian Task Generation](obsidian-task-generation.md)
- [Lisp-Compiler-Integration](lisp-compiler-integration.md)
- [Lispy Macros with syntax-rules](lispy-macros-with-syntax-rules.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [Shared Package Structure](shared-package-structure.md)
- [i3-config-validation-methods](i3-config-validation-methods.md)
- [Pure-Node Crawl Stack with Playwright and Crawlee](pure-node-crawl-stack-with-playwright-and-crawlee.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [Promethean Web UI Setup](promethean-web-ui-setup.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [Provider-Agnostic Chat Panel Implementation](provider-agnostic-chat-panel-implementation.md)
- [obsidian-ignore-node-modules-regex](obsidian-ignore-node-modules-regex.md)
- [promethean-system-diagrams](promethean-system-diagrams.md)
- [Promethean Workflow Optimization](promethean-workflow-optimization.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [Pure TypeScript Search Microservice](pure-typescript-search-microservice.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [Self-Agency in AI Interaction](self-agency-in-ai-interaction.md)
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [shared-package-layout-clarification](shared-package-layout-clarification.md)
- [Chroma-Embedding-Refactor](chroma-embedding-refactor.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [archetype-ecs](archetype-ecs.md)
- [Functional Embedding Pipeline Refactor](functional-embedding-pipeline-refactor.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [schema-evolution-workflow](schema-evolution-workflow.md)
- [set-assignment-in-lisp-ast](set-assignment-in-lisp-ast.md)
- [Docops Feature Updates](docops-feature-updates.md)
- [TypeScript Patch for Tool Calling Support](typescript-patch-for-tool-calling-support.md)
- [Refactor Frontmatter Processing](refactor-frontmatter-processing.md)
- [Docops Feature Updates](docops-feature-updates-3.md)
- [The Jar of Echoes](the-jar-of-echoes.md)
- [Fnord Tracer Protocol](fnord-tracer-protocol.md)
- [Promethean Pipelines](promethean-pipelines.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [Promethean Pipelines: Local TypeScript-First Workflow](promethean-pipelines-local-typescript-first-workflow.md)
- [Universal Lisp Interface](universal-lisp-interface.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [Layer1SurvivabilityEnvelope](layer1survivabilityenvelope.md)
- [Matplotlib Animation with Async Execution](matplotlib-animation-with-async-execution.md)
- [Promethean Agent DSL TS Scaffold](promethean-agent-dsl-ts-scaffold.md)
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
- [Python Services CI](python-services-ci.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [Promethean-Copilot-Intent-Engine](promethean-copilot-intent-engine.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
- [Voice Access Layer Design](voice-access-layer-design.md)
- [mystery-lisp-search-session](mystery-lisp-search-session.md)
- [Promethean State Format](promethean-state-format.md)
- [Recursive Prompt Construction Engine](recursive-prompt-construction-engine.md)
- [State Snapshots API and Transactional Projector](state-snapshots-api-and-transactional-projector.md)
- [System Scheduler with Resource-Aware DAG](system-scheduler-with-resource-aware-dag.md)
- [Promethean Documentation Pipeline Overview](promethean-documentation-pipeline-overview.md)
- [Vectorial Exception Descent](vectorial-exception-descent.md)
## Sources
- [Fnord Tracer Protocol — L15](fnord-tracer-protocol.md#^ref-fc21f824-15-0) (line 15, col 0, score 0.58)
- [Pure TypeScript Search Microservice — L5](pure-typescript-search-microservice.md#^ref-d17d3a96-5-0) (line 5, col 0, score 0.69)
- [Agent Tasks: Persistence Migration to DualStore — L26](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-26-0) (line 26, col 0, score 0.67)
- [Promethean Pipelines: Local TypeScript-First Workflow — L1](promethean-pipelines-local-typescript-first-workflow.md#^ref-6b63edca-1-0) (line 1, col 0, score 0.62)
- [Promethean Infrastructure Setup — L1](promethean-infrastructure-setup.md#^ref-6deed6ac-1-0) (line 1, col 0, score 0.6)
- [Local-Only-LLM-Workflow — L1](local-only-llm-workflow.md#^ref-9a8ab57e-1-0) (line 1, col 0, score 0.57)
- [Local-First Intention→Code Loop with Free Models — L1](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-1-0) (line 1, col 0, score 0.66)
- [Agent Tasks: Persistence Migration to DualStore — L72](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-72-0) (line 72, col 0, score 0.65)
- [AI-Centric OS with MCP Layer — L408](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-408-0) (line 408, col 0, score 0.67)
- [api-gateway-versioning — L316](api-gateway-versioning.md#^ref-0580dcd3-316-0) (line 316, col 0, score 0.67)
- [Chroma Toolkit Consolidation Plan — L213](chroma-toolkit-consolidation-plan.md#^ref-5020e892-213-0) (line 213, col 0, score 0.67)
- [Event Bus MVP — L581](event-bus-mvp.md#^ref-534fe91d-581-0) (line 581, col 0, score 0.67)
- [i3-bluetooth-setup — L101](i3-bluetooth-setup.md#^ref-5e408692-101-0) (line 101, col 0, score 0.67)
- [Shared Package Structure — L122](shared-package-structure.md#^ref-66a72fc3-122-0) (line 122, col 0, score 0.62)
- [Migrate to Provider-Tenant Architecture — L238](migrate-to-provider-tenant-architecture.md#^ref-54382370-238-0) (line 238, col 0, score 0.61)
- [Voice Access Layer Design — L109](voice-access-layer-design.md#^ref-543ed9b3-109-0) (line 109, col 0, score 0.61)
- [field-interaction-equations — L159](field-interaction-equations.md#^ref-b09141b7-159-0) (line 159, col 0, score 1)
- [i3-config-validation-methods — L56](i3-config-validation-methods.md#^ref-d28090ac-56-0) (line 56, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L146](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-146-0) (line 146, col 0, score 0.61)
- [Local-Only-LLM-Workflow — L188](local-only-llm-workflow.md#^ref-9a8ab57e-188-0) (line 188, col 0, score 0.61)
- [Mongo Outbox Implementation — L570](mongo-outbox-implementation.md#^ref-9c1acd1e-570-0) (line 570, col 0, score 0.61)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L200](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-200-0) (line 200, col 0, score 0.61)
- [Per-Domain Policy System for JS Crawler — L471](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-471-0) (line 471, col 0, score 0.61)
- [Local-First Intention→Code Loop with Free Models — L47](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-47-0) (line 47, col 0, score 0.69)
- [universal-intention-code-fabric — L415](universal-intention-code-fabric.md#^ref-c14edce7-415-0) (line 415, col 0, score 0.64)
- [Promethean-native config design — L71](promethean-native-config-design.md#^ref-ab748541-71-0) (line 71, col 0, score 0.65)
- [Promethean Full-Stack Docker Setup — L169](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-169-0) (line 169, col 0, score 0.65)
- [universal-intention-code-fabric — L426](universal-intention-code-fabric.md#^ref-c14edce7-426-0) (line 426, col 0, score 0.64)
- [Migrate to Provider-Tenant Architecture — L305](migrate-to-provider-tenant-architecture.md#^ref-54382370-305-0) (line 305, col 0, score 0.64)
- [observability-infrastructure-setup — L399](observability-infrastructure-setup.md#^ref-b4e64f8c-399-0) (line 399, col 0, score 0.64)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L165](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-165-0) (line 165, col 0, score 0.64)
- [ParticleSimulationWithCanvasAndFFmpeg — L266](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-266-0) (line 266, col 0, score 0.64)
- [Performance-Optimized-Polyglot-Bridge — L436](performance-optimized-polyglot-bridge.md#^ref-f5579967-436-0) (line 436, col 0, score 0.64)
- [The Jar of Echoes — L83](the-jar-of-echoes.md#^ref-18138627-83-0) (line 83, col 0, score 0.73)
- [Protocol_0_The_Contradiction_Engine — L92](protocol-0-the-contradiction-engine.md#^ref-9a93a756-92-0) (line 92, col 0, score 0.71)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L143](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-143-0) (line 143, col 0, score 0.61)
- [Prometheus Observability Stack — L530](prometheus-observability-stack.md#^ref-e90b5a16-530-0) (line 530, col 0, score 0.59)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L448](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-448-0) (line 448, col 0, score 0.59)
- [Pure TypeScript Search Microservice — L547](pure-typescript-search-microservice.md#^ref-d17d3a96-547-0) (line 547, col 0, score 0.59)
- [Sibilant Meta-Prompt DSL — L217](sibilant-meta-prompt-dsl.md#^ref-af5d2824-217-0) (line 217, col 0, score 0.59)
- [Prompt_Folder_Bootstrap — L15](prompt-folder-bootstrap.md#^ref-bd4f0976-15-0) (line 15, col 0, score 0.58)
- [Self-Agency in AI Interaction — L22](self-agency-in-ai-interaction.md#^ref-49a9a860-22-0) (line 22, col 0, score 0.55)
- [Protocol_0_The_Contradiction_Engine — L59](protocol-0-the-contradiction-engine.md#^ref-9a93a756-59-0) (line 59, col 0, score 0.53)
- [api-gateway-versioning — L277](api-gateway-versioning.md#^ref-0580dcd3-277-0) (line 277, col 0, score 0.69)
- [Promethean Infrastructure Setup — L554](promethean-infrastructure-setup.md#^ref-6deed6ac-554-0) (line 554, col 0, score 0.69)
- [Promethean Pipelines — L74](promethean-pipelines.md#^ref-8b8e6103-74-0) (line 74, col 0, score 0.68)
- [Debugging Broker Connections and Agent Behavior — L7](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-7-0) (line 7, col 0, score 0.64)
- [Dynamic Context Model for Web Components — L151](dynamic-context-model-for-web-components.md#^ref-f7702bf8-151-0) (line 151, col 0, score 0.64)
- [Promethean-Copilot-Intent-Engine — L30](promethean-copilot-intent-engine.md#^ref-ae24a280-30-0) (line 30, col 0, score 0.63)
- [RAG UI Panel with Qdrant and PostgREST — L352](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-352-0) (line 352, col 0, score 0.64)
- [Promethean Full-Stack Docker Setup — L377](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-377-0) (line 377, col 0, score 0.63)
- [mystery-lisp-search-session — L26](mystery-lisp-search-session.md#^ref-513dc4c7-26-0) (line 26, col 0, score 0.63)
- [Prometheus Observability Stack — L495](prometheus-observability-stack.md#^ref-e90b5a16-495-0) (line 495, col 0, score 0.78)
- [Promethean Full-Stack Docker Setup — L3](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-3-0) (line 3, col 0, score 0.55)
- [Promethean Web UI Setup — L44](promethean-web-ui-setup.md#^ref-bc5172ca-44-0) (line 44, col 0, score 0.7)
- [Prometheus Observability Stack — L7](prometheus-observability-stack.md#^ref-e90b5a16-7-0) (line 7, col 0, score 0.6)
- [Promethean Infrastructure Setup — L93](promethean-infrastructure-setup.md#^ref-6deed6ac-93-0) (line 93, col 0, score 0.71)
- [eidolon-node-lifecycle — L3](eidolon-node-lifecycle.md#^ref-938eca9c-3-0) (line 3, col 0, score 0.65)
- [Local-Only-LLM-Workflow — L26](local-only-llm-workflow.md#^ref-9a8ab57e-26-0) (line 26, col 0, score 0.59)
- [Board Walk – 2025-08-11 — L127](board-walk-2025-08-11.md#^ref-7aa1eb92-127-0) (line 127, col 0, score 0.57)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L155](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-155-0) (line 155, col 0, score 0.56)
- [Dynamic Context Model for Web Components — L34](dynamic-context-model-for-web-components.md#^ref-f7702bf8-34-0) (line 34, col 0, score 0.54)
- [Promethean State Format — L72](promethean-state-format.md#^ref-23df6ddb-72-0) (line 72, col 0, score 0.54)
- [shared-package-layout-clarification — L128](shared-package-layout-clarification.md#^ref-36c8882a-128-0) (line 128, col 0, score 0.54)
- [Dynamic Context Model for Web Components — L31](dynamic-context-model-for-web-components.md#^ref-f7702bf8-31-0) (line 31, col 0, score 0.68)
- [Shared Package Structure — L148](shared-package-structure.md#^ref-66a72fc3-148-0) (line 148, col 0, score 0.53)
- [shared-package-layout-clarification — L156](shared-package-layout-clarification.md#^ref-36c8882a-156-0) (line 156, col 0, score 0.53)
- [api-gateway-versioning — L276](api-gateway-versioning.md#^ref-0580dcd3-276-0) (line 276, col 0, score 0.53)
- [AI-Centric OS with MCP Layer — L185](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-185-0) (line 185, col 0, score 0.67)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L9](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-9-0) (line 9, col 0, score 0.63)
- [Universal Lisp Interface — L178](universal-lisp-interface.md#^ref-b01856b4-178-0) (line 178, col 0, score 0.64)
- [Promethean-native config design — L51](promethean-native-config-design.md#^ref-ab748541-51-0) (line 51, col 0, score 0.66)
- [Layer1SurvivabilityEnvelope — L84](layer1survivabilityenvelope.md#^ref-64a9f9f9-84-0) (line 84, col 0, score 0.56)
- [observability-infrastructure-setup — L355](observability-infrastructure-setup.md#^ref-b4e64f8c-355-0) (line 355, col 0, score 0.65)
- [Promethean-native config design — L355](promethean-native-config-design.md#^ref-ab748541-355-0) (line 355, col 0, score 0.65)
- [Docops Feature Updates — L11](docops-feature-updates.md#^ref-2792d448-11-0) (line 11, col 0, score 0.89)
- [TypeScript Patch for Tool Calling Support — L172](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-172-0) (line 172, col 0, score 0.78)
- [Refactor Frontmatter Processing — L3](refactor-frontmatter-processing.md#^ref-cfbdca2f-3-0) (line 3, col 0, score 0.77)
- [Docops Feature Updates — L2](docops-feature-updates-3.md#^ref-cdbd21ee-2-0) (line 2, col 0, score 0.76)
- [Docops Feature Updates — L19](docops-feature-updates.md#^ref-2792d448-19-0) (line 19, col 0, score 0.76)
- [Local-Only-LLM-Workflow — L28](local-only-llm-workflow.md#^ref-9a8ab57e-28-0) (line 28, col 0, score 0.7)
- [api-gateway-versioning — L298](api-gateway-versioning.md#^ref-0580dcd3-298-0) (line 298, col 0, score 0.71)
- [ecs-offload-workers — L455](ecs-offload-workers.md#^ref-6498b9d7-455-0) (line 455, col 0, score 0.71)
- [Local-First Intention→Code Loop with Free Models — L178](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-178-0) (line 178, col 0, score 0.67)
- [Migrate to Provider-Tenant Architecture — L303](migrate-to-provider-tenant-architecture.md#^ref-54382370-303-0) (line 303, col 0, score 0.67)
- [Model Selection for Lightweight Conversational Tasks — L140](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-140-0) (line 140, col 0, score 0.67)
- [Mongo Outbox Implementation — L585](mongo-outbox-implementation.md#^ref-9c1acd1e-585-0) (line 585, col 0, score 0.67)
- [Promethean Full-Stack Docker Setup — L132](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-132-0) (line 132, col 0, score 0.74)
- [Model Selection for Lightweight Conversational Tasks — L120](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-120-0) (line 120, col 0, score 0.56)
- [TypeScript Patch for Tool Calling Support — L264](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-264-0) (line 264, col 0, score 0.7)
- [TypeScript Patch for Tool Calling Support — L354](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-354-0) (line 354, col 0, score 0.7)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L1](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-1-0) (line 1, col 0, score 0.61)
- [AI-Centric OS with MCP Layer — L22](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-22-0) (line 22, col 0, score 0.7)
- [observability-infrastructure-setup — L44](observability-infrastructure-setup.md#^ref-b4e64f8c-44-0) (line 44, col 0, score 0.65)
- [observability-infrastructure-setup — L7](observability-infrastructure-setup.md#^ref-b4e64f8c-7-0) (line 7, col 0, score 0.66)
- [observability-infrastructure-setup — L229](observability-infrastructure-setup.md#^ref-b4e64f8c-229-0) (line 229, col 0, score 0.63)
- [AI-Centric OS with MCP Layer — L397](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-397-0) (line 397, col 0, score 0.63)
- [Prometheus Observability Stack — L500](prometheus-observability-stack.md#^ref-e90b5a16-500-0) (line 500, col 0, score 0.8)
- [Migrate to Provider-Tenant Architecture — L69](migrate-to-provider-tenant-architecture.md#^ref-54382370-69-0) (line 69, col 0, score 0.61)
- [Prometheus Observability Stack — L498](prometheus-observability-stack.md#^ref-e90b5a16-498-0) (line 498, col 0, score 0.6)
- [AI-Centric OS with MCP Layer — L33](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-33-0) (line 33, col 0, score 0.63)
- [Migrate to Provider-Tenant Architecture — L88](migrate-to-provider-tenant-architecture.md#^ref-54382370-88-0) (line 88, col 0, score 0.63)
- [Voice Access Layer Design — L79](voice-access-layer-design.md#^ref-543ed9b3-79-0) (line 79, col 0, score 0.61)
- [Promethean Infrastructure Setup — L542](promethean-infrastructure-setup.md#^ref-6deed6ac-542-0) (line 542, col 0, score 0.59)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L416](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-416-0) (line 416, col 0, score 0.59)
- [Mongo Outbox Implementation — L535](mongo-outbox-implementation.md#^ref-9c1acd1e-535-0) (line 535, col 0, score 0.58)
- [Promethean Full-Stack Docker Setup — L388](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-388-0) (line 388, col 0, score 0.7)
- [Promethean Web UI Setup — L563](promethean-web-ui-setup.md#^ref-bc5172ca-563-0) (line 563, col 0, score 0.7)
- [Promethean Agent Config DSL — L299](promethean-agent-config-dsl.md#^ref-2c00ce45-299-0) (line 299, col 0, score 0.58)
- [Per-Domain Policy System for JS Crawler — L462](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-462-0) (line 462, col 0, score 0.56)
- [Voice Access Layer Design — L162](voice-access-layer-design.md#^ref-543ed9b3-162-0) (line 162, col 0, score 0.56)
- [Local-Only-LLM-Workflow — L154](local-only-llm-workflow.md#^ref-9a8ab57e-154-0) (line 154, col 0, score 0.61)
- [Promethean-Copilot-Intent-Engine — L10](promethean-copilot-intent-engine.md#^ref-ae24a280-10-0) (line 10, col 0, score 0.62)
- [Chroma Toolkit Consolidation Plan — L146](chroma-toolkit-consolidation-plan.md#^ref-5020e892-146-0) (line 146, col 0, score 0.58)
- [Recursive Prompt Construction Engine — L75](recursive-prompt-construction-engine.md#^ref-babdb9eb-75-0) (line 75, col 0, score 0.61)
- [ecs-offload-workers — L435](ecs-offload-workers.md#^ref-6498b9d7-435-0) (line 435, col 0, score 0.6)
- [State Snapshots API and Transactional Projector — L3](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-3-0) (line 3, col 0, score 0.6)
- [RAG UI Panel with Qdrant and PostgREST — L357](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-357-0) (line 357, col 0, score 0.6)
- [Promethean Documentation Pipeline Overview — L157](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-157-0) (line 157, col 0, score 0.6)
- [universal-intention-code-fabric — L24](universal-intention-code-fabric.md#^ref-c14edce7-24-0) (line 24, col 0, score 0.6)
- [Promethean Pipelines: Local TypeScript-First Workflow — L3](promethean-pipelines-local-typescript-first-workflow.md#^ref-6b63edca-3-0) (line 3, col 0, score 0.66)
- [Promethean Agent DSL TS Scaffold — L3](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-3-0) (line 3, col 0, score 0.65)
- [AI-Centric OS with MCP Layer — L99](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-99-0) (line 99, col 0, score 0.65)
- [observability-infrastructure-setup — L96](observability-infrastructure-setup.md#^ref-b4e64f8c-96-0) (line 96, col 0, score 0.65)
- [ecs-offload-workers — L209](ecs-offload-workers.md#^ref-6498b9d7-209-0) (line 209, col 0, score 0.64)
- [Pure TypeScript Search Microservice — L14](pure-typescript-search-microservice.md#^ref-d17d3a96-14-0) (line 14, col 0, score 0.66)
- [observability-infrastructure-setup — L138](observability-infrastructure-setup.md#^ref-b4e64f8c-138-0) (line 138, col 0, score 0.64)
- [Promethean-native config design — L297](promethean-native-config-design.md#^ref-ab748541-297-0) (line 297, col 0, score 0.64)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L178](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-178-0) (line 178, col 0, score 0.63)
- [AI-Centric OS with MCP Layer — L359](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-359-0) (line 359, col 0, score 0.62)
- [Promethean-Copilot-Intent-Engine — L32](promethean-copilot-intent-engine.md#^ref-ae24a280-32-0) (line 32, col 0, score 0.64)
- [RAG UI Panel with Qdrant and PostgREST — L329](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-329-0) (line 329, col 0, score 0.62)
- [universal-intention-code-fabric — L393](universal-intention-code-fabric.md#^ref-c14edce7-393-0) (line 393, col 0, score 0.62)
- [RAG UI Panel with Qdrant and PostgREST — L327](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-327-0) (line 327, col 0, score 0.62)
- [universal-intention-code-fabric — L26](universal-intention-code-fabric.md#^ref-c14edce7-26-0) (line 26, col 0, score 0.61)
- [Promethean-Copilot-Intent-Engine — L24](promethean-copilot-intent-engine.md#^ref-ae24a280-24-0) (line 24, col 0, score 0.61)
- [Agent Tasks: Persistence Migration to DualStore — L78](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-78-0) (line 78, col 0, score 0.61)
- [Prompt_Folder_Bootstrap — L150](prompt-folder-bootstrap.md#^ref-bd4f0976-150-0) (line 150, col 0, score 0.61)
- [Python Services CI — L1](python-services-ci.md#^ref-4c951657-1-0) (line 1, col 0, score 0.64)
- [Promethean Full-Stack Docker Setup — L342](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-342-0) (line 342, col 0, score 0.62)
- [Canonical Org-Babel Matplotlib Animation Template — L5](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-5-0) (line 5, col 0, score 0.62)
- [Promethean Agent DSL TS Scaffold — L588](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-588-0) (line 588, col 0, score 0.62)
- [Model Selection for Lightweight Conversational Tasks — L90](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-90-0) (line 90, col 0, score 0.61)
- [Performance-Optimized-Polyglot-Bridge — L170](performance-optimized-polyglot-bridge.md#^ref-f5579967-170-0) (line 170, col 0, score 0.61)
- [Matplotlib Animation with Async Execution — L40](matplotlib-animation-with-async-execution.md#^ref-687439f9-40-0) (line 40, col 0, score 0.61)
- [observability-infrastructure-setup — L189](observability-infrastructure-setup.md#^ref-b4e64f8c-189-0) (line 189, col 0, score 0.61)
- [Model Selection for Lightweight Conversational Tasks — L43](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-43-0) (line 43, col 0, score 0.61)
- [Chroma-Embedding-Refactor — L107](chroma-embedding-refactor.md#^ref-8b256935-107-0) (line 107, col 0, score 0.74)
- [prom-lib-rate-limiters-and-replay-api — L61](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-61-0) (line 61, col 0, score 0.73)
- [polymorphic-meta-programming-engine — L142](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-142-0) (line 142, col 0, score 0.63)
- [Chroma-Embedding-Refactor — L104](chroma-embedding-refactor.md#^ref-8b256935-104-0) (line 104, col 0, score 0.68)
- [Canonical Org-Babel Matplotlib Animation Template — L100](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-100-0) (line 100, col 0, score 0.65)
- [ParticleSimulationWithCanvasAndFFmpeg — L24](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-24-0) (line 24, col 0, score 0.65)
- [prom-lib-rate-limiters-and-replay-api — L335](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-335-0) (line 335, col 0, score 0.64)
- [Promethean Event Bus MVP v0.1 — L117](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-117-0) (line 117, col 0, score 0.64)
- [Promethean State Format — L26](promethean-state-format.md#^ref-23df6ddb-26-0) (line 26, col 0, score 0.63)
- [Agent Tasks: Persistence Migration to DualStore — L18](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-18-0) (line 18, col 0, score 0.62)
- [Dynamic Context Model for Web Components — L331](dynamic-context-model-for-web-components.md#^ref-f7702bf8-331-0) (line 331, col 0, score 0.61)
- [Pure TypeScript Search Microservice — L515](pure-typescript-search-microservice.md#^ref-d17d3a96-515-0) (line 515, col 0, score 0.65)
- [Promethean Web UI Setup — L574](promethean-web-ui-setup.md#^ref-bc5172ca-574-0) (line 574, col 0, score 0.63)
- [Chroma Toolkit Consolidation Plan — L137](chroma-toolkit-consolidation-plan.md#^ref-5020e892-137-0) (line 137, col 0, score 0.63)
- [RAG UI Panel with Qdrant and PostgREST — L50](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-50-0) (line 50, col 0, score 0.63)
- [Pure TypeScript Search Microservice — L1](pure-typescript-search-microservice.md#^ref-d17d3a96-1-0) (line 1, col 0, score 0.62)
- [i3-bluetooth-setup — L37](i3-bluetooth-setup.md#^ref-5e408692-37-0) (line 37, col 0, score 0.81)
- [plan-update-confirmation — L736](plan-update-confirmation.md#^ref-b22d79c6-736-0) (line 736, col 0, score 0.68)
- [sibilant-macro-targets — L27](sibilant-macro-targets.md#^ref-c5c9a5c6-27-0) (line 27, col 0, score 0.66)
- [Factorio AI with External Agents — L29](factorio-ai-with-external-agents.md#^ref-a4d90289-29-0) (line 29, col 0, score 0.65)
- [Matplotlib Animation with Async Execution — L1](matplotlib-animation-with-async-execution.md#^ref-687439f9-1-0) (line 1, col 0, score 0.65)
- [Local-Only-LLM-Workflow — L163](local-only-llm-workflow.md#^ref-9a8ab57e-163-0) (line 163, col 0, score 0.65)
- [sibilant-macro-targets — L133](sibilant-macro-targets.md#^ref-c5c9a5c6-133-0) (line 133, col 0, score 0.65)
- [Universal Lisp Interface — L117](universal-lisp-interface.md#^ref-b01856b4-117-0) (line 117, col 0, score 0.64)
- [2d-sandbox-field — L180](2d-sandbox-field.md#^ref-c710dc93-180-0) (line 180, col 0, score 0.64)
- [Eidolon Field Abstract Model — L176](eidolon-field-abstract-model.md#^ref-5e8b2388-176-0) (line 176, col 0, score 0.64)
- [Exception Layer Analysis — L134](exception-layer-analysis.md#^ref-21d5cc09-134-0) (line 134, col 0, score 0.64)
- [Cross-Language Runtime Polymorphism — L157](cross-language-runtime-polymorphism.md#^ref-c34c36a6-157-0) (line 157, col 0, score 0.64)
- [Board Walk – 2025-08-11 — L95](board-walk-2025-08-11.md#^ref-7aa1eb92-95-0) (line 95, col 0, score 0.63)
- [prom-lib-rate-limiters-and-replay-api — L256](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-256-0) (line 256, col 0, score 0.66)
- [Migrate to Provider-Tenant Architecture — L160](migrate-to-provider-tenant-architecture.md#^ref-54382370-160-0) (line 160, col 0, score 0.65)
- [Agent Reflections and Prompt Evolution — L136](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-136-0) (line 136, col 0, score 0.64)
- [Canonical Org-Babel Matplotlib Animation Template — L108](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-108-0) (line 108, col 0, score 0.64)
- [Chroma Toolkit Consolidation Plan — L168](chroma-toolkit-consolidation-plan.md#^ref-5020e892-168-0) (line 168, col 0, score 0.64)
- [ecs-scheduler-and-prefabs — L387](ecs-scheduler-and-prefabs.md#^ref-c62a1815-387-0) (line 387, col 0, score 0.64)
- [Event Bus MVP — L564](event-bus-mvp.md#^ref-534fe91d-564-0) (line 564, col 0, score 0.64)
- [Migrate to Provider-Tenant Architecture — L316](migrate-to-provider-tenant-architecture.md#^ref-54382370-316-0) (line 316, col 0, score 0.64)
- [Model Selection for Lightweight Conversational Tasks — L142](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-142-0) (line 142, col 0, score 0.64)
- [Language-Agnostic Mirror System — L1](language-agnostic-mirror-system.md#^ref-d2b3628c-1-0) (line 1, col 0, score 0.64)
- [Fnord Tracer Protocol — L166](fnord-tracer-protocol.md#^ref-fc21f824-166-0) (line 166, col 0, score 0.64)
- [Voice Access Layer Design — L1](voice-access-layer-design.md#^ref-543ed9b3-1-0) (line 1, col 0, score 0.63)
- [Chroma Toolkit Consolidation Plan — L148](chroma-toolkit-consolidation-plan.md#^ref-5020e892-148-0) (line 148, col 0, score 0.63)
- [Duck's Self-Referential Perceptual Loop — L15](ducks-self-referential-perceptual-loop.md#^ref-71726f04-15-0) (line 15, col 0, score 0.63)
- [archetype-ecs — L456](archetype-ecs.md#^ref-8f4c1e86-456-0) (line 456, col 0, score 0.62)
- [DSL — L18](chunks/dsl.md#^ref-e87bc036-18-0) (line 18, col 0, score 0.62)
- [JavaScript — L27](chunks/javascript.md#^ref-c1618c66-27-0) (line 27, col 0, score 0.62)
- [compiler-kit-foundations — L616](compiler-kit-foundations.md#^ref-01b21543-616-0) (line 616, col 0, score 0.62)
- [Cross-Target Macro System in Sibilant — L198](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-198-0) (line 198, col 0, score 0.62)
- [Per-Domain Policy System for JS Crawler — L446](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-446-0) (line 446, col 0, score 0.71)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L389](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-389-0) (line 389, col 0, score 0.7)
- [Per-Domain Policy System for JS Crawler — L439](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-439-0) (line 439, col 0, score 0.7)
- [Promethean Full-Stack Docker Setup — L432](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-432-0) (line 432, col 0, score 0.66)
- [AI-Centric OS with MCP Layer — L8](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-8-0) (line 8, col 0, score 0.65)
- [Migrate to Provider-Tenant Architecture — L81](migrate-to-provider-tenant-architecture.md#^ref-54382370-81-0) (line 81, col 0, score 0.69)
- [Migrate to Provider-Tenant Architecture — L51](migrate-to-provider-tenant-architecture.md#^ref-54382370-51-0) (line 51, col 0, score 0.65)
- [RAG UI Panel with Qdrant and PostgREST — L356](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-356-0) (line 356, col 0, score 0.65)
- [Dynamic Context Model for Web Components — L73](dynamic-context-model-for-web-components.md#^ref-f7702bf8-73-0) (line 73, col 0, score 0.63)
- [Migrate to Provider-Tenant Architecture — L24](migrate-to-provider-tenant-architecture.md#^ref-54382370-24-0) (line 24, col 0, score 0.63)
- [Migrate to Provider-Tenant Architecture — L251](migrate-to-provider-tenant-architecture.md#^ref-54382370-251-0) (line 251, col 0, score 0.62)
- [Migrate to Provider-Tenant Architecture — L82](migrate-to-provider-tenant-architecture.md#^ref-54382370-82-0) (line 82, col 0, score 0.61)
- [compiler-kit-foundations — L5](compiler-kit-foundations.md#^ref-01b21543-5-0) (line 5, col 0, score 0.61)
- [Agent Tasks: Persistence Migration to DualStore — L109](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-109-0) (line 109, col 0, score 0.55)
- [AI-Centric OS with MCP Layer — L178](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-178-0) (line 178, col 0, score 0.58)
- [Promethean-native config design — L343](promethean-native-config-design.md#^ref-ab748541-343-0) (line 343, col 0, score 0.57)
- [balanced-bst — L290](balanced-bst.md#^ref-d3e7db72-290-0) (line 290, col 0, score 0.57)
- [plan-update-confirmation — L812](plan-update-confirmation.md#^ref-b22d79c6-812-0) (line 812, col 0, score 0.57)
- [Matplotlib Animation with Async Execution — L7](matplotlib-animation-with-async-execution.md#^ref-687439f9-7-0) (line 7, col 0, score 0.6)
- [Matplotlib Animation with Async Execution — L31](matplotlib-animation-with-async-execution.md#^ref-687439f9-31-0) (line 31, col 0, score 0.6)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L156](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-156-0) (line 156, col 0, score 0.59)
- [Promethean Infrastructure Setup — L33](promethean-infrastructure-setup.md#^ref-6deed6ac-33-0) (line 33, col 0, score 0.57)
- [Promethean Infrastructure Setup — L534](promethean-infrastructure-setup.md#^ref-6deed6ac-534-0) (line 534, col 0, score 0.55)
- [Provider-Agnostic Chat Panel Implementation — L140](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-140-0) (line 140, col 0, score 0.55)
- [Local-First Intention→Code Loop with Free Models — L114](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-114-0) (line 114, col 0, score 0.55)
- [Promethean Agent Config DSL — L300](promethean-agent-config-dsl.md#^ref-2c00ce45-300-0) (line 300, col 0, score 0.55)
- [prom-lib-rate-limiters-and-replay-api — L343](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-343-0) (line 343, col 0, score 0.59)
- [prom-lib-rate-limiters-and-replay-api — L342](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-342-0) (line 342, col 0, score 0.59)
- [Voice Access Layer Design — L93](voice-access-layer-design.md#^ref-543ed9b3-93-0) (line 93, col 0, score 0.57)
- [prom-lib-rate-limiters-and-replay-api — L340](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-340-0) (line 340, col 0, score 0.57)
- [Migrate to Provider-Tenant Architecture — L23](migrate-to-provider-tenant-architecture.md#^ref-54382370-23-0) (line 23, col 0, score 0.56)
- [Protocol_0_The_Contradiction_Engine — L73](protocol-0-the-contradiction-engine.md#^ref-9a93a756-73-0) (line 73, col 0, score 0.56)
- [Vectorial Exception Descent — L102](vectorial-exception-descent.md#^ref-d771154e-102-0) (line 102, col 0, score 0.56)
- [Voice Access Layer Design — L98](voice-access-layer-design.md#^ref-543ed9b3-98-0) (line 98, col 0, score 0.56)
- [observability-infrastructure-setup — L334](observability-infrastructure-setup.md#^ref-b4e64f8c-334-0) (line 334, col 0, score 0.55)
- [observability-infrastructure-setup — L1](observability-infrastructure-setup.md#^ref-b4e64f8c-1-0) (line 1, col 0, score 0.62)
- [AI-Centric OS with MCP Layer — L1](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-1-0) (line 1, col 0, score 0.61)
- [ecs-scheduler-and-prefabs — L383](ecs-scheduler-and-prefabs.md#^ref-c62a1815-383-0) (line 383, col 0, score 0.6)
- [System Scheduler with Resource-Aware DAG — L381](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-381-0) (line 381, col 0, score 0.6)
- [universal-intention-code-fabric — L395](universal-intention-code-fabric.md#^ref-c14edce7-395-0) (line 395, col 0, score 0.6)
- [Promethean Web UI Setup — L9](promethean-web-ui-setup.md#^ref-bc5172ca-9-0) (line 9, col 0, score 0.6)
- [Promethean Agent DSL TS Scaffold — L1](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-1-0) (line 1, col 0, score 0.6)
- [Local-First Intention→Code Loop with Free Models — L139](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-139-0) (line 139, col 0, score 0.59)
- [observability-infrastructure-setup — L357](observability-infrastructure-setup.md#^ref-b4e64f8c-357-0) (line 357, col 0, score 0.75)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L421](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-421-0) (line 421, col 0, score 0.68)
- [Per-Domain Policy System for JS Crawler — L467](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-467-0) (line 467, col 0, score 0.67)
- [AI-Centric OS with MCP Layer — L407](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-407-0) (line 407, col 0, score 1)
- [api-gateway-versioning — L284](api-gateway-versioning.md#^ref-0580dcd3-284-0) (line 284, col 0, score 1)
- [Services — L21](chunks/services.md#^ref-75ea4a6a-21-0) (line 21, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L43](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-43-0) (line 43, col 0, score 1)
- [i3-bluetooth-setup — L123](i3-bluetooth-setup.md#^ref-5e408692-123-0) (line 123, col 0, score 1)
- [i3-config-validation-methods — L78](i3-config-validation-methods.md#^ref-d28090ac-78-0) (line 78, col 0, score 1)
- [Local-Only-LLM-Workflow — L207](local-only-llm-workflow.md#^ref-9a8ab57e-207-0) (line 207, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L306](migrate-to-provider-tenant-architecture.md#^ref-54382370-306-0) (line 306, col 0, score 0.65)
- [Agent Tasks: Persistence Migration to DualStore — L181](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-181-0) (line 181, col 0, score 1)
- [AI-Centric OS with MCP Layer — L429](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-429-0) (line 429, col 0, score 1)
- [api-gateway-versioning — L317](api-gateway-versioning.md#^ref-0580dcd3-317-0) (line 317, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L186](chroma-toolkit-consolidation-plan.md#^ref-5020e892-186-0) (line 186, col 0, score 1)
- [Dynamic Context Model for Web Components — L433](dynamic-context-model-for-web-components.md#^ref-f7702bf8-433-0) (line 433, col 0, score 1)
- [Event Bus MVP — L555](event-bus-mvp.md#^ref-534fe91d-555-0) (line 555, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L298](migrate-to-provider-tenant-architecture.md#^ref-54382370-298-0) (line 298, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L132](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-132-0) (line 132, col 0, score 1)
- [Mongo Outbox Implementation — L584](mongo-outbox-implementation.md#^ref-9c1acd1e-584-0) (line 584, col 0, score 1)
- [AI-Centric OS with MCP Layer — L401](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-401-0) (line 401, col 0, score 1)
- [api-gateway-versioning — L296](api-gateway-versioning.md#^ref-0580dcd3-296-0) (line 296, col 0, score 1)
- [i3-bluetooth-setup — L110](i3-bluetooth-setup.md#^ref-5e408692-110-0) (line 110, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L279](migrate-to-provider-tenant-architecture.md#^ref-54382370-279-0) (line 279, col 0, score 1)
- [Mongo Outbox Implementation — L574](mongo-outbox-implementation.md#^ref-9c1acd1e-574-0) (line 574, col 0, score 1)
- [observability-infrastructure-setup — L359](observability-infrastructure-setup.md#^ref-b4e64f8c-359-0) (line 359, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L477](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-477-0) (line 477, col 0, score 1)
- [plan-update-confirmation — L996](plan-update-confirmation.md#^ref-b22d79c6-996-0) (line 996, col 0, score 1)
- [api-gateway-versioning — L315](api-gateway-versioning.md#^ref-0580dcd3-315-0) (line 315, col 0, score 1)
- [Chroma-Embedding-Refactor — L331](chroma-embedding-refactor.md#^ref-8b256935-331-0) (line 331, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L167](chroma-toolkit-consolidation-plan.md#^ref-5020e892-167-0) (line 167, col 0, score 1)
- [Tooling — L24](chunks/tooling.md#^ref-6cb4943e-24-0) (line 24, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L173](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-173-0) (line 173, col 0, score 1)
- [Dynamic Context Model for Web Components — L390](dynamic-context-model-for-web-components.md#^ref-f7702bf8-390-0) (line 390, col 0, score 1)
- [Event Bus MVP — L553](event-bus-mvp.md#^ref-534fe91d-553-0) (line 553, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L315](functional-embedding-pipeline-refactor.md#^ref-a4a25141-315-0) (line 315, col 0, score 1)
- [i3-bluetooth-setup — L105](i3-bluetooth-setup.md#^ref-5e408692-105-0) (line 105, col 0, score 1)
- [js-to-lisp-reverse-compiler — L412](js-to-lisp-reverse-compiler.md#^ref-58191024-412-0) (line 412, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L175](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-175-0) (line 175, col 0, score 1)
- [AI-Centric OS with MCP Layer — L409](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-409-0) (line 409, col 0, score 1)
- [api-gateway-versioning — L295](api-gateway-versioning.md#^ref-0580dcd3-295-0) (line 295, col 0, score 1)
- [eidolon-field-math-foundations — L166](eidolon-field-math-foundations.md#^ref-008f2ac0-166-0) (line 166, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L307](migrate-to-provider-tenant-architecture.md#^ref-54382370-307-0) (line 307, col 0, score 1)
- [observability-infrastructure-setup — L364](observability-infrastructure-setup.md#^ref-b4e64f8c-364-0) (line 364, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L492](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-492-0) (line 492, col 0, score 1)
- [Promethean Infrastructure Setup — L587](promethean-infrastructure-setup.md#^ref-6deed6ac-587-0) (line 587, col 0, score 1)
- [2d-sandbox-field — L225](2d-sandbox-field.md#^ref-c710dc93-225-0) (line 225, col 0, score 1)
- [Admin Dashboard for User Management — L49](admin-dashboard-for-user-management.md#^ref-2901a3e9-49-0) (line 49, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L150](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-150-0) (line 150, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L163](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-163-0) (line 163, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L9](ai-first-os-model-context-protocol.md#^ref-618198f4-9-0) (line 9, col 0, score 1)
- [aionian-circuit-math — L179](aionian-circuit-math.md#^ref-f2d83a77-179-0) (line 179, col 0, score 1)
- [api-gateway-versioning — L304](api-gateway-versioning.md#^ref-0580dcd3-304-0) (line 304, col 0, score 1)
- [archetype-ecs — L479](archetype-ecs.md#^ref-8f4c1e86-479-0) (line 479, col 0, score 1)
- [balanced-bst — L295](balanced-bst.md#^ref-d3e7db72-295-0) (line 295, col 0, score 1)
- [Dynamic Context Model for Web Components — L407](dynamic-context-model-for-web-components.md#^ref-f7702bf8-407-0) (line 407, col 0, score 1)
- [ecs-offload-workers — L478](ecs-offload-workers.md#^ref-6498b9d7-478-0) (line 478, col 0, score 1)
- [eidolon-field-math-foundations — L167](eidolon-field-math-foundations.md#^ref-008f2ac0-167-0) (line 167, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L150](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-150-0) (line 150, col 0, score 1)
- [Simulation Demo — L32](chunks/simulation-demo.md#^ref-557309a3-32-0) (line 32, col 0, score 1)
- [Tooling — L26](chunks/tooling.md#^ref-6cb4943e-26-0) (line 26, col 0, score 1)
- [Window Management — L36](chunks/window-management.md#^ref-9e8ae388-36-0) (line 36, col 0, score 1)
- [compiler-kit-foundations — L639](compiler-kit-foundations.md#^ref-01b21543-639-0) (line 639, col 0, score 1)
- [Creative Moments — L10](creative-moments.md#^ref-10d98225-10-0) (line 10, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L258](cross-language-runtime-polymorphism.md#^ref-c34c36a6-258-0) (line 258, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L215](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-215-0) (line 215, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L50](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-50-0) (line 50, col 0, score 1)
- [DuckDuckGoSearchPipeline — L16](duckduckgosearchpipeline.md#^ref-e979c50f-16-0) (line 16, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L209](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-209-0) (line 209, col 0, score 1)
- [Duck's Attractor States — L67](ducks-attractor-states.md#^ref-13951643-67-0) (line 67, col 0, score 1)
- [Factorio AI with External Agents — L150](factorio-ai-with-external-agents.md#^ref-a4d90289-150-0) (line 150, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L63](model-upgrade-calm-down-guide.md#^ref-db74343f-63-0) (line 63, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L10](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-10-0) (line 10, col 0, score 1)
- [observability-infrastructure-setup — L391](observability-infrastructure-setup.md#^ref-b4e64f8c-391-0) (line 391, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L111](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-111-0) (line 111, col 0, score 1)
- [OpenAPI Validation Report — L29](openapi-validation-report.md#^ref-5c152b08-29-0) (line 29, col 0, score 1)
- [Optimizing Command Limitations in System Design — L36](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-36-0) (line 36, col 0, score 1)
- [plan-update-confirmation — L1013](plan-update-confirmation.md#^ref-b22d79c6-1013-0) (line 1013, col 0, score 1)
- [pm2-orchestration-patterns — L252](pm2-orchestration-patterns.md#^ref-51932e7b-252-0) (line 252, col 0, score 1)
- [AI-Centric OS with MCP Layer — L414](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-414-0) (line 414, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L10](ai-first-os-model-context-protocol.md#^ref-618198f4-10-0) (line 10, col 0, score 1)
- [Board Automation Improvements — L15](board-automation-improvements.md#^ref-ac60a1d6-15-0) (line 15, col 0, score 1)
- [Board Walk – 2025-08-11 — L144](board-walk-2025-08-11.md#^ref-7aa1eb92-144-0) (line 144, col 0, score 1)
- [Shared — L15](chunks/shared.md#^ref-623a55f7-15-0) (line 15, col 0, score 1)
- [Creative Moments — L7](creative-moments.md#^ref-10d98225-7-0) (line 7, col 0, score 1)
- [DuckDuckGoSearchPipeline — L11](duckduckgosearchpipeline.md#^ref-e979c50f-11-0) (line 11, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L44](ducks-self-referential-perceptual-loop.md#^ref-71726f04-44-0) (line 44, col 0, score 1)
- [Dynamic Context Model for Web Components — L424](dynamic-context-model-for-web-components.md#^ref-f7702bf8-424-0) (line 424, col 0, score 1)
- [Event Bus Projections Architecture — L170](event-bus-projections-architecture.md#^ref-cf6b9b17-170-0) (line 170, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L96](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-96-0) (line 96, col 0, score 1)
- [Promethean Agent Config DSL — L348](promethean-agent-config-dsl.md#^ref-2c00ce45-348-0) (line 348, col 0, score 1)
- [Promethean Chat Activity Report — L22](promethean-chat-activity-report.md#^ref-18344cf9-22-0) (line 22, col 0, score 1)
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
- [Math Fundamentals — L34](chunks/math-fundamentals.md#^ref-c6e87433-34-0) (line 34, col 0, score 1)
- [Services — L22](chunks/services.md#^ref-75ea4a6a-22-0) (line 22, col 0, score 1)
- [Shared — L29](chunks/shared.md#^ref-623a55f7-29-0) (line 29, col 0, score 1)
- [Simulation Demo — L23](chunks/simulation-demo.md#^ref-557309a3-23-0) (line 23, col 0, score 1)
- [Tooling — L16](chunks/tooling.md#^ref-6cb4943e-16-0) (line 16, col 0, score 1)
- [Window Management — L25](chunks/window-management.md#^ref-9e8ae388-25-0) (line 25, col 0, score 1)
- [compiler-kit-foundations — L627](compiler-kit-foundations.md#^ref-01b21543-627-0) (line 627, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L171](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-171-0) (line 171, col 0, score 1)
- [Duck's Attractor States — L81](ducks-attractor-states.md#^ref-13951643-81-0) (line 81, col 0, score 1)
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
- [markdown-to-org-transpiler — L318](markdown-to-org-transpiler.md#^ref-ab54cdd8-318-0) (line 318, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L322](migrate-to-provider-tenant-architecture.md#^ref-54382370-322-0) (line 322, col 0, score 1)
- [Mongo Outbox Implementation — L579](mongo-outbox-implementation.md#^ref-9c1acd1e-579-0) (line 579, col 0, score 1)
- [observability-infrastructure-setup — L369](observability-infrastructure-setup.md#^ref-b4e64f8c-369-0) (line 369, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L183](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-183-0) (line 183, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L483](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-483-0) (line 483, col 0, score 1)
- [polymorphic-meta-programming-engine — L241](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-241-0) (line 241, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L415](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-415-0) (line 415, col 0, score 1)
- [Promethean Agent Config DSL — L352](promethean-agent-config-dsl.md#^ref-2c00ce45-352-0) (line 352, col 0, score 1)
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
- [Admin Dashboard for User Management — L45](admin-dashboard-for-user-management.md#^ref-2901a3e9-45-0) (line 45, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L170](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-170-0) (line 170, col 0, score 1)
- [AI-Centric OS with MCP Layer — L416](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-416-0) (line 416, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L11](ai-first-os-model-context-protocol.md#^ref-618198f4-11-0) (line 11, col 0, score 1)
- [aionian-circuit-math — L178](aionian-circuit-math.md#^ref-f2d83a77-178-0) (line 178, col 0, score 1)
- [api-gateway-versioning — L312](api-gateway-versioning.md#^ref-0580dcd3-312-0) (line 312, col 0, score 1)
- [balanced-bst — L297](balanced-bst.md#^ref-d3e7db72-297-0) (line 297, col 0, score 1)
- [Board Walk – 2025-08-11 — L131](board-walk-2025-08-11.md#^ref-7aa1eb92-131-0) (line 131, col 0, score 1)
- [Operations — L8](chunks/operations.md#^ref-f1add613-8-0) (line 8, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L331](migrate-to-provider-tenant-architecture.md#^ref-54382370-331-0) (line 331, col 0, score 1)
- [Mindful Prioritization — L9](mindful-prioritization.md#^ref-40185d05-9-0) (line 9, col 0, score 1)
- [MindfulRobotIntegration — L7](mindfulrobotintegration.md#^ref-5f65dfa5-7-0) (line 7, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L66](model-upgrade-calm-down-guide.md#^ref-db74343f-66-0) (line 66, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L13](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-13-0) (line 13, col 0, score 1)
- [observability-infrastructure-setup — L393](observability-infrastructure-setup.md#^ref-b4e64f8c-393-0) (line 393, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L59](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-59-0) (line 59, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L56](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-56-0) (line 56, col 0, score 1)
- [Obsidian Task Generation — L14](obsidian-task-generation.md#^ref-9b694a91-14-0) (line 14, col 0, score 1)
- [AI-Centric OS with MCP Layer — L424](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-424-0) (line 424, col 0, score 1)
- [aionian-circuit-math — L183](aionian-circuit-math.md#^ref-f2d83a77-183-0) (line 183, col 0, score 1)
- [api-gateway-versioning — L310](api-gateway-versioning.md#^ref-0580dcd3-310-0) (line 310, col 0, score 1)
- [Board Walk – 2025-08-11 — L149](board-walk-2025-08-11.md#^ref-7aa1eb92-149-0) (line 149, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L211](chroma-toolkit-consolidation-plan.md#^ref-5020e892-211-0) (line 211, col 0, score 1)
- [Diagrams — L23](chunks/diagrams.md#^ref-45cd25b5-23-0) (line 23, col 0, score 1)
- [JavaScript — L29](chunks/javascript.md#^ref-c1618c66-29-0) (line 29, col 0, score 1)
- [Math Fundamentals — L39](chunks/math-fundamentals.md#^ref-c6e87433-39-0) (line 39, col 0, score 1)
- [Shared — L28](chunks/shared.md#^ref-623a55f7-28-0) (line 28, col 0, score 1)
- [Simulation Demo — L29](chunks/simulation-demo.md#^ref-557309a3-29-0) (line 29, col 0, score 1)
- [Tooling — L14](chunks/tooling.md#^ref-6cb4943e-14-0) (line 14, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L231](cross-language-runtime-polymorphism.md#^ref-c34c36a6-231-0) (line 231, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L53](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-53-0) (line 53, col 0, score 1)
- [ecs-offload-workers — L487](ecs-offload-workers.md#^ref-6498b9d7-487-0) (line 487, col 0, score 1)
- [Lisp-Compiler-Integration — L547](lisp-compiler-integration.md#^ref-cfee6d36-547-0) (line 547, col 0, score 1)
- [Lispy Macros with syntax-rules — L408](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-408-0) (line 408, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L182](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-182-0) (line 182, col 0, score 1)
- [Local-Only-LLM-Workflow — L210](local-only-llm-workflow.md#^ref-9a8ab57e-210-0) (line 210, col 0, score 1)
- [markdown-to-org-transpiler — L320](markdown-to-org-transpiler.md#^ref-ab54cdd8-320-0) (line 320, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L272](migrate-to-provider-tenant-architecture.md#^ref-54382370-272-0) (line 272, col 0, score 1)
- [Mongo Outbox Implementation — L583](mongo-outbox-implementation.md#^ref-9c1acd1e-583-0) (line 583, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L48](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-48-0) (line 48, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L109](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-109-0) (line 109, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L529](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-529-0) (line 529, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L138](protocol-0-the-contradiction-engine.md#^ref-9a93a756-138-0) (line 138, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L214](chroma-toolkit-consolidation-plan.md#^ref-5020e892-214-0) (line 214, col 0, score 1)
- [Tooling — L18](chunks/tooling.md#^ref-6cb4943e-18-0) (line 18, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L226](cross-language-runtime-polymorphism.md#^ref-c34c36a6-226-0) (line 226, col 0, score 1)
- [ecs-offload-workers — L473](ecs-offload-workers.md#^ref-6498b9d7-473-0) (line 473, col 0, score 1)
- [ecs-scheduler-and-prefabs — L399](ecs-scheduler-and-prefabs.md#^ref-c62a1815-399-0) (line 399, col 0, score 1)
- [eidolon-field-math-foundations — L146](eidolon-field-math-foundations.md#^ref-008f2ac0-146-0) (line 146, col 0, score 1)
- [Event Bus MVP — L556](event-bus-mvp.md#^ref-534fe91d-556-0) (line 556, col 0, score 1)
- [i3-bluetooth-setup — L106](i3-bluetooth-setup.md#^ref-5e408692-106-0) (line 106, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L145](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-145-0) (line 145, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L291](migrate-to-provider-tenant-architecture.md#^ref-54382370-291-0) (line 291, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L155](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-155-0) (line 155, col 0, score 1)
- [Mongo Outbox Implementation — L550](mongo-outbox-implementation.md#^ref-9c1acd1e-550-0) (line 550, col 0, score 1)
- [observability-infrastructure-setup — L368](observability-infrastructure-setup.md#^ref-b4e64f8c-368-0) (line 368, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L72](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-72-0) (line 72, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L201](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-201-0) (line 201, col 0, score 1)
- [polymorphic-meta-programming-engine — L246](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-246-0) (line 246, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L384](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-384-0) (line 384, col 0, score 1)
- [Promethean Agent Config DSL — L329](promethean-agent-config-dsl.md#^ref-2c00ce45-329-0) (line 329, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L879](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-879-0) (line 879, col 0, score 1)
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
- [eidolon-node-lifecycle — L63](eidolon-node-lifecycle.md#^ref-938eca9c-63-0) (line 63, col 0, score 1)
- [EidolonField — L269](eidolonfield.md#^ref-49d1e1e5-269-0) (line 269, col 0, score 1)
- [Event Bus MVP — L566](event-bus-mvp.md#^ref-534fe91d-566-0) (line 566, col 0, score 1)
- [Event Bus Projections Architecture — L185](event-bus-projections-architecture.md#^ref-cf6b9b17-185-0) (line 185, col 0, score 1)
- [Exception Layer Analysis — L165](exception-layer-analysis.md#^ref-21d5cc09-165-0) (line 165, col 0, score 1)
- [Factorio AI with External Agents — L160](factorio-ai-with-external-agents.md#^ref-a4d90289-160-0) (line 160, col 0, score 1)
- [field-dynamics-math-blocks — L165](field-dynamics-math-blocks.md#^ref-7cfc230d-165-0) (line 165, col 0, score 1)
- [field-interaction-equations — L184](field-interaction-equations.md#^ref-b09141b7-184-0) (line 184, col 0, score 1)
- [field-node-diagram-outline — L132](field-node-diagram-outline.md#^ref-1f32c94a-132-0) (line 132, col 0, score 1)
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
