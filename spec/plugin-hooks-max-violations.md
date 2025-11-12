# Spec: Ensure `maxViolations` is never undefined in security manager

## Context

- `packages/plugin-hooks/src/security/security-manager.ts:278-284` declares `maxViolations` using optional config and triggers TS18048 when comparing against `safeViolations.length`.
- Build logs show the error originates during `pnpm --filter @promethean-os/plugin-hooks build`.

## Existing Issues / PRs

- No Kanban issues mention `plugin-hooks` security limits per latest `gh issue list --limit 5` (IDs 1668-1673 unrelated).
- `gh pr list --limit 5` returned no open PRs touching this area.

## Requirements

1. Guarantee `maxViolations` resolves to a concrete `number` before comparisons, even when config omits the field.
2. Maintain current default of 10 violations per plugin unless explicitly overridden, preserving zero as an allowed override.
3. Keep `handleViolation` logic and public API unchanged aside from the safety fix; add comments only if necessary for clarity.

## Definition of Done

- `pnpm --filter @promethean-os/plugin-hooks build` completes without TS18048.
- Any affected downstream builds (e.g., `@promethean-os/frontend`) no longer fail on this TypeScript error.
- No regressions introduced in security policy handling (spot-check via existing unit coverage if available).
