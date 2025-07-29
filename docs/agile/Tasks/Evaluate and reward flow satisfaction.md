## 🛠️ Task: Evaluate and reward flow satisfaction

Develop a metric for how "smooth" an interaction feels and use it to
reinforce the agent.  This could combine response latency, emotional
stability from Eidolon, and user feedback.

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
- [ ] Link baseline metrics from [eidolon-field-math](../../notes/math/eidolon-field-math.md)

---

## 🔗 Related Epics

#framework-core

---

## ⛓️ Blocked By

- Needs baseline emotion metrics from [Eidolon Fields](../../notes/math/eidolon-field-math.md)

## ⛓️ Blocks

- Future reinforcement-learning loops

---

## 🔍 Relevant Links

- [kanban](../boards/kanban.md)

## ❓ Questions

- Should user feedback be captured explicitly or inferred from message content?
- Do we need real-time updates to the reward signal or batched summaries?
