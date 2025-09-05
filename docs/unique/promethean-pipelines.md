---
uuid: 86ef1f2b-1b3f-4ca7-a88e-b8b52e70ac10
created_at: promethean-pipelines.md
filename: promethean-pipelines
title: promethean-pipelines
description: >-
  A set of idempotent, marker-safe pipelines for detecting API drift, generating
  semver recommendations, creating type dependency graphs, and more. Each
  pipeline outputs cached documentation and actionable tasks while maintaining
  deterministic behavior through a consistent processing flow.
tags:
  - api-diff
  - semver
  - typegraph
  - codemods
  - test-gap
  - i18npack
  - licscan
  - perf-bench
  - glossary
  - adr-bot
  - riskmap
  - orchestration
related_to_uuid:
  - 972c820f-63a8-49c6-831f-013832195478
  - bb4f4ed0-91f3-488a-9d64-3a33bde77e4e
  - 4316c3f9-551f-4872-b5c5-98ae73508535
  - 792a343e-674c-4bb4-8435-b3f8c163349d
  - 0f203aa7-c96d-4323-9b9e-bbc438966e8c
  - ee4b3631-a745-485b-aff1-2da806cfadfb
  - 6bbc5717-b8a5-4aaf-933d-b0225ad598b4
  - 7842d43c-7d13-46f0-bdf1-561f5e4c6f53
  - 8f1782ee-a75f-4c9e-acb7-3f744ad2c952
  - 1fcb8421-46eb-4813-ba66-f79b25ef5db7
related_to_title:
  - archetype-ecs
  - chroma-embedding-refactor
  - WebSocket Gateway Implementation
  - windows-tiling-with-autohotkey
  - schema-evolution-workflow
  - Promethean Documentation Pipeline Overview
  - matplotlib-animation-with-async-execution
  - promethean-infrastructure-setup
  - Optimizing Command Limitations in System Design
  - api-gateway-versioning
references:
  - uuid: 972c820f-63a8-49c6-831f-013832195478
    line: 363
    col: 0
    score: 0.9
  - uuid: bb4f4ed0-91f3-488a-9d64-3a33bde77e4e
    line: 66
    col: 0
    score: 0.89
  - uuid: 972c820f-63a8-49c6-831f-013832195478
    line: 366
    col: 0
    score: 0.89
  - uuid: 4316c3f9-551f-4872-b5c5-98ae73508535
    line: 36
    col: 0
    score: 0.88
  - uuid: bb4f4ed0-91f3-488a-9d64-3a33bde77e4e
    line: 101
    col: 0
    score: 0.88
  - uuid: 972c820f-63a8-49c6-831f-013832195478
    line: 415
    col: 0
    score: 0.88
  - uuid: 4316c3f9-551f-4872-b5c5-98ae73508535
    line: 56
    col: 0
    score: 0.88
  - uuid: 4316c3f9-551f-4872-b5c5-98ae73508535
    line: 630
    col: 0
    score: 0.87
  - uuid: 4316c3f9-551f-4872-b5c5-98ae73508535
    line: 43
    col: 0
    score: 0.87
  - uuid: 972c820f-63a8-49c6-831f-013832195478
    line: 442
    col: 0
    score: 0.87
  - uuid: 972c820f-63a8-49c6-831f-013832195478
    line: 418
    col: 0
    score: 0.86
  - uuid: 4316c3f9-551f-4872-b5c5-98ae73508535
    line: 336
    col: 0
    score: 0.86
  - uuid: 4316c3f9-551f-4872-b5c5-98ae73508535
    line: 451
    col: 0
    score: 0.86
---
love that. treat repos like dataflows and CLIs like transforms. here are high-leverage pipelines we can bolt on next (all idempotent, marker-safe, cached under `.cache/<pkg>`): ^ref-8b8e6103-1-0

## menu of new pipelines

1. **apidiff** — detect API drift & breaking changes ^ref-8b8e6103-5-0

   * scan exported symbols → compare across git refs (e.g., `main` vs `HEAD`) → classify breaks → write `docs/packages/<pkg>/api-diff.md` + tasks. ^ref-8b8e6103-7-0
   * outputs: semver bump suggestion per package, “fix or docs?” tasks. ^ref-8b8e6103-8-0

