---
uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
created_at: 2025.08.31.18.14.03.md
filename: Promethean Documentation Pipeline Overview
description: >-
  This document outlines the core themes and new packages in the Promethean
  project, focusing on how they integrate with pipelines, caching, and
  cross-document similarity. It details the workflow for document enrichment,
  code analysis, and API change governance using Ollama and JSON caches. The
  system emphasizes idempotent CLI steps and modular pipelines for efficient
  development.
tags:
  - Promethean
  - CLI
  - pipelines
  - Ollama
  - code analysis
  - API governance
  - document enrichment
  - semantic versioning
  - cross-document similarity
  - cache
related_to_uuid: []
related_to_title: []
references: []
---
here’s the high-level snapshot of what we’ve built together, plus how it all fits. ^ref-3a3bf2c9-1-0

# Core themes

* Everything is a **small, idempotent CLI step**. ^ref-3a3bf2c9-5-0
* Steps compose into **pipelines** (DAGs) with caching and reports. ^ref-3a3bf2c9-6-0
* We lean on **Ollama** (LLMs + embeddings), **ts-morph**, and **simple JSON caches**. ^ref-3a3bf2c9-7-0

# New packages & what they do

## 1) `@promethean/docops`

Document enrichment for `docs/unique`: ^ref-3a3bf2c9-13-0

* Extracts or completes **front matter** (filename, description, tags, uuid). ^ref-3a3bf2c9-15-0
* **Chunks** docs with a language-aware tokenizer; embeds; builds indexes. ^ref-3a3bf2c9-16-0
* Runs **cross-document similarity**, computes **related docs**, and **references** (chunk-level with line/col).
* Applies FM updates and writes **footer sections** (markdown links). ^ref-3a3bf2c9-18-0
* Safe to re-run; uses caches for chunks/embeddings/queries. ^ref-3a3bf2c9-19-0

## 2) `@promethean/codepack`

From documentation → working pseudo repo: ^ref-3a3bf2c9-23-0

* Extracts **code blocks + surrounding context** from a directory tree. ^ref-3a3bf2c9-25-0
* Embeds and clusters to find **similar code**. ^ref-3a3bf2c9-26-0
* LLM names a **directory path**, filenames, and **README** per cluster. ^ref-3a3bf2c9-27-0
* **Materializes** a file tree under `./pseudo/`. ^ref-3a3bf2c9-28-0

## 3) `@promethean/simtasks` (foundation used by codemods)

* Scans workspace, embeds functions, clusters by similarity. ^ref-3a3bf2c9-32-0
* Generates **consolidation plans** & package graph/tasks.

## 4) `@promethean/codemods`

Refactors duplicates toward a canonical API: ^ref-3a3bf2c9-37-0

* **Spec builder** with **parameter extraction** and **arg mapping** by name. ^ref-3a3bf2c9-39-0
* **Codemod generator** that **reorders callsite args** and fixes imports. ^ref-3a3bf2c9-40-0
* **Runner** with dry-run/apply, diffs, and optional cleanup of emptied dup files. ^ref-3a3bf2c9-41-0
* **Verify step** (`04-verify`) that runs `tsc/build/test` and produces reports + deltas. ^ref-3a3bf2c9-42-0

## 5) `@promethean/piper`

A tiny **pipeline runner**: ^ref-3a3bf2c9-46-0

* YAML-defined pipelines, **content-hash** caching, concurrency, watch mode. ^ref-3a3bf2c9-48-0
* Writes per-run **markdown reports** and maintains state in `.cache/piper`. ^ref-3a3bf2c9-49-0

## 6) `@promethean/sonarflow`

SonarQube → actionable tasks: ^ref-3a3bf2c9-53-0

* Runs/fetches **Sonar issues**, bundles by **rule/path**, plans concise tasks with Ollama, and writes **task files** under `docs/agile/tasks/sonar`. ^ref-3a3bf2c9-55-0

## 7) `@promethean/boardrev`

Board review automation:

* Ensures task **front matter**. ^ref-3a3bf2c9-61-0
* Slices **Process.md** into **per-column prompts**. ^ref-3a3bf2c9-62-0
* Indexes repo docs/code, finds **relevant context** per task. ^ref-3a3bf2c9-63-0
* LLM **evaluates status** + suggests **next actions**. ^ref-3a3bf2c9-64-0
* Generates **board reports** in `docs/agile/reports`.

## 8) `@promethean/semverguard`

API change governance: ^ref-3a3bf2c9-69-0

* Snapshots **exported API** per package; diffs vs baseline (or `git:<ref>`). ^ref-3a3bf2c9-71-0
* Computes required **major/minor/patch** and drafts migration tasks. ^ref-3a3bf2c9-72-0
* Writes **semver tasks** under `docs/agile/tasks/semver`. ^ref-3a3bf2c9-73-0
* **Step 05: PR maker**: bumps versions, updates dependents (configurable ranges), prepends **CHANGELOG**, prepares branches/PR metadata; optional `--mode git` to push and open PRs. ^ref-3a3bf2c9-74-0

# Pipelines we wired

```mermaid
flowchart LR
  subgraph DocOps
    DOFM[FM ensure] --> DOIDX[Chunk+Embed]
    DOIDX --> DOSIM[Cross-sim]
    DOSIM --> DOREL[Related]
    DOSIM --> DORF[References]
    DOREL --> DOAPPLY[Apply FM]
    DORF  --> DOAPPLY
    DOAPPLY --> DOFOOT[Footer]
    DOAPPLY --> DORENAME[Rename]
  end

  subgraph Codepack
    CPEX[Extract blocks] --> CPEMB[Embed]
    CPEMB --> CPCL[Cluster]
    CPCL --> CPPLAN[Plan names/paths]
    CPPLAN --> CPGEN[Generate pseudo/]
  end

  subgraph Sim+Codemods
    SIMSCAN[Scan+Embed+Cluster] --> CM01[Specs (param maps)]
    CM01 --> CM02[Generate transforms]
    CM02 --> CM03[Run (dry/apply)]
    CM03 --> CM04[Verify]
  end

  subgraph Quality/Agile
    SONAR[Sonar fetch] --> SPLAN[Plan tasks] --> SWRITE[Write tasks]
    BRFM[Board FM] --> BRIDX[Repo index] --> BRCTX[Task context] --> BREV[Evaluate] --> BRREP[Report]
    SVSNAP[API snapshot] --> SVDIFF[Diff] --> SVPLAN[Plan] --> SVWRITE[Write tasks] --> SVPR[Make PRs]
  end
```
^ref-3a3bf2c9-78-0

# Repo-level configs we added
 ^ref-3a3bf2c9-114-0
* **`pipelines.yaml`**: unified pipelines for **docops**, **codepack**, and a **workspace-all** convenience target. ^ref-3a3bf2c9-115-0
* Equivalent split configs `pipelines.docops.yml` and `pipelines.codepack.yml` if you want them separate.

# How to run (quick)
 ^ref-3a3bf2c9-119-0
```bash
# build tool packages as needed
pnpm -w i

# docops (front matter → related/ref → footer/rename)
piper run docops

# codepack (extract/cluster/plan/generate)
piper run codepack

# codemods (example full flow)
piper run codemods
pnpm --filter @promethean/codemods mods:04-verify:after

# sonar → tasks
piper run sonar

# board review → report
piper run board-review

# semver guard → tasks → PR prep
piper run semver-guard
pnpm --filter @promethean/semverguard sv:05-pr --mode prepare   # or --mode git --use-gh true
^ref-3a3bf2c9-119-0
```

# What’s nice about this setup ^ref-3a3bf2c9-146-0
 ^ref-3a3bf2c9-147-0
* **Idempotent**: re-runs are cheap; everything keys off cache fingerprints. ^ref-3a3bf2c9-148-0
* **Composable**: small CLIs with plain JSON inputs/outputs.
* **Traceable**: every pipeline writes a human **markdown report**.

# Suggested near-term polish

* Add a **global `.env` loader** in piper (e.g., `--env-file .env`) so OLLAMA/SONAR vars are automatic. ^ref-3a3bf2c9-154-0
* Board review: per-path **owner map** (prefix → team/assignee) to automate assignment. ^ref-3a3bf2c9-155-0
* Semverguard: option to **group PRs** by scope (one PR per area), and CI job to **fail** on uncommitted snapshot deltas.
* Docops: optional **Obsidian-safe FM size cap** with overflow to a sidecar JSON index. ^ref-3a3bf2c9-157-0

