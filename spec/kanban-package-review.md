# Kanban Package & Test Suite Review

## Scope

- Review current kanban-related packages: CLI (`cli/kanban`), content plugin (`packages/kanban-plugin-content`), heal plugin (`packages/kanban-plugin-heal`), markdown parser (`packages/markdown`), and Trello sync (`packages/trello`).
- Capture test coverage focus and notable gaps.

## Key References

- packages/markdown/src/kanban.ts:1-456 – Markdown board parser/serializer.
- packages/markdown/src/tests/kanban.test.ts:1-34 – Attribute escaping/id handling.
- packages/kanban-plugin-content/src/task-content/index.ts:1-376 – File-backed task cache and content manager.
- packages/kanban-plugin-content/src/task-content/ai.ts:1-694 – AI manager scaffolding (Pantheon integration, mock cache).
- packages/kanban-plugin-content/tests/task-content-\*.test.ts (editor/lifecycle/parser/AI/manager):1-200 – AVA coverage for parsing, editing, lifecycle, AI dry-runs.
- packages/kanban-plugin-heal/src/git-tag-manager.ts:1-361 – Git tag/scar persistence utilities.
- packages/kanban-plugin-heal/src/tests/git-tag-manager.test.ts:1-83 – Node test harness for tag create/delete.
- cli/kanban/package.json:1-119 – Scripts and dependency graph for CLI.
- cli/kanban/src/tests/\*.test.ts – Large AVA suite (move commands, sync, healing, dedupe, WIP rules, etc.).
- cli/kanban/test-\*.js – Legacy integration smoke tests and validators.
- packages/trello/src/lib/kanban-to-trello-sync.ts – Bridge from kanban boards to Trello (no dedicated tests found).

## Existing Issues/PRs

- No linked issues/PRs discovered during scan.

## Definition of Done

- Consolidated review notes covering code structure and current test focus for all kanban-adjacent packages.
- Identified notable test gaps or risk areas (e.g., untested flows, disabled specs).
- Ready recommendations for next validation steps (targeted tests or coverage improvements).

## Requirements

- Keep documentation traversable via `spec/` index; reference concrete files/lines above.
- Preserve existing code; this task is assessment-only.
