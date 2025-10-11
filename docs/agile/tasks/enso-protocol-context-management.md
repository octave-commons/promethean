---
uuid: "3cf3f7c8-bb01-41e3-b4eb-cdb00ed4ed89"
title: "enso-protocol-context-management"
slug: "enso-protocol-context-management"
status: "incoming"
priority: "P3"
labels: ["docops", "labeled"]
created_at: "2025-10-11T19:22:57.818Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

## 🗂 Source

- Path: docs/labeled/enso-protocol-context-management.md

## 📝 Context Summary

---

title: 2025.09.18.17.20.39
filename: Enso Protocol Context Management

  The Enso protocol defines how users manage data sources within contexts,
  including metadata, discoverability, state transitions, and content
  permissions. It ensures data visibility, control, and availability through
  explicit and implicit rules. This framework supports both user-defined and
  context-specific configurations for secure and flexible data handling.
tags:
  - context
  - data
  - metadata
  - discoverability
  - state
  - permissions
  - enso
  - protocol
  - visibility
  - availability

references: []
---
Context management is also an important feature of the enso protocol.
A users own contributions of a given conversation must be both visible, and controllable.
Users should be able to curate files/data sources for LLM usage, a data source can have several properties.
The specifics as to how the following are implemented can vary by implementation, but all must be present:

## Metadata

- owner(s): the user(s) or group(s) who owns a piece of data, and is allowed to decide it's availability to contexts
- source: Where is this data from? (fs, api, database, etc)
- location: How the data s

## 📋 Tasks

- [ ] Draft actionable subtasks from the summary
- [ ] Define acceptance criteria
- [ ] Link back to related labeled docs
