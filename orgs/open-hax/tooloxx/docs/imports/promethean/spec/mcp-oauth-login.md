# MCP OAuth Login Flow Investigation

## Summary

- Goal: complete the Model Context Protocol (MCP) OAuth login flow via the dev server started with `pnpm --filter @promethean/mcp dev` and surface any blockers.
- Context: PM2 process `mcp-dev` was launched by the user (see session log). We must use Chrome DevTools automations to exercise the UI and gather evidence of a successful login or pinpoint the failure point.

## Relevant Code & References

- `packages/mcp/package.json:30-39` — exposes the `dev` script (`tsx src/index.ts`) that PM2 is already running.
- `packages/mcp-dev-ui-frontend/package.json:7-15` — indicates the frontend is served by `shadow-cljs watch dev-ui`; expect assets to be hosted via the backend dev server.
- `packages/clj-hacks/src/clj_hacks/mcp/adapter_codex_toml.clj:269` — documents stdio command `pnpm --filter @promethean/mcp dev`, confirming we are targeting the same entry point.
- Docs: [[docs/agile/kanban-cli-reference.md]] for kanban process alignment (no specific OAuth doc located yet).

## Existing Issues / PRs

- None identified related to MCP OAuth login during initial search (ran `rg "@promethean/mcp"`).

## Requirements

1. Reach the MCP dev UI in the browser via Chrome DevTools session.
2. Trigger the OAuth login flow (likely Auth0/Okta style) and follow redirects until success or a clear blocking error.
3. Capture console/network insights to explain success/failure.
4. Summarize reproduction steps and outcomes for future debugging.

## Definition of Done

- Browser session demonstrates a completed OAuth login (dashboard visible) **or** provides actionable failure details (HTTP status, error payload, stack trace) plus proposed next steps.
- Observations recorded in final response referencing relevant files/lines.
- Todo list updated with final status.
- No code changes required unless blockers demand it.

## Open Questions

- What port/URL does `@promethean/mcp dev` expose for the OAuth UI?
- Which identity provider is configured (Auth0 vs. internal mock)?
- Are credentials available or is a mock login expected?
