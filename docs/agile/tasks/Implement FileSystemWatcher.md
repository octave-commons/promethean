---
uuid: "80f6a81a-f550-4a62-a5da-c3c321af3180"
title: "Implement FileSystemWatcher"
slug: "Implement FileSystemWatcher"
status: "incoming"
priority: ""
labels: ["implement", "filesystemwatcher", "nothing", "blocked"]
created_at: "2025-10-24T02:46:36.540Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

## ⛓️ Summary

Implement a robust FileSystemWatcher to monitor docs/agile/tasks recursively for create/modify/delete events, batch events, and emit normalized task-change events for the Compliance Monitoring System.

## ✅ Acceptance Criteria

- Watches ./docs/agile/tasks/ recursively and emits events for create/modify/delete
- Batches events (batchSize=10, batchTimeout=1000ms) to avoid thrash
- Normalizes task files into a Task object with frontmatter parsed
- Emits events: task.created, task.modified, task.deleted
- Includes unit tests for event queuing, batching, and parsing

## ⛓️ Blocked By

Nothing

## ⛓️ Tasks

- [ ] Implement watcher using chokidar abstraction
- [ ] Implement event queue and batch processor
- [ ] Implement frontmatter parser for task files (YAML)
- [ ] Emit normalized task events with metadata (uuid, path, timestamp)
- [ ] Add unit tests (event queue, batch processing, parser)
- [ ] Add integration test simulating file system events

## ⛓️ Blocks

- ViolationTracker implementation (depends on normalized events)

## 🔬 Implementation Notes

- Place package under packages/monitoring or packages/file-watcher following repository conventions
- Expose a simple API: startWatching(path, options) -> EventEmitter
- Ensure tests run via pnpm --filter <pkg> test

## ⛓️ Blocks

Nothing
