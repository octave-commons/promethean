# Kanban Estimates Parsing Bug

## Issue Discovered
The kanban system's task parser in `packages/kanban/src/lib/task-complexity.ts` does NOT parse the `estimates` field from markdown frontmatter when creating Task objects.

## Evidence
- Task type definition includes `estimates` field (lines 8-12 in types.ts)
- Task parser creates Task objects but only includes: uuid, title, status, priority, labels, created_at, content, slug, sourcePath
- The `estimates` field is completely missing from the parser logic

## Impact
- Breakdown completion rule (`breakdown-complete?`) requires estimates with complexity ≤ 5
- Since estimates are never parsed, tasks can never pass the breakdown completion check
- This blocks the entire kanban workflow from breakdown → ready transition

## Files Affected
- `packages/kanban/src/lib/task-complexity.ts` (lines 123-146)
- Missing estimates parsing in markdown task creation

## Workaround Needed
For stress test continuation, need to either:
1. Fix the parser to include estimates
2. Modify the breakdown rule to not require estimates
3. Find alternative transition path

## Root Cause
Incomplete implementation when estimates field was added to Task type but parser was never updated.