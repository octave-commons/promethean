---
uuid: "221324ac-c9de-4df7-95ff-017c6bdba8a2"
title: "Pantheon: architecture that respects “never fallback to cloud”"
slug: "pantheon-architecture-that-respects-never-fallback-to-cloud"
status: "incoming"
priority: "P3"
labels: ["docops", "labeled"]
created_at: "2025-10-11T19:22:57.819Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---




## 🗂 Source

- Path: docs/labeled/2025.10.07.00.14.12.md

## 📝 Context Summary

Heard. Night runs are **local-only**, and there is **no automatic cloud fallback**—ever. Daytime is when you (with a big cloud model) plan, scope, and supervise. Night is when small, specialized, tool-heavy local agents grind through the queue. That constraint drives the design.

Below is a blunt, practical blueprint for **Pantheon**: a TypeScript-first, FP-leaning, GPL-only framework that lets you (1) define agents, tools, and flows as code, (2) run scheduled local jobs overnight, (3) collect traces for training, and (4) iteratively specialize your small models with LoRA/QLoRA so they inch toward cloud-model quality on narrow tasks. I’ll include lean code shapes you can drop into your monorepo; we can expand any piece.

---

# Pantheon: architecture that respects “never fallback to cloud”

## 1) Two hard modes (policy enforced)

* **Day Mode (supervised)**: you + cloud model GPT-5, Claude, etc. are allowed for *planning only*—creating tasks, specs, and critiques. No background cloud calls.
* **Night Mode local-only**: agent graph executes with an **egress denylist** + no cloud creds present. If a node can’t complete, it fails fast and leaves an error artifact for next day—*no sile

## 📋 Tasks

- [ ] Draft actionable subtasks from the summary
- [ ] Define acceptance criteria
- [ ] Link back to related labeled docs



