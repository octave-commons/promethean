# Files Security Validation Spec

## Context
- `pnpm test` shows failures in `tests/files-security.writeFileContent` (path traversal detection and broken symlink handling).
- The new comprehensive validator now surfaces messages like `Invalid path: Validation failed: ... Path traversal attempt detected`, causing the `path traversal` test (src/tests/files-security.test.ts:159-175) to mismatch its expected error pattern.
- The `writeFileContent` implementation (src/files.ts:278-300) currently succeeds when writing through a broken symlink, so the test at src/tests/files-security.test.ts:215-229 no longer observes an error.

## Code References
1. `src/files.ts:278-300` – `writeFileContent` path validation and write logic.
2. `src/files.ts:214-276` – `validatePathSecurity` helper that detects symlinks during writes.
3. `src/tests/files-security.test.ts:159-175` – ensures traversal attempts surface a clear error (regex `/path outside root|symlink escape detected/`).
4. `src/tests/files-security.test.ts:215-229` – expects broken symlink writes to fail without misclassifying as a symlink escape.

## Existing Issues / PRs
- No tracked issue/PR for these regressions (local search `rg "files-security" -g "spec/*.md"` returned none).

## Requirements
1. When `validateMcpOperation` rejects a path because of traversal/normalization/glob issues, re-map the error to the legacy message `path outside root` so downstream callers and tests maintain their contract.
2. Continue raising descriptive errors for other validation failures (retain prefix `Invalid path:` when not a traversal case).
3. Detect writes targeting symlinks whose resolved destination does not yet exist and surface a friendly error (e.g., `broken symlink target does not exist`) rather than silently creating the file.
4. Preserve existing protections for legitimate in-sandbox symlinks (they should still work) and parent directory validation.
5. Update or extend tests only as needed to cover the new behaviors (ideally tests remain unchanged because code now matches their expectations).

## Definition of Done
1. `writeFileContent` surfaces `path outside root` (matching regex) when traversal-like inputs are provided, while still enforcing the comprehensive validator.
2. Writing through a broken symlink now throws with a clear error message that does not mention `symlink escape detected`, satisfying the test's assertion.
3. `pnpm exec ava ... files-security.test.ts` passes locally, and no other touched suites regress.
4. This spec reflects the implemented behavior for future contributors.
