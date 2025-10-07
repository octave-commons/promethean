---
task-id: TASK-20240921-buildfix
title: Fix TypeScript build errors across key packages
state: InProgress
prev: null
txn: '2024-09-21T03:30:00Z-0001'
owner: codex-cloud
priority: p2
size: m
epic: EPC-000
depends_on: []
labels:
  - 'board:auto'
  - 'lang:ts'
due: null
links: []
artifacts: []
rationale: |
  The latest Codex Cloud build report shows TypeScript build failures in
  `@promethean/enso-protocol`, `@promethean/docops`, `@promethean/kanban`, and
  `@promethean/webcrawler-service`. These prevent `pnpm -r --no-bail build`
  from succeeding and block downstream automation. We need to correct the
  regressions so the workspace builds cleanly.
proposed_transitions:
  - New->Accepted
  - Accepted->Breakdown
  - Breakdown->Ready
  - Ready->Todo
  - Todo->InProgress
  - InProgress->InReview
  - InReview->Done
  - InReview->Document
  - Document->Done
tags:
  - task/TASK-20240921-buildfix
  - board/kanban
  - state/InProgress
  - owner/codex-cloud
  - priority/p2
  - epic/EPC-000
uuid: eef79dc1-907d-4875-b833-31c2a9665d0e
created_at: '2025-10-06T01:50:48.291Z'
status: todo
---
```
<hr class="__chatgpt_plugin">
```
<span style="font-size: small;"> (llama3.2:latest)</span>
### role::assistant

Here's a suggested revision of your context section:

## Context
### Changes and Updates
- **What changed?**: Codex Cloud nightly build `pnpm -r --no-bail build` now fails in four workspace packages due to TypeScript errors involving unused variables, stricter nullability, and outdated API assumptions.
- **Where?**: `packages/enso-protocol`, `packages/docops`, `packages/kanban`, `packages/webcrawler-service`.
- **Why now?**: Build failures block integration work and violate the no-red-build gate for new tasks.

## Inputs / Artifacts
- docs/reports/codex_cloud/describe/latest/summary.tsv
- docs/reports/codex_cloud/describe/latest/logs/pnpm-build.out.log

## Definition of Done
- [ ] `pnpm --filter @promethean/enso-protocol build` succeeds locally.
- [ ] `pnpm --filter @promethean/docops build` succeeds locally.
- [ ] `pnpm --filter @promethean/kanban-cli build` succeeds locally.
- [ ] `pnpm --filter @promethean/webcrawler-service build` succeeds locally.
- [ ] No new ESLint errors are introduced in touched files.
- [ ] Codex Cloud build summary aligns with local fixes (documented in PR summary).

## Plan
1. Reproduce build failures locally for each package and capture the exact compiler diagnostics.
2. Update code to satisfy TypeScript's strict null and optional property checks without weakening type safety.
3. Remove or utilize unused variables and align test expectations with actual API responses.
4. Run targeted builds and eslint on affected files before committing.

## Relevant Resources

You might find [this](link) useful while working on this task.

### Smart Connections Configuration
```smart-connections
{
  "render_markdown": true,
  "show_full_path": false,
  "exclude_blocks_from_source_connections": false,
  "exclude_frontmatter_blocks": true,
  "expanded_view": false,
  "results_limit": "20",
  "exclude_inlinks": false,
  "exclude_outlinks": false
}
```

### Smart ChatGPT Configuration
```smart-chatgpt
```
```
<hr class="__chatgpt_plugin">
```
### role::user

fix-build-errors-enso-docops-kanban-webcrawler

<% tp.app.commands.executeCommandById"chatgpt-md:call-chatgpt-api" %>

