---
uuid: "99127fd9-debb-4eea-8625-32521de25fb1"
title: "Enforce /auth/me rate limiting in SmartGPT Bridge /TASK-20250307-0001 /kanban /InProgress /err /p2 /EPC-000 :auto :ts :smartgpt-bridge"
slug: "fix-auth-me-rate-limit"
status: "ready"
priority: "p2"
labels: ["task", "board", "state", "owner", "priority", "epic", "board", "lang", "package"]
created_at: "2025-10-07T20:25:05.643Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
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



