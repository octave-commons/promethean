# Typecheck remediation after package restructure

## Context

- Repo reorganized: many packages moved under `@cli/`, `@services/`, `@pipelines/`; some removed entirely (often type-only deps).
- Pre-push `nx affected -t typecheck` now fails for multiple targets due to stale tsconfig path refs and imports to removed packages.
- Branch: `device/stealth` (ahead of origin by 18 commits); typecheck is pre-push hook.

## Observed failures (from pre-push typecheck log)

- `@promethean-os/fs`: `tsconfig.json(11,9)` references missing `/packages/stream`.
- `@promethean-os/markdown`: inherits `../fs/tsconfig.json` path to missing `/packages/stream`.
- `@promethean-os/http`: `tsconfig.json(11,9)` references missing `/packages/event`.
- `@promethean-os/messaging`: imports `@promethean-os/event` in `src/context.ts`, `src/types.ts` (missing).
- `@promethean-os/plugin-hooks`: imports `@promethean-os/event` in `src/plugin-loader.ts` (missing).
- `@promethean-os/pantheon-ecs`: missing `@promethean-os/legacy/brokerClient.js` + implicit `any` params (`src/bus.ts`).
- `@promethean-os/frontend-service`: `tsconfig.json(11,5)` references missing `/services/web-utils`.
- `@promethean-os/discord`: imports missing legacy modules (`@promethean-os/legacy/env.js`, `@promethean-os/legacy/heartbeat/index.js`, `@promethean-os/event/memory.js`, `@promethean-os/monitoring`).
- `@promethean-os/mcp-kanban-bridge`: imports missing `@promethean-os/kanban` in `src/mcp-server.ts`, `src/simple-mcp-server.ts`.
- `@promethean-os/buildfix`, `@promethean-os/pipeline-automation`, `@promethean-os/readmeflow`, `@promethean-os/docops`, `@promethean-os/docs-system`: tsconfig paths still point to removed upstream location `/home/err/devel/orgs/riatzukiza/config/tsconfig.base.json` and several missing workspace packages.
- `@promethean-os/compiler`: `src/lisp/js-ast2lisp.ts(116,28)` needs `PrivateIdentifier` handling.
- Several packages (`buildfix`, `pipeline-automation`, `readmeflow`) need module/target bumped to ES2015+ and `esModuleInterop` or `moduleResolution` alignment (errors around private identifiers, default imports, downlevel iteration, import.meta).

## Definition of done

- All stale path references updated or removed to match new package layout; removed packages replaced with local shims or optional types.
- Imports from deleted modules either redirected to new locations or replaced with minimal local adapters to satisfy types.
- TypeScript configs aligned (targets >= es2015 where required, module settings allow `import.meta`, `esModuleInterop` where needed, base config path valid).
- `pnpm nx affected -t typecheck --base 0a0c1bc871a27e7860fc510d483b5da028baf410 --head HEAD` passes locally.

## Plan (phased)

1. Recon: inspect tsconfig and source files for failing packages; map new package paths or confirm removals.
2. Config cleanup: fix/bypass missing path refs (`packages/stream`, `packages/event`, `/services/web-utils`, shared base tsconfig path), introduce local stubs if necessary.
3. Import remediation: retarget or shim imports for removed packages (`@promethean-os/event`, `@promethean-os/legacy/*`, `@promethean-os/kanban`, etc.).
4. TS settings alignment: ensure targets/module options support `import.meta`, `downlevelIteration`, and `esModuleInterop` where needed.
5. Validate: rerun targeted typecheck and adjust remaining stragglers.

## Notes

- Some removed modules were type-only; lightweight local type modules may be enough.
- Keep changes scoped to failing packages; avoid broad workspace config churn unless necessary.
