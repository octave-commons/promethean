---
```
uuid: 83ec632a-3d28-440f-adb7-76496a95edd2
```
```
created_at: '2025-10-06T15:01:27Z'
```
title: 2025.10.06.15.01.27
```
filename: kanban-prioritize-subcommands
```
```
description: >-
```
  New subcommands for kanban task prioritization: sample, pairwise, choose,
  rank, shortlist, explain, cluster, score, and compare. Each command provides
  specific functionality for filtering, comparing, ranking, and clustering tasks
  with optional parameters and CLI flags.
tags:
  - kanban
  - prioritize
  - subcommands
  - CLI
  - task
  - filtering
  - ranking
  - clustering
  - score
  - explain
```
related_to_uuid: []
```
```
related_to_title: []
```
references: []
status: todo
priority: P3
labels: []
---
# New subcommands (added; keep your existing ones)

* `sample` — randomly (optionally weighted) pick a bite-sized set that matches a filter.
* `pairwise` — present A/B (or tie) pairs from a pool (stdin or filter); picks the next most informative pair.
* `choose` — record a comparison (`left`, `right`, `winner`) into a session cache.
* `rank` — compute a global ordering from comparisons Bradley–Terry/Elo + priors.
* `shortlist` — one-shot: filter → sample → (optional) auto warmup → rank → top-K.
* `explain` — attach compact rationales heuristic, theme-aware.
* `cluster` — reduce overwhelm by grouping labels/title; embeddings later.
* `score` — deterministic stateless scoring for CI/batch.
* `compare` — focal task vs sampled peers.

All new commands emit a single “agent coaching line” to `stderr` unless `--quiet` is set.

---

# CLI usage (additive)

```
pnpm kanban sample -f "status in (Todo,Doing) and priority>=2" -n 7 --seed 42
pnpm kanban pairwise --session today --k 1 < tasks.jsonl
pnpm kanban choose --session today --left <uuidA> --right <uuidB> --winner A
pnpm kanban rank --session today --top 5
pnpm kanban shortlist -f "status=Todo" -n 12 --warmup 20 --top 6
pnpm kanban cluster -f "status=Todo" --by labels --limit 8
pnpm kanban score -f "status=Todo" --expr "priority*2 - ageDays/7"
pnpm kanban compare --uuid <taskA> --against "status=Todo and labels in (agent,infra)" --n 6
pnpm kanban explain --why "unblocks_pipeline" < tasks.jsonl
```

Shared flags (consistent across new cmds):
`--kanban <path>` `--tasks <path>` `--format jsonl|table` `--seed <int>` `--quiet` `--no-color`

---

# Files to add (suggested)

```
packages/kanban/
  src/cmds/prioritize/               # all new stuff lives here
    sample.ts
    pairwise.ts
    choose.ts
    rank.ts
    shortlist.ts
    explain.ts
    cluster.ts
    score.ts
    compare.ts
  src/lib/prioritize/
    filters.ts         # small filter DSL -> predicate
    io.ts              # JSONL helpers, task loading, board parsing (reuse your readers)
    log.ts             # agent coaching line to stderr
    rng.ts             # seedable RNG
    sample.ts          # reservoir + diversity
    pair_model.ts      # Bradley–Terry/Elo & uncertainty
    score_expr.ts      # tiny safe scorer (expr -> function)
    groups.ts          # label/title clustering
    types.ts           # Task, Pair, RankRow, etc.
```

> Minimal integration: add a single loader that auto-registers any `src/cmds/prioritize/*.ts` command. If your `bin/kanban.ts` already dispatches subcommands, you can import a `registerPrioritizers(cli)` from a **new** `src/cmds/prioritize/index.ts` to avoid editing multiple places.

---
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- _None_
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->

