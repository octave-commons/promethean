# Spec: Stabilize Directory Adapter + Backup Tests

- **Date:** 2025-11-12
- **Owner:** Codex (via OpenCode)
- **Goal:** Restore the failing `@promethean-os/kanban` directory-adapter backup + security tests by tightening status normalization, cache coherence, error messaging, and backup integrity when compression is enabled.

## Related Tests / Failures

- `directory-adapter › tests › backup › should handle compressed backups end-to-end`
- `directory-adapter › tests › adapter › should report missing tasks when reading`
- `directory-adapter › tests › adapter › should block path traversal task identifiers`
- `directory-adapter › tests › adapter › should reject dangerous task content`
- `directory-adapter › tests › adapter › should update task files and cache contents`
- `directory-adapter › tests › adapter › should rename files when moving tasks`

## Code Hotspots (with line refs)

1. `packages/kanban/src/lib/directory-adapter/backup.ts:59-144, 341-369` – `TaskBackupManager.createBackup` & `verifyBackupIntegrity` currently hash original content even when compression rewrites the stored bytes.
2. `packages/kanban/src/lib/directory-adapter/adapter.ts:70-150` – `readTaskFile` and `writeTaskFile` swallow ENOENT errors and lack canonical status normalization before persisting frontmatter.
3. `packages/kanban/src/lib/directory-adapter/adapter.ts:198-333` – `createTaskFile` / `updateTaskFile` should sanitize status keys and pass security context details into errors.
4. `packages/kanban/src/lib/directory-adapter/adapter.ts:360-429` – `moveTaskFile` does not refresh the cache with the renamed task payload, so reads return the stale title/status.
5. `packages/kanban/src/lib/directory-adapter/adapter.ts:686-770` – `validateOperation` + `handleError` need to propagate security issue details so tests can assert on `security`/`dangerous` wording.

## Existing Issues / PRs

- No open repository issues or PRs referencing these concrete failures were identified during local search (`rg "directory-adapter"` / `rg "compressed backup"`).

## Requirements

1. **Compressed backups:** Integrity verification must hash the _decompressed_ payload when metadata marks a backup as `compressed`, ensuring end-to-end restore succeeds.
2. **Status normalization:** Any status update/write path must coerce aliases like `doing`, `in-progress`, `wip`, etc. to the canonical underscore format (`in_progress`).
3. **Cache coherence after move:** Moving a task must update the cache entry with the retitled payload so subsequent reads reflect the new metadata even if the on-disk UUID filename changed.
4. **Readable security errors:** Path traversal and dangerous content rejections should surface explicit `Security violation` messaging (and include validator issues) so consumers/tests can assert on the wording.
5. **Missing file clarity:** Reads of nonexistent tasks should emit `File not found` errors instead of raw `ENOENT` strings.

## Definition of Done

1. All six previously failing AVA specs in `packages/kanban/src/lib/directory-adapter/tests/{backup,adapter}.test.ts` pass locally via `pnpm --filter @promethean-os/kanban test --filter directory-adapter` (or equivalent package-level run).
2. Manual status updates (`updateTaskFile`) persist normalized canonical statuses, verified by inspecting the written frontmatter + cache read.
3. Moving a task immediately returns the updated title when `readTaskFile` is invoked without reloading from disk.
4. Security validation failures include actionable messaging mentioning `security` or `dangerous` plus the first validator issue, without exposing stack traces.
5. No regressions in other directory-adapter test suites.

## Implementation Phases

1. **Backup Integrity Fixes**
   - Update `verifyBackupIntegrity` in `backup.ts` to accept a `compressed` flag and compare hashes against decompressed content.
   - Ensure `createBackup` passes the compression flag alongside the expected hash.
2. **Adapter Error + Status Cohesion**
   - Normalize status values within `createTaskFile`, `writeTaskFile`, and `updateTaskFile` before writing frontmatter or caching.
   - Convert `readTaskFile` ENOENT cases into `FileNotFoundError` instances.
   - Enhance `handleError` to surface `SecurityValidationError` issue details with a `Security violation` prefix.
3. **Move/Cache Synchronization**
   - After move operations, refresh the cache with the updated task payload instead of reusing the stale copy.
   - Ensure metadata returned from move/update operations includes any backup info when enabled.
4. **Regression Testing**
   - Re-run the package test suite; capture and summarize results.
