# Debug Filtering Validation Spec

## Context
- Repeated failures in `tests/debug-filtering-unit.test.ts` show that `isValidJsonRpcMessage` lets malformed or debug-like payloads through.
- Current implementation in `src/proxy/stdio-proxy.ts:25-44` only checks for `jsonrpc: "2.0"` plus the presence of `method`, `result`, or `error`, so benign debug strings that mimic JSON-RPC slip through and cause downstream crashes.

## Code References
1. `src/proxy/stdio-proxy.ts:25-44` – existing minimal validator used by the stdio proxy to filter stdout before relaying over HTTP.
2. `src/tests/debug-filtering-unit.test.ts:13-181` – unit tests that currently stub their own validator and assert stricter behavior (responses need IDs, result/error typing, mutual exclusivity, etc.).

## Existing Issues / PRs
- No open issues or pull requests in this repository explicitly track the debug-filtering failures (searched locally via `rg "debug-filtering"`).

## Requirements
1. Export `isValidJsonRpcMessage` from `src/proxy/stdio-proxy.ts` so tests can exercise the real implementation.
2. Update the validator to enforce:
   - `jsonrpc` version exactly `"2.0"`.
   - Requests must have a string `method`; responses must include exactly one of `result` or `error` and cannot mix them.
   - `result` must not be a raw string (objects, arrays, numbers, booleans, or null are acceptable) to avoid misclassifying debug text.
   - `error` must be an object (non-null) to differentiate from plain log strings.
   - Responses must include an `id` whose type is string, number, or null; if an `id` is provided for a request it must also satisfy those types.
3. Keep acceptance lenient for request `params` and edge cases noted in the tests (e.g., empty `method` string, incomplete error objects) so we don't drop legitimate traffic.
4. Ensure the validator rejects any payload that mixes request/response shapes or lacks the required discriminators, matching the negative unit tests.

## Definition of Done
1. `isValidJsonRpcMessage` applies the stricter heuristics above and is exported for reuse.
2. `src/tests/debug-filtering-unit.test.ts` imports the shared validator instead of maintaining a divergent copy.
3. Targeted tests (`pnpm ava src/tests/debug-filtering-unit.test.ts` or equivalent) pass locally; no regressions introduced in lint/build steps touched by this change.
4. Documentation/spec (this file) reflects the new behavior, and any future code reviewers can rely on it as the source of truth for the validator's contract.
