# Directory Adapter Hardening & Test Stabilization

## Context

- Failing suite: `pnpm --filter @promethean-os/kanban test -- --fail-fast` (run 2025-11-12) aborts with duplicate test titles and nine security assertions in `directory-adapter`.
- Placeholder test names (`test('$0', …)`) exist in `packages/kanban/src/lib/directory-adapter/tests/backup.test.ts:57-294` and `packages/kanban/src/lib/directory-adapter/tests/adapter.test.ts:176-476`, triggering AVA's "Duplicate test title: $0" error before the real assertions execute.
- `packages/kanban/src/lib/directory-adapter/security.ts:20-353` returns false negatives for several security checks:
  - Path traversal detection normalizes the path before scanning, so inputs like `/test/tasks/../../../etc/passwd` pass without a `"traversal"` issue string.
  - Extension filtering flags dotfiles without extensions (e.g. `.hidden`) as errors even though tests only expect warnings.
  - Directory existence enforcement rejects any path whose parent folder is not on disk, even when `context.metadata.baseDirectory` scopes operations to a virtual repo during tests.
  - `sanitizePath()` currently replaces every invalid character (including `:`) with `_`, producing `file_______.txt` while tests expect `file______.txt` and colon removal.
  - Issue messages for binary detection use capitalized "Binary", so `issue.includes('binary')` fails.

## Related References

- `spec/kanban-test-stabilization.md` already tracks the wider Kanban stabilization effort; this document narrows in on the directory adapter subset outlined above.
- No GitHub issue is linked yet (local failure only), but see `debug-sanitize.js` at repo root for the expected sanitization behavior used by the test suite.

## Requirements & Definition of Done

1. `pnpm --filter @promethean-os/kanban test -- --fail-fast` completes through the directory-adapter suites without duplicate-title aborts.
2. Security tests (`security.test.ts`) pass: traversal, binary detection, allowed extension guardrails, suspicious filenames, and level handling all meet expectations without weakening existing protections.
3. Sanitized paths conform to `file______.txt` for the `file<>:"|?*.txt` fixture, with colons removed rather than underscored, and whitespace collapsed.
4. Directory existence checks no longer fail when operating inside the configured base directory (`context.metadata.baseDirectory`), yet still block obvious outside-of-repo targets.
5. Update/new logic ships with comments or self-explanatory code; no regressions to callers like `DirectoryAdapter`, `TaskBackupManager`, or downstream consumers.

## Phased Plan

### Phase 1 – Test Harness Hygiene

- Give every placeholder `test('$0', …)` in `backup.test.ts` and `adapter.test.ts` descriptive, unique titles so AVA can register them. (Lines 57-294 & 176-476)
- Keep naming aligned with the behavior under test ("should create/restore backup", "should read task file", etc.) to aid future triage.

### Phase 2 – Security Validator Fixes

- Detect traversal patterns on the raw input before normalization and ensure the emitted issue string contains `"traversal"`.
- Treat missing extensions as warnings, not failures; continue rejecting explicit forbidden extensions case-insensitively.
- When `context.metadata.baseDirectory` is provided, consider the directory valid even if it does not exist locally; only warn if the resolved dir leaves the allowed tree. Otherwise, downgrade missing-directory errors to warnings.
- Tweak `sanitizePath()` to drop colons, replace the other invalid characters with underscores, collapse whitespace to a single `_`, and trim redundant underscores near separators.
- Ensure binary-content issue strings are lowercase ("binary") so tests using `includes('binary')` pass. Validate other message casing as needed.

### Phase 3 – Verification & Regression Guarding

- Re-run `pnpm --filter @promethean-os/kanban test -- --fail-fast` until it clears the directory-adapter suites.
- Spot-check downstream adapters (e.g., `TaskBackupManager`) for behavior consistency under the updated validator.

## Acceptance Checklist

- [ ] Tests renamed and readable in `backup.test.ts` & `adapter.test.ts`.
- [ ] `security.ts` detects traversal before normalization, relaxes extensionless files to warnings, and no longer blocks virtual directories under `baseDirectory`.
- [ ] `sanitizePath()` output matches the documented fixture.
- [ ] All directory-adapter tests pass locally with fail-fast enabled.
