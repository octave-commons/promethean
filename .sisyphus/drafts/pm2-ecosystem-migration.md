# Draft: PM2 Ecosystem DSL Migration

## Requirements (confirmed)
- Convert all existing PM2 ecosystem files to the new Clojure DSL format.
- Update documentation to reference the new PM2 CLI + DSL workflow.
- Treat prior systems (sentinel, ecosystem-dsl) as historical inputs; new format is final.
- Scope decision: migrate source-of-truth configs only; keep generated dist/aggregate outputs as build artifacts.

## Technical Decisions
- Canonical target: pm2-clj (user confirmed).
- Conversion handling: replace legacy `ecosystem.config.*` sources with `*.pm2.edn` and delete the old files.

## Research Findings
- Existing ecosystem sources and outputs:
  - `/home/err/devel/system/daemons/**/ecosystem.edn` (source-of-truth for daemon configs).
  - `/home/err/devel/system/daemons/**/dist/ecosystem.config.mjs` (generated per-daemon configs).
  - `/home/err/devel/ecosystem.config.enhanced.mjs` (aggregate generated config).
- Existing ecosystem config files in repos:
  - `/home/err/devel/ecosystem.config.mjs` (root config; referenced in docs).
  - `/home/err/devel/orgs/riatzukiza/promethean/ecosystem.config.mjs`.
  - `/home/err/devel/orgs/open-hax/openhax/ecosystem.config.cjs`.
  - `/home/err/devel/orgs/open-hax/clients/ecosystem.config.js` and `ecosystem.config.json`.
  - `/home/err/devel/orgs/riatzukiza/ollama-benchmarks/ecosystem.config.cjs` and `ecosystem.dev.config.cjs`.
  - `/home/err/devel/orgs/riatzukiza/riatzukiza.github.io/ecosystem.config.js`.
  - `/home/err/devel/orgs/octave-commons/promethean-agent-system/ecosystem.config.cjs` and `ecosystem.dev.config.cjs`.
  - `/home/err/devel/orgs/octave-commons/promethean-discord-io-bridge/ecosystem.config.cjs`, `ecosystem.dev.config.cjs`, `ecosystem.duck.config.cjs`.
  - `/home/err/devel/orgs/octave-commons/gates-of-aker/ecosystem.config.cjs`.
- Existing DSL tooling:
  - `/home/err/devel/orgs/riatzukiza/promethean/cli/ecosystem-dsl` (CLI).
  - `/home/err/devel/orgs/riatzukiza/promethean/packages/ecosystem-dsl` (generator core).
  - `/home/err/devel/pm2-clj-project` (pm2-clj wrapper + DSL files).
- Key docs that mention PM2/ecosystem usage and may need updates:
  - `/home/err/devel/system/README.md`.
  - `/home/err/devel/orgs/riatzukiza/promethean/cli/ecosystem-dsl/README.md`.
  - `/home/err/devel/orgs/open-hax/openhax/spec/pm2-ecosystem.md`.
  - `/home/err/devel/orgs/riatzukiza/ollama-benchmarks/README.md`.
  - `/home/err/devel/orgs/octave-commons/promethean/README.md`.
  - `/home/err/devel/orgs/octave-commons/promethean/docs/pm2-enhanced-usage.md`.
  - `/home/err/devel/docs/notes/2026.01.28.13.09.31.md`.
  - `/home/err/devel/docs/notes/2026.01.28.13.18.44.md`.
- Sentinel/ecosystem-dsl integration references:
  - `/home/err/devel/orgs/riatzukiza/promethean/spec/2025-11-18-ecosystem-sentinel-integration.md`.
  - `/home/err/devel/orgs/octave-commons/promethean/spec/2025-11-18-ecosystem-sentinel-integration.md`.
- Additional PM2 documentation touchpoints (update targets):
  - `/home/err/devel/spec/pm2-daemon-sync.md` (per-daemon regen + dist paths).
  - `/home/err/devel/orgs/octave-commons/promethean/docs/pm2-enhanced-usage.md` (aggregate + NX watcher usage).
  - `/home/err/devel/orgs/open-hax/openhax/spec/pm2-ecosystem.md` (pm2 start/reload usage).
  - `/home/err/devel/orgs/octave-commons/promethean/docs/notes/pm2-orchestration-patterns.md`.
  - `/home/err/devel/orgs/octave-commons/promethean/docs/notes/tooling/pm2-ecosystem-patterns.md`.
  - `/home/err/devel/spec/octavia-cli.md` (pm2 wrapper CLI usage).
  - `/home/err/devel/orgs/riatzukiza/promethean/docs/dev/packages/pm2-helpers/README.md`.
  - `/home/err/devel/orgs/riatzukiza/promethean/docs/agile/tasks/create-pm2-log-monitor-package.md`.
  - `/home/err/devel/system/README.md` (ecosystem-dsl workflow, per-daemon dist outputs).

## Test Strategy Decision
- **Infrastructure exists**: YES (Vitest at `/home/err/devel/vitest.config.ts`, tests under `/home/err/devel/tests/` via `/home/err/devel/package.json`).
- **User wants tests**: YES (TDD).
- **QA approach**: TDD with Vitest, plus pm2-clj render/validate checks.

## External Research Findings
- No existing open-source Clojure/EDN PM2 DSL bridge found.
- Relevant Clojure config DSLs that could influence design patterns:
  - Baum (EDN EDSL with env/match/import).
  - Lambda Island Config (Aero-style EDN layering).
  - Nomad (Clojure-based configuration with env switching).
- Sentinel/ecosystem-dsl background:
  - ecosystem-dsl generates per-daemon `dist/ecosystem.config.mjs` plus aggregate `ecosystem.config.enhanced.mjs` from `system/daemons/**/ecosystem.edn`.
  - Sentinel provides chokidar-based watcher spine and emits synthetic events, but has no built-in consumer to regenerate PM2 configs.

## Open Questions
- Which DSL/CLI is the new standard? (`pm2-clj` EDN/CLJ files vs `ecosystem-dsl` EDN + generator workflow).
- Scope: which repos/submodules should be migrated in this pass (all orgs/*, system/daemons only, or a curated subset)?
- Should generated `ecosystem.config.*` artifacts be removed/ignored, or remain as outputs?

## Scope Boundaries
- INCLUDE: ecosystem source files, PM2 ecosystem configs, and documentation referencing PM2 workflows.
- INCLUDE: hand-authored `ecosystem.config.*` and `ecosystem.edn` sources across repos.
- EXCLUDE: generated `dist/ecosystem.config.mjs` and `ecosystem.config.enhanced.mjs` outputs (regenerated post-migration).
- EXCLUDE: unrelated “sentinel” mentions not tied to PM2 ecosystem flows (e.g., Redis sentinel).
