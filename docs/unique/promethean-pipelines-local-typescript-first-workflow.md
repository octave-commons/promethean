---
uuid: fda3b0d4-86dc-481e-8d89-d50ad0ec5d93
created_at: promethean-pipelines-local-typescript-first-workflow.md
filename: 'Promethean Pipelines: Local TypeScript-First Workflows'
title: 'Promethean Pipelines: Local TypeScript-First Workflows'
description: >-
  A set of reusable, zero-SaaS pipelines for generating documentation graphs,
  OpenAPI specs, RAG indexes, and code health checks using local TypeScript
  workflows. Each pipeline is designed to be composable and runs in a
  self-contained environment without external dependencies.
tags:
  - typescript
  - pipelines
  - local
  - openapi
  - rag
  - code-health
  - composable
  - symdocs
  - qdrant
  - dependency-cruiser
related_to_uuid:
  - 6b91d91d-6b5c-4516-a0c8-d66d9b9fcc9b
  - d28090ac-f746-4958-aab5-ed1315382c04
  - 49a9a860-944c-467a-b532-4f99186a8593
  - bd4f0976-0d5b-47f6-a20a-0601d1842dc1
  - 37b5d236-2b3e-4a95-a4e8-31655c3023ef
  - d17d3a96-c84d-4738-a403-6c733b874da2
  - 54382370-1931-4a19-a634-46735708a9ea
  - 71726f04-eb1c-42a5-a5fe-d8209de6e159
  - 5e8b2388-022b-46cf-952c-36ae9b8f0037
  - 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
  - 681a4ab2-8fef-4833-a09d-bceb62d114da
  - 01b21543-7e03-4129-8fe4-b6306be69dee
  - 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
  - 23e221e9-d4fa-4106-8458-06db2595085f
  - cfbdca2f-5ee8-4cad-a75e-0e017e8d9b77
  - 9044701b-03c9-4a30-92c4-46b1bd66c11e
  - 40e05c14-0db0-44c5-bf0a-2eece2f4c2a4
  - b51e19b4-1326-4311-9798-33e972bf626c
  - 5158f742-4a3b-466e-bfc3-d83517b64200
  - 49d1e1e5-5d13-4955-8f6f-7676434ec462
  - 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
  - 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
  - 5f210ca2-54e9-445b-afe4-fb340d4992c5
  - bc5172ca-7a09-42ad-b418-8e42bb14d089
  - e811123d-5841-4e52-bf8c-978f26db4230
related_to_title:
  - AGENTS.md
  - i3-config-validation-methods
  - Self-Agency in AI Interaction
  - Prompt_Folder_Bootstrap
  - homeostasis-decay-formulas
  - Pure TypeScript Search Microservice
  - Migrate to Provider-Tenant Architecture
  - Duck's Self-Referential Perceptual Loop
  - Eidolon Field Abstract Model
  - ecs-offload-workers
  - SentenceProcessing
  - compiler-kit-foundations
  - Voice Access Layer Design
  - heartbeat-simulation-snippets
  - Refactor Frontmatter Processing
  - file-watcher-auth-fix
  - Eidolon-Field-Optimization
  - promethean-system-diagrams
  - Promethean Agent DSL TS Scaffold
  - EidolonField
  - Promethean Full-Stack Docker Setup
  - 'Polyglot S-expr Bridge: Python-JS-Lisp Interop'
  - Cross-Target Macro System in Sibilant
  - prom ui bootstrap
  - WebSocket Gateway Implementation
references:
  - uuid: 6b91d91d-6b5c-4516-a0c8-d66d9b9fcc9b
    line: 1
    col: 0
    score: 1
  - uuid: d28090ac-f746-4958-aab5-ed1315382c04
    line: 28
    col: 0
    score: 0.89
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 2586
    col: 0
    score: 0.88
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 1863
    col: 0
    score: 0.88
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 2228
    col: 0
    score: 0.88
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 6907
    col: 0
    score: 0.88
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 4849
    col: 0
    score: 0.88
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 1600
    col: 0
    score: 0.88
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 3582
    col: 0
    score: 0.88
  - uuid: 681a4ab2-8fef-4833-a09d-bceb62d114da
    line: 30
    col: 0
    score: 0.87
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 427
    col: 0
    score: 0.87
  - uuid: 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
    line: 280
    col: 0
    score: 0.86
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 590
    col: 0
    score: 0.86
  - uuid: 23e221e9-d4fa-4106-8458-06db2595085f
    line: 84
    col: 0
    score: 0.85
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
        shell: "pnpm tsx fetch-kanban.ts --url  --out .cache/board/kanban.md"
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

If you want, I can scaffold any of these (scripts + pnpm targets) and slot them into your repo layout exactly where you prefer (`tools/*`, `images/*`, `docs/*`, `packages/*`).
r","bake.hcl","../packages/**"]
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
        shell: "pnpm tsx fetch-kanban.ts --url  --out .cache/board/kanban.md"
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

If you want, I can scaffold any of these (scripts + pnpm targets) and slot them into your repo layout exactly where you prefer (`tools/*`, `images/*`, `docs/*`, `packages/*`).
