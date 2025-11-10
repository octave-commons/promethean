# Kanban Duplicate Processing Mitigation Spec

## Context

- Crisis summary in `.serena/memories/workflow-optimization-session-continuity.md:3-48` flags 109 agents active with 20+ running the same "Cross-Platform Clojure Agent Instruction Generator" epic while the Todo column holds ~250 items.
- The manual board `docs/agile/boards/kanban.md:1` currently lists **247** Todo entries (vs WIP limit 25) and `docs/agile/reports/wip-violations-manual.md:3-25` recorded 318 Todo / 15 In Progress cards during the prior audit, confirming a chronic overload.
- Auto-generated board data in `docs/agile/boards/generated.md:55-69` shows 15 duplicated wikilinks for the agent-instruction epic family (three copies each of epic, summaries, architecture, research, and infrastructure subtasks) all sitting in `incoming`.

## Existing Tooling to Leverage

- **WIP runtime enforcement** lives in `packages/kanban/src/lib/wip-enforcement.ts:1-210`. It already intercepts transitions via `validateWIPLimits` and `interceptStatusTransition`, but it only triggers per-move and does not scan existing columns for duplicates or chronic overloads.
- **Offline balancing** exists in `packages/kanban/src/scripts/wip-sheriff.ts:22-294`, which parses `docs/agile/boards/kanban.md`, applies capacities, and re-renders lanes. Today it only rebalances counts, not semantic duplicates nor agent ownership metadata.
- **Similarity detection hooks** are available in `packages/kanban/src/lib/task-tools.ts:54-144` (`compareTasks`) and could be reused to score potential duplicates before spawning agents.

## Problem Statement

1. Todo/WIP overload is blocking scheduling (10× limit) and invalidates flow metrics.
2. Agents are being launched against identical "agent-instruction" tasks because the board contains multiple indistinguishable copies with unique UUIDs.
3. There is no automated gate that prevents duplicate entry creation or that collapses existing ones.
4. Observed impact: 20+ agents burning cycles on the same epic (summary lines 8-17) while 99 agents stay in `running` without meaningful progress.

## Requirements

1. **Immediate containment**
   - Detect duplicate tasks (same slug/title) before agents pick them up.
   - Stop new agent launches against tasks that already have an active worker.
2. **Structural controls**
   - Enforce WIP limits on `docs/agile/boards/kanban.md` during board regeneration and heal operations.
   - Auto-suppress duplicated wikilinks when regenerating `docs/agile/boards/generated*.md`.
3. **Monitoring & Reporting**
   - Surface duplicate statistics and WIP breaches in a machine-readable report for MCP tooling.
4. **Definition of Done Targets**
   - Todo column reduced to ≤100 entries (60% reduction) within one regeneration cycle.
   - No duplicate entries for the same canonical slug (`2025.10.14.agent-instruction-generator-*`) across any column.
   - Agents per epic limited to 1 active + 1 standby (configurable) with audit trail.

## Proposed Plan

### Phase 1 – Containment & Instrumentation

1. **Duplicate indexer**: add a CLI handler under `packages/kanban/src/scripts/` (reusing `task-tools` helpers) that scans `docs/agile/boards/generated*.md` and `docs/agile/tasks/*.md` for repeated slugs, emitting a consolidated JSON report (uuid, canonical slug, column). This report becomes input for WIP sheriff and healing pipelines.
2. **Agent throttle**: extend `packages/kanban/src/lib/healing/kanban-healing-coordinator.ts:94-230` to query the duplicate report before invoking `runAgentOperations`, short-circuiting when an identical task already has a running agent or when the column is over its configured capacity.
3. **Board annotation**: inject a `#duplicate` tag onto offending entries inside `docs/agile/boards/kanban.md` so human operators can visually triage until automation is fully deployed.

### Phase 2 – Structural Enforcement

1. **WIP gate tightening**: update `WIPLimitEnforcement.validateWIPLimits` (lines 108-175) to consume the duplicate report and treat duplicates as an additional projected count; a transition into `todo` or `incoming` should automatically fail when another item with the same slug already exists.
2. **WIP sheriff enhancements**: augment `wip-sheriff.ts` to:
   - Collapse duplicated wikilinks into a single card, merging tags/priorities.
   - Re-route overflow tasks to `icebox` or `superseded` automatically, logging the move result.
3. **Board regeneration hook**: ensure scripts that rebuild `docs/agile/boards/generated*.md` (via `packages/kanban/src/lib/dev-server.ts` and JSONL data) call the duplicate indexer before writing the Markdown so duplicates never reach the board if a canonical task already exists.

### Phase 3 – Monitoring & Preventive Automation

1. **Metrics surface**: publish a lightweight JSON feed under `docs/agile/reports/kanban-metrics.json` (new) listing counts per column, duplicates per epic, and agent assignment counts so MCP/PM2 can alert when thresholds are crossed.
2. **MCP tooling**: add a Kanban duplication check tool inside `mcp/src/tools/kanban*.ts` that consumes the JSON feed and prevents agents from checking out tasks flagged as duplicates or over the agent limit.
3. **Playbooks**: update `docs/agile/process/README.md` and `docs/agile/recommendations/kanban-optimization-2025-10-08.md` with the new workflow so humans know how to interpret duplicate tags and reports.

## Definition of Done

- `docs/agile/boards/kanban.md` shows ≤100 Todo cards when `wip-sheriff --write` is executed; automation fails CI if counts regress.
- Duplicate report returns zero entries for the agent-instruction slug family, verified by CI (new test under `packages/kanban/src/scripts/__tests__/duplicate-sheriff.test.ts`).
- `KanbanHealingCoordinator` refuses to launch more than the configured number of agents per canonical slug, logging the rejection.
- MCP tool exposes a `kanban.duplication_status` check returning "healthy" before any `pnpm kanban process` run.

## Dependencies / Open Questions

1. Do we have an authoritative list of running agents per task (PM2 vs MCP telemetry)? If not, we must add one before the throttle is reliable.
2. Should duplicates be archived (`superseded`) or merged into a single file? Merging implies updating wikilinks and may require `scripts/bulk-init-tracking.ts` to rewrite references.
3. The duplicate report needs to run in CI; decide whether it belongs under `packages/kanban` or a repo-level `scripts/` entrypoint.

## Existing Issues / PRs

- No GitHub issues reference this specific crisis yet; documentation lives only in `.serena/memories/workflow-optimization-session-continuity.md`. A follow-up issue should be filed once this spec is approved.
