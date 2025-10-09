---
uuid: "45a4101d-01ab-497b-8920-97cc563e9351"
title: "evaluate and reward flow satisfaction"
slug: "evaluate_and_reward_flow_satisfaction"
status: "rejected"
priority: "P3"
labels: ["reward", "evaluate", "flow", "satisfaction"]
created_at: "2025-10-07T20:25:05.645Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

## 🛠️ Task: Evaluate and reward flow satisfaction

Develop a metric for how "smooth" an interaction feels and use it to
reinforce the agent. This could combine response latency, emotional
stability from Eidolon, and user feedback.

Generated from ../unique/2025.07.28.18.07.20.md$../unique/2025.07.28.18.07.20.md

---

## 🎯 Goals

- Quantify conversation quality with a simple score
- Feed that score back into the agent as a reward signal
- Log scores for later analysis

---

## 📦 Requirements

- [ ] Capture turn duration and message sentiment
- [ ] Expose current Eidolon emotional metrics
- [ ] Store scores in `data/eidolon/flow_scores.csv`

---

## 📋 Subtasks

- [ ] Instrument Cephalon to timestamp message flow
- [ ] Add a small Python module to compute satisfaction (0‑1 scale)
- [ ] Update Eidolon to accept a reward event
- [ ] Write a minimal visualization notebook
- [ ] Link baseline metrics from [eidolon-field-math]

---

## 🔗 Related Epics
```
#framework-core
```
---

## ⛓️ Blocked By

- Needs baseline emotion metrics from [eidolon-field-math|Eidolon Fields]

## ⛓️ Blocks

- Future reinforcement-learning loops

---

## 🔍 Relevant Links

- [[kanban]]

## ❓ Questions

- Should user feedback be captured explicitly or inferred from message content?
- Do we need real-time updates to the reward signal or batched summaries?
#IceBox
#rejected
