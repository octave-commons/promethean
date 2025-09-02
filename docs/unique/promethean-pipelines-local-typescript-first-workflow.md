---
uuid: 6b63edca-7637-4fb0-bc85-d498c31cc46e
created_at: 2025.08.31.19.50.08.md
filename: 'Promethean Pipelines: Local TypeScript-First Workflow'
description: >-
  A set of plug-and-play pipelines for generating documentation graphs, OpenAPI
  specs, RAG systems, and code health checks—all using local tools and
  TypeScript. Each pipeline is designed to be composable and zero-SaaS, with
  clear step-by-step implementations.
tags:
  - TypeScript
  - local pipelines
  - RAG
  - OpenAPI
  - code health
  - composable workflows
  - Qdrant
  - Zod
  - Orval
  - dependency analysis
related_to_uuid: []
related_to_title: []
references: []
---
Love this question. Here are a bunch of *plug-and-play* pipelines we can add in the same style as your `symdocs` one—zero SaaS, all local, TypeScript-first. I kept each to a few clear steps so they’re composable. ^ref-6b63edca-1-0

```yaml
pipelines:
  # 1) Complete the docs flow with graphs
  - name: docs-graph
    steps:
      - id: symdocs-graph
        deps: ["symdocs-docs"]
        cwd: .
        shell: "pnpm --filter @promethean/symdocs symdocs:04-graph --in .cache/symdocs/docs.json --out docs/graphs"
        inputs: [".cache/symdocs/docs.json"]
        outputs: ["docs/graphs/**/*.mmd", "docs/graphs/**/*.png"]

  # 2) OpenAPI from TS + typed clients + static viewer
  - name: api-openapi
    steps:
      - id: openapi-gen
        cwd: packages/api
        shell: "pnpm run openapi:build" # e.g., zod-to-openapi/ts-rest/redocly generate ./dist/openapi.json
        inputs: ["src/**/*.{ts,tsx}"]
        outputs: ["dist/openapi.json"]
      - id: openapi-clients
        deps: ["openapi-gen"]
        cwd: packages/clients
        shell: "pnpm openapi-typescript ../api/dist/openapi.json -o src/generated/openapi.d.ts && pnpm orval --config orval.config.cjs"
        inputs: ["../api/dist/openapi.json"]
        outputs: ["src/generated/**/*"]
      - id: openapi-site
        deps: ["openapi-gen"]
        cwd: packages/api
        shell: "pnpm run openapi:site" # bundle swagger-ui or redoc static
        inputs: ["dist/openapi.json"]
        outputs: ["public/openapi/**/*"]

  # 3) RAG for docs/unique (frontmatter → chunk → embed → index)
  - name: rag-unique
    steps:
      - id: fm-extract-and-fill
        cwd: tools/rag
        shell: "pnpm tsx scripts/frontmatter-fill.ts docs/unique --model qwen3:4b --cache .cache/rag/fm"
        inputs: ["../../docs/unique/**/*.{md,mdx}"]
        outputs: [".cache/rag/fm/**/*.json", "docs/unique/**/*.{md,mdx}"]
      - id: rag-chunk
        deps: ["fm-extract-and-fill"]
        cwd: tools/rag
        shell: "pnpm tsx scripts/chunk.ts docs/unique --out .cache/rag/chunks.jsonl"
        inputs: ["docs/unique/**/*.{md,mdx}"]
        outputs: [".cache/rag/chunks.jsonl"]
      - id: rag-embed-qdrant
        deps: ["rag-chunk"]
        cwd: tools/rag
        shell: "pnpm tsx scripts/embed-qdrant.ts .cache/rag/chunks.jsonl --model nomic-embed-text --collection unique"
        inputs: [".cache/rag/chunks.jsonl"]
        outputs: [".cache/rag/embeddings/unique.done"]

  # 4) Web crawler → clean → index
  - name: crawl-and-index
    steps:
      - id: crawl
        cwd: tools/crawl
        shell: "pnpm tsx crawl/crawlee.ts --seed ./seeds.txt --out .cache/crawl/raw"
        inputs: ["seeds.txt"]
        outputs: [".cache/crawl/raw/**/*.html"]
      - id: sanitize-to-md
        deps: ["crawl"]
        cwd: tools/crawl
        shell: "pnpm tsx crawl/html-to-md.ts .cache/crawl/raw .cache/crawl/md"
        inputs: [".cache/crawl/raw/**/*.html"]
        outputs: [".cache/crawl/md/**/*.md"]
      - id: embed-index
        deps: ["sanitize-to-md"]
        cwd: tools/rag
        shell: "pnpm tsx scripts/embed-qdrant.ts .cache/crawl/md --model nomic-embed-text --collection crawl"
        inputs: [".cache/crawl/md/**/*.md"]
        outputs: [".cache/rag/embeddings/crawl.done"]

  # 5) Code health + boundaries (no Python)
  - name: code-health
    steps:
      - id: typecheck
        cwd: .
        shell: "pnpm -r run typecheck"
        inputs: ["packages/**/{src,lib}/**/*.{ts,tsx}","tsconfig.json"]
        outputs: [".cache/health/typecheck.ok"]
      - id: eslint
        deps: ["typecheck"]
        cwd: .
        shell: "pnpm -r run lint"
        inputs: ["packages/**/{src,lib}/**/*.{ts,tsx,js,jsx}"]
        outputs: [".cache/health/lint.ok"]
      - id: deps-graph
        deps: ["eslint"]
        cwd: .
        shell: "pnpm dependency-cruiser --config .depcruise.cjs packages --output-type dot | dot -Tsvg > .cache/health/depgraph.svg"
        inputs: ["packages/**"]
        outputs: [".cache/health/depgraph.svg"]
      - id: dead-exports
        deps: ["eslint"]
        cwd: .
        shell: "pnpm ts-prune --json > .cache/health/ts-prune.json"
        inputs: ["packages/**/{src,lib}/**/*.{ts,tsx}"]
        outputs: [".cache/health/ts-prune.json"]

  # 6) Structural refactor diffs (AST) — pairs with your tree-diff task
  - name: ast-refactor
    steps:
      - id: codemods-dry-run
        cwd: tools/codemods
        shell: "pnpm jscodeshift -t codemods/*.ts ../../packages --dry --print > .cache/codemods/preview.diff"
        inputs: ["codemods/*.ts","../../packages/**/{src,lib}/**/*.{ts,tsx}"]
        outputs: [".cache/codemods/preview.diff"]
      - id: codemods-apply
        deps: ["codemods-dry-run"]
        cwd: tools/codemods
        shell: "pnpm jscodeshift -t codemods/*.ts ../../packages && pnpm tsx codemods/validate.ts"
        inputs: ["codemods/*.ts"]
        outputs: [".cache/codemods/applied.ok"]

  # 7) Media → transcript (no Python)
  - name: media-transcribe
    steps:
      - id: segment-audio
        cwd: data/audio
        shell: "find . -type f -name '*.mp3' -o -name '*.wav' | xargs -I{} ffmpeg -y -i {} -ar 16000 -ac 1 .cache/audio/{/.}.wav"
        inputs: ["**/*.{mp3,wav}"]
        outputs: [".cache/audio/**/*.wav"]
      - id: whispercpp
        deps: ["segment-audio"]
        cwd: tools/stt
        shell: "pnpm tsx scripts/whispercpp.ts .cache/audio --out .cache/stt"
        inputs: [".cache/audio/**/*.wav"]
        outputs: [".cache/stt/**/*.json",".cache/stt/**/*.srt"]

  # 8) Agent evals (prompt suites vs Cephalon/Ollama)
  - name: agent-evals
    steps:
      - id: run-bench
        cwd: tools/evals
        shell: "pnpm tsx run-evals.ts --suites suites/*.yaml --model qwen3:8b --out .cache/evals/results.json"
        inputs: ["suites/*.yaml"]
        outputs: [".cache/evals/results.json"]
      - id: score-and-report
        deps: ["run-bench"]
        cwd: tools/evals
        shell: "pnpm tsx score.ts .cache/evals/results.json > docs/evals/report.md"
        inputs: [".cache/evals/results.json"]
        outputs: ["docs/evals/report.md"]

  # 9) Changelog + release notes (Rust/Go tools, no Python)
  - name: release-notes
    steps:
      - id: changelog
        cwd: .
        shell: "git-cliff -o docs/CHANGELOG.md"
        inputs: [".git/**"]
        outputs: ["docs/CHANGELOG.md"]
      - id: notes-from-diffs
        deps: ["changelog"]
        cwd: tools/release
        shell: "pnpm tsx notes-from-diff.ts --since main > docs/RELEASE_NOTES.md"
        inputs: ["../../**/*"]
        outputs: ["docs/RELEASE_NOTES.md"]

  # 10) Build & attest containers (SBOM + vuln scan)
  - name: images
    steps:
      - id: buildx
        cwd: images
        shell: "docker buildx bake -f bake.hcl --set *.platform=linux/amd64 --print && docker buildx bake -f bake.hcl"
        inputs: ["*.docker","bake.hcl","../packages/**"]
        outputs: [".cache/images/build.ok"]
      - id: sbom
        deps: ["buildx"]
        cwd: images
        shell: "syft packages:local -o json > ../docs/sbom.json"
        inputs: []
        outputs: ["../docs/sbom.json"]
      - id: scan
        deps: ["sbom"]
        cwd: images
        shell: "grype sbom:../docs/sbom.json -o json > ../docs/vulns.json || true"
        inputs: ["../docs/sbom.json"]
        outputs: ["../docs/vulns.json"]

  # 11) Board sync (Obsidian/GitHub raw → normalized tasks)
  - name: board-sync
    steps:
      - id: fetch-kanban
        cwd: tools/board
        shell: "pnpm tsx fetch-kanban.ts --url https://raw.githubusercontent.com/riatzukiza/promethean/dev/docs/agile/boards/kanban.md --out .cache/board/kanban.md"
        inputs: []
        outputs: [".cache/board/kanban.md"]
      - id: normalize
        deps: ["fetch-kanban"]
        cwd: tools/board
        shell: "pnpm tsx normalize-kanban.ts .cache/board/kanban.md --out .cache/board/normalized.json"
        inputs: [".cache/board/kanban.md"]
        outputs: [".cache/board/normalized.json"]

  # 12) MCP tool registry checks
  - name: mcp-tools
    steps:
      - id: manifest-validate
        cwd: tools/mcp
        shell: "pnpm tsx validate-tooling.ts ./tools/mcp/manifests --out .cache/mcp/validation.json"
        inputs: ["manifests/**/*.json"]
        outputs: [".cache/mcp/validation.json"]
      - id: smoke-connect
        deps: ["manifest-validate"]
        cwd: tools/mcp
        shell: "pnpm tsx smoke.ts --manifest manifests/*.json --out .cache/mcp/smoke.log"
        inputs: ["manifests/*.json"]
        outputs: [".cache/mcp/smoke.log"]
```
^ref-6b63edca-3-0
 ^ref-6b63edca-217-0
