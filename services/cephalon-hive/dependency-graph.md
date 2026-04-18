# Cephalon Hive — Dependency Graph

This document captures the **runtime** (docker-compose) and **build/source** dependencies for the Cephalon Hive stack.

## 1) Runtime dependency graph (docker compose)

**Legend**
- **Solid** arrows (`-->`) = docker-compose `depends_on` (startup ordering)
- **Dashed** arrows (`-.->`) = runtime network calls (HTTP/HTTPS/etc)

```mermaid
flowchart TD
  %% ----------------------------
  %% Compose services
  %% ----------------------------
  subgraph COMPOSE[services/cephalon-hive/docker-compose.yml]
    mongodb[(mongodb)]
    chroma[(chroma)]
    proxx_db[(proxx-db / postgres)]

    openplanner[openplanner]
    proxx[proxx]
    dashboard[dashboard]
    federation_sync[federation-sync]

    duck[duck]
    openhax[openhax]
    openskull[openskull]
  end

  %% ----------------------------
  %% External dependencies
  %% ----------------------------
  discord_api[(Discord API)]
  zai_api[(z.ai / GLM API)]
  irc_host[(IRC server)]
  ollama_ext[(Ollama endpoint<br/>(ai-infra or host))]
  upstream_llm[(Upstream model providers<br/>(OpenRouter/Gemini/Mistral/etc))]
  federation_peer[(Federation peer / hub)]

  %% ----------------------------
  %% Startup dependencies (depends_on)
  %% ----------------------------
  openplanner -->|depends_on| chroma
  proxx -->|depends_on| proxx_db

  dashboard -->|depends_on| mongodb
  dashboard -->|depends_on| openplanner

  federation_sync -->|depends_on| proxx

  duck -->|depends_on| mongodb
  openhax -->|depends_on| mongodb
  openskull -->|depends_on| mongodb

  %% ----------------------------
  %% Runtime call dependencies (implied by env + code)
  %% ----------------------------
  openplanner -.->|HTTP: CHROMA_URL| chroma
  openplanner -.->|HTTP: OLLAMA_BASE_URL| ollama_ext

  proxx -.->|TCP: DATABASE_URL| proxx_db
  proxx -.->|HTTPS: upstream inference| upstream_llm
  proxx -.->|HTTP: CHROMA_URL (default via host.docker.internal:8000)| chroma
  proxx -.->|HTTP: federation peer API| federation_peer

  duck -.->|HTTP: OPENPLANNER_API_BASE_URL| openplanner
  openhax -.->|HTTP: OPENPLANNER_API_BASE_URL| openplanner
  openskull -.->|HTTP: OPENPLANNER_API_BASE_URL| openplanner

  duck -.->|HTTP: OLLAMA_BASE_URL| proxx
  openhax -.->|HTTP: OLLAMA_BASE_URL| proxx
  openskull -.->|HTTP: OLLAMA_BASE_URL| proxx

  dashboard -.->|HTTP: aggregate memory UIs| duck
  dashboard -.->|HTTP: aggregate memory UIs| openhax
  dashboard -.->|HTTP: aggregate memory UIs| openskull
  dashboard -.->|HTTP: OpenPlanner search/backfill| openplanner

  federation_sync -.->|HTTP: /api/ui/federation/*| proxx

  duck -.->|Discord gateway| discord_api
  openhax -.->|Discord gateway| discord_api
  openskull -.->|Discord gateway| discord_api

  duck -.->|IRC client| irc_host
  openhax -.->|IRC client| irc_host
  openskull -.->|IRC client| irc_host

  %% ZAI is present in env; cephalons can use it when not forcing the Ollama/proxx path.
  duck -.->|HTTPS (optional)| zai_api
  openhax -.->|HTTPS (optional)| zai_api
  openskull -.->|HTTPS (optional)| zai_api
```

## 2) Source/build dependency graph (what code/images the stack is built from)

```mermaid
flowchart LR
  %% Build contexts / sources
  hive_dir[services/cephalon-hive]
  openplanner_dir[services/openplanner]
  proxx_dir[orgs/open-hax/proxx]
  cephalon_ts_pkg[packages/cephalon-ts]

  %% Images/services produced
  hive_image[cephalon-base image<br/>(used by duck/openhax/openskull)]
  openplanner_image[openplanner image]
  proxx_image[proxx image]

  %% Compose services (from the runtime graph)
  duck_svc[duck]
  openhax_svc[openhax]
  openskull_svc[openskull]

  %% Build links
  cephalon_ts_pkg -->|tsup --config tsup.standalone.ts<br/>produces dist/{cli.cjs,index.cjs,public}| hive_dir
  hive_dir -->|docker build (Dockerfile)| hive_image
  openplanner_dir -->|docker build (Dockerfile)| openplanner_image
  proxx_dir -->|docker build (Dockerfile)| proxx_image

  %% Image reuse
  hive_image --> duck_svc
  hive_image --> openhax_svc
  hive_image --> openskull_svc
```

## 3) Workspace package dependency graph (the minimal hive pnpm workspace)

This is the workspace defined in `services/cephalon-hive/pnpm-workspace.yaml` and mirrored into each cephalon container at runtime.

```mermaid
flowchart LR
  cephalon_ts[@promethean-os/cephalon-ts]
  event[@promethean-os/event]
  openplanner_client[@promethean-os/openplanner-cljs-client]

  cephalon_ts -->|workspace:*| event
  cephalon_ts -->|workspace:*| openplanner_client
```
