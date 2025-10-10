# In-Progress WIP Audit — 2025-10-10

## Summary
- Brought the **In Progress** column back under the WIP cap by reclassifying eleven cards that had no active work into earlier workflow states.
- Left only the two cards with documented, ongoing work (`enhance-clj-hacks-claude-code-mcp`, `shadow-cljs-migration-step-1-foundation`) in **In Progress**.

## Status Adjustments
| Task | New Status | Rationale |
| --- | --- | --- |
| [[boardrev-continuous-monitoring]] | todo | No execution evidence—queued until capacity frees up. |
| [[boardrev-incremental-updates]] | todo | Requires implementation slice to be scheduled; move out of active work. |
| [[cleanup-done-column-incomplete-tasks]] | breakdown | Scope scored at 8 points; needs decomposition before resuming. |
| [[cleanup-done-column-incomplete-tasks 2]] | accepted | Duplicate placeholder card awaiting refinement; removed from WIP. |
| [[fix-writefilecontent-sandbox-escape-via-symlinks]] | ready | Urgent security fix with clear scope; staged for immediate pull when capacity opens. |
| [[fix-writefilecontent-sandbox-escape-via-symlinks 2]] | accepted | Duplicate metadata stub; park until consolidated with the main fix. |
| [[resolve_eslint_violations_repo_wide]] | todo | Broad lint initiative with no current execution—returned to backlog. |
| [[author-omni-protocol-package]] | ready | Dependencies captured; poised for implementation after upstream spec lands. |
| [[scaffold-omni-protocol-package]] | accepted | Precursor work that still needs scoping adjustments before kicking off. |
| [[setup-kanban-mcp-server]] | ready | Implementation plan is complete; waiting for available engineer. |
| [[setup-mcp-pnpm-ops]] | ready | Work is well-defined but not actively staffed, so removed from WIP. |

## Follow-up
- Coordinate with owners of the security and kanban automation tasks to ensure quick pickup now that capacity exists.
- Break down the done-column cleanup epic into ≤5 point slices before re-entering execution.
- Remove the duplicate security task once consolidation with the primary card is confirmed.