2. **semver-guard** — compute required semver and open a task/PR stub ^ref-8b8e6103-10-0

   * inputs: apidiff results, changelog fragments → decide `major|minor|patch` → write `docs/agile/tasks/semver-<pkg>.md`. ^ref-8b8e6103-12-0

3. **typegraph** — TS type dependency graph ^ref-8b8e6103-14-0

   * crawl types/interfaces → emit Mermaid graphs per module + cross-package type edges → `docs/packages/<pkg>/types.md`. ^ref-8b8e6103-16-0

4. **cookbook** — auto example miner ^ref-8b8e6103-18-0

   * harvest examples from tests/docs/snippets → normalize & run small runners → write `docs/cookbook/<topic>.md` with verified outputs. ^ref-8b8e6103-20-0

5. **test-gap** — semantic test coverage ^ref-8b8e6103-22-0

   * map functions ↔ tests (by name, imports, embeddings) → flag high-risk/low-coverage → create tasks per cluster. ^ref-8b8e6103-24-0

6. **codemods** — transform kits for consolidation ^ref-8b8e6103-26-0

   * from `simtasks` clusters → synthesize jscodeshift/ts-morph codemods → write under `codemods/<cluster>/` with dry-run report + task. ^ref-8b8e6103-28-0

7. **i18npack** — string extraction & dedupe ^ref-8b8e6103-30-0

   * extract literals → cluster near-dupes → propose keys → write `i18n/<locale>.json` and tasks to wire calls. ^ref-8b8e6103-32-0

8. **licscan** — license & header compliance

   * detect license of each dependency (from lockfile) + check file headers → write `docs/compliance/license-report.md` + fixup tasks. ^ref-8b8e6103-36-0

9. **perf-bench** — microbench common idioms ^ref-8b8e6103-38-0

   * auto-gen small benchmarks for hot functions → record runs → write `docs/bench/<pkg>.md` with tables & trend deltas. ^ref-8b8e6103-40-0

10. **glossary** — repo knowledge graph ^ref-8b8e6103-42-0

* extract terms from docs/code → link occurrences → `docs/glossary/*.md` and back-links in footers. ^ref-8b8e6103-44-0

11. **adr-bot** — decision trail

* generate ADR stubs from merged tasks/PRs → place in `docs/adr/NNN-*.md`, cross-linked to affected packages. ^ref-8b8e6103-48-0

12. **riskmap** — dependency risk heatmap ^ref-8b8e6103-50-0

* combine in-graph centrality + age of last change + test-gap → write `docs/ops/riskmap.md` and “stabilize X” tasks.

---

## orchestration sketch

```mermaid
flowchart LR
  A[scan symbols/types] --> B[embed/compare]
  B --> C[cluster/score]
  C --> D[plans (Ollama)]
  D --> E[docs pages]
  D --> F[tasks]
  B --> G[graphs (api/type/pkg)]
  G --> E
```
^ref-8b8e6103-58-0 ^ref-8b8e6103-68-0

---

## consistent shape (each package)

* **01-scan** → JSON facts ^ref-8b8e6103-74-0
* **02-embed** (optional) ^ref-8b8e6103-75-0
* **03-analyze** (diff/cluster/score) ^ref-8b8e6103-76-0
* **04-plan** (LLM JSON, zod-validated, cached) ^ref-8b8e6103-77-0
* **05-write** (docs + tasks, marker-bounded) ^ref-8b8e6103-78-0
* all steps support `--dry-run`, read config from `*.config.json`, and keep outputs deterministic.

---

## quick starters to build next
 ^ref-8b8e6103-84-0
* **apidiff** (fast win): reuse `@promethean/symdocs` scan output; add `03-diff.ts` (compare against saved baseline in `.cache/apidiff/<pkg>.json`) and `05-write.ts` for a per-package report + semver recommendation. ^ref-8b8e6103-85-0
* **codemods** (pairs nicely with `simtasks`): add `simtasks:06-codemods` to synthesize ts-morph transforms from a plan and emit runnable codemods with a dry-run CLI.
 ^ref-8b8e6103-87-0
pick 2 and I’ll spin the files. if you want, we can also add a tiny **runner** (`pipelines.json` → runs steps with change detection) so new steps slot in without touching existing scripts.
