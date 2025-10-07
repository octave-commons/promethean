---
$$
uuid: 715ad925-165f-413c-811c-9d76fbbc31ac
$$
created_at: promethean-ci-cd-pipeline.md
filename: Promethean CI/CD Pipeline
title: Promethean CI/CD Pipeline
$$
description: >-
$$
  A comprehensive CI/CD pipeline for Promethean that automates documentation
  generation, code transformation, semantic versioning, and board reviews. The
  pipeline processes TypeScript/JavaScript code, generates API documentation,
  performs code analysis, and ensures semantic versioning compliance through
  automated checks and PR summaries.
tags:
  - ci-cd
  - documentation
  - code-modification
  - semantic-versioning
  - agile
  - pipeline
  - typescript
  - javascript
$$
related_to_uuid:
$$
  - 01c5547f-27eb-42d1-af24-9cad10b6a2ca
  - a09a2867-7f5a-4864-8150-6eee881a616b
  - 599c228b-22a8-4fb2-ac23-edc191b630f1
  - 7c3ee67a-f458-464f-9b5e-92f1c0ea8366
  - 6b91d91d-6b5c-4516-a0c8-d66d9b9fcc9b
  - e84ebe20-72b3-420b-8fec-a094326f8c9f
  - 4594f6ff-aa66-4c55-8a18-2a8c417c03a7
  - fda3b0d4-86dc-481e-8d89-d50ad0ec5d93
  - a39e72eb-34f4-45d2-9b59-a0f9f4a12fc0
  - f35d133e-6e9a-4aee-84b1-fa2579664ad8
  - 2c6f53c5-71e1-4737-a227-714e1286274f
$$
related_to_title:
$$
  - run-step-api
  - pr-688-nitpack-extract
  - Pseudo Pipes Overview
  - Promethean Monorepo Law
  - AGENTS.md
  - docops-pipeline
  - Pipeline Brainstorming
  - 'Promethean Pipelines: Local TypeScript-First Workflows'
  - mcp-server-config
  - Pipeline Enhancements
references:
  - uuid: 01c5547f-27eb-42d1-af24-9cad10b6a2ca
    line: 828
    col: 0
    score: 1
  - uuid: a09a2867-7f5a-4864-8150-6eee881a616b
    line: 66
    col: 0
    score: 0.91
  - uuid: 01c5547f-27eb-42d1-af24-9cad10b6a2ca
    line: 20
    col: 0
    score: 0.9
---

pipelines:
  - name: docs
    steps:
      - id: symdocs-scan
        cwd: .
        inputs: $"packages/**/{src,lib}/**/*.{ts,tsx,js,jsx}"$
        outputs: $".cache/symdocs/symbols.json"$
      - id: symdocs-docs
$$
        deps: ["symdocs-scan"]
$$
        inputs: $".cache/symdocs/symbols.json"$
        outputs: $".cache/symdocs/docs.json"$
      - id: symdocs-write
$$
        deps: ["symdocs-docs"]
$$
        inputs: $".cache/symdocs/docs.json"$
$$
        outputs: ["docs/packages/**/**/*.md"]
$$
      - id: symdocs-graph
$$
        deps: ["symdocs-scan"]
$$
        inputs:
$$
"packages/**/package.json",
            "packages/**/{src,lib}/**/*.{ts,tsx,js,jsx}",
$$
        outputs: $"docs/packages/README.md", "docs/packages/**/README.md"$

  - name: simtasks
    steps:
      - id: simtasks-scan
        inputs: $"packages/**/{src,lib}/**/*.{ts,tsx,js,jsx}"$
        outputs: $".cache/simtasks/functions.json"$
      - id: simtasks-embed
$$
        deps: ["simtasks-scan"]
$$
        inputs: $".cache/simtasks/functions.json"$
        outputs: $".cache/simtasks/embeddings.json"$
      - id: simtasks-cluster
$$
        deps: ["simtasks-embed"]
$$
        inputs: $".cache/simtasks/embeddings.json"$
        outputs: $".cache/simtasks/clusters.json"$
      - id: simtasks-plan
$$
        deps: ["simtasks-cluster"]
$$
        inputs: $".cache/simtasks/clusters.json"$
        outputs: $".cache/simtasks/plans.json"$
      - id: simtasks-write
$$
        deps: ["simtasks-plan"]
$$
        inputs: $".cache/simtasks/plans.json"$
        outputs: $"docs/agile/tasks/*.md"$

  - name: codemods
    steps:
      - id: mods-simtasks
        inputs: []
        outputs:
