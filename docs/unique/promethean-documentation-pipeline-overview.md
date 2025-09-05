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
