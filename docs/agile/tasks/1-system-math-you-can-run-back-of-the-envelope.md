---
uuid: "f2fa76f0-75b9-4498-aa68-c39e591e8abc"
title: "1) System math you can run back-of-the-envelope"
slug: "1-system-math-you-can-run-back-of-the-envelope"
status: "icebox"
priority: "P3"
labels: ["docops", "labeled"]
created_at: "2025-10-11T19:22:57.815Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---




## 🗂 Source

- Path: docs/labeled/2025.10.07.00.32.21.md

## 📝 Context Summary

hell yeah — you’re on the right bet: narrow tasks + heavy tool use + batching + patience. here’s the **Pantheon primer — part 2** with sharper diagrams, math you can actually use to size the system, and repo-ready shapes for flows, traces, training, and review. it keeps your hard rule: **night runs are local-only; there is never cloud fallback.**

---

# 1) System math you can run back-of-the-envelope

## 1.1 Night throughput & stability (don’t oversubscribe)

Assume a nightly queue of micro-tasks arriving at average rate ( \lambda ) (tasks/hour). You have (c) concurrent “server” slots (GPUs/agents) each with effective service rate ( \mu ) (tasks/hour) under **continuous batching** (vLLM/OpenVINO/etc.). Treat it as M/M/c for a rough bound:

* Utilization: ( \rho = \frac{\lambda}{c\mu} ). Keep ( \rho \le 0.8 ) so queues don’t explode by dawn.
* Use Erlang-C to estimate expected wait; if it’s > ~10–20% of your night budget, shrink task size or add capacity. ([Wikipedia][1])

**Why batching matters:** the amortized latency per task under batch size (b):
[
\text{lat}*\text{task} \approx \tau*\text{tools} + \frac{s_\text{prefill}}{b} + s_\text{decode}
]
As (b) grows, prefill amortizes; 

## 📋 Tasks

- [ ] Draft actionable subtasks from the summary
- [ ] Define acceptance criteria
- [ ] Link back to related labeled docs



