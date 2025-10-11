---
uuid: "fe6be1d5-bcd6-4804-bf5e-f55b5838e9e0"
title: "Fix MCP filesSearch integration tests   -tools"
slug: "fix-mcp-files-search-tests"
status: "accepted"
priority: "P2"
labels: ["mcp", "tests", "files-tools"]
created_at: "2025-10-11T03:43:38.858Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---


## Objective
Restore all failing `filesSearch` and related `filesWriteFileLines` MCA tool tests in the MCP package. Tests currently reject promises due to proxy/tool behavior uncovered while running `pnpm --filter @promethean/mcp test`.

## Acceptance Criteria
- [ ] `filesSearch` tests covering regex, case sensitivity, include/exclude globs, max results, and max file size all pass locally.
- [ ] `filesWriteFileLines` invalid input test passes without rejected promise warnings.
- [ ] Root cause documented in this task with before/after notes.

## Related
- Blocked by: `mcp_stdio_proxy_review` (`3c3a6f8b-2a8d-4b3e-8d63-2b7d1e8f7a91`).
- Original blocker task: "MCP stdio proxy: code review + minimal hardening".


## Triage Notes (2025-10-10)
- Reproduced with `pnpm exec ava src/tests/files-tools.test.ts`.
- All failing invocations hit `normalizeToRoot` returning `path outside root` when tests pass absolute paths; MCP tools now enforce root sandbox and tests need to stage temporary root/ENV.
- Validation test expects `ZodError` but receives filesystem `ENOENT`; tool now performs IO before schema validation.
- Next steps: align tests with new root restrictions (set `MCP_ROOT_PATH`/use relative inputs) or adjust tool behavior.
