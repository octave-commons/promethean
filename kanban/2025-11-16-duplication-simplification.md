---
uuid: "orgs-octave-commons-promethean-kanban-orgs-octave-commons-promethean-spec-2025-11-16-duplication-simplification-md"
title: "Simplify duplicated ECS batch helpers"
status: incoming
priority: P3
labels: ["specs", "migrated-spec"]
created_at: "2026-05-29T04:01:14.597Z"
source: "orgs/octave-commons/promethean/spec/2025-11-16-duplication-simplification.md"
category: "specs"
---

> Source: `orgs/octave-commons/promethean/spec/2025-11-16-duplication-simplification.md`
> Migrated-to-kanban: `orgs/octave-commons/promethean/kanban/2025-11-16-duplication-simplification.md`

# Simplify duplicated ECS batch helpers

## Context

- Task: reduce duplicated/obscure code while keeping behavior stable.
- Target area: ECS functional helpers with repeated batch patterns.

## Code touchpoints

- `packages/ds/src/world-functional.ts:176` `destroyEntitiesByQuery` gathers entities then destroy via command buffer.
- `packages/ds/src/world-functional.ts:192` `addComponentToEntitiesByQuery` repeats same pattern for adding components.
- `packages/ds/src/world-functional.ts:213` `removeComponentFromEntitiesByQuery` duplicates the same batching logic.

## Existing work

- No related issues/PRs spotted locally for this helper duplication.

## Requirements

- Extract shared batch logic into a reusable helper to avoid repetition.
- Preserve public API and behavior (warnings, return counts, command buffer flow).
- Keep code readable—clear naming for helper and minimal branching.
- Ensure types remain correct with current TS setup.

## Definition of done

- Three batch helpers reuse a common routine instead of ad-hoc loops.
- Behavior is unchanged (counts returned, tick/flush still invoked).
- Tests/lint in scope pass or rationale provided if not run.
- Note changes in summary with file references.
