# Pantheon MCP TSC Build Fix

## Context

- `pnpm --filter @promethean-os/pantheon-mcp build` currently fails because `tsc` reports `TS6133` for the unused `defaultHandler` in `packages/pantheon/mcp/src/index.ts:62-76`.
- `noUnusedLocals` is enforced in this package, so any placeholder definitions must be used or removed.

## Files / References

- packages/pantheon/mcp/src/index.ts:62-76 — `register` declares `defaultHandler` without ever referencing it.

## Existing Issues

- No related GitHub issues found via `gh issue list --search "pantheon-mcp" --limit 5` (2025-11-10).

## Existing PRs

- No related GitHub pull requests found via `gh pr list --search "pantheon-mcp" --limit 5` (2025-11-10).

## Requirements

1. Keep a sensible default execution path for tools registered without a handler instead of dead code.
2. Ensure TypeScript `noUnusedLocals` passes by wiring the default handler (or removing it if it is unnecessary).
3. Maintain backward compatibility for callers expecting `register` to accept a handler on the spec object.

## Definition of Done

- `pnpm --filter @promethean-os/pantheon-mcp build` succeeds locally without TypeScript warnings.
- Default handler logic is covered either by usage or by clearly documented intentional removal.
- The change includes any minimal commentary necessary so future changes know why the fallback handler exists.

## Notes

- Consider adding targeted unit coverage later, but not required for this unblocking fix.