$$
".cache/simtasks/functions.json",
            ".cache/simtasks/clusters.json",
            ".cache/simtasks/plans.json",
$$
      - id: mods-spec
$$
        deps: ["mods-simtasks"]
$$
        inputs:
$$
".cache/simtasks/functions.json",
            ".cache/simtasks/clusters.json",
            ".cache/simtasks/plans.json",
$$
        outputs: $".cache/codemods/specs.json"$
      - id: mods-generate
$$
        deps: ["mods-spec"]
$$
        inputs: $".cache/codemods/specs.json"$
$$
        outputs: ["codemods/**/transform.ts"]
$$
      - id: mods-dry-run
$$
        deps: ["mods-generate"]
$$
        inputs:
$$
"codemods/**/transform.ts",
            "packages/**/{src,lib}/**/*.{ts,tsx,js,jsx}",
$$
        outputs: $"docs/agile/tasks/codemods/*.md"$
      - id: mods-apply
$$
        deps: ["mods-dry-run"]
$$
$$
        inputs: ["codemods/**/transform.ts"]
$$
        outputs: $".cache/codemods/run-apply.json"$
      - id: mods-verify
$$
        deps: ["mods-apply"]
$$
        inputs: $".cache/codemods/run-apply.json"$
        outputs:
$$
"docs/agile/tasks/codemods/verify-after.md",
            "docs/agile/tasks/codemods/VERIFY.md",
$$
  - name: semver-guard
    steps:
      - id: sv-snapshot
        inputs:
          - "packages/**/package.json"
          - "packages/**/{src,lib}/**/*.{ts,tsx,js,jsx}"
        outputs: $".cache/semverguard/snapshot.json"$

      - id: sv-diff
$$
        deps: ["sv-snapshot"]
$$
        inputs: $".cache/semverguard/snapshot.json"$
        outputs: $".cache/semverguard/diff.json"$

      - id: sv-plan
$$
        deps: ["sv-diff"]
$$
        inputs: $".cache/semverguard/diff.json"$
        outputs: $".cache/semverguard/plans.json"$

      - id: sv-write
$$
        deps: ["sv-plan"]
$$
        inputs: $".cache/semverguard/plans.json"$
        outputs: $"docs/agile/tasks/semver/*.md"$

      - id: sv-pr
$$
        deps: ["sv-write"]
$$
        inputs:
          - ".cache/semverguard/plans.json"
          - "packages/**/package.json"
        outputs:
          - ".cache/semverguard/pr/summary.json"
  - name: board-review
    steps:
      - id: br-fm
        inputs: $"docs/agile/tasks/**/*.md"$
        outputs: $"docs/agile/tasks/**/*.md"$ # FM updates in-place
      - id: br-prompts
$$
        deps: ["br-fm"]
$$
        inputs: $"docs/agile/Process.md"$
        outputs: $".cache/boardrev/prompts.json"$
      - id: br-index
$$
        deps: ["br-fm"]
$$
        inputs:
          - "README.md"
          - "docs/**/*.md"
          - "packages/**/{src,lib}/**/*.{ts,tsx,js,jsx}"
        outputs:
          - ".cache/boardrev/repo-index.json"
          - ".cache/boardrev/repo-embeddings.json"
      - id: br-match
        deps: $"br-prompts", "br-index"$
        inputs:
          - "docs/agile/tasks/**/*.md"
          - ".cache/boardrev/repo-index.json"
          - ".cache/boardrev/repo-embeddings.json"
        outputs: $".cache/boardrev/context.json"$
      - id: br-eval
$$
        deps: ["br-match"]
$$
        inputs:
          - ".cache/boardrev/prompts.json"
          - ".cache/boardrev/context.json"
        outputs: $".cache/boardrev/evals.json"$
      - id: br-report
$$
        deps: ["br-eval"]
$$
        inputs: $".cache/boardrev/evals.json"$
        outputs: $"docs/agile/reports/*.md"$
  - name: sonar
    steps:
      - id: sonar-scan
        cwd: .
        env:
          SONAR_HOST_URL: "${SONAR_HOST_URL}"
          SONAR_TOKEN: "${SONAR_TOKEN}"
          SONAR_PROJECT_KEY: "${SONAR_PROJECT_KEY}"
        inputs:
          - "packages/**/{src,lib}/**/*.{ts,tsx,js,jsx}"
          - "sonar-project.properties"
        outputs:
          - ".cache/sonar/scan.touch" # marker file we create after scan
      - id: sonar-fetch
