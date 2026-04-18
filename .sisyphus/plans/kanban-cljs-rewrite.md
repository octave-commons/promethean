# Kanban CLJS Rewrite (Replace `cli/kanban` TS)

## TL;DR

Rewrite the Kanban core + CLI in ClojureScript (shadow-cljs) under `promethean/packages/kanban`, while preserving the current `@promethean-os/kanban/*` API surface and CLI command set so existing TS services (notably `services/mcp-kanban-bridge` and `packages/github-sync`) keep working.

Deliverables:
- New canonical package: `promethean/packages/kanban` (CLJS)
- Preserved JS import paths: `@promethean-os/kanban/board/config`, `@promethean-os/kanban/lib/kanban`, `@promethean-os/kanban/lib/types` (+ keep existing `exports` shape)
- Preserved CLI command surface (treat `promethean/cli/kanban/src/cli/command-handlers.ts` as authoritative)
- Multi-root tasks/spec support (scan/merge) without mass file migration
- JSONL mode that is machine-parseable (no stdout pollution)
- Tests-first (TDD) with automated verification

Estimated effort: Large

---

## Context

Original pain points:
- `promethean/cli/kanban` is a TS implementation that attempted to embed Clojure; the goal is to “embed clojure in clojure” instead.

Existing implementation references (to preserve behavior):
- CLI entry + wiring: `promethean/cli/kanban/src/cli.ts`, `promethean/cli/kanban/src/cli/commander.ts`
- Command surface list: `promethean/cli/kanban/src/cli/command-handlers.ts`
- UI server behavior: `promethean/cli/kanban/src/lib/ui-server.ts`
- JSONL helper: `promethean/cli/kanban/src/lib/jsonl.ts`
- Current config file example: `promethean/cli/kanban/promethean.kanban.json`

Known TS dependents (must keep compiling):
- `promethean/services/mcp-kanban-bridge/src/mcp-server.ts`
- `promethean/services/mcp-kanban-bridge/src/simple-mcp-server.ts`
- `promethean/packages/github-sync/src/index.ts`

Existing workspace shadow-cljs frontend build:
- `promethean/shadow-cljs.edn` already has `:kanban-frontend` outputting to `packages/kanban/dist/frontend`.

---

## Work Objectives

Core objective:
- Replace kanban TS implementation with a CLJS implementation that is callable from Node (library + CLI) while keeping import paths and CLI commands stable.

Definition of done:
- `pnpm --filter @promethean-os/kanban build` succeeds.
- `pnpm --filter @promethean-os/kanban test` succeeds (tests-first plan).
- `pnpm --filter @promethean-os/mcp-kanban-bridge typecheck` succeeds.
- `pnpm --filter @promethean-os/github-sync typecheck` succeeds.
- Node can import required subpaths and see expected symbols:
  - `node -e "import('@promethean-os/kanban/board/config').then(m=>console.log(typeof m.loadKanbanConfig))"` prints `function`.
  - `node -e "import('@promethean-os/kanban/lib/kanban').then(m=>console.log([typeof m.loadBoard, typeof m.updateStatus].join(',')))"` prints `function,function`.
- CLI `--json` output is parseable JSONL (no extraneous stdout):
  - `pnpm --filter @promethean-os/kanban exec kanban count --json | node -e "const fs=require('fs');const s=fs.readFileSync(0,'utf8').trim();for(const l of s.split('\n')) JSON.parse(l); console.log('ok')"` prints `ok`.

Guardrails:
- Do not redesign the board/task file formats unless strictly required; default to preserving current semantics.
- Do not expand scope into rewriting plugin packages (`@promethean-os/kanban-plugin-*`, `@promethean-os/kanban-transition-rules`, `@promethean-os/kanban-sdk`) except where needed to keep the exported surface working.

---

## Verification Strategy (TDD)

Testing approach:
- Use CLJS tests (shadow-cljs `:node-test` or equivalent) for core library behavior.
- Add a small set of CLI-focused smoke tests (spawn CLI in Node / verify JSONL parsing + exit codes).
- Add “import contract” tests that verify subpath exports + required function names exist.
- Keep TS dependents’ typechecks as integration gates.

