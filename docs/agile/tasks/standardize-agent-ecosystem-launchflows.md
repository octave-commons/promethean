---
uuid: ab4b2c51-91e6-4880-9390-30609209389c
title: standardize agent ecosystem launch flows
status: document
priority: P2
labels: ['agents', 'devx', 'duck']
created_at: '2025-10-07T06:39:18.599Z'
---
Background: Contributors still rely on outdated Makefile targets to launch agents. The backlog calls for PM2 (or an alternative) baselines, reusable ecosystem declarations (starting with Duck), and documentation that ties `pnpm --filter` scripts to real-world dev flows.

Goal: Ship a consistent launch workflow so every agent (Duck, Cephalon, Discord forwarders, etc.) advertises the same process metadata, tooling, and documentation.

Scope:
- Decide on a process manager baseline (PM2 or replacement), produce canonical ecosystem config examples, and codify them under `scripts/` or a new shared package.
- Inventories each agent package's `dev`/`start` scripts, aligning them with `pnpm --filter` workflows and ensuring docs reference the correct commands.
- Generate or update `AGENTS.md` stubs (potentially via automation) so every service inherits the same launch section, environment variable expectations, and health checks.
- Document the combined workflow in `docs/agents/` including quickstart tables for Duck, ENSO gateway, Cephalon, and supporting tooling.

Out of Scope:
- Refactoring agent business logic unrelated to launch orchestration.
- Building CI deployment pipelines (focus is on developer ergonomics and local ops).

Exit Criteria:
- A shared process manager configuration (or equivalent) exists with working examples for Duck and at least one additional agent.
- Agent package scripts (`pnpm --filter ...`) are verified and documented; stale Makefile references are removed or updated.
- `AGENTS.md` files across agent services share the standardized launch template.
- Docs include an end-to-end launch guide linking to ecosystem declarations and troubleshooting tips.
