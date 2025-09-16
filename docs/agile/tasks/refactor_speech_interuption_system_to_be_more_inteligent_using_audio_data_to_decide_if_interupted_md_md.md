---
uuid: 099c293b-2aaf-4ead-9cea-e88d8e352606
title: >-
  refactor speech interuption system to be more inteligent using audio data to
  decide if interupted md md
status: todo
priority: P3
labels: []
created_at: '2025-09-15T02:02:58.519Z'
---
## 🛠️ Description

Refactor the speech interruption system to analyze incoming audio data so the agent only stops speaking when the user intentionally interrupts.
The current speech interruption detection in Discord conversations is unreliable.  
Sometimes the agent stops speaking too quickly, while other times it fails to pause when a user begins talking.  
We need smarter audio-based heuristics so the agent reacts consistently.

---

## 🎯 Goals

- Reduce accidental interruptions caused by background noise.
- Allow the user to break in quickly when needed.
- Use real-time audio energy/VAD thresholds to decide when a user intends to interrupt.
- Stop or pause TTS output within 200 ms of a valid interruption.
- Ignore background noise or echoes that fall below the interruption threshold.
- Improve accuracy of detecting when a user is speaking.
- Prevent premature interruptions of the agent's own speech.
- Allow configurable sensitivity for different environments.

---

## 📦 Requirements

- [ ] Interruption detection uses audio energy or similar metrics rather than fixed timers.
- [ ] Sensitivity thresholds are configurable.
- [ ] Unit tests cover interruption, no-interruption, and noise scenarios.
- [ ] Documentation explains how the new logic works and how to tune it.
- [ ] Interruption detection latency is **≤ 200 ms** from user speech onset.
- [ ] Valid interruption detection accuracy ≥ **95 %** with false-positive rate < **5 %**.
- [ ] TTS resumes or hands off control within **500 ms** after interruption is handled.
- [ ] Audit current interruption logic in audio processing service.
- [ ] Incorporate amplitude or spectral analysis to distinguish speech from silence.
- [ ] Expose configuration knobs for interruption sensitivity.
- [ ] Document new behavior and parameters.

---

## 📋 Subtasks

- [ ] Audit existing interruption logic and document current behavior.
- [ ] Collect representative audio samples for noise, silence, and user speech.
- [ ] Implement audio-metric based interruption detection.
- [ ] Expose configuration options for thresholds and windows.
- [ ] Write unit/integration tests for typical scenarios.
- [ ] Update docs describing interruption workflow.
- [ ] Collect sample conversation audio to calibrate energy/VAD thresholds.
- [ ] Implement threshold-based interruption check in the speech loop.
- [ ] Abort or pause active TTS when threshold is crossed.
- [ ] Log detection latency and correctness for evaluation.
- [ ] Add tests covering true and false interruption scenarios.
- [ ] Identify where interruption hooks exist in the Discord audio pipeline.
- [ ] Prototype improved detection using audio signal metrics.
- [ ] Add tests for successful and failed interruption cases.
- [ ] Update docs and examples for configuring thresholds.

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

- [[kanban]]
#Breakdown


