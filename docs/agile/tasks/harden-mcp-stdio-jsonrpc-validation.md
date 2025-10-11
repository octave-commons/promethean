---
uuid: "b069c1e4-523e-4dd6-a3bb-03c30bd9a2c5"
title: "Harden MCP stdio proxy JSON-RPC validation   -proxy   -proxy   -proxy   -proxy   -proxy   -proxy"
slug: "harden-mcp-stdio-jsonrpc-validation"
status: "accepted"
priority: "P2"
labels: ["mcp", "tests", "stdio-proxy"]
created_at: "2025-10-11T19:22:57.819Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

## Objective
Diagnose and fix the failing JSON-RPC validation suites (`stdio-proxy-validation` and `debug-filtering-unit`) so that invalid messages are rejected and edge cases resolve without timeouts.

## Acceptance Criteria
- [ ] `stdio-proxy-validation` tests complete without pending promises or assertion failures.
- [ ] `debug-filtering-unit` NEGATIVE tests detect malformed messages while allowing valid ones.
- [ ] Updated validation logic includes regression coverage for the fixed scenarios.
- [ ] Findings documented in this task, referencing prior failure logs.

## Related
- Blocked by: `mcp_stdio_proxy_review` (`3c3a6f8b-2a8d-4b3e-8d63-2b7d1e8f7a91`).
- Original blocker task: "MCP stdio proxy: code review + minimal hardening".


## Triage Notes (2025-10-10)
- Reproduced failures via `pnpm exec ava src/tests/debug-filtering-unit.test.ts src/tests/stdio-proxy-validation.test.ts`.
- `isValidJsonRpcMessage` currently treats `{jsonrpc:"2.0", method:""}` as valid; validator only checks property presence, not non-empty method strings.
- Malformed debug-like messages pass validation because method string is only checked for type.
- Need stricter JSON-RPC validation (non-empty method, response shape, etc.) and adjust tests accordingly.
