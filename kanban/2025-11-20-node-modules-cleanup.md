---
uuid: "orgs-octave-commons-promethean-kanban-orgs-octave-commons-promethean-spec-2025-11-20-node-modules-cleanup-md"
title: "Node modules cleanup for submodules"
status: incoming
priority: P3
labels: ["specs", "migrated-spec"]
created_at: "2026-05-29T04:01:14.576Z"
source: "orgs/octave-commons/promethean/spec/2025-11-20-node-modules-cleanup.md"
category: "specs"
---

> Source: `orgs/octave-commons/promethean/spec/2025-11-20-node-modules-cleanup.md`
> Migrated-to-kanban: `orgs/octave-commons/promethean/kanban/2025-11-20-node-modules-cleanup.md`

# Node modules cleanup for submodules

## Context

The user asked to remove `node_modules` from tracked submodules and ensure they are ignored going forward. Affected submodules reported dirty by `git submodule foreach git status` are:

- `packages/discord` (`node_modules/@promethean-os/pantheon`, `tsconfig.tsbuildinfo`)
- `pipelines/readmeflow` (`node_modules/@promethean-os/pantheon-llm-openai`)
- `services/mcp-kanban-bridge` (`node_modules/@promethean-os/pantheon-protocol`, `node_modules/@promethean-os/pantheon-state`)

## Plan (phases)

1. Inspect each submodule for existing ignore rules and confirm current status.
2. Add root-level `.gitignore` files that ignore `node_modules/` (and `tsconfig.tsbuildinfo` where present), then remove tracked node_modules content from git indexes.
3. Verify submodules are clean and no node_modules remain tracked.

## Files of interest (planned edits)

- `packages/discord/.gitignore:1-2` – add `node_modules/` and `tsconfig.tsbuildinfo` ignores.
- `pipelines/readmeflow/.gitignore:1` – add `node_modules/` ignore.
- `services/mcp-kanban-bridge/.gitignore:1` – add `node_modules/` ignore.

## Existing issues/PRs

- None identified related to this cleanup.

## Definition of done

- `node_modules` directories removed from git tracking for the three submodules.
- `.gitignore` files present in each submodule to prevent future inclusion of `node_modules` (and `tsconfig.tsbuildinfo` in `packages/discord`).
- `git status` for each affected submodule is clean.

## Requirements

- Do not touch other submodules or unrelated files.
- Keep repository documentation traversable; new docs placed under `spec/`.
- Default to ASCII; keep edits concise.
