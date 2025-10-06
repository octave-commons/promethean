---
task-id: TASK-20240607-0001
title: Consolidate mk MCP/IDE libs under clj-hacks
state: InProgress
prev: null
txn: '2024-06-07T00:00:00Z-0001'
owner: err
priority: p3
size: m
epic: EPC-000
depends_on: []
labels:
  - 'board:auto'
  - 'lang:clj'
due: null
links: []
artifacts: []
rationale: Align shared Babashka tooling with clj-hacks package ownership.
proposed_transitions:
  - New->Accepted
  - Accepted->Breakdown
  - Breakdown->Ready
  - Ready->Todo
  - Todo->InProgress
  - InProgress->InReview
tags:
  - task/TASK-20240607-0001
  - board/kanban
  - state/InProgress
  - owner/err
  - priority/p3
  - epic/EPC-000
uuid: 046df43b-fdc3-46d5-a45a-ed7dca487615
created_at: '2025-10-06T01:50:48.295Z'
status: todo
---
<hr class="__chatgpt_plugin">

### Context
### Changes and Updates
- **What changed?**: Need to move mk IDE/MCP shared code into clj-hacks to reuse from Babashka entrypoints.
- **Where?**: `packages/clj-hacks`, `bb/src/mk`, `bb.edn`, tests.
- **Why now?**: Consolidation requested so Lisp package exports APIs for tooling.

## Inputs / Artifacts
- (packages/clj-hacks/deps.edn)
- (bb/src/mk)

## Definition of Done
- [ ] mk IDE and MCP logic lives under clj-hacks namespaces.
- [ ] Babashka wrappers delegate to new modules.
- [ ] Tests updated and passing via `clj-hacks` alias.

## Plan
1. Port mk.ide-* namespaces to `clj-hacks.ide.*` and mk.mcp-* to `clj-hacks.mcp.*`.
2. Update Babashka namespaces to thin wrappers around the new modules and adjust paths in `bb.edn`.
3. Refresh tests and dependencies to target the relocated namespaces; run package test suite.

## Relevant Resources
- `packages/clj-hacks/README.md`

<hr class="__chatgpt_plugin">

