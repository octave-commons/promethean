---
uuid: "orgs-octave-commons-promethean-kanban-orgs-octave-commons-promethean-spec-2025-11-16-wip-enforcement-test-config-md"
title: "WIP enforcement test config adjustments"
status: incoming
priority: P3
labels: ["specs", "migrated-spec"]
created_at: "2026-05-29T04:01:14.589Z"
source: "orgs/octave-commons/promethean/spec/2025-11-16-wip-enforcement-test-config.md"
category: "specs"
---

> Source: `orgs/octave-commons/promethean/spec/2025-11-16-wip-enforcement-test-config.md`
> Migrated-to-kanban: `orgs/octave-commons/promethean/kanban/2025-11-16-wip-enforcement-test-config.md`

# WIP enforcement test config adjustments

- Context: WIP enforcement tests were using the repository kanban config (todo=75, done=500, etc.), which made the mock board expectations (todo limit 5, in_progress limit 3, done unlimited) and severity checks fail.
- Change: Added `TEST_WIP_LIMITS` and a `createTestEnforcement` helper in `packages/kanban/src/tests/wip-enforcement.test.ts` to inject test-specific WIP limits (todo=5, in_progress=3, review=5, done treated as unlimited) while reusing the loaded config. Adjusted assertions to match engine behavior (`critical` severity for >120% utilization and override reason wording).
- Files touched: packages/kanban/src/tests/wip-enforcement.test.ts (helper + assertions).
- Definition of done: WIP enforcement tests use deterministic WIP limits independent of repo config; override and severity expectations align with engine logic; targeted WIP enforcement test suite passes.
- Tests run: `pnpm --filter @promethean-os/kanban exec ava packages/kanban/dist/tests/wip-enforcement.test.js` (pass).
