---
task-id: TASK-20250307-0001
title: Enforce /auth/me rate limiting in SmartGPT Bridge
state: InProgress
prev: null
txn: '2025-03-07T00:00:00Z-0001'
owner: err
priority: p2
size: s
epic: EPC-000
depends_on: []
labels:
  - 'board:auto'
  - 'lang:ts'
  - 'package:smartgpt-bridge'
due: null
links: []
artifacts: []
rationale: >-
  Integration test `server.openapi.auth` is failing because `/auth/me` currently
  ignores the configured per-IP rate limiting, returning 200 instead of 429
  after the limit is exceeded. We need to wire the Fastify rate limit plugin
  into the auth route so SmartGPT Bridge enforces its expected protections.
proposed_transitions:
  - New->Accepted
  - Accepted->Breakdown
  - Breakdown->Ready
  - Ready->Todo
  - Todo->InProgress
  - InProgress->InReview
  - InReview->Document
  - Document->Done
  - InReview->InProgress
  - InProgress->Todo
  - InProgress->Breakdown
  - InReview->Todo
  - Document->InReview
  - Done->Todo
tags:
  - task/TASK-20250307-0001
  - board/kanban
  - state/InProgress
  - owner/err
  - priority/p2
  - epic/EPC-000
uuid: 99127fd9-debb-4eea-8625-32521de25fb1
created_at: '2025-10-06T01:50:48.290Z'
status: in-progress
---
## Context

### Changes and Updates
- **What changed?**: `/auth/me` route bypasses per-IP rate limiting
  expectations; integration test now fails expecting 429 after hitting
  the limit.
- **Where?**: `packages/smartgpt-bridge/src/auth.ts` and Fastify auth
  registration in `packages/smartgpt-bridge/src/fastifyAuth.ts`.
- **Why now?**: CI surfaced the regression during
  `integration › server.openapi.auth`. Fixing auth rate limiting keeps
  SmartGPT Bridge secure and unblocks the pipeline.

### Inputs / Artifacts
- `packages/smartgpt-bridge/src/auth.ts`
- `packages/smartgpt-bridge/src/fastifyAuth.ts`
- `packages/smartgpt-bridge/src/tests/integration/server.openapi.auth.test.ts`

## Definition of Done
- [ ] `/auth/me` applies the configured rate limit, returning 429 when
      the request count exceeds the limit for an IP.
- [ ] Integration test `server.openapi.auth` passes locally.
- [ ] Changelog entry documents the fix.
- [ ] PR opened referencing this task.

## Plan
1. Audit auth route registration to understand why per-route rate limit
   config isn't applied.
2. Wire Fastify rate limit plugin to `/auth/me` with correct options and
   test behaviour manually.
3. Run `pnpm --filter @promethean/smartgpt-bridge test` to confirm
   integration suite passes.
4. Add changelog entry summarizing the rate limit fix and prepare PR.

