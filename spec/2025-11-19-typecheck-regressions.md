# 2025-11-19 Typecheck Regressions

## Context

- Pre-push hook (`pnpm nx affected -t typecheck`) fails for:
  1. `@promethean-os/compiler` – `cli/compiler/src/lisp/js-ast2lisp.ts:91-185` calls `expr(...)` with `PrivateIdentifier` nodes which are not part of `EST.Expression`.
  2. `@promethean-os/discord` – `packages/discord/src/index.ts:1-8` re-exports `./gateway/gateway.js` and `./rest/rest.js`, but their source files are missing. Tests at `packages/discord/src/tests/{gateway.test.ts,flow.test.ts}` import `@promethean-os/event/memory.js`, a package that no longer exists.
  3. `pipelines/readmeflow/src/02-outline.ts:1-115` still imports a deleted `pantheon/llm-openai` build output, forcing `makeOpenAIAdapter` to be `any`.
  4. `services/mcp-kanban-bridge/src/{mcp-server.ts,simple-mcp-server.ts}` and `packages/github-sync/src/index.ts` import from `@promethean-os/kanban` root even though that package only exports subpaths such as `./lib/kanban.js` and `./board/config.js`; TypeScript cannot resolve the root entry any longer.

## Existing Issues / PRs

- None referenced in repo docs or issues. Failure surfaced via the user's `git push` output.

## Definition of Done

1. `cli/compiler` handles `PrivateIdentifier` nodes without widening types unsafely (typecheck passes for `@promethean-os/compiler`).
2. `packages/discord` once again ships working `gateway` and `rest` source files plus local test helpers so typechecking and tests do not depend on missing packages.
3. `pipelines/readmeflow` imports `makeOpenAIAdapter` from the current Pantheon workspace export so typing information flows through and the implicit `any` warning disappears.
4. `services/mcp-kanban-bridge` and `packages/github-sync` import from supported `@promethean-os/kanban/*` subpaths so TypeScript can find the module declarations.
5. Targeted package typechecks pass (`pnpm nx run @promethean-os/<pkg>:typecheck`), and updated tests (if any) pass.

## Requirements & Notes

- Maintain existing functional behaviour for compiler AST conversion, Discord gateway publishing, and REST rate limiting. Reuse the logic visible in `packages/discord/dist/{gateway,rest}` while converting to typed TypeScript (include a local `TokenBucket` implementation since `@promethean-os/monitoring` no longer exists).
- Provide a lightweight in-memory bus implementation for Discord tests to remove the dependency on `@promethean-os/event`.
- Update `pipelines/readmeflow` to rely on Pantheon’s published TypeScript entry point. Keep CLI behaviour unchanged and prefer typed adapters to remove `any` leakage.
- Update Kanban imports to subpath exports: functions live under `@promethean-os/kanban/lib/kanban.js`, config helpers under `@promethean-os/kanban/board/config.js`, and types under `@promethean-os/kanban/lib/types.js`.
- Keep new code ASCII-only; add succinct comments only when logic is non-obvious (e.g., describing the simplified token bucket behaviour).
