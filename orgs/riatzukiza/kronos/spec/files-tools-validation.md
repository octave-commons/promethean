# Files Tools Validation Spec

## Context
- Recent `pnpm test` runs show every `files-tools*.test.ts` suite failing because the tool factories ignore the provided `ToolContext` environment and because errors now bubble as uncaught exceptions instead of structured `{ ok: false, error }` payloads.
- Examples from the log (2025-11-13) include:
  - `filesSearch - handles empty search patterns` rejecting with `Error: path outside root` instead of `ok: true` (see `src/tests/files-tools-edgecases.test.ts:75-89`).
  - `filesListDirectory - handles non-existent directory` throwing `Invalid path: ...` when the test expects `result.ok === false` (see `src/tests/files-tools.test.ts:91-97`).
- Tool factories in `src/tools/files.ts:17-169` currently call `getMcpRoot()` directly, ignoring the `ctx.env.MCP_ROOT_PATH` that tests supply. Helper functions in `src/files.ts:12-212` strictly validate roots and now raise errors for absolute temp paths that fall outside the process-level root.

## Code References
1. `src/tools/files.ts` – tool factories for list/tree/view/write/search; need to consume `ToolContext.env` and normalize error handling.
2. `src/tools/search.ts:5-161` – search tool also hardcodes `getMcpRoot()` and does not guard `normalizeToRoot` or return structured errors.
3. `src/files.ts:12-212` – sandbox helpers; already enforce root boundaries, so factories must pass the intended root (from context or env) before calling them.
4. Tests expecting structured `{ ok, error }` payloads:
   - `src/tests/files-tools.test.ts:55-444`
   - `src/tests/files-tools-edgecases.test.ts:33-379`
   - `src/tests/files-tools-integration.test.ts:158-550`

## Failures Observed
- Root resolution mismatch: factories ignore the per-tool context, so `resolveRoot()` always points to the repo root, causing `path outside root` when tests create temporary sandboxes.
- Error propagation mismatch: on failure the factories currently throw, making AVA flag “Rejected promise returned by test” instead of returning `{ ok: false, error: "..." }`.
- Integration suites receive unexpected HTTP 400/500 results because the tool responses are not serialized (errors escape the MCP server as thrown exceptions).

## Requirements
1. **Context-aware root resolution**: every files tool must prefer `ctx.env.MCP_ROOT_PATH` (falling back to `process.env.MCP_ROOT_PATH` and then CWD). For temporary sandboxes, absolute paths inside that root must pass validation.
2. **Structured error payloads**: tool `invoke` functions should wrap their core helpers in `try/catch` and return `{ ok: false, error: string }` instead of throwing, unless the failure is a schema (Zod) error, which tests already expect to throw.
3. **Consistency across tools**: apply the same handling to `files_list_directory`, `files_tree_directory`, `files_view_file`, `files_write_content`, `files_write_lines`, and `files_search` so both unit and integration tests see uniform behavior (`result.content` in MCP responses should serialize these objects).
4. **No regression in sandboxing**: continue to leverage `src/files.ts` validation (do not loosen `normalizeToRoot`), only ensure the intended sandbox root is the same value the tests provide via context/env.

## Definition of Done
1. All files tools use the provided `ToolContext.env.MCP_ROOT_PATH` when resolving the sandbox root, with clear fallback rules, and this behavior is documented in code comments where needed.
2. Each tool returns `{ ok, ... }` objects for success and `{ ok: false, error }` for runtime failures; Zod validation errors still throw.
3. Targeted suites pass locally: `pnpm exec ava --config ../../config/ava.config.mjs dist/tests/files-tools.test.js dist/tests/files-tools-edgecases.test.js dist/tests/files-tools-integration.test.js`.
4. Full MCP integrations no longer crash due to unhandled tool exceptions, and this spec reflects the final behavior for future contributors.

## Progress Log
- Implemented context-aware root resolution and error handling across `files_list_directory`, `files_tree_directory`, `files_view_file`, `files_write_content`, `files_write_lines`, and `files_search` (2025-11-13).
- Added root-relative coercion so absolute paths inside the sandbox continue to work while still blocking escapes.
- Updated validation to tolerate legitimate special characters (e.g., `&`) in filenames.
- Extended `viewFile` to expose full `content` alongside snippets so consumer tests can assert on file bodies.
- `files-tools-edgecases.test.ts` now passes entirely; remaining suites still require follow-up work (see test log).
