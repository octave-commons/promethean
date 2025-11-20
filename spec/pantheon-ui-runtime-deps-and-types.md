# Pantheon UI Runtime & Typing Fixes

## Context

- Affected package: `packages/pantheon/ui`
- Source files:
  - `packages/pantheon/ui/package.json:15-25` – dependency list missing runtime imports (`lit`, `luxon`, `rxjs`, `@promethean-os/ui-components`).
  - `packages/pantheon/ui/tsconfig.json:1-12` – compiler `lib` option does not include DOM APIs, so `dispatchEvent` and CustomEvent typings are absent.
  - `packages/pantheon/ui/src/utils/state-manager.ts:5-125` – observable pipelines use parameters without explicit types, triggering `noImplicitAny` warnings under `strict` mode.
- Related artifacts: none found in `git log -5 --oneline` (latest commits unrelated).
- Open issues / PRs: none referenced in prompt or repo metadata for these files.

## Requirements

1. Declare every runtime dependency used by `src/components/*.ts` and `src/utils/state-manager.ts` inside `packages/pantheon/ui/package.json`.
2. Ensure the package TypeScript config includes the DOM libs required for Lit components dispatching events.
3. Remove implicit `any` values in observable streams inside `state-manager.ts` by explicitly typing parameters or helper signatures without weakening existing type safety.

## Definition of Done

- `pnpm --filter @promethean-os/pantheon-ui build` succeeds locally.
- `tsc --project packages/pantheon/ui/tsconfig.json --noEmit` reports no implicit `any` errors from `state-manager.ts`.
- Lit components compile cleanly with DOM typings available (verified by presence of `lib` entries and lack of `dispatchEvent` errors).
- Dependencies for `lit`, `lit/decorators.js`, `luxon`, `rxjs`, and `@promethean-os/ui-components` resolve from `package.json`.
- Spec updated with any additional discoveries if scope changes.

## Notes

- Prefer minimal surface changes focused on Pantheon UI package.
- Keep new dependencies aligned with versions used elsewhere in the monorepo (check for existing lockfile entries before pinning new versions).
