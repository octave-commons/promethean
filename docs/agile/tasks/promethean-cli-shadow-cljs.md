# Promethean CLI shadow-cljs launcher

## Summary
- Replace legacy Sibilant-based CLI launcher with JS wrapper that loads Shadow-CLJS bundle.
- Author new ClojureScript entrypoint to discover package scripts and expose `promethean <package> <action>` commands.
- Wire up shadow-cljs build + pnpm scripts, point bin at generated node script.

## Desired Outcome
- Running `promethean <pkg> <action>` executes the matching npm script.
- CLI build artefact generated via `pnpm build`.
- Repository bin references built artefact instead of missing runtime.

## Acceptance Criteria
- `bin/promethean.js` loads compiled CLI bundle.
- CLI enumerates packages and scripts as described, with helpful usage when args missing.
- `shadow-cljs release promethean-cli` produces node-targeted output consumed by bin script.
- `pnpm build` and `pnpm --filter promethean-cli build` succeed.

## Plan
1. Add shadow-cljs config + deps for new CLI package.
2. Implement ClojureScript entry that reads monorepo package.json graph and scripts.
3. Create thin Node launcher delegating to compiled bundle.
4. Update pnpm scripts/build + root bin entry.
5. Document/testing.

## Score
- Estimated complexity: 5

## Notes
- Investigate existing tooling for package graph traversal (pnpm workspace? manual?).
- Ensure generated CLI handles missing scripts gracefully.
