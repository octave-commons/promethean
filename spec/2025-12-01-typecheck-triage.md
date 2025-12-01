# Typecheck triage 2025-12-01

## Context

- Pre-push hook runs `pnpm nx affected -t typecheck --base 725fbec8617ad58fd8bb42b2fe95b5cc0b9243a3 --head HEAD` and failed on three projects.

Related: [[docs/AGENTS]] • [[packages/pantheon/README]]

## Files / lines to touch

- `experimental/pantheon/src/cli/index.ts:395` – unused `@ts-expect-error` in REPL command import.
- `cli/kanban/packages/kanban-plugin-git-index/tests/*.ts` – missing module resolutions for `../lib/**` and implicit `any` parameters.
- `experimental/docs-system/src/server/index.ts:11-12` – imports `swagger-jsdoc` and `swagger-ui-express` without declared deps.

## Known issues / PRs

- No related open issues or PRs found locally.

## Definition of done

- `pnpm nx affected -t typecheck --base 725fbec8617ad58fd8bb42b2fe95b5cc0b9243a3 --head HEAD` succeeds without errors or new warnings.
- No new lint/type errors introduced.
- Changes remain scoped to Pantheon CLI, kanban-plugin-git-index tests, and docs-system server deps.

## Plan (phased)

1. Pantheon CLI: remove unused `@ts-expect-error` in REPL command import and ensure dynamic import remains intact.
2. Kanban plugin tests: add ambient module declarations for `../lib/**` and `../test-utils/helpers.js`; annotate callbacks to avoid implicit `any`.
3. Docs-system: declare missing swagger dependencies (runtime + types) in `package.json` to satisfy typechecker.
4. Verify by rerunning the affected typecheck command for these projects (or full nx affected target) and confirm clean output.