Here’s a quick mental model of how they relate:
 ^ref-6b63edca-219-0
```mermaid
flowchart LR
  subgraph Docs
    A[symdocs-scan] --> B[symdocs-docs] --> C[symdocs-graph]
  end

  subgraph API
    D[openapi-gen] --> E[openapi-clients]
    D --> F[openapi-site]
  end

  subgraph Knowledge
    G[frontmatter-fill] --> H[chunk] --> I[embed->qdrant]
    J[crawl] --> K[html->md] --> I
  end

  subgraph Code
    L[typecheck] --> M[eslint] --> N[dep-graph]
    M --> O[dead-exports]
    P[codemods-preview] --> Q[codemods-apply]
  end

  subgraph Media
    R[segment] --> S[whisper.cpp]
  end

  subgraph Ops
    T[changelog] --> U[release-notes]
    V[buildx] --> W[sbom] --> X[scan]
    Y[board-fetch] --> Z[normalize]
    AA[mcp-validate] --> AB[mcp-smoke]
  end
^ref-6b63edca-219-0
``` ^ref-6b63edca-253-0
^ref-6b63edca-220-0

If you want, I can scaffold any of these (scripts + pnpm targets) and slot them into your repo layout exactly where you prefer (`tools/*`, `images/*`, `docs/*`, `packages/*`).<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [2d-sandbox-field](2d-sandbox-field.md)
- [Admin Dashboard for User Management](admin-dashboard-for-user-management.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [Promethean Documentation Pipeline Overview](promethean-documentation-pipeline-overview.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [EidolonField](eidolonfield.md)
- [Event Bus MVP](event-bus-mvp.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [field-interaction-equations](field-interaction-equations.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [Window Management](chunks/window-management.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [Creative Moments](creative-moments.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [Diagrams](chunks/diagrams.md)
- [DSL](chunks/dsl.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [Operations](chunks/operations.md)
- [Shared](chunks/shared.md)
- [Prometheus Observability Stack](prometheus-observability-stack.md)
- [Pure-Node Crawl Stack with Playwright and Crawlee](pure-node-crawl-stack-with-playwright-and-crawlee.md)
- [Shared Package Structure](shared-package-structure.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [Promethean Web UI Setup](promethean-web-ui-setup.md)
- [promethean-system-diagrams](promethean-system-diagrams.md)
- [Promethean Workflow Optimization](promethean-workflow-optimization.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [Protocol_0_The_Contradiction_Engine](protocol-0-the-contradiction-engine.md)
- [Provider-Agnostic Chat Panel Implementation](provider-agnostic-chat-panel-implementation.md)
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [shared-package-layout-clarification](shared-package-layout-clarification.md)
- [Pure TypeScript Search Microservice](pure-typescript-search-microservice.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [schema-evolution-workflow](schema-evolution-workflow.md)
- [Self-Agency in AI Interaction](self-agency-in-ai-interaction.md)
- [set-assignment-in-lisp-ast](set-assignment-in-lisp-ast.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [Tooling](chunks/tooling.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [DuckDuckGoSearchPipeline](duckduckgosearchpipeline.md)
- [Fnord Tracer Protocol](fnord-tracer-protocol.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [layer-1-uptime-diagrams](layer-1-uptime-diagrams.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [Optimizing Command Limitations in System Design](optimizing-command-limitations-in-system-design.md)
- [archetype-ecs](archetype-ecs.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [Promethean Pipelines](promethean-pipelines.md)
- [System Scheduler with Resource-Aware DAG](system-scheduler-with-resource-aware-dag.md)
- [observability-infrastructure-setup](observability-infrastructure-setup.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler](ollama-llm-provider-for-pseudo-code-transpiler.md)
- [Functional Embedding Pipeline Refactor](functional-embedding-pipeline-refactor.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [Ghostly Smoke Interference](ghostly-smoke-interference.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [Smoke Resonance Visualizations](smoke-resonance-visualizations.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [plan-update-confirmation](plan-update-confirmation.md)
- [Promethean Agent DSL TS Scaffold](promethean-agent-dsl-ts-scaffold.md)
- [Eidolon-Field-Optimization](eidolon-field-optimization.md)
- [Model Upgrade Calm-Down Guide](model-upgrade-calm-down-guide.md)
- [Promethean-Copilot-Intent-Engine](promethean-copilot-intent-engine.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [Local-Offline-Model-Deployment-Strategy](local-offline-model-deployment-strategy.md)
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [WebSocket Gateway Implementation](websocket-gateway-implementation.md)
- [Universal Lisp Interface](universal-lisp-interface.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [Chroma-Embedding-Refactor](chroma-embedding-refactor.md)
- [The Jar of Echoes](the-jar-of-echoes.md)
- [Vectorial Exception Descent](vectorial-exception-descent.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [promethean-requirements](promethean-requirements.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [Tracing the Signal](tracing-the-signal.md)
- [Layer1SurvivabilityEnvelope](layer1survivabilityenvelope.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [file-watcher-auth-fix](file-watcher-auth-fix.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [Promethean Full-Stack Docker Setup](promethean-full-stack-docker-setup.md)
- [Voice Access Layer Design](voice-access-layer-design.md)
- [Recursive Prompt Construction Engine](recursive-prompt-construction-engine.md)
- [Simple Log Example](simple-log-example.md)
## Sources
- [Promethean Documentation Pipeline Overview — L163](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-163-0) (line 163, col 0, score 0.74)
- [Promethean Event Bus MVP v0.1 — L941](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-941-0) (line 941, col 0, score 0.74)
- [AI-Centric OS with MCP Layer — L1](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-1-0) (line 1, col 0, score 0.69)
- [Functional Embedding Pipeline Refactor — L309](functional-embedding-pipeline-refactor.md#^ref-a4a25141-309-0) (line 309, col 0, score 0.68)
- [Promethean Pipelines — L1](promethean-pipelines.md#^ref-8b8e6103-1-0) (line 1, col 0, score 0.65)
- [Promethean Documentation Pipeline Overview — L114](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-114-0) (line 114, col 0, score 0.66)
- [Local-Only-LLM-Workflow — L1](local-only-llm-workflow.md#^ref-9a8ab57e-1-0) (line 1, col 0, score 0.67)
- [Local-Offline-Model-Deployment-Strategy — L1](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-1-0) (line 1, col 0, score 0.67)
- [Promethean-native config design — L3](promethean-native-config-design.md#^ref-ab748541-3-0) (line 3, col 0, score 0.66)
- [Promethean-native config design — L380](promethean-native-config-design.md#^ref-ab748541-380-0) (line 380, col 0, score 0.72)
- [WebSocket Gateway Implementation — L628](websocket-gateway-implementation.md#^ref-e811123d-628-0) (line 628, col 0, score 0.66)
- [Promethean Agent DSL TS Scaffold — L1](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-1-0) (line 1, col 0, score 0.69)
- [Promethean Documentation Pipeline Overview — L6](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-6-0) (line 6, col 0, score 0.69)
- [RAG UI Panel with Qdrant and PostgREST — L330](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-330-0) (line 330, col 0, score 0.67)
- [Promethean Pipelines — L58](promethean-pipelines.md#^ref-8b8e6103-58-0) (line 58, col 0, score 0.76)
- [Promethean-Copilot-Intent-Engine — L7](promethean-copilot-intent-engine.md#^ref-ae24a280-7-0) (line 7, col 0, score 0.67)
- [Promethean Documentation Pipeline Overview — L78](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-78-0) (line 78, col 0, score 0.82)
- [Promethean-Copilot-Intent-Engine — L9](promethean-copilot-intent-engine.md#^ref-ae24a280-9-0) (line 9, col 0, score 0.63)
- [field-node-diagram-visualizations — L5](field-node-diagram-visualizations.md#^ref-e9b27b06-5-0) (line 5, col 0, score 0.66)
- [Promethean-Copilot-Intent-Engine — L26](promethean-copilot-intent-engine.md#^ref-ae24a280-26-0) (line 26, col 0, score 0.66)
- [api-gateway-versioning — L79](api-gateway-versioning.md#^ref-0580dcd3-79-0) (line 79, col 0, score 0.65)
- [Promethean Documentation Pipeline Overview — L119](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-119-0) (line 119, col 0, score 0.66)
- [Promethean Infrastructure Setup — L93](promethean-infrastructure-setup.md#^ref-6deed6ac-93-0) (line 93, col 0, score 0.6)
- [api-gateway-versioning — L270](api-gateway-versioning.md#^ref-0580dcd3-270-0) (line 270, col 0, score 0.69)
- [api-gateway-versioning — L51](api-gateway-versioning.md#^ref-0580dcd3-51-0) (line 51, col 0, score 0.68)
- [AI-Centric OS with MCP Layer — L185](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-185-0) (line 185, col 0, score 0.63)
- [api-gateway-versioning — L1](api-gateway-versioning.md#^ref-0580dcd3-1-0) (line 1, col 0, score 0.66)
- [Prometheus Observability Stack — L7](prometheus-observability-stack.md#^ref-e90b5a16-7-0) (line 7, col 0, score 0.61)
- [shared-package-layout-clarification — L145](shared-package-layout-clarification.md#^ref-36c8882a-145-0) (line 145, col 0, score 0.66)
- [Pure TypeScript Search Microservice — L14](pure-typescript-search-microservice.md#^ref-d17d3a96-14-0) (line 14, col 0, score 0.66)
- [Local-Offline-Model-Deployment-Strategy — L255](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-255-0) (line 255, col 0, score 0.6)
- [Local-Offline-Model-Deployment-Strategy — L156](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-156-0) (line 156, col 0, score 0.59)
- [observability-infrastructure-setup — L189](observability-infrastructure-setup.md#^ref-b4e64f8c-189-0) (line 189, col 0, score 0.62)
- [Universal Lisp Interface — L61](universal-lisp-interface.md#^ref-b01856b4-61-0) (line 61, col 0, score 0.65)
- [RAG UI Panel with Qdrant and PostgREST — L140](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-140-0) (line 140, col 0, score 0.65)
- [Dynamic Context Model for Web Components — L311](dynamic-context-model-for-web-components.md#^ref-f7702bf8-311-0) (line 311, col 0, score 0.65)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L389](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-389-0) (line 389, col 0, score 0.6)
- [Promethean Documentation Pipeline Overview — L15](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-15-0) (line 15, col 0, score 0.64)
- [Per-Domain Policy System for JS Crawler — L27](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-27-0) (line 27, col 0, score 0.65)
- [AI-Centric OS with MCP Layer — L42](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-42-0) (line 42, col 0, score 0.64)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L9](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-9-0) (line 9, col 0, score 0.64)
- [Chroma-Embedding-Refactor — L111](chroma-embedding-refactor.md#^ref-8b256935-111-0) (line 111, col 0, score 0.63)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L107](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-107-0) (line 107, col 0, score 0.63)
- [Per-Domain Policy System for JS Crawler — L117](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-117-0) (line 117, col 0, score 0.63)
- [AI-Centric OS with MCP Layer — L8](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-8-0) (line 8, col 0, score 0.61)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L223](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-223-0) (line 223, col 0, score 0.63)
- [Language-Agnostic Mirror System — L507](language-agnostic-mirror-system.md#^ref-d2b3628c-507-0) (line 507, col 0, score 0.63)
- [polymorphic-meta-programming-engine — L50](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-50-0) (line 50, col 0, score 0.65)
- [Promethean Infrastructure Setup — L287](promethean-infrastructure-setup.md#^ref-6deed6ac-287-0) (line 287, col 0, score 0.64)
- [Promethean Pipelines — L16](promethean-pipelines.md#^ref-8b8e6103-16-0) (line 16, col 0, score 0.64)
- [Performance-Optimized-Polyglot-Bridge — L170](performance-optimized-polyglot-bridge.md#^ref-f5579967-170-0) (line 170, col 0, score 0.6)
- [Performance-Optimized-Polyglot-Bridge — L22](performance-optimized-polyglot-bridge.md#^ref-f5579967-22-0) (line 22, col 0, score 0.63)
- [Canonical Org-Babel Matplotlib Animation Template — L5](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-5-0) (line 5, col 0, score 0.63)
- [plan-update-confirmation — L650](plan-update-confirmation.md#^ref-b22d79c6-650-0) (line 650, col 0, score 0.69)
- [plan-update-confirmation — L662](plan-update-confirmation.md#^ref-b22d79c6-662-0) (line 662, col 0, score 0.69)
- [plan-update-confirmation — L674](plan-update-confirmation.md#^ref-b22d79c6-674-0) (line 674, col 0, score 0.69)
- [Promethean Pipelines — L14](promethean-pipelines.md#^ref-8b8e6103-14-0) (line 14, col 0, score 0.66)
- [Promethean Infrastructure Setup — L392](promethean-infrastructure-setup.md#^ref-6deed6ac-392-0) (line 392, col 0, score 0.66)
- [ecs-offload-workers — L15](ecs-offload-workers.md#^ref-6498b9d7-15-0) (line 15, col 0, score 0.66)
- [shared-package-layout-clarification — L47](shared-package-layout-clarification.md#^ref-36c8882a-47-0) (line 47, col 0, score 0.65)
- [Promethean Infrastructure Setup — L33](promethean-infrastructure-setup.md#^ref-6deed6ac-33-0) (line 33, col 0, score 0.65)
- [Shared Package Structure — L64](shared-package-structure.md#^ref-66a72fc3-64-0) (line 64, col 0, score 0.65)
- [ecs-scheduler-and-prefabs — L7](ecs-scheduler-and-prefabs.md#^ref-c62a1815-7-0) (line 7, col 0, score 0.61)
- [System Scheduler with Resource-Aware DAG — L5](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-5-0) (line 5, col 0, score 0.61)
- [Promethean Agent DSL TS Scaffold — L97](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-97-0) (line 97, col 0, score 0.65)
- [shared-package-layout-clarification — L84](shared-package-layout-clarification.md#^ref-36c8882a-84-0) (line 84, col 0, score 0.65)
- [WebSocket Gateway Implementation — L447](websocket-gateway-implementation.md#^ref-e811123d-447-0) (line 447, col 0, score 0.64)
- [Promethean Pipelines — L85](promethean-pipelines.md#^ref-8b8e6103-85-0) (line 85, col 0, score 0.62)
- [Promethean Pipelines — L26](promethean-pipelines.md#^ref-8b8e6103-26-0) (line 26, col 0, score 0.69)
- [Promethean Pipelines — L28](promethean-pipelines.md#^ref-8b8e6103-28-0) (line 28, col 0, score 0.66)
- [plan-update-confirmation — L202](plan-update-confirmation.md#^ref-b22d79c6-202-0) (line 202, col 0, score 0.63)
- [plan-update-confirmation — L286](plan-update-confirmation.md#^ref-b22d79c6-286-0) (line 286, col 0, score 0.63)
- [Promethean Agent DSL TS Scaffold — L3](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-3-0) (line 3, col 0, score 0.62)
- [promethean-requirements — L1](promethean-requirements.md#^ref-95205cd3-1-0) (line 1, col 0, score 0.62)
- [Model Selection for Lightweight Conversational Tasks — L90](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-90-0) (line 90, col 0, score 0.62)
- [Promethean Agent Config DSL — L19](promethean-agent-config-dsl.md#^ref-2c00ce45-19-0) (line 19, col 0, score 0.59)
- [file-watcher-auth-fix — L32](file-watcher-auth-fix.md#^ref-9044701b-32-0) (line 32, col 0, score 0.61)
- [Prompt_Folder_Bootstrap — L145](prompt-folder-bootstrap.md#^ref-bd4f0976-145-0) (line 145, col 0, score 0.58)
- [Promethean Agent Config DSL — L195](promethean-agent-config-dsl.md#^ref-2c00ce45-195-0) (line 195, col 0, score 0.59)
- [Promethean Full-Stack Docker Setup — L3](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-3-0) (line 3, col 0, score 0.59)
- [Model Selection for Lightweight Conversational Tasks — L79](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-79-0) (line 79, col 0, score 0.59)
- [Universal Lisp Interface — L178](universal-lisp-interface.md#^ref-b01856b4-178-0) (line 178, col 0, score 0.59)
- [Voice Access Layer Design — L255](voice-access-layer-design.md#^ref-543ed9b3-255-0) (line 255, col 0, score 0.58)
- [Recursive Prompt Construction Engine — L41](recursive-prompt-construction-engine.md#^ref-babdb9eb-41-0) (line 41, col 0, score 0.58)
- [Simple Log Example — L1](simple-log-example.md#^ref-0490eee7-1-0) (line 1, col 0, score 0.58)
- [Promethean Web UI Setup — L563](promethean-web-ui-setup.md#^ref-bc5172ca-563-0) (line 563, col 0, score 0.65)
- [shared-package-layout-clarification — L11](shared-package-layout-clarification.md#^ref-36c8882a-11-0) (line 11, col 0, score 0.61)
- [Promethean Pipelines — L7](promethean-pipelines.md#^ref-8b8e6103-7-0) (line 7, col 0, score 0.6)
- [observability-infrastructure-setup — L138](observability-infrastructure-setup.md#^ref-b4e64f8c-138-0) (line 138, col 0, score 0.6)
- [Pure TypeScript Search Microservice — L62](pure-typescript-search-microservice.md#^ref-d17d3a96-62-0) (line 62, col 0, score 0.6)
- [Promethean Pipelines — L5](promethean-pipelines.md#^ref-8b8e6103-5-0) (line 5, col 0, score 0.6)
- [observability-infrastructure-setup — L267](observability-infrastructure-setup.md#^ref-b4e64f8c-267-0) (line 267, col 0, score 0.59)
- [plan-update-confirmation — L585](plan-update-confirmation.md#^ref-b22d79c6-585-0) (line 585, col 0, score 0.62)
- [AI-Centric OS with MCP Layer — L279](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-279-0) (line 279, col 0, score 0.61)
- [Unique Info Dump Index — L15](unique-info-dump-index.md#^ref-30ec3ba6-15-0) (line 15, col 0, score 0.6)
- [Functional Embedding Pipeline Refactor — L9](functional-embedding-pipeline-refactor.md#^ref-a4a25141-9-0) (line 9, col 0, score 0.74)
- [Eidolon-Field-Optimization — L24](eidolon-field-optimization.md#^ref-40e05c14-24-0) (line 24, col 0, score 0.68)
- [Eidolon-Field-Optimization — L17](eidolon-field-optimization.md#^ref-40e05c14-17-0) (line 17, col 0, score 0.65)
- [Eidolon-Field-Optimization — L14](eidolon-field-optimization.md#^ref-40e05c14-14-0) (line 14, col 0, score 0.64)
- [Cross-Language Runtime Polymorphism — L129](cross-language-runtime-polymorphism.md#^ref-c34c36a6-129-0) (line 129, col 0, score 0.64)
- [The Jar of Echoes — L9](the-jar-of-echoes.md#^ref-18138627-9-0) (line 9, col 0, score 0.63)
- [Vectorial Exception Descent — L1](vectorial-exception-descent.md#^ref-d771154e-1-0) (line 1, col 0, score 0.63)
- [Prompt_Folder_Bootstrap — L161](prompt-folder-bootstrap.md#^ref-bd4f0976-161-0) (line 161, col 0, score 0.62)
- [Duck's Self-Referential Perceptual Loop — L4](ducks-self-referential-perceptual-loop.md#^ref-71726f04-4-0) (line 4, col 0, score 0.61)
- [field-dynamics-math-blocks — L15](field-dynamics-math-blocks.md#^ref-7cfc230d-15-0) (line 15, col 0, score 0.61)
- [Tracing the Signal — L38](tracing-the-signal.md#^ref-c3cd4f65-38-0) (line 38, col 0, score 0.61)
- [Duck's Self-Referential Perceptual Loop — L15](ducks-self-referential-perceptual-loop.md#^ref-71726f04-15-0) (line 15, col 0, score 0.61)
- [Layer1SurvivabilityEnvelope — L71](layer1survivabilityenvelope.md#^ref-64a9f9f9-71-0) (line 71, col 0, score 0.61)
- [Eidolon Field Abstract Model — L59](eidolon-field-abstract-model.md#^ref-5e8b2388-59-0) (line 59, col 0, score 0.61)
- [field-node-diagram-outline — L9](field-node-diagram-outline.md#^ref-1f32c94a-9-0) (line 9, col 0, score 0.6)
- [Promethean Event Bus MVP v0.1 — L832](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-832-0) (line 832, col 0, score 0.8)
- [archetype-ecs — L423](archetype-ecs.md#^ref-8f4c1e86-423-0) (line 423, col 0, score 0.77)
- [Event Bus Projections Architecture — L5](event-bus-projections-architecture.md#^ref-cf6b9b17-5-0) (line 5, col 0, score 0.77)
- [Language-Agnostic Mirror System — L11](language-agnostic-mirror-system.md#^ref-d2b3628c-11-0) (line 11, col 0, score 0.77)
- [Promethean Infrastructure Setup — L501](promethean-infrastructure-setup.md#^ref-6deed6ac-501-0) (line 501, col 0, score 0.76)
- [ecs-scheduler-and-prefabs — L352](ecs-scheduler-and-prefabs.md#^ref-c62a1815-352-0) (line 352, col 0, score 0.75)
- [System Scheduler with Resource-Aware DAG — L350](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-350-0) (line 350, col 0, score 0.75)
- [RAG UI Panel with Qdrant and PostgREST — L336](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-336-0) (line 336, col 0, score 0.75)
- [Promethean Web UI Setup — L581](promethean-web-ui-setup.md#^ref-bc5172ca-581-0) (line 581, col 0, score 0.74)
- [Duck's Attractor States — L5](ducks-attractor-states.md#^ref-13951643-5-0) (line 5, col 0, score 0.73)
- [Ghostly Smoke Interference — L11](ghostly-smoke-interference.md#^ref-b6ae7dfa-11-0) (line 11, col 0, score 0.73)
- [Event Bus Projections Architecture — L67](event-bus-projections-architecture.md#^ref-cf6b9b17-67-0) (line 67, col 0, score 0.7)
- [Smoke Resonance Visualizations — L57](smoke-resonance-visualizations.md#^ref-ac9d3ac5-57-0) (line 57, col 0, score 0.7)
- [Promethean Agent Config DSL — L239](promethean-agent-config-dsl.md#^ref-2c00ce45-239-0) (line 239, col 0, score 0.69)
- [Model Upgrade Calm-Down Guide — L58](model-upgrade-calm-down-guide.md#^ref-db74343f-58-0) (line 58, col 0, score 0.67)
- [Promethean-native config design — L362](promethean-native-config-design.md#^ref-ab748541-362-0) (line 362, col 0, score 0.67)
- [Promethean-Copilot-Intent-Engine — L33](promethean-copilot-intent-engine.md#^ref-ae24a280-33-0) (line 33, col 0, score 0.66)
- [Promethean-Copilot-Intent-Engine — L50](promethean-copilot-intent-engine.md#^ref-ae24a280-50-0) (line 50, col 0, score 0.66)
- [api-gateway-versioning — L280](api-gateway-versioning.md#^ref-0580dcd3-280-0) (line 280, col 0, score 0.65)
- [Model Upgrade Calm-Down Guide — L30](model-upgrade-calm-down-guide.md#^ref-db74343f-30-0) (line 30, col 0, score 0.65)
- [AI-Centric OS with MCP Layer — L395](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-395-0) (line 395, col 0, score 0.65)
- [shared-package-layout-clarification — L1](shared-package-layout-clarification.md#^ref-36c8882a-1-0) (line 1, col 0, score 0.64)
- [universal-intention-code-fabric — L383](universal-intention-code-fabric.md#^ref-c14edce7-383-0) (line 383, col 0, score 0.64)
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
- [Simulation Demo — L32](chunks/simulation-demo.md#^ref-557309a3-32-0) (line 32, col 0, score 1)
- [Tooling — L26](chunks/tooling.md#^ref-6cb4943e-26-0) (line 26, col 0, score 1)
- [Window Management — L36](chunks/window-management.md#^ref-9e8ae388-36-0) (line 36, col 0, score 1)
- [compiler-kit-foundations — L639](compiler-kit-foundations.md#^ref-01b21543-639-0) (line 639, col 0, score 1)
- [Creative Moments — L10](creative-moments.md#^ref-10d98225-10-0) (line 10, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L258](cross-language-runtime-polymorphism.md#^ref-c34c36a6-258-0) (line 258, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L215](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-215-0) (line 215, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L50](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-50-0) (line 50, col 0, score 1)
- [DuckDuckGoSearchPipeline — L16](duckduckgosearchpipeline.md#^ref-e979c50f-16-0) (line 16, col 0, score 1)
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
- [api-gateway-versioning — L320](api-gateway-versioning.md#^ref-0580dcd3-320-0) (line 320, col 0, score 0.83)
- [Optimizing Command Limitations in System Design — L52](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-52-0) (line 52, col 0, score 0.83)
- [Promethean Infrastructure Setup — L628](promethean-infrastructure-setup.md#^ref-6deed6ac-628-0) (line 628, col 0, score 0.83)
- [archetype-ecs — L470](archetype-ecs.md#^ref-8f4c1e86-470-0) (line 470, col 0, score 0.75)
- [Dynamic Context Model for Web Components — L382](dynamic-context-model-for-web-components.md#^ref-f7702bf8-382-0) (line 382, col 0, score 0.75)
- [ecs-offload-workers — L456](ecs-offload-workers.md#^ref-6498b9d7-456-0) (line 456, col 0, score 0.75)
- [ecs-scheduler-and-prefabs — L390](ecs-scheduler-and-prefabs.md#^ref-c62a1815-390-0) (line 390, col 0, score 0.75)
- [eidolon-field-math-foundations — L125](eidolon-field-math-foundations.md#^ref-008f2ac0-125-0) (line 125, col 0, score 0.75)
- [Mongo Outbox Implementation — L572](mongo-outbox-implementation.md#^ref-9c1acd1e-572-0) (line 572, col 0, score 0.75)
- [observability-infrastructure-setup — L360](observability-infrastructure-setup.md#^ref-b4e64f8c-360-0) (line 360, col 0, score 0.75)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L163](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-163-0) (line 163, col 0, score 0.75)
- [Agent Tasks: Persistence Migration to DualStore — L135](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-135-0) (line 135, col 0, score 1)
- [ecs-offload-workers — L481](ecs-offload-workers.md#^ref-6498b9d7-481-0) (line 481, col 0, score 1)
- [ecs-scheduler-and-prefabs — L418](ecs-scheduler-and-prefabs.md#^ref-c62a1815-418-0) (line 418, col 0, score 1)
- [eidolon-node-lifecycle — L49](eidolon-node-lifecycle.md#^ref-938eca9c-49-0) (line 49, col 0, score 1)
- [Event Bus MVP — L545](event-bus-mvp.md#^ref-534fe91d-545-0) (line 545, col 0, score 1)
- [Event Bus Projections Architecture — L148](event-bus-projections-architecture.md#^ref-cf6b9b17-148-0) (line 148, col 0, score 1)
- [Fnord Tracer Protocol — L242](fnord-tracer-protocol.md#^ref-fc21f824-242-0) (line 242, col 0, score 1)
- [i3-bluetooth-setup — L104](i3-bluetooth-setup.md#^ref-5e408692-104-0) (line 104, col 0, score 1)
- [layer-1-uptime-diagrams — L173](layer-1-uptime-diagrams.md#^ref-4127189a-173-0) (line 173, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L147](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-147-0) (line 147, col 0, score 1)
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
