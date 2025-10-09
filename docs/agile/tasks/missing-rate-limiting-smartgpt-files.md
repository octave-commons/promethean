---
uuid: "7f2a8d19-4f72-4c39-9b23-08fd4e33c4f0"
title: "Add rate limiting to SmartGPT Bridge file routes"
slug: "missing-rate-limiting-smartgpt-files"
status: "done"
priority: "P1"
labels: ["security", "bug"]
created_at: "2025-10-07T20:25:05.644Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

# Description

CodeQL flagged the SmartGPT Bridge file routes for missing rate limiting. We need to scope the affected endpoints under sensible rate limits to prevent abuse while keeping the UX responsive.

## Requirements/Definition of done

- Add appropriate per-route rate limiting to SmartGPT Bridge v1 file routes.
- Keep the existing global route registration working without breaking Fastify encapsulation.
- Ensure the SmartGPT Bridge package continues to build successfully.
- Document the change in the changelog directory.

## Tasks

- [x] Audit `packages/smartgpt-bridge/src/routes/v1/files.ts` for missing rate limiting.
- [x] Implement per-route rate limit configuration for read and write endpoints.
- [x] Run the SmartGPT Bridge build to confirm no regressions.
- [x] Capture summary in `changelog.d`.

## Relevant resources

- CodeQL alert #426 (Missing rate limiting)
- Fastify rate limit plugin documentation

## Comments

- 2025-01-06: Initial triage confirms v1 file routes lack explicit per-route rate limits even though the plugin is registered for v1.
- 2025-01-06: Added scoped rate limit configuration, ran package build, and documented the change in the changelog.
