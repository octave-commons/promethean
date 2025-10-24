---
uuid: "66331ec1-3413-472d-858d-e78bde1bef4b"
title: "[5791f7ad] GitWorkflow: implement core integration - GitWorkflow"
slug: "[5791f7ad] GitWorkflow implement core integration - GitWorkflow"
status: "incoming"
priority: "P1"
labels: ["git-workflow", "backend"]
created_at: "2025-10-24T02:50:28.999Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

Parent: 5791f7ad-8954-4204-932d-1f1383e90732\nEstimate: 2.5h\nDescription: Implement GitWorkflow class at packages/kanban/src/lib/heal/git-workflow.ts with methods: preOperation, postOperation, commitTasksDirectory, commitKanbanBoard, commitDependencies, createPreOpTag, createPostOpTag, createFinalTag, rollback, getCurrentState. Integrate with packages/kanban/src/lib/git-sync.ts. Acceptance Criteria: individual commits for tasks/board/deps; pre-op and post-op tags; returns pre/post SHA; rollback support; unit tests.

## ⛓️ Blocked By

Nothing



## ⛓️ Blocks

Nothing
