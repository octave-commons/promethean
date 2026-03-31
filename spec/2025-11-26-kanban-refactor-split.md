# Kanban CLI: split oversized `kanban.ts`

## Context

- `cli/kanban/src/lib/kanban.ts` (~2,500 LOC) mixes helpers, parsing, persistence, sync, CRUD, AI hooks. Hard to navigate and test.
- Key hotspots:
  - Slug/label/column helpers near lines 15-180.
  - Markdown parsing and serialization (`parseColumnsFromMarkdown`, `serializeBoard`, `resolveKanbanFooter`) around lines 234-775.
  - Task file parsing/IO (`readTasksFolder`, `toFrontmatter`, `fallbackTaskFromRaw`) around lines 334-1195.
  - Sync/push/pull logic (`pullFromTasks`, `pushToTasks`, `syncBoardAndTasks`) around lines 1263-1219.
  - Lifecycle operations (`createTask`, `updateStatus`, `archiveTask`, `mergeTasks`) around lines 748-2260.
  - Search/index/tagged board generation near lines 2263-2390.
  - AI helpers (`analyzeTask`, `rewriteTask`, `breakdownTask`) near lines 2392-2520.
- No linked issues/PRs found yet.

## Plan (phases buildable after each)

1. **Foundations**: Extract pure helpers (slug/labels/column/time/sections/template utils) into `kanban-utils.ts`; frontmatter helpers into `kanban-frontmatter.ts`. Update imports in downstream files while keeping behavior identical.
2. **IO/Serialization**: Move task file parsing (`readTasksFolder`, `resolveTaskFilePath`, `toFrontmatter`, fallbacks) into `task-files.ts`. Move board parsing/serialization (`mergeColumnsCaseInsensitive`, `parseColumnsFromMarkdown`, `serializeBoard`, footer resolution, index refresh) into `board-serialization.ts`.
3. **Lifecycle & Sync**: Extract lifecycle operations into `task-lifecycle.ts` (validate/move/update/create/archive/delete/merge). Extract sync/regeneration/search into `task-sync.ts` & `task-search.ts`. Keep `updateStatus` using imported validators (transition, wip, p0).
4. **API Surface**: Shrink `kanban.ts` to re-export from new modules (plus AI helper module if needed). Ensure `src/index.ts` exports remain unchanged. Adjust tests/imports if they touch moved members.

## Definition of Done

- `kanban.ts` reduced to an orchestrator/exports; core logic lives in smaller modules with coherent responsibilities.
- All existing exports preserved with identical behavior and types.
- New modules located under `cli/kanban/src/lib/` with clear names matching phases above.
- References updated across the package; typecheck/build (at least targeted if time) passes.
- No new lint errors; docs/tests unaffected aside from path updates.

## Notes

- Keep new docs linked: this spec is reachable via `spec/` index.
- Preserve existing behavior (especially P0/WIP/transition validation side effects and sync logging).
