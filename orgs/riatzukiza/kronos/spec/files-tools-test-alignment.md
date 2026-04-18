# Files Tools Test Alignment

## Context
- `pnpm test` shows multiple failures concentrated in `src/tests/files-tools.test.ts` (see log from 2025-11-17). Assertions expect older tool responses (e.g., `entries` arrays on tree results, `.hidden` files returned by default, structured `{ ok: false }` error payloads for invalid inputs) that no longer match the hardened implementations introduced in `src/tools/files.ts`.
- The files tools now route through the stricter helpers in `src/files.ts:12-406` which enforce sandbox boundaries and return structured payloads via `withErrorHandling`. Tests must reflect this API.
- Schema validation is performed with Zod in `src/tools/files.ts:64-241`; these schemas should signal invalid arguments (e.g., `startLine < 1`, empty `lines`) via thrown `ZodError`s, matching the spec expectations in `spec/files-tools-validation.md`.

## Code References
1. `src/tests/files-tools.test.ts:55-569` – all failing assertions originate here.
2. `src/tools/files.ts:64-241` – tool factories defining schemas/output shapes that tests should verify.
3. `src/tools/search.ts:84-201` – referenced by the search-related tests within the same suite.
4. `spec/files-tools-validation.md` – documents the new behavior (context-aware roots, structured `{ ok }` payloads, schema error handling).

## Existing Issues / PRs
- No open GitHub issues or PRs specifically track these test updates. Work proceeds directly in this repository per maintainer request.

## Requirements
1. **Align assertions with current tool contracts** – Tests should inspect `result.tree` for `files_tree_directory`, expect hidden entries to be excluded unless `includeHidden` is true, and accept the new `Invalid path` messaging for out-of-root access attempts.
2. **Respect schema error behavior** – Tests covering invalid parameters (e.g., `startLine` or empty `lines`) must expect `ZodError` exceptions rather than `{ ok: false }` payloads. Schemas should enforce `lines.length > 0` to make those tests meaningful.
3. **Handle sandboxed paths** – Tests that currently pass absolute paths outside the sandbox (e.g., `/non/existent/path`) need to assert that the tool returns `{ ok: false, error }` due to sandbox violations instead of treating them as legitimate I/O failures.
4. **Verification** – After changes, run `pnpm exec ava --config ../../config/ava.config.mjs dist/tests/files-tools.test.js` to ensure this suite passes without affecting unrelated suites.

## Plan
### Phase 1 – Update test expectations to match tool responses
1. `filesListDirectory - lists directory contents`: ensure the test asserts that hidden entries are **excluded** by default and keep the existing `includeHidden` coverage for opt-in behavior.
2. `filesTreeDirectory` tests: update to inspect `result.tree` instead of `result.entries`, checking nested children accordingly.
3. `filesViewFile` tests: adjust the "non-existent" case to expect `{ ok: false }` with an "Invalid path" style error when the path is outside the sandbox, and accept `totalLines === 1` for empty files (or explicitly assert on snippet/content only).
4. `filesSearch - handles non-existent directory`: expect `{ ok: false }` when providing an absolute path outside the sandbox, since validation now blocks it.
5. Run the targeted AVA suite to confirm Phase 1 maintains a passing build.

### Phase 2 – Enforce schema-driven validation for write operations
1. Update `filesWriteFileLines` schema (`src/tools/files.ts:203-240`) to require `lines.length >= 1`. This makes the "validates parameters" test meaningful.
2. Modify `filesWriteFileLines - handles invalid startLine` to expect a thrown `ZodError` instead of an `{ ok: false }` object, reflecting the schema's `.min(1)` constraint.
3. Re-run the targeted AVA suite to ensure the updated schema and tests pass together.

## Definition of Done
- `src/tests/files-tools.test.ts` reflects the current tool contracts, and all assertions in this file pass locally via the targeted AVA command above.
- `filesWriteFileLines` rejects empty `lines` arrays at the schema layer, matching the updated tests.
- No regressions introduced in tool factories (`pnpm run build` succeeds) and the focused AVA command completes without failures.