Minimum test domains:
- Config resolution (argv/env/config discovery) parity with current TS behavior.
- Board parsing from markdown and fallback from tasks dirs.
- CRUD and status transitions (create/update/delete/update_status/move_up/move_down).
- Multi-root read/merge; primary-root write; cross-root update/delete; collision behavior.
- JSONL purity when `--json` is used.

---

## Execution Strategy

Wave 1 (Foundation; can start immediately):
- Package skeleton for `promethean/packages/kanban` (shadow-cljs, package.json exports, dist layout)
- Import-contract tests (Node import) driving the required JS module surface

Wave 2 (Core library; depends on Wave 1):
- Config loader + path resolution
- Board/task parsing model + read APIs

Wave 3 (Mutations + multi-root; depends on Wave 2):
- Write/update/delete operations
- Multi-root policies and collision handling

Wave 4 (CLI + UI; depends on Waves 2–3):
- CLI command wiring for full command set
- UI server replacement (or delegation) + asset path correctness

Wave 5 (Integration + cleanup; depends on all):
- TS dependents typecheck gates
- Deprecation/shim strategy for `promethean/cli/kanban`

---

## TODOs

- [ ] 1. Specify the compatibility contract as executable tests

  What to do:
  - Create Node-based tests that import:
    - `@promethean-os/kanban/board/config` and assert `loadKanbanConfig` exists.
    - `@promethean-os/kanban/lib/kanban` and assert required functions exist.
    - `@promethean-os/kanban/lib/types` and assert exported type shims exist.
  - Add CLI JSONL purity test for at least `count --json`.

  References:
  - `promethean/services/mcp-kanban-bridge/src/mcp-server.ts`
  - `promethean/services/mcp-kanban-bridge/src/simple-mcp-server.ts`
  - `promethean/packages/github-sync/src/index.ts`
  - `promethean/cli/kanban/package.json` (current `exports` map)

  Acceptance criteria:
  - Import-contract tests fail before implementation and pass after.

- [ ] 2. Create `promethean/packages/kanban` CLJS build + dist layout

  What to do:
  - Add a new package directory with:
    - shadow-cljs config that can emit Node-consumable ESM modules for library code.
    - node-script build for the CLI entrypoint.
    - output layout that supports existing subpath exports.
  - Ensure build artifacts do not require running from a specific cwd.

  Pattern references:
  - `promethean/packages/report-forge/shadow-cljs.edn` (`:target :esm`)
  - `promethean/cli/ecosystem-dsl/shadow-cljs.edn` (`:target :node-library` / `:target :node-script`)

  Acceptance criteria:
  - `pnpm --filter @promethean-os/kanban build` produces JS modules matching the planned export paths.

- [ ] 3. Implement `.d.ts` shims for TS consumers

  What to do:
  - Hand-write minimal `.d.ts` to cover:
    - `Board`, `Task`, `TaskFM` (as needed)
    - functions imported by TS dependents (see Context)
  - Keep `.d.ts` aligned with actual runtime exports (import-contract tests should catch drift).

  References:
  - `promethean/cli/kanban/src/lib/types.ts` (current TS type shapes)

  Acceptance criteria:
  - `pnpm --filter @promethean-os/mcp-kanban-bridge typecheck` passes.
  - `pnpm --filter @promethean-os/github-sync typecheck` passes.

- [ ] 4. Re-implement config loading + path resolution in CLJS

  What to do:
  - Preserve existing precedence and repo-root detection behavior.
  - Extend config schema to support multi-root (e.g., `tasksDirs`, `specDirs`) while preserving `tasksDir` for backward compatibility.

  References:
  - `promethean/cli/kanban/src/board/config/sources.ts`
  - `promethean/cli/kanban/src/board/config/merge.ts`
  - `promethean/cli/kanban/src/board/config/shared.ts`
  - `promethean/cli/kanban/promethean.kanban.json`

  Acceptance criteria:
  - Tests cover: default discovery, env override, argv override, multi-root merge, and backward compatibility.

- [ ] 5. Implement board/task read model (markdown board + task file fallback)

  What to do:
  - Parse `docs/agile/boards/generated.md` into columns + tasks when present.
  - Fall back to scanning tasks directories when board markdown has no columns.
  - Ensure each task retains a `sourcePath` (needed for multi-root update/delete correctness).

  References:
  - `promethean/cli/kanban/src/lib/board-service.ts`
  - `promethean/cli/kanban/src/lib/board-serialization.ts`
  - `promethean/cli/kanban/src/lib/task-files.ts`

  Acceptance criteria:
  - CLJS tests cover parsing edge cases (wip syntax, wiki links, uuid extraction, labels).

