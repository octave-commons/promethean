---
uuid: be3c3f60-070b-4bb2-8671-6eb48d1ba15c
created_at: '2025-09-21T12:49:02Z'
title: 2025.09.21.12.49.02
filename: doc-driven-workflow-diagram
description: >-
  A Mermaid flowchart illustrating a doc-driven workflow with labeled stages for
  design, spec, and tasks. Shows transitions between draft, review, accepted,
  rejected, and final states. Includes paths for learning from rejections to
  improve future outcomes.
tags:
  - workflow
  - mermaid
  - doc-driven
  - design
  - spec
  - tasks
  - rejection
  - learning
  - process
  - improvement
---

# doc driven workflow diagram
```mermaid
flowchart TD

inbox --> labeled
labeled --> tasks/incoming
labeled --> design/drafts
labeled --> notes/:category
labeled --> spec/drafts
labeled --> pseudo/:package
design/drafts --> design/review
design/review --> design/accepted
design/review --> design/rejected
design/review --> design/drafts
design/accepted --> design/plan
design/plan --> tasks/incoming


spec/drafts --> spec/review
spec/review --> spec/accepted
spec/review --> spec/rejected
spec/review --> spec/drafts
spec/accepted --> spec/plan
spec/plan --> tasks/incoming

tasks/incoming --> tasks/accepted
tasks/incoming --> tasks/rejected
tasks/incoming --> tasks/icebox
tasks/accepted --> tasks/breakdown
tasks/breakdown --> tasks/rejected
tasks/breakdown --> tasks/blocked
tasks/breakdown --> tasks/ready
tasks/ready --> tasks/todo
tasks/todo --> tasks/in-progress

tasks/in-progress --> tasks/in-progress
tasks/in-progress --> tasks/in-review
tasks/in-progress --> tasks/breakdown
tasks/in-review --> tasks/document
tasks/in-review --> tasks/in-progress
tasks/in-review --> tasks/ready
tasks/in-review --> tasks/done
tasks/in-review --> tasks/breakdown
tasks/document --> tasks/done
tasks/done --> tasks/archive
```

At some point I want a flow that'll use the rejected and final states to learn why and why not, to reduce the number of rejected items as time goes on
