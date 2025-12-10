# Knowledge Graph ECS simulation subpackage (2025-12-10)

## Code touchpoints

- services/knowledge-graph/src/simulation/redis-store.ts:1-128 (Redis helpers for simulation state/settings)
- services/knowledge-graph/src/simulation/session-manager.ts:1-257 (session lifecycle + runner spawn + persistence)
- services/knowledge-graph/src/simulation/session-runner.ts:1-103 (runner process; emits graph deltas)
- services/knowledge-graph/src/ecs/agent-entities.ts:1-399 (ECS world backing store for graph snapshots/deltas)
- services/knowledge-graph/src/http-server.ts:1-200 (API routes depending on simulationManager + redis helpers)
- services/knowledge-graph/src/graphql-server.ts:1-100+ (GraphQL schema/resolvers using simulationManager)

## Existing issues / PRs

- None located for this extraction; tracked locally.

## Requirements

- Create a dedicated subpackage under services/knowledge-graph/packages/ for ECS simulation utilities (session manager, runner entry, redis helpers, ECS store if moved).
- Update service imports (HTTP/GraphQL) to consume the new package instead of local src paths.
- Ensure new package has its own package.json/tsconfig/build scripts; wire workspace dependency from service root.
- Keep runtime behavior intact (session persistence, runner spawning, Redis streaming) after move.

## Definition of done

- Simulation-related modules reside under services/knowledge-graph/packages/<new package>/src with exports and build config.
- knowledge-graph service imports simulation APIs from the new package; no lingering references to ./simulation/\*\* in src.
- Package builds/typechecks (knowledge-graph + new package) succeed; runner resolution still works for dist/src.
- Workspace dependency added so pnpm install/typecheck works without manual path tweaks.

## Plan (phased)

- Phase 1: Scaffold package
  - Create packages/knowledge-graph-simulation (name TBD) with package.json, tsconfig, index exports.
  - Decide export surface (SimulationSessionManager, simulationManager singleton, redis helpers, runner path helpers, ECS store if moved).
- Phase 2: Move code
  - Relocate simulation files (redis-store, session-manager, session-runner, possibly agent-entities) into new package src/; adjust relative imports.
  - Update barrel/index.ts to export needed APIs.
- Phase 3: Wire consumers
  - Update service src imports (http-server, graphql-server, any others) to use the new package path.
  - Add dependency in services/knowledge-graph/package.json and ensure workspace wiring.
- Phase 4: Verify
  - Run targeted typecheck/build for knowledge-graph and new package (pnpm --filter ... typecheck/build).
  - Ensure no remaining references to old simulation paths.
