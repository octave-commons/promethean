---
uuid: "99127fd9-debb-4eea-8625-32521de25fb1"
title: "Enforce /auth/me rate limiting in SmartGPT Bridge /TASK-20250307-0001 /kanban /InProgress /err /p2 /EPC-000 :auto :ts :smartgpt-bridge"
slug: "fix-auth-me-rate-limit"
status: "done"
priority: "p2"
labels: ["task", "board", "state", "owner", "priority", "epic", "lang", "package"]
created_at: "2025-10-08T05:40:53.945Z"
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
- **Where?**: Test environment variable conflict between `.env` file and test setup.
- **Why now?**: CI surfaced the regression during
  `integration › server.openapi.auth`. Fixing auth rate limiting keeps
  SmartGPT Bridge secure and unblocks the pipeline.

### Root Cause Found
The issue was an environment variable conflict:
- `.env` file contains `AUTH_TOKENS=26d8b566b4d9072f312b6b6956dc83983c1ef2306c13b227fa81d66f709ca0b6` (hashed)
- Test sets `AUTH_TOKEN=secret` but doesn't clear `AUTH_TOKENS`
- `AUTH_TOKENS` takes precedence over `AUTH_TOKEN`, causing auth failure

### Inputs / Artifacts
- `packages/smartgpt-bridge/src/tests/integration/server.openapi.auth.test.ts`
- `.env` file with conflicting AUTH_TOKENS value

## Definition of Done
- [x] `/auth/me` applies the configured rate limit, returning 429 when
      the request count exceeds the limit for an IP.
- [x] Integration test `server.openapi.auth` passes locally.
- [x] Changelog entry documents the fix.
- [ ] PR opened referencing this task.

## Solution Implemented
1. **Identified environment variable conflict**: Test wasn't clearing `AUTH_TOKENS`
2. **Fixed test setup**: Added `AUTH_TOKENS` to capture list and deleted it in test
3. **Verified rate limiting works**: Test now passes with 10 successful requests + 1 rate-limited request

## Files Changed
- `packages/smartgpt-bridge/src/tests/integration/server.openapi.auth.test.ts`:
  - Added `AUTH_TOKENS` to environment capture
  - Added `delete process.env.AUTH_TOKENS;` to ensure test token takes precedence





