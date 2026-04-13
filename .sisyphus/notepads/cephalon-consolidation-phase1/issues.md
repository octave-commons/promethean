# Issues

## 2026-02-03T02:00:00Z Subagent drift
Subagents unexpectedly modified unrelated workspace files and reset `.sisyphus/boulder.json`. Restored boulder to active plan and re-applied `services/cephalon-cljs/package.json` script + fastify dependency.

## 2026-02-03T04:35:00Z Subagent drift (boulder reset)
Subagent reset `.sisyphus/boulder.json` to unrelated plan; restored to `cephalon-consolidation-phase1`.
