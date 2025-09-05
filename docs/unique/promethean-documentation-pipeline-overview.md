---
uuid: ee4b3631-a745-485b-aff1-2da806cfadfb
created_at: promethean-documentation-pipeline-overview.md
filename: Promethean Documentation Pipeline Overview
title: Promethean Documentation Pipeline Overview
description: >-
  This document outlines the core themes and new packages in the Promethean
  documentation pipeline, emphasizing small idempotent CLI steps, pipeline
  composition with caching, and integration with Ollama for LLMs and embeddings.
  It details how each package functions to enhance documentation, manage code,
  and automate tasks like API governance and SonarQube issue resolution.
tags:
  - documentation
  - pipeline
  - idempotent
  - CLI
  - Ollama
  - embeddings
  - code
  - semver
  - SonarQube
  - agile
related_to_uuid:
  - f0528a41-be17-4213-b5bc-7d37fcbef0e0
  - a28a39dd-8c17-463c-9050-2ffe9b56e8bc
  - e4317155-7fa6-44e8-8aee-b72384581790
  - fd753d3a-84cb-4bdd-ae93-8c5b09617e3b
  - 8fd08696-5338-493b-bed5-507f8a6a6ea9
  - 0f203aa7-c96d-4323-9b9e-bbc438966e8c
  - 006182ac-45a4-449d-8a60-c9bd5a3a9bff
  - 792a343e-674c-4bb4-8435-b3f8c163349d
  - 3657117f-241d-4ab9-a717-4a3f584071fc
  - d65e5b6c-29ed-458f-bf9b-94bf0d48fa79
  - 260f25bf-c996-4da2-a529-3a292406296f
  - 6bbc5717-b8a5-4aaf-933d-b0225ad598b4
  - 46b3c583-a4e2-4ecc-90de-6fd104da23db
  - 740bbd1c-c039-405c-8a32-4baeddfb5637
  - 972c820f-63a8-49c6-831f-013832195478
  - 315a8cf5-239b-449b-a9eb-7df496a796c6
  - 0c501d52-ba38-42aa-ad25-2d78425dfaff
  - 4594f6ff-aa66-4c55-8a18-2a8c417c03a7
  - 4c87f571-9942-4288-aec4-0bc52e9cdbe7
  - 01c5547f-27eb-42d1-af24-9cad10b6a2ca
  - e84ebe20-72b3-420b-8fec-a094326f8c9f
  - 6e678cce-b68f-4420-980f-5c9009f0d971
  - 73d64bce-f428-4735-a3d0-6225a0588e46
  - 5becb573-0a78-486b-8d3c-199b3c7a79ec
  - 95410f6e-dabb-4560-80a8-1ed4fd9c3d3b
related_to_title:
  - local-offline-model-deployment-strategy
  - AI-Centric OS with MCP Layer
  - TypeScript Patch for Tool Calling Support
  - polyglot-repl-interface-layer
  - typed-struct-compiler
  - schema-evolution-workflow
  - local-first-intention-code-loop
  - windows-tiling-with-autohotkey
  - language-agnostic-mirror-system
  - sibilant-macro-targets
  - Polymorphic Meta-Programming Engine
  - matplotlib-animation-with-async-execution
  - Promethean Event Bus MVP
  - heartbeat-fragment-demo
  - archetype-ecs
  - Smoke Resonance Visualizations
  - dynamic-context-model-for-web-components
  - Pipeline Brainstorming
  - set-assignment-in-lisp-ast
  - run-step-api
  - docops-pipeline
  - balanced-bst
  - Voice Access Layer Design
  - Agent Reflections and Prompt Evolution
  - model-selection-for-lightweight-conversational-tasks
references:
  - uuid: f0528a41-be17-4213-b5bc-7d37fcbef0e0
    line: 1
    col: 0
    score: 1
  - uuid: f0528a41-be17-4213-b5bc-7d37fcbef0e0
    line: 9
    col: 0
    score: 1
  - uuid: f0528a41-be17-4213-b5bc-7d37fcbef0e0
    line: 10
    col: 0
    score: 1
  - uuid: a28a39dd-8c17-463c-9050-2ffe9b56e8bc
    line: 77
    col: 0
    score: 0.87
  - uuid: e4317155-7fa6-44e8-8aee-b72384581790
    line: 115
    col: 0
    score: 0.87
  - uuid: 8fd08696-5338-493b-bed5-507f8a6a6ea9
    line: 304
    col: 0
    score: 0.86
  - uuid: fd753d3a-84cb-4bdd-ae93-8c5b09617e3b
    line: 114
    col: 0
    score: 0.86
  - uuid: 8fd08696-5338-493b-bed5-507f8a6a6ea9
    line: 358
    col: 0
    score: 0.85
  - uuid: 8fd08696-5338-493b-bed5-507f8a6a6ea9
    line: 339
    col: 0
    score: 0.85
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
^ref-3a3bf2c9-78-0 ^ref-3a3bf2c9-111-0

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

If you want, I can generate a one-pager README for each package or a top-level “how it all works” doc linking to every CLI and cache file.
c1ec-487d-8e0b-3ce33d6b4d06
    line: 582
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 620
    col: 0
    score: 1
  - uuid: c26f0044-26fe-4c43-8ab0-fc4690723e3c
    line: 11
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 130
    col: 0
    score: 1
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 106
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 44
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 409
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 554
    col: 0
    score: 1
  - uuid: ed6f3fc9-5eb1-482c-8b3c-f0abc5aff2a2
    line: 9
    col: 0
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 83
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 41
    col: 0
    score: 1
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 82
    col: 0
    score: 1
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 43
    col: 0
    score: 1
  - uuid: f1add613-656e-4bec-b52b-193fd78c4642
    line: 47
    col: 0
    score: 1
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 58
    col: 0
    score: 1
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
^ref-3a3bf2c9-78-0 ^ref-3a3bf2c9-111-0

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

If you want, I can generate a one-pager README for each package or a top-level “how it all works” doc linking to every CLI and cache file.
