---
uuid: 0b5c2829-4d26-4bda-93db-ab13a5a80a12
title: setup services to recieve work from the broker via push md
status: todo
priority: P3
labels: []
created_at: '2025-09-15T02:02:58.520Z'
---
### ✅ Setup services to use broker correctly


**Refactor broker to use `queueManager` for service-assigned task dispatch**

---

### 📋 Description

Replace the current pull-based task handling in the broker (`enqueue`/`dequeue`) with push-based task dispatch via `queueManager`. Services will register themselves as available to receive tasks from specific named queues (one per service for now).

Each queue represents a task type or target service. Over time, this model will evolve to support:

- Multiple concurrent tasks per service (bounded by load metrics or field state)
    
- Task prioritization and throttling based on system state
    

---

### 🧠 Concepts

- **Service**, not worker — the agent that owns the queue (e.g. `tts`, `stt`, `embedder`)
    
- **Queue**, per service — maps to a capability, not an individual instance
    
- **Availability** — service must explicitly signal readiness
    
- **Push delivery** — the broker decides when to deliver, based on availability
    

---

### 🧩 Acceptance Criteria

-  Remove support for `dequeue` (broker owns delivery now)
    
-  Add support for:
    
    - `ready` messages (mark service queue as ready to receive next task)
        
    - `ack` messages (confirm task was received and is being handled)
        
    - `heartbeat` (optional for liveness tracking)
        
-  Each task enqueued is assigned to a ready service instance immediately, or queued until one is ready
    
-  If a task isn’t acknowledged in time, it is requeued
    
-  Broker logs task delivery + acknowledgment per service queue
    

---

### 📎 Optional Extensions (future tasks)

- Add `concurrency` setting to each queue (e.g. `tts = 2`, `stt = 1`)
    
- Integrate feedback from Eidolon metrics to throttle or pause queues
    
- Report queue state via API or log endpoint for debugging
    

---

### 🏷 Tags

#codex-task #broker #queueManager #service-oriented #push-queue #agent-mode

---
#in-progress

## Blockers
- Missing integration tests for push-based task delivery.
- Shared broker client interface lacks documentation.

## Comments

This is kind of done. But also kind of not. I am not a fan of *how* many of these services got broker access. It should all be through a shared broker client interface. Anything extra they need, needs to be encapsulated

We're gonna call it In Progress

## Notes
- Tests or documentation are missing; acceptance criteria not fully met.
- Story Points: 8

#in-progress

