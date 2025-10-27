# In-Progress WIP Audit — 2025-10-10

## Summary
- Brought the **In Progress** column back under the WIP cap by reclassifying eleven cards that had no active work into earlier workflow states.
- Left only the two cards with documented, ongoing work (`enhance-clj-hacks-claude-code-mcp`, `shadow-cljs-migration-step-1-foundation`) in **In Progress**.

## Status Adjustments
| Task | New Status | Rationale |
| --- | --- | --- |
| [boardrev-continuous-monitoring](boardrev-continuous-monitoring.md) | todo | No execution evidence—queued until capacity frees up. |
| [boardrev-incremental-updates](boardrev-incremental-updates.md) | todo | Requires implementation slice to be scheduled; move out of active work. |
| [cleanup-done-column-incomplete-tasks](../tasks/cleanup-done-column-incomplete-tasks.md) | breakdown | Scope scored at 8 points; needs decomposition before resuming. |
| [cleanup-done-column-incomplete-tasks 2](cleanup-done-column-incomplete-tasks%202.md) | accepted | Duplicate placeholder card awaiting refinement; removed from WIP. |
| [fix-writefilecontent-sandbox-escape-via-symlinks](fix-writefilecontent-sandbox-escape-via-symlinks.md) | ready | Urgent security fix with clear scope; staged for immediate pull when capacity opens. |
| [fix-writefilecontent-sandbox-escape-via-symlinks 2](fix-writefilecontent-sandbox-escape-via-symlinks%202.md) | accepted | Duplicate metadata stub; park until consolidated with the main fix. |
| [resolve_eslint_violations_repo_wide](resolve_eslint_violations_repo_wide.md) | todo | Broad lint initiative with no current execution—returned to backlog. |
| [author-omni-protocol-package](author-omni-protocol-package.md) | ready | Dependencies captured; poised for implementation after upstream spec lands. |
| [scaffold-omni-protocol-package](scaffold-omni-protocol-package.md) | accepted | Precursor work that still needs scoping adjustments before kicking off. |
| [setup-kanban-mcp-server](setup-kanban-mcp-server.md) | ready | Implementation plan is complete; waiting for available engineer. |
| [setup-mcp-pnpm-ops](setup-mcp-pnpm-ops.md) | ready | Work is well-defined but not actively staffed, so removed from WIP. |

## Follow-up
- Coordinate with owners of the security and kanban automation tasks to ensure quick pickup now that capacity exists.
- Break down the done-column cleanup epic into ≤5 point slices before re-entering execution.
- Remove the duplicate security task once consolidation with the primary card is confirmed.
