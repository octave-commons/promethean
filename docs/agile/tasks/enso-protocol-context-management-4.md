---
uuid: "5e23268a-6d3c-497a-b66e-309f0d3fc2d9"
title: "enso-protocol-context-management-4"
slug: "enso-protocol-context-management-4"
status: "incoming"
priority: "P3"
tags: ["docops", "labeled"]
created_at: "2025-10-10T03:23:55.969Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---







## 🗂 Source

- Path: docs/labeled/enso-protocol-context-management-4.md

## 📝 Context Summary

---
uuid: 19e76e7a-2c6e-42a2-90aa-dcfb56b91b7f
created_at: '2025-09-18T17:20:39Z'
title: 2025.09.18.17.20.39
filename: Enso Protocol Context Management
description: >-
  The Enso protocol defines how users manage data sources within contexts,
  including metadata, discoverability, state transitions, and content
  permissions. It ensures data visibility, control, and availability through
  explicit and implicit rules. This system allows users to curate and share data
  securely across contexts.
tags:
  - context
  - data
  - enso
  - metadata
  - discoverability
  - state
  - content
  - permissions
  - availability
  - curate
---
Context management is also an important feature of the enso protocol.
A users own contributions of a given conversation must be both visible, and controllable.
Users should be able to curate files/data sources for LLM usage, a data source can have several properties.
The specifics as to how the following are implemented can vary by implementation, but all must be present:

## Metadata

- owner(s): the user(s) or group(s) who owns a piece of data, and is allowed to decide it's availability to contexts
- source: Where is this data from? (fs, api, database, e

## 📋 Tasks

- [ ] Draft actionable subtasks from the summary
- [ ] Define acceptance criteria
- [ ] Link back to related labeled docs






