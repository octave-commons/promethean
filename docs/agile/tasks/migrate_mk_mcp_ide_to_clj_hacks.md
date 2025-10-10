---
uuid: "046df43b-fdc3-46d5-a45a-ed7dca487615"
title: "Consolidate mk MCP/IDE libs under clj-hacks /TASK-20240607-0001 /kanban /InProgress /err /p3 /EPC-000 :auto :clj"
slug: "migrate_mk_mcp_ide_to_clj_hacks"
status: "done"
priority: "p3"
tags: ["task", "board", "state", "owner", "priority", "epic", "lang"]
created_at: "2025-10-10T03:23:55.971Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---







```
<hr class="__chatgpt_plugin">
```
### Context
### Changes and Updates
- **What changed?**: Need to move mk IDE/MCP shared code into clj-hacks to reuse from Babashka entrypoints.
- **Where?**: `packages/clj-hacks`, `bb/src/mk`, `bb.edn`, tests.
- **Why now?**: Consolidation requested so Lisp package exports APIs for tooling.

## Inputs / Artifacts
- packages/clj-hacks/deps.edn
- bb/src/mk

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
```
<hr class="__chatgpt_plugin">
```