- [ ] 6. Implement core mutations (create/update/delete/status/move)

  What to do:
  - Implement the runtime functions imported by TS dependents:
    - `createTask`, `deleteTask`, `updateTaskDescription`, `renameTask`, `updateStatus`, `moveTask`
  - Ensure write operations:
    - Write new tasks into primary root.
    - Update/delete tasks in their originating `sourcePath`.
    - Reject UUID collisions with a clear error message listing paths.

  References:
  - `promethean/cli/kanban/src/cli/handlers/board.ts` (existing behavior)
  - `promethean/cli/kanban/src/board/event-log/*` (event logging patterns)

  Acceptance criteria:
  - CLJS tests cover write semantics across multiple roots.

- [ ] 7. Implement search + indexing JSONL outputs

  What to do:
  - Implement search behavior consistent with `search`/`indexForSearch`.
  - Preserve any JSONL file formats used by automation:
    - `docs/agile/boards/index.jsonl`-style index
    - `.kanban/scars/scars.jsonl` if heal workflow remains

  References:
  - `promethean/cli/kanban/src/board/indexer.ts`
  - `promethean/cli/kanban/src/board/types.ts`
  - `promethean/cli/kanban/src/lib/heal/scar-file-manager.ts`

  Acceptance criteria:
  - CLI JSONL mode remains parseable; index writer emits one JSON per line.

- [ ] 8. Implement CLI command wiring (full command set)

  What to do:
  - Treat `promethean/cli/kanban/src/cli/command-handlers.ts` as the authoritative command list.
  - Implement argument parsing and flags.
  - Ensure `--json` mode produces JSONL-only on stdout; route logs to stderr.

  References:
  - `promethean/cli/kanban/src/cli/command-handlers.ts`
  - `promethean/cli/kanban/src/cli/handlers/*`
  - `promethean/cli/kanban/src/lib/jsonl.ts`

  Acceptance criteria:
  - CLI smoke suite covers at least: `count`, `list`, `create`, `update`, `delete`, `update_status`, `move_up`, `move_down`, `search`, `regenerate`.

- [ ] 9. UI: make `kanban ui` work from repo root and serve correct assets

  What to do:
  - Preserve endpoints:
    - `GET /api/board`
    - `GET /api/actions`
    - `POST /api/actions`
  - Ensure asset serving matches the existing shadow build output path `packages/kanban/dist/frontend` (or update consistently).

  References:
  - `promethean/cli/kanban/src/lib/ui-server.ts`
  - `promethean/shadow-cljs.edn` (`:kanban-frontend`)

  Acceptance criteria:
  - Start server and verify endpoints with curl (agent-executable):
    - `curl -s http://127.0.0.1:<port>/api/board | node -e "JSON.parse(require('fs').readFileSync(0,'utf8')); console.log('ok')"` prints `ok`.

- [ ] 10. Integration gates: keep TS dependents green

  What to do:
  - Run typecheck in:
    - `@promethean-os/mcp-kanban-bridge`
    - `@promethean-os/github-sync`
  - Add a minimal runtime smoke check that the MCP bridge can call into the new library.

  References:
  - `promethean/services/mcp-kanban-bridge/src/mcp-server.ts`
  - `promethean/packages/github-sync/src/index.ts`

  Acceptance criteria:
  - Both package typechecks pass.

- [ ] 11. Deprecate or shim `promethean/cli/kanban`

  What to do:
  - Decide deprecation posture:
    - Either keep a short-lived shim package that forwards `bin kanban` to `@promethean-os/kanban` outputs.
    - Or remove `cli/kanban` from the workspace and update docs/scripts accordingly.
  - Update docs to point to the new canonical package location.

  References:
  - `promethean/pnpm-workspace.yaml` includes `cli/*` and `packages/*`.
  - `promethean/cli/AGENTS.md` notes what belongs under `cli/`.

  Acceptance criteria:
  - `pnpm kanban --help` works from repo root.

---

## Notes / Defaults Applied

- Multi-root: read/merge across all roots; write new tasks to the first root; update/delete by `sourcePath`; UUID collisions are hard errors.
- Preserve the current `exports` map shape for safety, even if only a subset is used today.
