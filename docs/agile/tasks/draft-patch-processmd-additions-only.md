---
uuid: "b327df6a-145e-4109-b54b-b2a7bc72422f"
title: "Draft patch — `process.md` (additions only)"
slug: "draft-patch-processmd-additions-only"
status: "incoming"
priority: "P3"
labels: ["docops", "labeled"]
created_at: "2025-10-11T03:39:14.371Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

## 🗂 Source

- Path: docs/labeled/2025.09.19.21.08.02.md

## 📝 Context Summary

perfect—process first, one step at a time. here’s **Step 1: a minimal, surgical update to `process.md`** that bakes in the cloud-agent realities phases over timeboxes, artifact-every-session, auto-split, without touching the board yet.

I’ve kept this tight and additive so we can discuss/apply safely.

# Draft patch — `process.md` (additions only)

> New subsections to append under your existing sections. They reference the current board flow and keep Kanban pure. Citations point to the exact lines in your repo that this aligns with.

### 🧑‍💻 Agent Profiles (authoritative pointers)

* **Cloud (Codex Cloud)**
  Must read build reports at `docs/reports/codex_cloud/latest/{INDEX.md,summary.tsv,eslint.json}` before acting; if `latest/` is stale/missing it knows the optional maintenance script that refreshes reports and updates `latest/`. &#x20;
  This is only a pointer; operational details stay in `docs/agents/codex-cloud.md`.

* **CLI (Codex CLI)**
  Runs with MCP servers and local FS constraints; discovers tools dynamically and adheres to strict scope limits. &#x20;

> Rationale: process stays “scripture”; agent specifics live in their specialized docs, which the system prompt will

## 📋 Tasks

- [ ] Draft actionable subtasks from the summary
- [ ] Define acceptance criteria
- [ ] Link back to related labeled docs
