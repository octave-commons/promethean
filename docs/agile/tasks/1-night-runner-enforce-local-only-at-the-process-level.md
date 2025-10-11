---
uuid: "274b4ca1-8bef-47da-8dce-bab507d544c0"
title: "1) Night runner: enforce “local-only” at the process level"
slug: "1-night-runner-enforce-local-only-at-the-process-level"
status: "icebox"
priority: "P3"
labels: ["docops", "labeled"]
created_at: "2025-10-11T01:03:32.219Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---


























## 🗂 Source

- Path: docs/labeled/2025.10.07.00.34.06.md

## 📝 Context Summary

got it. let’s lock this in and make it buildable. below is **Pantheon — primer, part 3**: concrete shapes (TS-first), the deterministic tool loop, training data formats, and the math you’ll actually use to size night runs. zero auto cloud fallback; night runner has **no egress** and only **local** runtimes.

---

# 1) Night runner: enforce “local-only” at the process level

**Why:** your guarantee isn’t policy text—it’s enforced by runtime + network. Keep the runner user behind an egress-deny firewall at night so even a rogue tool can’t “accidentally” call out.

---

# 2) Deterministic Tool Loop (DFA) — small models + strict schemas

This is the “boring core” that wins: JSON-schema validation, finite steps, bounded retries, and **no free-text side-effects**. Qwen’s function-calling docs and Qwen-Agent show the precise prompt/templating nudges that keep calls on-schema; mirror that style. ([Qwen][1])

> Local engines: **vLLM** (continuous batching + PagedAttention) for throughput on GPU; **OpenVINO** variants for CPU/iGPU. Both are well-documented and practical. ([docs.vllm.ai][2])

---

# 3) Thick prompt template for tool use (Qwen-style)

The Qwen function-calling guides emphasize

## 📋 Tasks

- [ ] Draft actionable subtasks from the summary
- [ ] Define acceptance criteria
- [ ] Link back to related labeled docs

























