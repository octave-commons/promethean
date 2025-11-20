# TSC Build Failures – Workspace Module Resolution

## Problem Statement

`pnpm build` currently fails for multiple packages (embedding, security, docops, file-watcher, cephalon, examples, http, pantheon-state, codepack, piper, symdocs, plugin-hooks, opencode-unified, discord) because the TypeScript compiler cannot resolve workspace imports such as `@promethean-os/platform`, `@promethean-os/file-indexer`, and `@promethean-os/test-utils`. The repo recently switched package scopes from `@promethean/*` to `@promethean-os/*`, but the shared compiler configuration still only exposes the old aliases. TypeScript therefore cannot map the scoped imports back to the local packages, producing TS2307 errors as soon as any package references another workspace package.

## Code References

- `config/tsconfig.base.json:34-41` – shared compiler options with obsolete `paths` map for the `@promethean/*` namespace only.
- `packages/embedding/tsconfig.json:2-29` – example package tsconfig that still hardcodes the deprecated `@promethean/*` aliases.
- `packages/security/src/index.ts:1-40` and other dependants – affected modules importing `@promethean-os/*` symbols which currently fail to resolve.

## Existing Issues / PRs

- No open GitHub issues or PRs currently track this namespace mismatch (checked via `gh issue list` and `gh pr list`).

## Requirements / Definition of Done

1. Extend the shared TypeScript configuration so that the compiler resolves the `@promethean-os/*` namespace (including nested subpaths like `/dist/...`) to the corresponding workspace packages under `packages/**`.
2. Remove or update package-level `paths` overrides that still reference the deprecated `@promethean/*` namespace to avoid regressions.
3. Re-run `pnpm --filter` builds for the previously failing packages (at least one representative from pipelines/docops plus a service package) to confirm that TS2307 errors disappear and no new diagnostics are introduced.
4. Document the change in this spec file’s changelog (or commit message) so future contributors know why the aliases were updated.
