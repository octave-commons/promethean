## 🛠️ Description

Refactor the speech interruption system to analyze incoming audio data so the agent only stops speaking when the user intentionally interrupts.

---

## 🎯 Goals

- Reduce accidental interruptions caused by background noise.
- Allow the user to break in quickly when needed.

---

## 📦 Requirements

- [ ] Interruption detection uses audio energy or similar metrics rather than fixed timers.
- [ ] Sensitivity thresholds are configurable.
- [ ] Unit tests cover interruption, no-interruption, and noise scenarios.
- [ ] Documentation explains how the new logic works and how to tune it.

---

## 📋 Subtasks

- [ ] Audit existing interruption logic and document current behavior.
- [ ] Collect representative audio samples for noise, silence, and user speech.
- [ ] Implement audio-metric based interruption detection.
- [ ] Expose configuration options for thresholds and windows.
- [ ] Write unit/integration tests for typical scenarios.
- [ ] Update docs describing interruption workflow.

---

## 🔗 Related Epics

#framework-core

---

## ⛓️ Blocked By

Nothing

## ⛓️ Blocks

Nothing

---

## 🔍 Relevant Links

- [kanban](../boards/kanban.md)

#breakdown