If you want, I can generate a one-pager README for each package or a top-level “how it all works” doc linking to every CLI and cache file.<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [Admin Dashboard for User Management](admin-dashboard-for-user-management.md)
- [2d-sandbox-field](2d-sandbox-field.md)
- [Promethean Pipelines: Local TypeScript-First Workflow](promethean-pipelines-local-typescript-first-workflow.md)
- [AI-First-OS-Model-Context-Protocol](ai-first-os-model-context-protocol.md)
- [balanced-bst](balanced-bst.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [archetype-ecs](archetype-ecs.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [Diagrams](chunks/diagrams.md)
- [JavaScript](chunks/javascript.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [Services](chunks/services.md)
- [Event Bus MVP](event-bus-mvp.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [EidolonField](eidolonfield.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [field-interaction-equations](field-interaction-equations.md)
- [DSL](chunks/dsl.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [Creative Moments](creative-moments.md)
- [DuckDuckGoSearchPipeline](duckduckgosearchpipeline.md)
- [Operations](chunks/operations.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [Board Automation Improvements](board-automation-improvements.md)
- [Post-Linguistic Transhuman Design Frameworks](post-linguistic-transhuman-design-frameworks.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [plan-update-confirmation](plan-update-confirmation.md)
- [Obsidian ChatGPT Plugin Integration Guide](obsidian-chatgpt-plugin-integration-guide.md)
- [Optimizing Command Limitations in System Design](optimizing-command-limitations-in-system-design.md)
- [Obsidian Templating Plugins Integration Guide](obsidian-templating-plugins-integration-guide.md)
- [Model Upgrade Calm-Down Guide](model-upgrade-calm-down-guide.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [Window Management](chunks/window-management.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [Shared](chunks/shared.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [observability-infrastructure-setup](observability-infrastructure-setup.md)
- [NPU Voice Code and Sensory Integration](npu-voice-code-and-sensory-integration.md)
- [OpenAPI Validation Report](openapi-validation-report.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [Promethean Workflow Optimization](promethean-workflow-optimization.md)
- [promethean-system-diagrams](promethean-system-diagrams.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [Shared Package Structure](shared-package-structure.md)
- [Promethean Web UI Setup](promethean-web-ui-setup.md)
- [Provider-Agnostic Chat Panel Implementation](provider-agnostic-chat-panel-implementation.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [Prometheus Observability Stack](prometheus-observability-stack.md)
- [Protocol_0_The_Contradiction_Engine](protocol-0-the-contradiction-engine.md)
- [Pure-Node Crawl Stack with Playwright and Crawlee](pure-node-crawl-stack-with-playwright-and-crawlee.md)
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [shared-package-layout-clarification](shared-package-layout-clarification.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [Pure TypeScript Search Microservice](pure-typescript-search-microservice.md)
- [schema-evolution-workflow](schema-evolution-workflow.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [Self-Agency in AI Interaction](self-agency-in-ai-interaction.md)
- [set-assignment-in-lisp-ast](set-assignment-in-lisp-ast.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [Tooling](chunks/tooling.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [Promethean Pipelines](promethean-pipelines.md)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler](ollama-llm-provider-for-pseudo-code-transpiler.md)
- [Functional Embedding Pipeline Refactor](functional-embedding-pipeline-refactor.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [file-watcher-auth-fix](file-watcher-auth-fix.md)
- [refactor-relations](refactor-relations.md)
- [Promethean State Format](promethean-state-format.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [Promethean-Copilot-Intent-Engine](promethean-copilot-intent-engine.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [Ghostly Smoke Interference](ghostly-smoke-interference.md)
- [State Snapshots API and Transactional Projector](state-snapshots-api-and-transactional-projector.md)
- [Recursive Prompt Construction Engine](recursive-prompt-construction-engine.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [System Scheduler with Resource-Aware DAG](system-scheduler-with-resource-aware-dag.md)
- [Docops Feature Updates](docops-feature-updates.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [i3-config-validation-methods](i3-config-validation-methods.md)
- [Interop and Source Maps](interop-and-source-maps.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
- [Layer1SurvivabilityEnvelope](layer1survivabilityenvelope.md)
- [Universal Lisp Interface](universal-lisp-interface.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [Fnord Tracer Protocol](fnord-tracer-protocol.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [lisp-dsl-for-window-management](lisp-dsl-for-window-management.md)
- [Refactor Frontmatter Processing](refactor-frontmatter-processing.md)
- [Chroma-Embedding-Refactor](chroma-embedding-refactor.md)
- [Lispy Macros with syntax-rules](lispy-macros-with-syntax-rules.md)
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [sibilant-metacompiler-overview](sibilant-metacompiler-overview.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [Functional Refactor of TypeScript Document Processing](functional-refactor-of-typescript-document-processing.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [markdown-to-org-transpiler](markdown-to-org-transpiler.md)
- [Pipeline Enhancements](pipeline-enhancements.md)
- [Promethean Dev Workflow Update](promethean-dev-workflow-update.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [sibilant-meta-string-templating-runtime](sibilant-meta-string-templating-runtime.md)
- [graph-ds](graph-ds.md)
- [TypeScript Patch for Tool Calling Support](typescript-patch-for-tool-calling-support.md)
- [Obsidian ChatGPT Plugin Integration](obsidian-chatgpt-plugin-integration.md)
- [Local-Offline-Model-Deployment-Strategy](local-offline-model-deployment-strategy.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [komorebi-group-window-hack](komorebi-group-window-hack.md)
- [prom-lib-rate-limiters-and-replay-api](prom-lib-rate-limiters-and-replay-api.md)
- [Voice Access Layer Design](voice-access-layer-design.md)
- [polyglot-repl-interface-layer](polyglot-repl-interface-layer.md)
- [template-based-compilation](template-based-compilation.md)
- [Stateful Partitions and Rebalancing](stateful-partitions-and-rebalancing.md)
- [Docops Feature Updates](docops-feature-updates-3.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [Lisp-Compiler-Integration](lisp-compiler-integration.md)
- [mystery-lisp-search-session](mystery-lisp-search-session.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [The Jar of Echoes](the-jar-of-echoes.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [promethean-requirements](promethean-requirements.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [windows-tiling-with-autohotkey](windows-tiling-with-autohotkey.md)
- [Mindful Prioritization](mindful-prioritization.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [Reawakening Duck](reawakening-duck.md)
- [Promethean Full-Stack Docker Setup](promethean-full-stack-docker-setup.md)
- [WebSocket Gateway Implementation](websocket-gateway-implementation.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
- [Ice Box Reorganization](ice-box-reorganization.md)
- [layer-1-uptime-diagrams](layer-1-uptime-diagrams.md)
## Sources
- [Cross-Language Runtime Polymorphism — L3](cross-language-runtime-polymorphism.md#^ref-c34c36a6-3-0) (line 3, col 0, score 0.67)
- [Cross-Target Macro System in Sibilant — L37](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-37-0) (line 37, col 0, score 0.66)
- [Prompt_Folder_Bootstrap — L3](prompt-folder-bootstrap.md#^ref-bd4f0976-3-0) (line 3, col 0, score 0.65)
- [Promethean Workflow Optimization — L12](promethean-workflow-optimization.md#^ref-d614d983-12-0) (line 12, col 0, score 0.65)
- [Ghostly Smoke Interference — L9](ghostly-smoke-interference.md#^ref-b6ae7dfa-9-0) (line 9, col 0, score 0.64)
- [lisp-dsl-for-window-management — L204](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-204-0) (line 204, col 0, score 0.64)
- [The Jar of Echoes — L115](the-jar-of-echoes.md#^ref-18138627-115-0) (line 115, col 0, score 0.64)
- [Exception Layer Analysis — L5](exception-layer-analysis.md#^ref-21d5cc09-5-0) (line 5, col 0, score 0.63)
- [promethean-system-diagrams — L3](promethean-system-diagrams.md#^ref-b51e19b4-3-0) (line 3, col 0, score 0.62)
- [Ghostly Smoke Interference — L1](ghostly-smoke-interference.md#^ref-b6ae7dfa-1-0) (line 1, col 0, score 0.62)
- [State Snapshots API and Transactional Projector — L3](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-3-0) (line 3, col 0, score 0.63)
- [Debugging Broker Connections and Agent Behavior — L30](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-30-0) (line 30, col 0, score 0.62)
- [field-node-diagram-outline — L78](field-node-diagram-outline.md#^ref-1f32c94a-78-0) (line 78, col 0, score 0.61)
- [Agent Tasks: Persistence Migration to DualStore — L121](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-121-0) (line 121, col 0, score 0.61)
- [The Jar of Echoes — L96](the-jar-of-echoes.md#^ref-18138627-96-0) (line 96, col 0, score 0.61)
- [AI-Centric OS with MCP Layer — L23](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-23-0) (line 23, col 0, score 0.67)
- [i3-bluetooth-setup — L74](i3-bluetooth-setup.md#^ref-5e408692-74-0) (line 74, col 0, score 0.72)
- [Promethean-native config design — L363](promethean-native-config-design.md#^ref-ab748541-363-0) (line 363, col 0, score 0.67)
- [Mindful Prioritization — L1](mindful-prioritization.md#^ref-40185d05-1-0) (line 1, col 0, score 0.62)
- [Promethean-native config design — L328](promethean-native-config-design.md#^ref-ab748541-328-0) (line 328, col 0, score 0.61)
- [plan-update-confirmation — L367](plan-update-confirmation.md#^ref-b22d79c6-367-0) (line 367, col 0, score 0.6)
- [lisp-dsl-for-window-management — L21](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-21-0) (line 21, col 0, score 0.66)
- [archetype-ecs — L3](archetype-ecs.md#^ref-8f4c1e86-3-0) (line 3, col 0, score 0.59)
- [Promethean Pipelines — L1](promethean-pipelines.md#^ref-8b8e6103-1-0) (line 1, col 0, score 0.64)
- [State Snapshots API and Transactional Projector — L319](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-319-0) (line 319, col 0, score 0.67)
- [WebSocket Gateway Implementation — L443](websocket-gateway-implementation.md#^ref-e811123d-443-0) (line 443, col 0, score 0.58)
- [Model Selection for Lightweight Conversational Tasks — L105](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-105-0) (line 105, col 0, score 0.58)
- [Promethean Pipelines: Local TypeScript-First Workflow — L3](promethean-pipelines-local-typescript-first-workflow.md#^ref-6b63edca-3-0) (line 3, col 0, score 0.65)
- [Pipeline Enhancements — L1](pipeline-enhancements.md#^ref-e2135d9f-1-0) (line 1, col 0, score 0.67)
- [Fnord Tracer Protocol — L13](fnord-tracer-protocol.md#^ref-fc21f824-13-0) (line 13, col 0, score 0.63)
- [Promethean Pipelines: Local TypeScript-First Workflow — L1](promethean-pipelines-local-typescript-first-workflow.md#^ref-6b63edca-1-0) (line 1, col 0, score 0.74)
- [Promethean-Copilot-Intent-Engine — L9](promethean-copilot-intent-engine.md#^ref-ae24a280-9-0) (line 9, col 0, score 0.63)
- [Model Selection for Lightweight Conversational Tasks — L41](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-41-0) (line 41, col 0, score 0.62)
- [State Snapshots API and Transactional Projector — L321](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-321-0) (line 321, col 0, score 0.65)
- [Lispy Macros with syntax-rules — L389](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-389-0) (line 389, col 0, score 0.62)
- [Docops Feature Updates — L12](docops-feature-updates.md#^ref-2792d448-12-0) (line 12, col 0, score 0.62)
- [Functional Embedding Pipeline Refactor — L309](functional-embedding-pipeline-refactor.md#^ref-a4a25141-309-0) (line 309, col 0, score 0.68)
- [Promethean-Copilot-Intent-Engine — L29](promethean-copilot-intent-engine.md#^ref-ae24a280-29-0) (line 29, col 0, score 0.6)
- [Local-Only-LLM-Workflow — L159](local-only-llm-workflow.md#^ref-9a8ab57e-159-0) (line 159, col 0, score 0.66)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L1](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-1-0) (line 1, col 0, score 0.66)
- [Agent Tasks: Persistence Migration to DualStore — L157](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-157-0) (line 157, col 0, score 0.7)
- [api-gateway-versioning — L298](api-gateway-versioning.md#^ref-0580dcd3-298-0) (line 298, col 0, score 0.7)
- [ecs-offload-workers — L455](ecs-offload-workers.md#^ref-6498b9d7-455-0) (line 455, col 0, score 0.7)
- [ecs-scheduler-and-prefabs — L389](ecs-scheduler-and-prefabs.md#^ref-c62a1815-389-0) (line 389, col 0, score 0.7)
- [eidolon-field-math-foundations — L130](eidolon-field-math-foundations.md#^ref-008f2ac0-130-0) (line 130, col 0, score 0.7)
- [i3-config-validation-methods — L63](i3-config-validation-methods.md#^ref-d28090ac-63-0) (line 63, col 0, score 0.7)
- [Interop and Source Maps — L531](interop-and-source-maps.md#^ref-cdfac40c-531-0) (line 531, col 0, score 0.7)
- [Language-Agnostic Mirror System — L548](language-agnostic-mirror-system.md#^ref-d2b3628c-548-0) (line 548, col 0, score 0.7)
- [Local-First Intention→Code Loop with Free Models — L143](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-143-0) (line 143, col 0, score 0.7)
- [Chroma-Embedding-Refactor — L26](chroma-embedding-refactor.md#^ref-8b256935-26-0) (line 26, col 0, score 0.65)
- [template-based-compilation — L41](template-based-compilation.md#^ref-f8877e5e-41-0) (line 41, col 0, score 0.64)
- [Agent Tasks: Persistence Migration to DualStore — L8](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-8-0) (line 8, col 0, score 0.64)
- [sibilant-metacompiler-overview — L49](sibilant-metacompiler-overview.md#^ref-61d4086b-49-0) (line 49, col 0, score 0.64)
- [Performance-Optimized-Polyglot-Bridge — L345](performance-optimized-polyglot-bridge.md#^ref-f5579967-345-0) (line 345, col 0, score 0.63)
- [api-gateway-versioning — L277](api-gateway-versioning.md#^ref-0580dcd3-277-0) (line 277, col 0, score 0.7)
- [Promethean Infrastructure Setup — L554](promethean-infrastructure-setup.md#^ref-6deed6ac-554-0) (line 554, col 0, score 0.7)
- [TypeScript Patch for Tool Calling Support — L104](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-104-0) (line 104, col 0, score 0.61)
- [Prompt_Folder_Bootstrap — L18](prompt-folder-bootstrap.md#^ref-bd4f0976-18-0) (line 18, col 0, score 0.61)
- [Prompt_Folder_Bootstrap — L36](prompt-folder-bootstrap.md#^ref-bd4f0976-36-0) (line 36, col 0, score 0.61)
- [Prompt_Folder_Bootstrap — L55](prompt-folder-bootstrap.md#^ref-bd4f0976-55-0) (line 55, col 0, score 0.61)
- [Prompt_Folder_Bootstrap — L78](prompt-folder-bootstrap.md#^ref-bd4f0976-78-0) (line 78, col 0, score 0.61)
- [Per-Domain Policy System for JS Crawler — L461](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-461-0) (line 461, col 0, score 0.67)
- [Docops Feature Updates — L3](docops-feature-updates.md#^ref-2792d448-3-0) (line 3, col 0, score 0.64)
- [Promethean Pipelines — L44](promethean-pipelines.md#^ref-8b8e6103-44-0) (line 44, col 0, score 0.66)
- [Functional Embedding Pipeline Refactor — L31](functional-embedding-pipeline-refactor.md#^ref-a4a25141-31-0) (line 31, col 0, score 0.63)
- [Recursive Prompt Construction Engine — L39](recursive-prompt-construction-engine.md#^ref-babdb9eb-39-0) (line 39, col 0, score 0.65)
- [Docops Feature Updates — L13](docops-feature-updates.md#^ref-2792d448-13-0) (line 13, col 0, score 0.68)
- [Recursive Prompt Construction Engine — L41](recursive-prompt-construction-engine.md#^ref-babdb9eb-41-0) (line 41, col 0, score 0.62)
- [refactor-relations — L10](refactor-relations.md#^ref-41ce0216-10-0) (line 10, col 0, score 0.65)
- [Model Selection for Lightweight Conversational Tasks — L74](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-74-0) (line 74, col 0, score 0.63)
- [Prompt_Folder_Bootstrap — L58](prompt-folder-bootstrap.md#^ref-bd4f0976-58-0) (line 58, col 0, score 0.7)
- [Promethean-Copilot-Intent-Engine — L30](promethean-copilot-intent-engine.md#^ref-ae24a280-30-0) (line 30, col 0, score 0.64)
- [Language-Agnostic Mirror System — L507](language-agnostic-mirror-system.md#^ref-d2b3628c-507-0) (line 507, col 0, score 0.62)
- [Language-Agnostic Mirror System — L52](language-agnostic-mirror-system.md#^ref-d2b3628c-52-0) (line 52, col 0, score 0.71)
- [Chroma-Embedding-Refactor — L111](chroma-embedding-refactor.md#^ref-8b256935-111-0) (line 111, col 0, score 0.67)
- [markdown-to-org-transpiler — L1](markdown-to-org-transpiler.md#^ref-ab54cdd8-1-0) (line 1, col 0, score 0.67)
- [RAG UI Panel with Qdrant and PostgREST — L358](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-358-0) (line 358, col 0, score 0.63)
- [Model Selection for Lightweight Conversational Tasks — L55](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-55-0) (line 55, col 0, score 0.66)
- [Promethean State Format — L27](promethean-state-format.md#^ref-23df6ddb-27-0) (line 27, col 0, score 0.73)
- [Language-Agnostic Mirror System — L27](language-agnostic-mirror-system.md#^ref-d2b3628c-27-0) (line 27, col 0, score 0.65)
- [Promethean-Copilot-Intent-Engine — L28](promethean-copilot-intent-engine.md#^ref-ae24a280-28-0) (line 28, col 0, score 0.66)
- [Cross-Language Runtime Polymorphism — L129](cross-language-runtime-polymorphism.md#^ref-c34c36a6-129-0) (line 129, col 0, score 0.63)
- [Obsidian ChatGPT Plugin Integration Guide — L18](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-18-0) (line 18, col 0, score 0.63)
- [Optimizing Command Limitations in System Design — L26](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-26-0) (line 26, col 0, score 0.66)
- [promethean-requirements — L4](promethean-requirements.md#^ref-95205cd3-4-0) (line 4, col 0, score 0.64)
- [markdown-to-org-transpiler — L291](markdown-to-org-transpiler.md#^ref-ab54cdd8-291-0) (line 291, col 0, score 0.63)
- [Agent Tasks: Persistence Migration to DualStore — L92](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-92-0) (line 92, col 0, score 0.62)
- [Model Selection for Lightweight Conversational Tasks — L79](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-79-0) (line 79, col 0, score 0.62)
- [Obsidian ChatGPT Plugin Integration Guide — L17](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-17-0) (line 17, col 0, score 0.62)
- [Obsidian ChatGPT Plugin Integration — L17](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-17-0) (line 17, col 0, score 0.61)
- [Obsidian Templating Plugins Integration Guide — L17](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-17-0) (line 17, col 0, score 0.61)
- [Functional Embedding Pipeline Refactor — L5](functional-embedding-pipeline-refactor.md#^ref-a4a25141-5-0) (line 5, col 0, score 0.61)
- [Functional Embedding Pipeline Refactor — L24](functional-embedding-pipeline-refactor.md#^ref-a4a25141-24-0) (line 24, col 0, score 0.75)
- [Functional Embedding Pipeline Refactor — L302](functional-embedding-pipeline-refactor.md#^ref-a4a25141-302-0) (line 302, col 0, score 0.74)
- [Dynamic Context Model for Web Components — L311](dynamic-context-model-for-web-components.md#^ref-f7702bf8-311-0) (line 311, col 0, score 0.73)
- [Local-First Intention→Code Loop with Free Models — L121](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-121-0) (line 121, col 0, score 0.72)
- [Performance-Optimized-Polyglot-Bridge — L418](performance-optimized-polyglot-bridge.md#^ref-f5579967-418-0) (line 418, col 0, score 0.7)
- [Chroma-Embedding-Refactor — L105](chroma-embedding-refactor.md#^ref-8b256935-105-0) (line 105, col 0, score 0.68)
- [Chroma-Embedding-Refactor — L250](chroma-embedding-refactor.md#^ref-8b256935-250-0) (line 250, col 0, score 0.68)
- [Functional Embedding Pipeline Refactor — L11](functional-embedding-pipeline-refactor.md#^ref-a4a25141-11-0) (line 11, col 0, score 0.67)
- [Agent Tasks: Persistence Migration to DualStore — L111](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-111-0) (line 111, col 0, score 0.66)
- [Promethean-Copilot-Intent-Engine — L33](promethean-copilot-intent-engine.md#^ref-ae24a280-33-0) (line 33, col 0, score 0.66)
- [Agent Tasks: Persistence Migration to DualStore — L97](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-97-0) (line 97, col 0, score 0.67)
- [Promethean Dev Workflow Update — L53](promethean-dev-workflow-update.md#^ref-03a5578f-53-0) (line 53, col 0, score 0.67)
- [Model Upgrade Calm-Down Guide — L30](model-upgrade-calm-down-guide.md#^ref-db74343f-30-0) (line 30, col 0, score 0.68)
- [universal-intention-code-fabric — L383](universal-intention-code-fabric.md#^ref-c14edce7-383-0) (line 383, col 0, score 0.65)
- [Promethean Pipelines — L42](promethean-pipelines.md#^ref-8b8e6103-42-0) (line 42, col 0, score 0.69)
- [Promethean Infrastructure Setup — L534](promethean-infrastructure-setup.md#^ref-6deed6ac-534-0) (line 534, col 0, score 0.63)
- [Promethean-Copilot-Intent-Engine — L50](promethean-copilot-intent-engine.md#^ref-ae24a280-50-0) (line 50, col 0, score 0.66)
- [prom-lib-rate-limiters-and-replay-api — L256](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-256-0) (line 256, col 0, score 0.64)
- [Agent Tasks: Persistence Migration to DualStore — L7](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-7-0) (line 7, col 0, score 0.63)
- [Dynamic Context Model for Web Components — L75](dynamic-context-model-for-web-components.md#^ref-f7702bf8-75-0) (line 75, col 0, score 0.63)
- [Language-Agnostic Mirror System — L3](language-agnostic-mirror-system.md#^ref-d2b3628c-3-0) (line 3, col 0, score 0.66)
- [Local-First Intention→Code Loop with Free Models — L127](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-127-0) (line 127, col 0, score 0.62)
- [plan-update-confirmation — L836](plan-update-confirmation.md#^ref-b22d79c6-836-0) (line 836, col 0, score 0.6)
- [Dynamic Context Model for Web Components — L23](dynamic-context-model-for-web-components.md#^ref-f7702bf8-23-0) (line 23, col 0, score 0.7)
- [polyglot-repl-interface-layer — L139](polyglot-repl-interface-layer.md#^ref-9c79206d-139-0) (line 139, col 0, score 0.64)
- [Dynamic Context Model for Web Components — L146](dynamic-context-model-for-web-components.md#^ref-f7702bf8-146-0) (line 146, col 0, score 0.65)
- [Performance-Optimized-Polyglot-Bridge — L381](performance-optimized-polyglot-bridge.md#^ref-f5579967-381-0) (line 381, col 0, score 0.67)
- [Promethean Pipelines — L32](promethean-pipelines.md#^ref-8b8e6103-32-0) (line 32, col 0, score 0.66)
- [Fnord Tracer Protocol — L181](fnord-tracer-protocol.md#^ref-fc21f824-181-0) (line 181, col 0, score 0.66)
- [Promethean Pipelines — L26](promethean-pipelines.md#^ref-8b8e6103-26-0) (line 26, col 0, score 0.65)
- [Promethean Pipelines — L24](promethean-pipelines.md#^ref-8b8e6103-24-0) (line 24, col 0, score 0.68)
- [mystery-lisp-search-session — L100](mystery-lisp-search-session.md#^ref-513dc4c7-100-0) (line 100, col 0, score 0.63)
- [Recursive Prompt Construction Engine — L75](recursive-prompt-construction-engine.md#^ref-babdb9eb-75-0) (line 75, col 0, score 0.68)
- [universal-intention-code-fabric — L24](universal-intention-code-fabric.md#^ref-c14edce7-24-0) (line 24, col 0, score 0.67)
- [prompt-programming-language-lisp — L3](prompt-programming-language-lisp.md#^ref-d41a06d1-3-0) (line 3, col 0, score 0.65)
- [Promethean Pipelines — L76](promethean-pipelines.md#^ref-8b8e6103-76-0) (line 76, col 0, score 0.64)
- [sibilant-meta-string-templating-runtime — L107](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-107-0) (line 107, col 0, score 0.64)
- [Admin Dashboard for User Management — L43](admin-dashboard-for-user-management.md#^ref-2901a3e9-43-0) (line 43, col 0, score 0.64)
- [archetype-ecs — L465](archetype-ecs.md#^ref-8f4c1e86-465-0) (line 465, col 0, score 0.64)
- [Tooling — L23](chunks/tooling.md#^ref-6cb4943e-23-0) (line 23, col 0, score 0.64)
- [ecs-offload-workers — L471](ecs-offload-workers.md#^ref-6498b9d7-471-0) (line 471, col 0, score 0.64)
- [eidolon-field-math-foundations — L144](eidolon-field-math-foundations.md#^ref-008f2ac0-144-0) (line 144, col 0, score 0.64)
- [i3-config-validation-methods — L54](i3-config-validation-methods.md#^ref-d28090ac-54-0) (line 54, col 0, score 0.64)
- [js-to-lisp-reverse-compiler — L426](js-to-lisp-reverse-compiler.md#^ref-58191024-426-0) (line 426, col 0, score 0.64)
- [Dynamic Context Model for Web Components — L165](dynamic-context-model-for-web-components.md#^ref-f7702bf8-165-0) (line 165, col 0, score 0.67)
- [Shared Package Structure — L146](shared-package-structure.md#^ref-66a72fc3-146-0) (line 146, col 0, score 0.66)
- [Prompt_Folder_Bootstrap — L145](prompt-folder-bootstrap.md#^ref-bd4f0976-145-0) (line 145, col 0, score 0.65)
- [Shared Package Structure — L154](shared-package-structure.md#^ref-66a72fc3-154-0) (line 154, col 0, score 0.63)
- [Agent Reflections and Prompt Evolution — L136](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-136-0) (line 136, col 0, score 0.62)
- [Canonical Org-Babel Matplotlib Animation Template — L108](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-108-0) (line 108, col 0, score 0.62)
- [Chroma Toolkit Consolidation Plan — L168](chroma-toolkit-consolidation-plan.md#^ref-5020e892-168-0) (line 168, col 0, score 0.62)
- [lisp-dsl-for-window-management — L122](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-122-0) (line 122, col 0, score 0.69)
- [Migrate to Provider-Tenant Architecture — L243](migrate-to-provider-tenant-architecture.md#^ref-54382370-243-0) (line 243, col 0, score 0.64)
- [lisp-dsl-for-window-management — L9](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-9-0) (line 9, col 0, score 0.64)
- [Migrate to Provider-Tenant Architecture — L85](migrate-to-provider-tenant-architecture.md#^ref-54382370-85-0) (line 85, col 0, score 0.64)
- [Chroma Toolkit Consolidation Plan — L14](chroma-toolkit-consolidation-plan.md#^ref-5020e892-14-0) (line 14, col 0, score 0.64)
- [Functional Refactor of TypeScript Document Processing — L115](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-115-0) (line 115, col 0, score 0.63)
- [windows-tiling-with-autohotkey — L109](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-109-0) (line 109, col 0, score 0.63)
- [Event Bus Projections Architecture — L1](event-bus-projections-architecture.md#^ref-cf6b9b17-1-0) (line 1, col 0, score 0.69)
- [graph-ds — L1](graph-ds.md#^ref-6620e2f2-1-0) (line 1, col 0, score 0.66)
- [js-to-lisp-reverse-compiler — L427](js-to-lisp-reverse-compiler.md#^ref-58191024-427-0) (line 427, col 0, score 0.64)
- [komorebi-group-window-hack — L219](komorebi-group-window-hack.md#^ref-dd89372d-219-0) (line 219, col 0, score 0.64)
- [Language-Agnostic Mirror System — L563](language-agnostic-mirror-system.md#^ref-d2b3628c-563-0) (line 563, col 0, score 0.64)
- [Layer1SurvivabilityEnvelope — L179](layer1survivabilityenvelope.md#^ref-64a9f9f9-179-0) (line 179, col 0, score 0.64)
- [Lisp-Compiler-Integration — L562](lisp-compiler-integration.md#^ref-cfee6d36-562-0) (line 562, col 0, score 0.64)
- [polyglot-repl-interface-layer — L170](polyglot-repl-interface-layer.md#^ref-9c79206d-170-0) (line 170, col 0, score 0.64)
- [Promethean Dev Workflow Update — L69](promethean-dev-workflow-update.md#^ref-03a5578f-69-0) (line 69, col 0, score 0.64)
- [Promethean-native config design — L385](promethean-native-config-design.md#^ref-ab748541-385-0) (line 385, col 0, score 0.64)
- [Promethean Web UI Setup — L626](promethean-web-ui-setup.md#^ref-bc5172ca-626-0) (line 626, col 0, score 0.64)
- [Prompt_Folder_Bootstrap — L184](prompt-folder-bootstrap.md#^ref-bd4f0976-184-0) (line 184, col 0, score 0.64)
- [prompt-programming-language-lisp — L74](prompt-programming-language-lisp.md#^ref-d41a06d1-74-0) (line 74, col 0, score 0.64)
- [Provider-Agnostic Chat Panel Implementation — L231](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-231-0) (line 231, col 0, score 0.64)
- [Migrate to Provider-Tenant Architecture — L194](migrate-to-provider-tenant-architecture.md#^ref-54382370-194-0) (line 194, col 0, score 0.73)
- [Migrate to Provider-Tenant Architecture — L195](migrate-to-provider-tenant-architecture.md#^ref-54382370-195-0) (line 195, col 0, score 0.73)
- [Migrate to Provider-Tenant Architecture — L196](migrate-to-provider-tenant-architecture.md#^ref-54382370-196-0) (line 196, col 0, score 0.73)
- [Migrate to Provider-Tenant Architecture — L197](migrate-to-provider-tenant-architecture.md#^ref-54382370-197-0) (line 197, col 0, score 0.73)
- [Migrate to Provider-Tenant Architecture — L198](migrate-to-provider-tenant-architecture.md#^ref-54382370-198-0) (line 198, col 0, score 0.73)
- [Chroma-Embedding-Refactor — L334](chroma-embedding-refactor.md#^ref-8b256935-334-0) (line 334, col 0, score 0.68)
- [Functional Refactor of TypeScript Document Processing — L150](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-150-0) (line 150, col 0, score 0.68)
- [Language-Agnostic Mirror System — L566](language-agnostic-mirror-system.md#^ref-d2b3628c-566-0) (line 566, col 0, score 0.68)
- [Promethean Agent Config DSL — L289](promethean-agent-config-dsl.md#^ref-2c00ce45-289-0) (line 289, col 0, score 0.63)
- [Universal Lisp Interface — L178](universal-lisp-interface.md#^ref-b01856b4-178-0) (line 178, col 0, score 0.61)
- [Docops Feature Updates — L3](docops-feature-updates-3.md#^ref-cdbd21ee-3-0) (line 3, col 0, score 0.61)
- [Docops Feature Updates — L20](docops-feature-updates.md#^ref-2792d448-20-0) (line 20, col 0, score 0.61)
- [Fnord Tracer Protocol — L172](fnord-tracer-protocol.md#^ref-fc21f824-172-0) (line 172, col 0, score 0.6)
- [Promethean Agent Config DSL — L123](promethean-agent-config-dsl.md#^ref-2c00ce45-123-0) (line 123, col 0, score 0.6)
- [Interop and Source Maps — L9](interop-and-source-maps.md#^ref-cdfac40c-9-0) (line 9, col 0, score 0.58)
- [Layer1SurvivabilityEnvelope — L148](layer1survivabilityenvelope.md#^ref-64a9f9f9-148-0) (line 148, col 0, score 0.7)
- [Cross-Language Runtime Polymorphism — L155](cross-language-runtime-polymorphism.md#^ref-c34c36a6-155-0) (line 155, col 0, score 0.59)
- [Promethean Pipelines — L85](promethean-pipelines.md#^ref-8b8e6103-85-0) (line 85, col 0, score 0.68)
- [template-based-compilation — L60](template-based-compilation.md#^ref-f8877e5e-60-0) (line 60, col 0, score 0.64)
- [universal-intention-code-fabric — L420](universal-intention-code-fabric.md#^ref-c14edce7-420-0) (line 420, col 0, score 0.63)
- [Pipeline Enhancements — L2](pipeline-enhancements.md#^ref-e2135d9f-2-0) (line 2, col 0, score 0.67)
- [Interop and Source Maps — L506](interop-and-source-maps.md#^ref-cdfac40c-506-0) (line 506, col 0, score 0.62)
- [Promethean Agent Config DSL — L292](promethean-agent-config-dsl.md#^ref-2c00ce45-292-0) (line 292, col 0, score 0.6)
- [i3-config-validation-methods — L9](i3-config-validation-methods.md#^ref-d28090ac-9-0) (line 9, col 0, score 0.61)
- [Dynamic Context Model for Web Components — L337](dynamic-context-model-for-web-components.md#^ref-f7702bf8-337-0) (line 337, col 0, score 0.61)
- [Functional Embedding Pipeline Refactor — L307](functional-embedding-pipeline-refactor.md#^ref-a4a25141-307-0) (line 307, col 0, score 0.6)
- [shared-package-layout-clarification — L143](shared-package-layout-clarification.md#^ref-36c8882a-143-0) (line 143, col 0, score 0.59)
- [universal-intention-code-fabric — L25](universal-intention-code-fabric.md#^ref-c14edce7-25-0) (line 25, col 0, score 0.62)
- [Agent Tasks: Persistence Migration to DualStore — L103](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-103-0) (line 103, col 0, score 0.65)
- [Lisp-Compiler-Integration — L531](lisp-compiler-integration.md#^ref-cfee6d36-531-0) (line 531, col 0, score 0.59)
- [Board Walk – 2025-08-11 — L93](board-walk-2025-08-11.md#^ref-7aa1eb92-93-0) (line 93, col 0, score 0.59)
- [i3-bluetooth-setup — L7](i3-bluetooth-setup.md#^ref-5e408692-7-0) (line 7, col 0, score 0.58)
- [Promethean Agent Config DSL — L137](promethean-agent-config-dsl.md#^ref-2c00ce45-137-0) (line 137, col 0, score 0.61)
- [Mongo Outbox Implementation — L537](mongo-outbox-implementation.md#^ref-9c1acd1e-537-0) (line 537, col 0, score 0.6)
- [universal-intention-code-fabric — L26](universal-intention-code-fabric.md#^ref-c14edce7-26-0) (line 26, col 0, score 0.6)
- [Promethean Pipelines — L20](promethean-pipelines.md#^ref-8b8e6103-20-0) (line 20, col 0, score 0.59)
- [WebSocket Gateway Implementation — L614](websocket-gateway-implementation.md#^ref-e811123d-614-0) (line 614, col 0, score 0.58)
- [Promethean Pipelines — L78](promethean-pipelines.md#^ref-8b8e6103-78-0) (line 78, col 0, score 0.58)
- [Fnord Tracer Protocol — L116](fnord-tracer-protocol.md#^ref-fc21f824-116-0) (line 116, col 0, score 0.58)
- [homeostasis-decay-formulas — L64](homeostasis-decay-formulas.md#^ref-37b5d236-64-0) (line 64, col 0, score 0.58)
- [eidolon-field-math-foundations — L40](eidolon-field-math-foundations.md#^ref-008f2ac0-40-0) (line 40, col 0, score 0.58)
- [Chroma-Embedding-Refactor — L256](chroma-embedding-refactor.md#^ref-8b256935-256-0) (line 256, col 0, score 0.6)
- [api-gateway-versioning — L320](api-gateway-versioning.md#^ref-0580dcd3-320-0) (line 320, col 0, score 0.69)
- [Optimizing Command Limitations in System Design — L52](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-52-0) (line 52, col 0, score 0.69)
- [Promethean Infrastructure Setup — L628](promethean-infrastructure-setup.md#^ref-6deed6ac-628-0) (line 628, col 0, score 0.69)
- [AI-Centric OS with MCP Layer — L32](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-32-0) (line 32, col 0, score 0.59)
- [lisp-dsl-for-window-management — L186](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-186-0) (line 186, col 0, score 0.61)
- [polymorphic-meta-programming-engine — L188](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-188-0) (line 188, col 0, score 0.6)
- [Performance-Optimized-Polyglot-Bridge — L13](performance-optimized-polyglot-bridge.md#^ref-f5579967-13-0) (line 13, col 0, score 0.59)
- [Layer1SurvivabilityEnvelope — L84](layer1survivabilityenvelope.md#^ref-64a9f9f9-84-0) (line 84, col 0, score 0.59)
- [Promethean-Copilot-Intent-Engine — L42](promethean-copilot-intent-engine.md#^ref-ae24a280-42-0) (line 42, col 0, score 0.59)
- [Cross-Language Runtime Polymorphism — L121](cross-language-runtime-polymorphism.md#^ref-c34c36a6-121-0) (line 121, col 0, score 0.59)
- [Model Selection for Lightweight Conversational Tasks — L109](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-109-0) (line 109, col 0, score 0.69)
- [Optimizing Command Limitations in System Design — L21](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-21-0) (line 21, col 0, score 0.69)
- [Obsidian ChatGPT Plugin Integration Guide — L15](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-15-0) (line 15, col 0, score 0.65)
- [Obsidian ChatGPT Plugin Integration — L15](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-15-0) (line 15, col 0, score 0.65)
- [Obsidian Templating Plugins Integration Guide — L15](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-15-0) (line 15, col 0, score 0.66)
- [sibilant-macro-targets — L18](sibilant-macro-targets.md#^ref-c5c9a5c6-18-0) (line 18, col 0, score 0.63)
- [Simulation Demo — L32](chunks/simulation-demo.md#^ref-557309a3-32-0) (line 32, col 0, score 1)
- [Tooling — L26](chunks/tooling.md#^ref-6cb4943e-26-0) (line 26, col 0, score 1)
- [Window Management — L36](chunks/window-management.md#^ref-9e8ae388-36-0) (line 36, col 0, score 1)
- [compiler-kit-foundations — L639](compiler-kit-foundations.md#^ref-01b21543-639-0) (line 639, col 0, score 1)
- [Creative Moments — L10](creative-moments.md#^ref-10d98225-10-0) (line 10, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L258](cross-language-runtime-polymorphism.md#^ref-c34c36a6-258-0) (line 258, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L215](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-215-0) (line 215, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L50](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-50-0) (line 50, col 0, score 1)
- [DuckDuckGoSearchPipeline — L16](duckduckgosearchpipeline.md#^ref-e979c50f-16-0) (line 16, col 0, score 1)
- [Refactor Frontmatter Processing — L3](refactor-frontmatter-processing.md#^ref-cfbdca2f-3-0) (line 3, col 0, score 0.62)
- [Local-Only-LLM-Workflow — L28](local-only-llm-workflow.md#^ref-9a8ab57e-28-0) (line 28, col 0, score 0.66)
- [TypeScript Patch for Tool Calling Support — L425](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-425-0) (line 425, col 0, score 0.66)
- [Local-Offline-Model-Deployment-Strategy — L80](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-80-0) (line 80, col 0, score 0.66)
- [TypeScript Patch for Tool Calling Support — L264](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-264-0) (line 264, col 0, score 0.65)
- [TypeScript Patch for Tool Calling Support — L354](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-354-0) (line 354, col 0, score 0.65)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L7](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-7-0) (line 7, col 0, score 0.65)
- [Promethean Infrastructure Setup — L61](promethean-infrastructure-setup.md#^ref-6deed6ac-61-0) (line 61, col 0, score 0.64)
- [Docops Feature Updates — L2](docops-feature-updates-3.md#^ref-cdbd21ee-2-0) (line 2, col 0, score 0.64)
- [Docops Feature Updates — L19](docops-feature-updates.md#^ref-2792d448-19-0) (line 19, col 0, score 0.64)
- [Admin Dashboard for User Management — L45](admin-dashboard-for-user-management.md#^ref-2901a3e9-45-0) (line 45, col 0, score 0.63)
- [Agent Tasks: Persistence Migration to DualStore — L170](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-170-0) (line 170, col 0, score 0.63)
- [AI-Centric OS with MCP Layer — L416](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-416-0) (line 416, col 0, score 0.63)
- [AI-First-OS-Model-Context-Protocol — L11](ai-first-os-model-context-protocol.md#^ref-618198f4-11-0) (line 11, col 0, score 0.63)
- [aionian-circuit-math — L178](aionian-circuit-math.md#^ref-f2d83a77-178-0) (line 178, col 0, score 0.63)
- [api-gateway-versioning — L312](api-gateway-versioning.md#^ref-0580dcd3-312-0) (line 312, col 0, score 0.63)
- [balanced-bst — L297](balanced-bst.md#^ref-d3e7db72-297-0) (line 297, col 0, score 0.63)
- [Board Walk – 2025-08-11 — L131](board-walk-2025-08-11.md#^ref-7aa1eb92-131-0) (line 131, col 0, score 0.63)
- [Operations — L8](chunks/operations.md#^ref-f1add613-8-0) (line 8, col 0, score 0.63)
- [Admin Dashboard for User Management — L9](admin-dashboard-for-user-management.md#^ref-2901a3e9-9-0) (line 9, col 0, score 0.63)
- [Eidolon Field Abstract Model — L92](eidolon-field-abstract-model.md#^ref-5e8b2388-92-0) (line 92, col 0, score 0.64)
- [Agent Reflections and Prompt Evolution — L106](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-106-0) (line 106, col 0, score 0.62)
- [Agent Reflections and Prompt Evolution — L45](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-45-0) (line 45, col 0, score 0.61)
- [Prompt_Folder_Bootstrap — L57](prompt-folder-bootstrap.md#^ref-bd4f0976-57-0) (line 57, col 0, score 0.62)
- [Reawakening Duck — L19](reawakening-duck.md#^ref-59b5670f-19-0) (line 19, col 0, score 0.6)
- [Obsidian Templating Plugins Integration Guide — L73](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-73-0) (line 73, col 0, score 0.6)
- [Promethean Agent Config DSL — L178](promethean-agent-config-dsl.md#^ref-2c00ce45-178-0) (line 178, col 0, score 0.59)
- [Model Upgrade Calm-Down Guide — L38](model-upgrade-calm-down-guide.md#^ref-db74343f-38-0) (line 38, col 0, score 0.65)
- [Prompt_Folder_Bootstrap — L88](prompt-folder-bootstrap.md#^ref-bd4f0976-88-0) (line 88, col 0, score 0.58)
- [Sibilant Meta-Prompt DSL — L67](sibilant-meta-prompt-dsl.md#^ref-af5d2824-67-0) (line 67, col 0, score 0.66)
- [Recursive Prompt Construction Engine — L21](recursive-prompt-construction-engine.md#^ref-babdb9eb-21-0) (line 21, col 0, score 0.66)
- [Recursive Prompt Construction Engine — L137](recursive-prompt-construction-engine.md#^ref-babdb9eb-137-0) (line 137, col 0, score 0.65)
- [Voice Access Layer Design — L90](voice-access-layer-design.md#^ref-543ed9b3-90-0) (line 90, col 0, score 0.65)
- [prompt-programming-language-lisp — L6](prompt-programming-language-lisp.md#^ref-d41a06d1-6-0) (line 6, col 0, score 0.67)
- [markdown-to-org-transpiler — L7](markdown-to-org-transpiler.md#^ref-ab54cdd8-7-0) (line 7, col 0, score 0.63)
- [markdown-to-org-transpiler — L219](markdown-to-org-transpiler.md#^ref-ab54cdd8-219-0) (line 219, col 0, score 0.62)
- [Promethean Pipelines — L38](promethean-pipelines.md#^ref-8b8e6103-38-0) (line 38, col 0, score 0.62)
- [State Snapshots API and Transactional Projector — L130](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-130-0) (line 130, col 0, score 0.62)
- [Agent Reflections and Prompt Evolution — L102](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-102-0) (line 102, col 0, score 0.62)
- [Unique Info Dump Index — L10](unique-info-dump-index.md#^ref-30ec3ba6-10-0) (line 10, col 0, score 0.62)
- [Promethean-Copilot-Intent-Engine — L10](promethean-copilot-intent-engine.md#^ref-ae24a280-10-0) (line 10, col 0, score 0.68)
- [Shared — L19](chunks/shared.md#^ref-623a55f7-19-0) (line 19, col 0, score 0.62)
- [Window Management — L28](chunks/window-management.md#^ref-9e8ae388-28-0) (line 28, col 0, score 0.62)
- [Creative Moments — L8](creative-moments.md#^ref-10d98225-8-0) (line 8, col 0, score 0.62)
- [Cross-Target Macro System in Sibilant — L211](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-211-0) (line 211, col 0, score 0.62)
- [Debugging Broker Connections and Agent Behavior — L54](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-54-0) (line 54, col 0, score 0.62)
- [DuckDuckGoSearchPipeline — L12](duckduckgosearchpipeline.md#^ref-e979c50f-12-0) (line 12, col 0, score 0.62)
- [Duck's Self-Referential Perceptual Loop — L51](ducks-self-referential-perceptual-loop.md#^ref-71726f04-51-0) (line 51, col 0, score 0.62)
- [Admin Dashboard for User Management — L34](admin-dashboard-for-user-management.md#^ref-2901a3e9-34-0) (line 34, col 0, score 0.68)
- [AI-Centric OS with MCP Layer — L420](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-420-0) (line 420, col 0, score 0.63)
- [aionian-circuit-math — L177](aionian-circuit-math.md#^ref-f2d83a77-177-0) (line 177, col 0, score 0.63)
- [Board Automation Improvements — L18](board-automation-improvements.md#^ref-ac60a1d6-18-0) (line 18, col 0, score 0.63)
- [Board Walk – 2025-08-11 — L140](board-walk-2025-08-11.md#^ref-7aa1eb92-140-0) (line 140, col 0, score 0.63)
- [Canonical Org-Babel Matplotlib Animation Template — L118](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-118-0) (line 118, col 0, score 0.63)
- [Diagrams — L47](chunks/diagrams.md#^ref-45cd25b5-47-0) (line 47, col 0, score 0.63)
- [JavaScript — L35](chunks/javascript.md#^ref-c1618c66-35-0) (line 35, col 0, score 0.63)
- [Math Fundamentals — L33](chunks/math-fundamentals.md#^ref-c6e87433-33-0) (line 33, col 0, score 0.63)
- [Services — L31](chunks/services.md#^ref-75ea4a6a-31-0) (line 31, col 0, score 0.63)
- [State Snapshots API and Transactional Projector — L317](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-317-0) (line 317, col 0, score 0.71)
- [Promethean Pipelines — L5](promethean-pipelines.md#^ref-8b8e6103-5-0) (line 5, col 0, score 0.66)
- [Promethean Event Bus MVP v0.1 — L733](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-733-0) (line 733, col 0, score 0.68)
- [Promethean Pipelines — L84](promethean-pipelines.md#^ref-8b8e6103-84-0) (line 84, col 0, score 0.66)
- [Layer1SurvivabilityEnvelope — L159](layer1survivabilityenvelope.md#^ref-64a9f9f9-159-0) (line 159, col 0, score 0.66)
- [State Snapshots API and Transactional Projector — L9](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-9-0) (line 9, col 0, score 0.66)
- [Services — L9](chunks/services.md#^ref-75ea4a6a-9-0) (line 9, col 0, score 0.64)
- [ecs-scheduler-and-prefabs — L420](ecs-scheduler-and-prefabs.md#^ref-c62a1815-420-0) (line 420, col 0, score 0.64)
- [Event Bus MVP — L552](event-bus-mvp.md#^ref-534fe91d-552-0) (line 552, col 0, score 0.64)
- [Migrate to Provider-Tenant Architecture — L201](migrate-to-provider-tenant-architecture.md#^ref-54382370-201-0) (line 201, col 0, score 0.61)
- [prom-lib-rate-limiters-and-replay-api — L58](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-58-0) (line 58, col 0, score 0.65)
- [prom-lib-rate-limiters-and-replay-api — L369](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-369-0) (line 369, col 0, score 0.65)
- [AI-Centric OS with MCP Layer — L11](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-11-0) (line 11, col 0, score 0.65)
- [Migrate to Provider-Tenant Architecture — L261](migrate-to-provider-tenant-architecture.md#^ref-54382370-261-0) (line 261, col 0, score 0.65)
- [ecs-offload-workers — L7](ecs-offload-workers.md#^ref-6498b9d7-7-0) (line 7, col 0, score 0.65)
- [Stateful Partitions and Rebalancing — L522](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-522-0) (line 522, col 0, score 0.64)
- [Promethean-native config design — L375](promethean-native-config-design.md#^ref-ab748541-375-0) (line 375, col 0, score 0.64)
- [Promethean Pipelines — L10](promethean-pipelines.md#^ref-8b8e6103-10-0) (line 10, col 0, score 0.76)
- [Promethean Pipelines — L8](promethean-pipelines.md#^ref-8b8e6103-8-0) (line 8, col 0, score 0.67)
- [Promethean Pipelines — L77](promethean-pipelines.md#^ref-8b8e6103-77-0) (line 77, col 0, score 0.64)
- [compiler-kit-foundations — L640](compiler-kit-foundations.md#^ref-01b21543-640-0) (line 640, col 0, score 0.63)
- [Promethean Pipelines: Local TypeScript-First Workflow — L219](promethean-pipelines-local-typescript-first-workflow.md#^ref-6b63edca-219-0) (line 219, col 0, score 0.82)
- [Promethean Event Bus MVP v0.1 — L832](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-832-0) (line 832, col 0, score 0.73)
- [Language-Agnostic Mirror System — L11](language-agnostic-mirror-system.md#^ref-d2b3628c-11-0) (line 11, col 0, score 0.73)
- [Duck's Attractor States — L5](ducks-attractor-states.md#^ref-13951643-5-0) (line 5, col 0, score 0.73)
- [Promethean Pipelines — L58](promethean-pipelines.md#^ref-8b8e6103-58-0) (line 58, col 0, score 0.72)
- [archetype-ecs — L423](archetype-ecs.md#^ref-8f4c1e86-423-0) (line 423, col 0, score 0.72)
- [Event Bus Projections Architecture — L5](event-bus-projections-architecture.md#^ref-cf6b9b17-5-0) (line 5, col 0, score 0.72)
- [Promethean Infrastructure Setup — L501](promethean-infrastructure-setup.md#^ref-6deed6ac-501-0) (line 501, col 0, score 0.71)
- [Ghostly Smoke Interference — L11](ghostly-smoke-interference.md#^ref-b6ae7dfa-11-0) (line 11, col 0, score 0.71)
- [ecs-scheduler-and-prefabs — L352](ecs-scheduler-and-prefabs.md#^ref-c62a1815-352-0) (line 352, col 0, score 0.71)
- [System Scheduler with Resource-Aware DAG — L350](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-350-0) (line 350, col 0, score 0.71)
- [Event Bus Projections Architecture — L67](event-bus-projections-architecture.md#^ref-cf6b9b17-67-0) (line 67, col 0, score 0.7)
- [field-node-diagram-visualizations — L63](field-node-diagram-visualizations.md#^ref-e9b27b06-63-0) (line 63, col 0, score 0.68)
- [RAG UI Panel with Qdrant and PostgREST — L336](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-336-0) (line 336, col 0, score 0.67)
- [universal-intention-code-fabric — L9](universal-intention-code-fabric.md#^ref-c14edce7-9-0) (line 9, col 0, score 0.67)
- [Universal Lisp Interface — L26](universal-lisp-interface.md#^ref-b01856b4-26-0) (line 26, col 0, score 0.67)
- [Promethean-native config design — L21](promethean-native-config-design.md#^ref-ab748541-21-0) (line 21, col 0, score 0.64)
- [prom-lib-rate-limiters-and-replay-api — L345](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-345-0) (line 345, col 0, score 0.64)
- [sibilant-macro-targets — L113](sibilant-macro-targets.md#^ref-c5c9a5c6-113-0) (line 113, col 0, score 0.64)
- [Promethean Event Bus MVP v0.1 — L393](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-393-0) (line 393, col 0, score 0.64)
- [Pipeline Enhancements — L3](pipeline-enhancements.md#^ref-e2135d9f-3-0) (line 3, col 0, score 0.66)
- [Promethean Agent Config DSL — L72](promethean-agent-config-dsl.md#^ref-2c00ce45-72-0) (line 72, col 0, score 0.63)
- [Chroma Toolkit Consolidation Plan — L4](chroma-toolkit-consolidation-plan.md#^ref-5020e892-4-0) (line 4, col 0, score 0.63)
- [Migrate to Provider-Tenant Architecture — L59](migrate-to-provider-tenant-architecture.md#^ref-54382370-59-0) (line 59, col 0, score 0.71)
- [Promethean Event Bus MVP v0.1 — L114](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-114-0) (line 114, col 0, score 0.69)
- [i3-config-validation-methods — L16](i3-config-validation-methods.md#^ref-d28090ac-16-0) (line 16, col 0, score 0.66)
- [Chroma Toolkit Consolidation Plan — L10](chroma-toolkit-consolidation-plan.md#^ref-5020e892-10-0) (line 10, col 0, score 0.63)
- [i3-config-validation-methods — L25](i3-config-validation-methods.md#^ref-d28090ac-25-0) (line 25, col 0, score 0.61)
- [Promethean-native config design — L72](promethean-native-config-design.md#^ref-ab748541-72-0) (line 72, col 0, score 0.61)
- [Event Bus MVP — L368](event-bus-mvp.md#^ref-534fe91d-368-0) (line 368, col 0, score 0.6)
- [api-gateway-versioning — L280](api-gateway-versioning.md#^ref-0580dcd3-280-0) (line 280, col 0, score 0.6)
- [Promethean Full-Stack Docker Setup — L342](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-342-0) (line 342, col 0, score 0.6)
- [Promethean-native config design — L367](promethean-native-config-design.md#^ref-ab748541-367-0) (line 367, col 0, score 0.6)
- [i3-config-validation-methods — L3](i3-config-validation-methods.md#^ref-d28090ac-3-0) (line 3, col 0, score 0.59)
- [shared-package-layout-clarification — L145](shared-package-layout-clarification.md#^ref-36c8882a-145-0) (line 145, col 0, score 0.73)
- [file-watcher-auth-fix — L9](file-watcher-auth-fix.md#^ref-9044701b-9-0) (line 9, col 0, score 0.73)
- [Pure TypeScript Search Microservice — L73](pure-typescript-search-microservice.md#^ref-d17d3a96-73-0) (line 73, col 0, score 0.71)
- [Promethean Web UI Setup — L238](promethean-web-ui-setup.md#^ref-bc5172ca-238-0) (line 238, col 0, score 0.7)
- [plan-update-confirmation — L637](plan-update-confirmation.md#^ref-b22d79c6-637-0) (line 637, col 0, score 0.69)
- [Promethean Infrastructure Setup — L33](promethean-infrastructure-setup.md#^ref-6deed6ac-33-0) (line 33, col 0, score 0.68)
- [Prometheus Observability Stack — L7](prometheus-observability-stack.md#^ref-e90b5a16-7-0) (line 7, col 0, score 0.67)
- [Promethean Pipelines: Local TypeScript-First Workflow — L253](promethean-pipelines-local-typescript-first-workflow.md#^ref-6b63edca-253-0) (line 253, col 0, score 0.66)
- [Voice Access Layer Design — L161](voice-access-layer-design.md#^ref-543ed9b3-161-0) (line 161, col 0, score 0.58)
- [schema-evolution-workflow — L22](schema-evolution-workflow.md#^ref-d8059b6a-22-0) (line 22, col 0, score 0.55)
- [Universal Lisp Interface — L107](universal-lisp-interface.md#^ref-b01856b4-107-0) (line 107, col 0, score 0.48)
- [Ice Box Reorganization — L81](ice-box-reorganization.md#^ref-291c7d91-81-0) (line 81, col 0, score 0.46)
- [Interop and Source Maps — L542](interop-and-source-maps.md#^ref-cdfac40c-542-0) (line 542, col 0, score 0.46)
- [Language-Agnostic Mirror System — L559](language-agnostic-mirror-system.md#^ref-d2b3628c-559-0) (line 559, col 0, score 0.46)
- [layer-1-uptime-diagrams — L185](layer-1-uptime-diagrams.md#^ref-4127189a-185-0) (line 185, col 0, score 0.46)
- [Layer1SurvivabilityEnvelope — L177](layer1survivabilityenvelope.md#^ref-64a9f9f9-177-0) (line 177, col 0, score 0.46)
- [Lisp-Compiler-Integration — L565](lisp-compiler-integration.md#^ref-cfee6d36-565-0) (line 565, col 0, score 0.46)
- [Cross-Target Macro System in Sibilant — L146](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-146-0) (line 146, col 0, score 0.72)
- [Promethean Agent Config DSL — L9](promethean-agent-config-dsl.md#^ref-2c00ce45-9-0) (line 9, col 0, score 0.71)
- [Recursive Prompt Construction Engine — L7](recursive-prompt-construction-engine.md#^ref-babdb9eb-7-0) (line 7, col 0, score 0.71)
- [Factorio AI with External Agents — L90](factorio-ai-with-external-agents.md#^ref-a4d90289-90-0) (line 90, col 0, score 0.63)
- [Sibilant Meta-Prompt DSL — L12](sibilant-meta-prompt-dsl.md#^ref-af5d2824-12-0) (line 12, col 0, score 0.68)
- [sibilant-meta-string-templating-runtime — L33](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-33-0) (line 33, col 0, score 0.67)
- [Fnord Tracer Protocol — L24](fnord-tracer-protocol.md#^ref-fc21f824-24-0) (line 24, col 0, score 0.69)
- [universal-intention-code-fabric — L22](universal-intention-code-fabric.md#^ref-c14edce7-22-0) (line 22, col 0, score 0.68)
- [Fnord Tracer Protocol — L142](fnord-tracer-protocol.md#^ref-fc21f824-142-0) (line 142, col 0, score 0.67)
- [Fnord Tracer Protocol — L151](fnord-tracer-protocol.md#^ref-fc21f824-151-0) (line 151, col 0, score 0.66)
- [ecs-offload-workers — L450](ecs-offload-workers.md#^ref-6498b9d7-450-0) (line 450, col 0, score 0.65)
- [AI-Centric OS with MCP Layer — L22](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-22-0) (line 22, col 0, score 0.63)
- [Performance-Optimized-Polyglot-Bridge — L432](performance-optimized-polyglot-bridge.md#^ref-f5579967-432-0) (line 432, col 0, score 0.63)
- [Promethean Infrastructure Setup — L93](promethean-infrastructure-setup.md#^ref-6deed6ac-93-0) (line 93, col 0, score 0.63)
- [Local-Offline-Model-Deployment-Strategy — L76](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-76-0) (line 76, col 0, score 0.62)
- [observability-infrastructure-setup — L189](observability-infrastructure-setup.md#^ref-b4e64f8c-189-0) (line 189, col 0, score 0.62)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L108](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-108-0) (line 108, col 0, score 0.62)
- [Prometheus Observability Stack — L495](prometheus-observability-stack.md#^ref-e90b5a16-495-0) (line 495, col 0, score 0.61)
- [Lispy Macros with syntax-rules — L388](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-388-0) (line 388, col 0, score 0.68)
- [RAG UI Panel with Qdrant and PostgREST — L357](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-357-0) (line 357, col 0, score 0.66)
- [komorebi-group-window-hack — L9](komorebi-group-window-hack.md#^ref-dd89372d-9-0) (line 9, col 0, score 0.66)
- [Fnord Tracer Protocol — L125](fnord-tracer-protocol.md#^ref-fc21f824-125-0) (line 125, col 0, score 0.65)
- [Lispy Macros with syntax-rules — L391](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-391-0) (line 391, col 0, score 0.64)
- [Dynamic Context Model for Web Components — L198](dynamic-context-model-for-web-components.md#^ref-f7702bf8-198-0) (line 198, col 0, score 0.64)
- [Interop and Source Maps — L507](interop-and-source-maps.md#^ref-cdfac40c-507-0) (line 507, col 0, score 0.63)
- [Pure TypeScript Search Microservice — L3](pure-typescript-search-microservice.md#^ref-d17d3a96-3-0) (line 3, col 0, score 0.63)
- [Interop and Source Maps — L3](interop-and-source-maps.md#^ref-cdfac40c-3-0) (line 3, col 0, score 0.61)
- [Universal Lisp Interface — L19](universal-lisp-interface.md#^ref-b01856b4-19-0) (line 19, col 0, score 0.67)
- [Promethean Dev Workflow Update — L29](promethean-dev-workflow-update.md#^ref-03a5578f-29-0) (line 29, col 0, score 0.66)
- [Promethean Dev Workflow Update — L42](promethean-dev-workflow-update.md#^ref-03a5578f-42-0) (line 42, col 0, score 0.65)
- [compiler-kit-foundations — L3](compiler-kit-foundations.md#^ref-01b21543-3-0) (line 3, col 0, score 0.64)
- [universal-intention-code-fabric — L1](universal-intention-code-fabric.md#^ref-c14edce7-1-0) (line 1, col 0, score 0.64)
- [polymorphic-meta-programming-engine — L19](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-19-0) (line 19, col 0, score 0.64)
- [sibilant-macro-targets — L157](sibilant-macro-targets.md#^ref-c5c9a5c6-157-0) (line 157, col 0, score 0.63)
- [Mongo Outbox Implementation — L379](mongo-outbox-implementation.md#^ref-9c1acd1e-379-0) (line 379, col 0, score 0.63)
- [Promethean-native config design — L380](promethean-native-config-design.md#^ref-ab748541-380-0) (line 380, col 0, score 0.63)
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
- [eidolon-node-lifecycle — L63](eidolon-node-lifecycle.md#^ref-938eca9c-63-0) (line 63, col 0, score 1)
- [EidolonField — L269](eidolonfield.md#^ref-49d1e1e5-269-0) (line 269, col 0, score 1)
- [Event Bus MVP — L566](event-bus-mvp.md#^ref-534fe91d-566-0) (line 566, col 0, score 1)
- [Event Bus Projections Architecture — L185](event-bus-projections-architecture.md#^ref-cf6b9b17-185-0) (line 185, col 0, score 1)
- [Exception Layer Analysis — L165](exception-layer-analysis.md#^ref-21d5cc09-165-0) (line 165, col 0, score 1)
- [Factorio AI with External Agents — L160](factorio-ai-with-external-agents.md#^ref-a4d90289-160-0) (line 160, col 0, score 1)
- [field-dynamics-math-blocks — L165](field-dynamics-math-blocks.md#^ref-7cfc230d-165-0) (line 165, col 0, score 1)
- [field-interaction-equations — L184](field-interaction-equations.md#^ref-b09141b7-184-0) (line 184, col 0, score 1)
- [field-node-diagram-outline — L132](field-node-diagram-outline.md#^ref-1f32c94a-132-0) (line 132, col 0, score 1)
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
- [Promethean Event Bus MVP v0.1 — L941](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-941-0) (line 941, col 0, score 1)
- [Promethean Pipelines: Local TypeScript-First Workflow — L259](promethean-pipelines-local-typescript-first-workflow.md#^ref-6b63edca-259-0) (line 259, col 0, score 0.7)
- [Promethean-native config design — L3](promethean-native-config-design.md#^ref-ab748541-3-0) (line 3, col 0, score 0.69)
- [shared-package-layout-clarification — L161](shared-package-layout-clarification.md#^ref-36c8882a-161-0) (line 161, col 0, score 0.68)
- [sibilant-metacompiler-overview — L93](sibilant-metacompiler-overview.md#^ref-61d4086b-93-0) (line 93, col 0, score 0.68)
- [Cross-Target Macro System in Sibilant — L209](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-209-0) (line 209, col 0, score 1)
- [Duck's Attractor States — L67](ducks-attractor-states.md#^ref-13951643-67-0) (line 67, col 0, score 1)
- [Factorio AI with External Agents — L150](factorio-ai-with-external-agents.md#^ref-a4d90289-150-0) (line 150, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L63](model-upgrade-calm-down-guide.md#^ref-db74343f-63-0) (line 63, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L10](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-10-0) (line 10, col 0, score 1)
- [observability-infrastructure-setup — L391](observability-infrastructure-setup.md#^ref-b4e64f8c-391-0) (line 391, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L56](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-56-0) (line 56, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L111](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-111-0) (line 111, col 0, score 1)
- [OpenAPI Validation Report — L29](openapi-validation-report.md#^ref-5c152b08-29-0) (line 29, col 0, score 1)
- [Optimizing Command Limitations in System Design — L36](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-36-0) (line 36, col 0, score 1)
- [plan-update-confirmation — L1013](plan-update-confirmation.md#^ref-b22d79c6-1013-0) (line 1013, col 0, score 1)
- [Admin Dashboard for User Management — L55](admin-dashboard-for-user-management.md#^ref-2901a3e9-55-0) (line 55, col 0, score 1)
- [AI-Centric OS with MCP Layer — L414](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-414-0) (line 414, col 0, score 1)
- [Board Automation Improvements — L15](board-automation-improvements.md#^ref-ac60a1d6-15-0) (line 15, col 0, score 1)
- [Operations — L7](chunks/operations.md#^ref-f1add613-7-0) (line 7, col 0, score 1)
- [Creative Moments — L7](creative-moments.md#^ref-10d98225-7-0) (line 7, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L210](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-210-0) (line 210, col 0, score 1)
- [DuckDuckGoSearchPipeline — L11](duckduckgosearchpipeline.md#^ref-e979c50f-11-0) (line 11, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L44](ducks-self-referential-perceptual-loop.md#^ref-71726f04-44-0) (line 44, col 0, score 1)
- [Dynamic Context Model for Web Components — L424](dynamic-context-model-for-web-components.md#^ref-f7702bf8-424-0) (line 424, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L96](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-96-0) (line 96, col 0, score 1)
- [Promethean Agent Config DSL — L348](promethean-agent-config-dsl.md#^ref-2c00ce45-348-0) (line 348, col 0, score 1)
- [AI-Centric OS with MCP Layer — L427](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-427-0) (line 427, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L13](ai-first-os-model-context-protocol.md#^ref-618198f4-13-0) (line 13, col 0, score 1)
- [api-gateway-versioning — L288](api-gateway-versioning.md#^ref-0580dcd3-288-0) (line 288, col 0, score 1)
- [archetype-ecs — L480](archetype-ecs.md#^ref-8f4c1e86-480-0) (line 480, col 0, score 1)
- [balanced-bst — L301](balanced-bst.md#^ref-d3e7db72-301-0) (line 301, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L178](chroma-toolkit-consolidation-plan.md#^ref-5020e892-178-0) (line 178, col 0, score 1)
- [Diagrams — L39](chunks/diagrams.md#^ref-45cd25b5-39-0) (line 39, col 0, score 1)
- [DSL — L41](chunks/dsl.md#^ref-e87bc036-41-0) (line 41, col 0, score 1)
- [JavaScript — L40](chunks/javascript.md#^ref-c1618c66-40-0) (line 40, col 0, score 1)
- [Math Fundamentals — L40](chunks/math-fundamentals.md#^ref-c6e87433-40-0) (line 40, col 0, score 1)
- [Services — L38](chunks/services.md#^ref-75ea4a6a-38-0) (line 38, col 0, score 1)
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
