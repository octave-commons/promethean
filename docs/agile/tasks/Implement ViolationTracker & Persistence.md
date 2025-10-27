---
uuid: 'c1d2e3f4-5678-90ab-cdef-1234567890ab'
title: 'Implement ViolationTracker & Persistence'
slug: 'Implement ViolationTracker & Persistence'
status: 'incoming'
priority: ''
labels: ['persistence', 'violation', 'tracking']
created_at: '2025-10-24T03:02:00.000Z'
estimates:
  complexity: ''
  scale: ''
  time_to_completion: ''
---

## Summary

Implement a ViolationTracker service that persists detected violations, supports querying by task, time range, severity, and provides an audit trail for reporting and dashboard consumption.

## Acceptance Criteria

- Persist violations to local storage (JSON file or sqlite) with schema: id, task_uuid, severity, type, message, suggestions, timestamp
- Provide query API for dashboard and alerts
- Retention policy and archival support
- Unit tests for persistence and query correctness

## Tasks

- [ ] Design storage schema
- [ ] Implement persistence layer
- [ ] Implement query APIs
- [ ] Add unit tests

## Blocked By

- Normalized events from FileSystemWatcher

## Blocks

- Dashboard & Reporting
