---
uuid: "45ad22b1-d5b9-4c21-887c-c22f8ca6395e"
title: "Prevent invalid starting status creation in kanban CLI"
slug: "Prevent invalid starting status creation in kanban CLI"
status: "accepted"
priority: "P0"
labels: ["prevent", "invalid", "starting", "status"]
created_at: "2025-10-13T06:05:52.286Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---














Add validation to the kanban create command to prevent tasks from being created with invalid starting statuses. Tasks should only be created with 'incoming' status, and any attempt to create with other statuses should be rejected with an error message explaining the proper workflow.

## ⛓️ Blocked By

Nothing



## ⛓️ Blocks

Nothing













