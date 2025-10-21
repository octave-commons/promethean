---
uuid: "363f1d14-a864-11f0-a5c2-7fa31ed98b3f"
title: "Migrate kanban Labels to tags for compatability with obsidian's knowledge graph"
slug: "migrate kanban label frontmatter field to tags for better compatability with obsdian"
status: "accepted"
priority: "P1"
labels: ["ai", "automation", "kanban", "obsidian", "knowledge-graph", "knowledge-management-system"]
created_at: "2025-10-13T06:32:03.264Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
lastCommitSha: "deec21fe4553bb49020b6aa2bdfee1b89110f15d"
commitHistory: 
  - sha: "deec21fe4553bb49020b6aa2bdfee1b89110f15d"
    timestamp: "2025-10-19T16:27:40.289Z"
    action: "Bulk commit tracking initialization"
---

## Context

The kanban currently uses a `label` field to categorize tasks. This works in the context of our use
but we would get additional benefits from using a `tags` field because obsidian understands them
the same way it understands #hashtags, allowing them to show up in the knowledge graph.

This allows us to better visualize the connections between our tasks with out having to write our own
knowledge graph visualizer.

## Scope

...


## Definition of Done

...

## Technical Implementation

...

## Acceptance Criteria

...
