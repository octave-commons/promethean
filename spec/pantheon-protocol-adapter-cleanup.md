# Pantheon Protocol Adapter Cleanup

## Context

The `@promethean-os/pantheon-protocol` package fails strict TypeScript compilation because `packages/pantheon/protocol/src/adapters/protocol-adapter.ts` contains unused imports/fields and parameters typed as implicit `any`. Diagnostics cite the following hot spots:

- Line 8: `z` imported but never used.
- Line 66: `crisisHandlers` map declared but unused.
- Line 107/211: `identifyAffectedAgents` receives `payload` argument that is unused and typed `any`.
- Line 350: `distributeWorkload` accepts `tasks: any[]`.
- Lines 454, 481, 643: helper methods consume `any` tasks.
- Lines 562, 593: `qos` coerced via `2 as any` instead of `QoSLevel` enum.

## Files & Line References

- `packages/pantheon/protocol/src/adapters/protocol-adapter.ts:8-10` – remove unused `z` import.
- `packages/pantheon/protocol/src/adapters/protocol-adapter.ts:65-113` – drop unused `crisisHandlers` map, ensure `identifyAffectedAgents` signature matches usage.
- `packages/pantheon/protocol/src/adapters/protocol-adapter.ts:350-485` – introduce typed `CrisisTask` model for workload distribution helpers.
- `packages/pantheon/protocol/src/adapters/protocol-adapter.ts:559-599` – use `QoSLevel.EXACTLY_ONCE` instead of casting literals to `any`.
- `packages/pantheon/protocol/src/adapters/protocol-adapter.ts:633-645` – type `estimateTaskLoad` input.

## Existing Issues / PRs

- No existing issues reference this adapter cleanup as of `gh issue list --limit 5` (2025-10-09).
- `gh pr list --limit 5` returned no relevant open pull requests.

## Requirements

1. Remove unused imports and class members flagged by the compiler.
2. Replace `any`/implicit `any` task and payload fields with explicit interfaces.
3. Ensure QoS uses `QoSLevel` enum, not `as any` casts.
4. Preserve runtime behavior while satisfying strict TypeScript settings.

## Definition of Done

- `pnpm --filter @promethean-os/pantheon-protocol typecheck` succeeds locally.
- No `tsc` warnings about unused imports/variables or implicit `any` remain in `protocol-adapter.ts`.
- Changes documented in this spec are implemented with tests/code samples updated as necessary.