$$
        deps: ["sonar-scan"]
$$
        inputs: []
$$
        outputs: [".cache/sonar/issues"]
$$
      - id: sonar-plan
$$
        deps: ["sonar-fetch"]
$$
$$
        inputs: [".cache/sonar/issues"]
$$
$$
        outputs: [".cache/sonar/plans"]
$$
      - id: sonar-write
$$
        deps: ["sonar-plan"]
$$
$$
        inputs: [".cache/sonar/plans"]
$$
        outputs: $"docs/agile/tasks/sonar/*.md"$
  - name: readmes
    steps:
      - id: rm-scan
        inputs:
          - "packages/**/package.json"
          - "packages/**/tsconfig.json"
        outputs:
          - ".cache/readmes/scan.json"

      - id: rm-outline
$$
        deps: ["rm-scan"]
$$
        env:
          OLLAMA_URL: "${OLLAMA_URL}"
        inputs:
          - ".cache/readmes/scan.json"
        outputs:
          - ".cache/readmes/outlines.json"

      - id: rm-write
$$
        deps: ["rm-outline"]
$$
        inputs:
          - ".cache/readmes/outlines.json"
        outputs:
          - "packages/**/README.md"

      - id: rm-verify
$$
        deps: ["rm-write"]
$$
        inputs:
          - "packages/**/README.md"
        outputs:
          - "docs/agile/reports/readmes/*.md"
  - name: buildfix
    steps:
      - id: bf-errors
        inputs:
          - "tsconfig.json"
          - "packages/**/{src,lib}/**/*.{ts,tsx,js,jsx}"
        outputs:
          - ".cache/buildfix/errors.json"

      - id: bf-iterate
$$
        deps: ["bf-errors"]
$$
        env:
          OLLAMA_URL: "${OLLAMA_URL}"
        inputs:
          - ".cache/buildfix/errors.json"
          - "tsconfig.json"
          - "packages/**/{src,lib}/**/*.{ts,tsx,js,jsx}"
        outputs:
          - ".cache/buildfix/summary.json"
          - ".cache/buildfix/history/**"
          - ".cache/buildfix/snippets/**"

      - id: bf-report
$$
        deps: ["bf-iterate"]
$$
        inputs:
          - ".cache/buildfix/summary.json"
        outputs:
          - "docs/agile/reports/buildfix/*.md"
  - name: test-gap
    steps:
      # (Optional) upstream: run your tests to produce lcov.info
      # - id: tg-run-tests
      #   outputs: $"coverage/lcov.info", "packages/**/coverage/lcov.info"$
      - id: tg-exports
        inputs:
          - "packages/**/package.json"
          - "packages/**/{src,lib}/**/*.{ts,tsx,js,jsx}"
        outputs:
          - ".cache/testgap/exports.json"

      - id: tg-coverage
        # deps: $"tg-run-tests"$
        inputs:
          - "coverage/lcov.info"
          - "packages/**/coverage/lcov.info"
        outputs:
          - ".cache/testgap/coverage.json"

      - id: tg-map
        deps: $"tg-exports", "tg-coverage"$
        inputs:
          - ".cache/testgap/exports.json"
          - ".cache/testgap/coverage.json"
        outputs:
          - ".cache/testgap/gaps.json"
      - id: tg-gate
$$
        deps: ["tg-map"]
$$
        inputs: $".cache/testgap/gaps.json"$
        outputs: $".cache/testgap/gate.json"$

      - id: tg-cookbook
$$
        deps: ["tg-map"]
$$
        inputs:
          - "docs/cookbook/**/*.md"
        outputs:
          - ".cache/testgap/cookbook.json"

      - id: tg-plan
$$
        deps: ["tg-cookbook"]
$$
        env:
          OLLAMA_URL: "${OLLAMA_URL}"
        inputs:
          - ".cache/testgap/gaps.json"
          - ".cache/testgap/cookbook.json"
        outputs:
          - ".cache/testgap/plans.json"

      - id: tg-write
$$
        deps: ["tg-plan"]
$$
        inputs:
          - ".cache/testgap/plans.json"
        outputs:
          - "docs/agile/tasks/test-gaps/*.md"

      - id: tg-report
$$
        deps: ["tg-map"]
