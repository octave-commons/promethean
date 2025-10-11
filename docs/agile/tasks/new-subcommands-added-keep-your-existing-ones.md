---
uuid: "e5a58731-d1c3-4445-9e45-e2b87e996e2e"
title: "New subcommands (added; keep your existing ones)"
slug: "new-subcommands-added-keep-your-existing-ones"
status: "incoming"
priority: "P3"
labels: ["docops", "labeled"]
created_at: "2025-10-11T01:03:32.221Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---


























## 🗂 Source

- Path: docs/labeled/2025.10.06.15.01.27.md

## 📝 Context Summary

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

Shared flags (consistent across new cmds):
`--kanban <path>` `--tasks <path>` `--format jsonl|table` `--seed <int>` `--quiet` `--no-color`

---

# Files to add (suggested)

> Minimal integration: add a single loader that auto-registers any `src/cmds/prioritize/*.ts` command. If your `bin/kanban.ts` already dispatches subcommands, you can

## 📋 Tasks

- [ ] Draft actionable subtasks from the summary
- [ ] Define acceptance criteria
- [ ] Link back to related labeled docs

























