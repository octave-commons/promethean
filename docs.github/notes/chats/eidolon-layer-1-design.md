> Based on chat log `docs/chats/2025-08-03_03-07-18_ChatGPT_Promethean - Eidolon Layer 1 Design....md`.

## User
Let's start talking about the implementation of the Eidolon fields. Layer 1 manages processing resources so the system doesn't crash.

## ChatGPT
- Layer 1 acts as the uptime layer, monitoring CPU, GPU, NPU, RAM, and latency to prevent overload.
- Resources are modeled as a vector field where tasks become agents with mass, velocity, and drag.
- Core components: sensors, field model, task agents, resource governor, feedback loop, and kill switch.
- Proposed Python scaffold uses MongoDB for shared state with modules like `field.py`, `heartbeat.py`, and `constraints.py`.
- Optional add-ons include visualizers, process evictors, and generators for simulating node arrangements.

- Heartbeat and Health services feed uptime and resource metrics into Layer 1. Heartbeat tracks per-process signals while Health aggregates the data.
- Cephalon and the file watcher register with these services so their activity influences the field through these metrics.
- Each event from Cephalon or the file watcher is projected into the field as a `daimo`, making every system action traceable.

### PSF sketch

```lisp
(memory-state
  (layer 1
    (metric heartbeat)
    (metric health)
    (daimo "cephalon-event" (trigger cephalon.action))
    (daimo "file-change" (trigger file-watcher.change)))
)
```

#tags: #eidolon #layer1 #resource-management #promethean #heartbeat #health #cephalon #file-watcher #daimo
