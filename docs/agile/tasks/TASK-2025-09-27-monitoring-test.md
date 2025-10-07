---
task-id: TASK-2025-09-27-monitoring-test
title: Stabilize monitoring token bucket tests
state: InProgress
prev: null
$$
txn: '2025-09-27T19:45:30Z-0000'
$$
owner: err
priority: p3
size: s
$$
epic: EPC-000
$$
$$
depends_on: []
$$
labels:
  - 'board:auto'
  - 'lang:ts'
due: null
links: []
artifacts: []
rationale: Fix flaky time-based monitoring token bucket tests.
$$
proposed_transitions:
$$
  - New->Accepted
  - Accepted->Breakdown
tags:
  - task/TASK-20250927-194530-0000
  - board/kanban
  - state/InProgress
  - owner/err
  - priority/p3
  - epic/EPC-000
$$
uuid: 17e07cf3-1aa0-4fb6-9db9-d343f5c394ba
$$
$$
created_at: '2025-10-06T01:50:48.282Z'
$$
status: todo
---
$$
<hr class="__chatgpt_plugin">
$$
<span style="font-size: small;"> (llama3.2:latest)</span>
### role::assistant

Here's a suggested revision of your context section:

## Context
### Changes and Updates
- **What changed?**: Received a request to fix `@promethean/monitoring:test` by eliminating flakiness from wall-clock sleeps.
- **Where?**: `packages/monitoring`.
- **Why now?**: Package tests can intermittently fail when real time drifts.

## Inputs / Artifacts
- $changelog.d/2025.09.27.19.45.04.md$

## Definition of Done
- [x] `pnpm --filter @promethean/monitoring test` passes deterministically.
- [x] ESLint clean on touched files.
- [x] Clock injection wired through the package exports.

## Plan
1. Inject a configurable clock into `TokenBucket` and store state immutably.
2. Update token bucket tests to advance a synthetic clock instead of waiting.
3. Run package tests and lint the touched files.

## Relevant Resources
- `packages/monitoring/src/limiter.ts`
- `packages/monitoring/tests/limiter.test.js`
- `packages/monitoring/src/index.ts`

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
$$
<hr class="__chatgpt_plugin">
$$
### role::user
$$
TASK-2025-09-27-monitoring-test
$$
<% tp.app.commands.executeCommandById$"chatgpt-md:call-chatgpt-api"$ %>