$$
        inputs:
          - ".cache/testgap/gaps.json"
        outputs:
          - "docs/agile/reports/test-gaps/*.md"
  - name: docops
    steps:
      # a) Ensure / complete front matter $filename/description/tags/uuid$
      - id: doc-fm
        env:
          OLLAMA_URL: "${OLLAMA_URL}"
        inputs:
          - "docs/unique/**/*.md"
        outputs:
          - ".cache/docops/frontmatters.json"

      # b) Chunk + embed $language-aware tokenizer$ and build index
      - id: doc-index
$$
        deps: ["doc-fm"]
$$
        env:
          OLLAMA_URL: "${OLLAMA_URL}"
        inputs:
          - "docs/unique/**/*.md"
          - ".cache/docops/frontmatters.json"
        outputs:
          - ".cache/docops/chunks.json"
          - ".cache/docops/embeddings.json"

      # c) Cross-document similarity queries $cache per-chunk results$
      - id: doc-similarity
$$
        deps: ["doc-index"]
$$
        inputsg
          - ".cache/docops/chunks.json"
          - ".cache/docops/embeddings.json"
        outputs:
          - ".cache/docops/queries.json"

      # d) Compute related-doc scores $doc↔doc$
      - id: doc-related
$$
        deps: ["doc-similarity"]
$$
        inputs:
          - ".cache/docops/queries.json"
          - ".cache/docops/frontmatters.json"
        outputs:
          - ".cache/docops/related.json"

      # e) High-scoring references $chunk-level, with line/col$
      - id: doc-references
$$
        deps: ["doc-similarity"]
$$
        inputs:
          - ".cache/docops/queries.json"
          - ".cache/docops/chunks.json"
        outputs:
          - ".cache/docops/references.json"

      # f) Apply FM updates (add related & references into FM only)
      - id: doc-apply-fm
        deps: $"doc-related", "doc-references"$
        inputs:
          - ".cache/docops/frontmatters.json"
          - ".cache/docops/related.json"
          - ".cache/docops/references.json"
        outputs:
          - ".cache/docops/applied-fm.touch"

      # g) Footer writer (markdown links with line anchors)
      - id: doc-footer
$$
        deps: ["doc-apply-fm"]
$$
        inputs:
          - ".cache/docops/references.json"
          - ".cache/docops/related.json"
          - "docs/unique/**/*.md"
        outputs:
          - ".cache/docops/footer.touch"

      # h) Optional rename pass (based on generated titles)
      - id: doc-rename
$$
        deps: ["doc-apply-fm"]
$$
        inputs:
          - ".cache/docops/frontmatters.json"
        outputs:
          - ".cache/docops/renames.json"
$$
e/docops/applied-fm.touch"
$$
      # g) Footer writer (markdown links with line anchors)
      - id: doc-footer
$$
        deps: ["doc-apply-fm"]
$$
        inputs:
          - ".cache/docops/references.json"
          - ".cache/docops/related.json"
          - "docs/unique/**/*.md"
        outputs:
          - ".cache/docops/footer.touch"

      # h) Optional rename pass (based on generated titles)
      - id: doc-rename
$$
        deps: ["doc-apply-fm"]
$$
        inputs:
          - ".cache/docops/frontmatters.json"
        outputs:
          - ".cache/docops/renames.json"
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- $run-step-api$$run-step-api.md$
- $pr-688-nitpack-extract$(2025.09.03.20.05.23.md)
- [Pseudo Pipes Overview](2025.09.03.11.34.39.md)
- [Promethean Monorepo Law](2025.09.02.23.54.00.md)
- [AGENTS.md]$agents-md-3.md$
- $docops-pipeline$(2025.09.03.20.50.47.md)
- [Pipeline Brainstorming](2025.09.03.11.44.54.md)
- $Promethean Pipelines: Local TypeScript-First Workflows$$promethean-pipelines-local-typescript-first-workflow.md$
- $mcp-server-config$(2025.09.03.14.01.47.md)
- $mcp-server-config$(2025.09.03.14.01.47.md)
- [Pipeline Enhancements]$pipeline-enhancements.md$
## Sources
- $run-step-api — L828$$run-step-api.md#^ref-01c5547f-828-0$ (line 828, col 0, score 1)
- $pr-688-nitpack-extract — L66$$2025.09.03.20.05.23.md#^ref-a09a2867-66-0$ (line 66, col 0, score 0.91)
- $run-step-api — L20$$run-step-api.md#^ref-01c5547f-20-0$ (line 20, col 0, score 0.9)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
