# Tooloxx MCP monorepo migration

## Goal
Consolidate the workspace-owned MCP packages and services under `orgs/open-hax/tooloxx` so MCP infrastructure has one canonical monorepo home.

## Canonical layout
- `orgs/open-hax/tooloxx/packages/*` — shared MCP libraries and package-style tools
- `orgs/open-hax/tooloxx/services/*` — runnable MCP servers and HTTP services

## Phase 1 scope
Move these canonical paths into `tooloxx`:

### packages
- `packages/mcp-foundation`
- `packages/mcp-oauth`
- `packages/chat-bridge-mcp`
- `reconstitute-mcp`

### services
- `orgs/open-hax/mcp-fs-oauth`
- `orgs/riatzukiza/mcp-devtools`
- `orgs/riatzukiza/mcp-exec`
- `orgs/riatzukiza/mcp-github`
- `orgs/riatzukiza/mcp-ollama`
- `orgs/riatzukiza/mcp-process`
- `orgs/riatzukiza/mcp-sandboxes`
- `orgs/riatzukiza/mcp-social-publisher`
- `orgs/riatzukiza/mcp-tdd`
- `orgs/riatzukiza/hormuz-clock-mcp`
- `orgs/riatzukiza/threat-radar-mcp`
- `orgs/octave-commons/fork_tales/mcp-lith-nexus`

## Deferred edge cases
- `mcp-social-publisher-live` — duplicate/live scratch tree, not treated as the canonical package home in this pass.

## Required follow-through
- Add `tooloxx` workspace roots to the root `pnpm-workspace.yaml`.
- Update runtime scripts/configs that hard-code the old MCP paths.
- Update fork-tales `part64` runtime wiring so it loads `mcp-lith-nexus` from `tooloxx`.
- Refresh the root lockfile after the workspace move.

## Active rewires completed
- Root workspace package discovery now includes `orgs/open-hax/tooloxx/packages/*` and `orgs/open-hax/tooloxx/services/*`.
- `services/mcp-stack/*` now points at `tooloxx` package/service paths.
- `services/radar-stack/Dockerfile.hormuz-clock-mcp` now builds Hormuz from `orgs/open-hax/tooloxx/services/hormuz-clock-mcp` and `orgs/open-hax/tooloxx/packages/mcp-oauth`.
- `services/radar-stack/Dockerfile.threat-radar-mcp` now sources `mcp-foundation` and `threat-radar-mcp` from `tooloxx` via an additional Docker build context.
- `services/radar-stack/docker-compose.yml` now runs Hormuz from the `tooloxx` path and passes the extra build context needed for `threat-radar-mcp`.
- Fork Tales `part64` runtime/build wiring now loads `mcp-lith-nexus` from `orgs/open-hax/tooloxx/services/mcp-lith-nexus`.

## Historical references intentionally left alone for now
- `spec/migrations/mcp-servers-epic.md`
- `spec/services-code-migration-epic.md`
- `orgs/octave-commons/fork_tales/docs/SCATTERED_TASKS_INVENTORY.md`
- `orgs/octave-commons/fork_tales/specs/drafts/mcp-lith-nexus.md`

These are history/spec/report surfaces rather than active runtime wiring.

## Verification
- Root workspace still resolves moved packages via `pnpm --filter ...`.
- MCP stack scripts point at `tooloxx` service paths.
- Fork Tales `part64` still resolves and builds `mcp-lith-nexus` from its new canonical location.
- `@riatzukiza/hormuz-clock-mcp` still builds and typechecks from its new `tooloxx` home.
