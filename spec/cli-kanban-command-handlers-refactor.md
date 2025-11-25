# CLI Kanban Command Handlers Refactor

## Scope

- Split `cli/kanban/src/cli/command-handlers.ts` (~2050 lines) into focused handler modules under `cli/kanban/src/cli/handlers/`.
- Preserve existing command behavior and command registry exports.
- Update imports/exports and any call sites/tests that reference the handlers.

## Key References

- cli/kanban/src/cli/command-handlers.ts:1-2052 (current monolith)
- cli/kanban/src/cli/handlers/wip.js (existing handler module)
- cli/kanban/src/cli/handlers/shared.js (shared CLI helpers)

## Existing Issues / PRs

- None discovered during scan.

## Definition of Done

- Handlers are organized into logical modules (board/tasks/epics/audit/process/ui/dev/heal/etc.) and re-exported via `command-handlers.ts`.
- Build/tests for @promethean-os/kanban succeed.
- No behavior regressions for command registry or handler semantics.

## Requirements

- Maintain ESM import style with explicit `.js` extensions.
- Keep command maps (`COMMAND_HANDLERS`, `AVAILABLE_COMMANDS`, `REMOTE_COMMANDS`) intact.
- Avoid altering command outputs beyond necessary import path changes.
