---
uuid: "orgs-octave-commons-promethean-kanban-orgs-octave-commons-promethean-spec-2025-12-10-ignore-large-json-md"
title: "Ignore generated large JSON artifacts"
status: incoming
priority: P3
labels: ["specs", "migrated-spec"]
created_at: "2026-05-29T04:01:14.578Z"
source: "orgs/octave-commons/promethean/spec/2025-12-10-ignore-large-json.md"
category: "specs"
---

> Source: `orgs/octave-commons/promethean/spec/2025-12-10-ignore-large-json.md`
> Migrated-to-kanban: `orgs/octave-commons/promethean/kanban/2025-12-10-ignore-large-json.md`

# Ignore generated large JSON artifacts

## Context

- Recent autocommit logs show large JSON outputs being committed (knowledge-graph/boards exports and benchmark caches), creating noisy commits.
- Largest tracked JSONs (sizes):
  - `docs/agile/boards/.kanban/scars/heal-2025-10-22-12-13-15.context.json` (~2.5MB)
  - `cache/benchmark/memoized-benchmark-results-2025-10-15T09-15-41.json` (~330KB)
  - `output.json` (~550KB)
  - `package-list.json` (~520KB)

## Plan

- Add ignore rules in `.gitignore` for the generated JSON artifacts above.
- Remove tracked copies of those files from the repo while leaving them locally present for tooling, if needed.
- Verify git status is clean apart from intended removals and .gitignore change.

## Scope / Files

- `.gitignore` (append ignore patterns near artifact sections).
- Remove from index: `docs/agile/boards/.kanban/scars/*.json`, `cache/benchmark/*.json`, `output.json`, `package-list.json`.

## Definition of Done

- `.gitignore` excludes the generated JSON artifacts listed above.
- The files are no longer tracked in git (removed from index) but left locally if required.
- Working tree shows only expected changes (ignore file + tracked removals) with no other unintended diffs.
