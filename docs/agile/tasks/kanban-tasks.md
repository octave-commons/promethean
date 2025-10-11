---
uuid: "379c1028-3b05-4984-8414-42cab3634054"
title: "Kanban CLI Tasks Docs/Agile"
slug: "kanban-tasks"
status: "accepted"
priority: "P3"
labels: ["cli", "docs", "kanban", "tasks"]
created_at: "2025-10-11T03:39:14.373Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

# Kanban CLI Tasks Docs/Agile

New subcommands (added; keep your existing ones)

- sample
- pairwise
- choose
- rank
- shortlist
- explain
- cluster
- score
- compare

All new commands emit a single “agent coaching line” to stderr unless `--quiet` is set.

---

## sample

- Purpose: randomly (optionally weighted) pick a bite-sized set that matches a filter.
- CLI usage (example):
  - pnpm kanban sample -f "status in (Todo,Doing) and priority>=2" -n 7 --seed 42
- Arguments:
  - -f / --filter: filter expression
  - -n: number of tasks to pick
  - --seed: RNG seed
  - --format: jsonl|table (default)
- Output: JSONL of Task objects to stdout.
- Coaching: AGENT line emitted to stderr unless --quiet.
  - Example: AGENT: You have a bite-sized set. Next run `kanban pairwise --session <name>` to compare two at a time.

---

## pairwise

- Purpose: present A/B (or tie) pairs from a pool (stdin or filter); picks the next most informative pair.
- CLI usage (example):
  - pnpm kanban pairwise --session today --k 1 < tasks.jsonl
- Arguments:
  - --session: session name for pairwise cache
  - -k: number of pairs to generate
  - -f / --filter: optional filter
  - --lang: dsl/js/cljs predicate language for filtering
- Output: JSONL of pair objects to stdout.
- Coaching: AGENT: Choose A, B, or tie via `kanban choose --session ... --left <uuidA> --right <uuidB> --winner A|B|tie`.

---

## choose

- Purpose: record a comparison (`left`, `right`, `winner`) into a session cache.
- CLI usage (example):
  - pnpm kanban choose --session today --left <uuidA> --right <uuidB> --winner A
- Arguments:
  - --session
  - --left
  - --right
  - --winner: A|B|tie
- Output: a JSON line representing the recorded choice.
- Coaching: AGENT: Choices stored; run `kanban rank --session today` to compute a ranking.

---

## rank

- Purpose: compute a global ordering from comparisons Bradley–Terry/Elo + priors.
- CLI usage (example):
  - pnpm kanban rank --session today --top 5
- Arguments:
  - --session
  - --top
- Output: JSONL with Task rows annotated by score/rank.
- Coaching: AGENT: Ranking computed; top-X ready for review.

---

## shortlist

- Purpose: one-shot: filter → sample → (optional) auto warmup → rank → top-K.
- CLI usage (example):
  - pnpm kanban shortlist -f "status=Todo" -n 12 --warmup 20 --top 6
- Arguments:
  - -f / --filter
  - -n
  - --warmup
  - --top
  - --lang dsl/js/cljs
- Output: JSONL consisting of the top-K results after processing.
- Coaching: AGENT: Shortlist ready; use `kanban rank` to inspect top results.

---

## explain

- Purpose: attach compact rationales heuristic, theme-aware.
- CLI usage (example):
  - pnpm kanban explain --why "unblocks_pipeline" < tasks.jsonl
- Arguments:
  - --why
  - (stdin tasks)
- Output: JSONL augmented with explain field.
- Coaching: AGENT: Explanations attached to results.

---

## cluster

- Purpose: reduce overwhelm by grouping labels/title; embeddings later.
- CLI usage (example):
  - pnpm kanban cluster -f "status=Todo" --by labels --limit 8
- Arguments:
  - -f / --filter
  - --by
  - --limit
- Output: JSONL with clusters and representative tasks.
- Coaching: AGENT: Clustering produced; review clusters for triage.

---

## score

- Purpose: deterministic stateless scoring for CI/batch.
- CLI usage (example):
  - pnpm kanban score -f "status=Todo" --expr "priority*2 - ageDays/7"
- Arguments:
  - -f / --filter
  - --expr
- Output: JSONL with scores per task.
- Coaching: AGENT: Scores computed for CI validation.

---

## compare

- Purpose: focal task vs sampled peers.
- CLI usage (example):
  - pnpm kanban compare --uuid <taskA> --against "status=Todo and labels in (agent,infra)" --n 6
- Arguments:
  - --uuid
  - --against
  - -n
- Output: JSONL with comparison plan.
- Coaching: AGENT: Comparison ready; proceed with selection or ranking.

---

## Shared flags (consistent across new cmds)

- --kanban <path> 
- --tasks <path> 
- --format jsonl|table
- --seed <int>
- --quiet
- --no-color

---

## Minimal integration note

Minimal integration: add a single loader that auto-registers any `src/cmds/prioritize/*.ts` command. If your bin/kanban.ts already dispatches subcommands, you can import a registerPrioritizers(cli) from a new `src/cmds/prioritize/index.ts` to avoid editing multiple places.
