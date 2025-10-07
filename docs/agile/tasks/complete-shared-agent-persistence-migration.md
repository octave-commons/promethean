---
uuid: 1325fde4-1aab-485d-aca6-53f180883740
title: complete shared agent persistence migration
status: todo
priority: P1
labels: ['agents', 'persistence']
created_at: '2025-10-07T06:39:18.599Z'
---
Background: The backlog still calls for a `shared/ts/persistence` module, but services continue to maintain bespoke Mongo/Chroma clients. Without a shared DualStore/ContextStore implementation, agent state handling diverges, legacy code lingers, and new services cannot rely on a tested persistence baseline.

Goal: Deliver the shared persistence module, migrate agent services onto it, and retire the old ad-hoc stores with confidence.

Scope:
- Stand up `shared/ts/persistence` with DualStore/ContextStore ports, adapters, and AVA coverage (unit + integration fakes).
- Update each agent service to depend on the shared module, removing local persistence wrappers and wiring migrations where data moves.
- Refresh service-level `AGENTS.md` docs to point at the shared module and outline usage patterns.
- Provide a rollout checklist documenting migration order, verification steps, and fallback procedures.

Out of Scope:
- Introducing new storage backends beyond the supported MongoDB/LevelDB pairing.
- Reworking unrelated agent capabilities (e.g., ECS loops) except for necessary persistence wiring adjustments.

Exit Criteria:
- `shared/ts/persistence` builds and ships with passing tests and published docs.
- All agent services compile against the shared module without referencing legacy persistence files.
- Legacy persistence directories are removed or archived with deprecation notes.
- Rollout documentation and changelog entries reflect the migration completion and highlight any service-specific nuances.
