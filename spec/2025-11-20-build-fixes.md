# Build Fixes 2025-11-20

## Scope

- Resolve failing targets from `pnpm build` on 2025-11-20.
- Packages reported failing: voice-service, event, symdocs, codepack, codemods, sonarflow, kanban, semverguard, broker, legacy, frontend.

## Known errors and locations

- `experimental/voice/tsconfig.json` references missing `experimental/logger/tsconfig.json` (TS5083).
- `packages/event/src/memory.ts:111,116` – unused params `topic`, `group` (TS6133).
- `pipelines/symdocs/tsconfig.json:11` – base config path resolves to `/home/err/devel/orgs/riatzukiza/config/tsconfig.base.json` (missing). Also bad path to `../level-cache`.
- `pipelines/codepack/tsconfig.json` similar base path issue; additional module settings cause `import.meta` and ES target errors.
- `pipelines/codemods/tsconfig.json` base path issue; missing `@types/diff`/`diff` types.
- `pipelines/sonarflow/tsconfig.json:12` base path issue and invalid `logger` path.
- `cli/kanban/src/lib/pantheon/runtime.ts:7` missing dep `@promethean-os/pantheon-core`; implicit any parameters (40,53,88).
- `pipelines/semverguard/tsconfig.json` base path issue; module target too low (`esModuleInterop`, ES2015 iteration, import.meta), uses zod/ts-morph requiring ES2015+.
- `packages/broker/src/index.ts:41` unused `sender`; `server.address()` nullable and type narrowing needed at line ~121.
- `packages/legacy/src/index.ts` exports missing compiled files `env.js`, `brokerClient.js`, `queueManager.js`.
- `packages/frontend shadow-cljs`: missing namespace `promethean.frontends.chat-ui.app` required by `promethean/main/router.cljs`.

## Existing issues / PRs

- Not checked yet (to verify in later pass).

## Definition of done

- `pnpm build` (or targeted builds) succeeds with the previously failing packages fixed.
- No new lint/type errors introduced.
- Any added deps/config changes are minimal and scoped.

## Requirements / approach

- Adjust tsconfig base paths to use repo-level `config/tsconfig.base.json`.
- Bump module/target options to support import.meta/ES2015 where needed.
- Add missing dependencies/types where required.
- Remove/ignore unused variables in TypeScript warns.
- Ensure missing compiled outputs or sources are present or remove exports.
- Fix shadow-cljs namespace availability for frontend build.

## Notes

- Engine mismatch warning (node 22.18 vs 22.20) currently ignored, not blocking build.
