## 🛠️ Description

Sometimes it's too easy to interupt the agent, and other times it won't trigger at all. the interuption   logic is brittle

---

## 🎯 Goals

- Use real-time audio energy/VAD thresholds to decide when a user intends to interrupt.
- Stop or pause TTS output within 200 ms of a valid interruption.
- Ignore background noise or echoes that fall below the interruption threshold.

---

## 📦 Requirements

- [ ] Interruption detection latency is **≤ 200 ms** from user speech onset.
- [ ] Valid interruption detection accuracy ≥ **95 %** with false-positive rate < **5 %**.
- [ ] TTS resumes or hands off control within **500 ms** after interruption is handled.

---

## 📋 Subtasks

- [ ] Collect sample conversation audio to calibrate energy/VAD thresholds.
- [ ] Implement threshold-based interruption check in the speech loop.
- [ ] Abort or pause active TTS when threshold is crossed.
- [ ] Log detection latency and correctness for evaluation.
- [ ] Add tests covering true and false interruption scenarios.

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
