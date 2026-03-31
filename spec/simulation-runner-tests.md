# Simulation Runner Tests

## Scope

Add tests for the knowledge graph simulation runner/session manager to ensure runner resolution works with modern `tsx` exports and session lifecycle state persists correctly.

## Relevant code

- `services/knowledge-graph/src/simulation/session-manager.ts`: runner resolution and session lifecycle (`resolveRunnerCommand` ~lines 189-204; persistence/load ~lines 205-233)
- `services/knowledge-graph/src/simulation/session-runner.ts`: runner entry writes state/logs (environment variables, tick loop ~lines 8-86)

## Known issues / PRs

- No open issues or PRs found for the simulation runner resolution.

## Requirements

- Cover `SimulationSessionManager.resolveRunnerCommand` for both built (dist) and source fallback paths without relying on `tsx/dist/cli.js` (use exported CLI path).
- Cover session lifecycle persistence updates for start/stop transitions without spawning a real runner process.
- Tests should isolate filesystem state (use temp dirs) and avoid global `.space` pollution.

## Definition of done

- New Vitest cases under `services/knowledge-graph/tests/` asserting runner resolution logic and lifecycle persistence.
- Tests pass via `pnpm --filter @promethean-os/knowledge-graph test`.
- No regression to existing tests; CI-friendly (no long-running processes).

## Change log

- Added tsx CLI fallback coverage and session lifecycle tests (2025-12-07).
- Updated runner resolution to use exported `tsx/cli` path.
