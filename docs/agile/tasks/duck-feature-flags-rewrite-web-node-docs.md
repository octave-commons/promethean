---
uuid: 9c1a2f5c-a7e2-4f4a-bb3d-2f8a7d54f6f1
title: DUCK — feature flags rewrite (web + node) + docs
status: in_progress
priority: P1
labels:
  - duck
  - web
  - node
  - flags
  - docs
created_at: '2025-10-02T00:00:00.000Z'
---
#Todo

## 🛠️ Description
Rewrite broken feature flag modules for duck-web and duck-utils; pure ESM TS, functional, side-effect free. Align env names; fix `FEATURE_FLAGS.md`.

## Goals
- Replace `apps/duck-web/src/flags.ts` with pure helpers (`parseBool`, constants)
- Add `packages/duck-utils/src/flags.ts` for Node path
- Fix docs `docs/duck/FEATURE_FLAGS.md` (names/casing, examples)

## Requirements
- [ ] Unit tests (ava) cover true/false parsing + defaults
- [ ] Web: `import.meta.env.VITE_*` inputs only
- [ ] Node: `process.env.*` inputs only
- [ ] No side effects at import time

## Subtasks
1. Implement helpers and constants
2. Wire flags in consumers (duck-web, cephalon where relevant)
3. Update docs

---

## ⛓️ Blocked By

- None

## ⛓️ Blocks

- Merge PR #1447

---

## 🔍 Relevant Links

- PR #1447
