# Kanban CLI Commander Refactor and Scar Test Relocation

## Context and Scope

- Current CLI entrypoint (`cli/kanban/src/cli.ts`, ~1-200) manually parses args, applies legacy flags, and dispatches to `executeCommand` without structured subcommands; no grouping, makes maintenance difficult.
- Command registry lives in `cli/kanban/src/cli/command-handlers.ts` (imports ~1-80+, handlers throughout file). Each handler is positional-arg based; no commander usage.
- Scar/heal components (e.g., `scar-context-builder`, `scar-file-manager`, `scar-context-types`, `heal-command`, `scar-history-manager`) and their tests currently live in the CLI package under `cli/kanban/src/lib/heal` and `cli/kanban/src/tests/*`.
- Heal/scar plugin exists (`packages/kanban-plugin-heal`), but only provides git tag manager; scar logic/tests are not colocated.

## Goals / Definition of Done

- CLI rebuilt on `commander` with command groups (e.g., core board ops, task ops, heal/scar ops, dev ops). Legacy flag normalization still supported.
- Subcommands expose help/usage via commander; common options (board file, tasks dir, output format) centralized.
- Scar/heal tests and implementations moved to the plugin package where applicable; CLI uses plugin exports for scar/heal concerns.
- Test suite runs with reduced runtime (parallel AVA retained), passes without git fatal noise; build succeeds.

## Plan (phases)

1. **Design/Setup**
   - Introduce commander dependency to CLI package; define CLI scaffolding with grouped subcommands.
   - Map existing commands in `command-handlers.ts` into commander actions.
2. **Implementation**
   - Create new `cli/kanban/src/cli/commander.ts` (or similar) to register groups (board, task, search, heal/scar, dev/process) and wire to existing handlers.
   - Update `cli.ts` to delegate to commander bootstrap; preserve legacy flag/env normalization.
   - Extract scar/heal modules/tests into `packages/kanban-plugin-heal` (re-export to keep CLI imports stable).
3. **Validation**
   - Update tsconfig references/paths and package deps for commander and plugin consumption.
   - Run scoped tests (`pnpm --filter @promethean-os/kanban test`, plugin tests) and ensure logging remains silent in tests.

## Notes / Risks

- Moving scar code may require API surface in plugin; ensure CLI imports remain stable via re-exports/shims if needed.
- Commander actions must preserve current behavior/outputs (JSON/markdown printing) and exit codes.
- Keep legacy args/env mapping intact to avoid breaking existing automation.
