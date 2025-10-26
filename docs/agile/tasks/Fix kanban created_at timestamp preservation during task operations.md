---
uuid: "07358cf3-317b-492d-a37e-51eb45ea8ec9"
title: "Fix kanban created_at timestamp preservation during task operations"
slug: "Fix kanban created_at timestamp preservation during task operations"
status: "review"
priority: "P0"
labels: ["bugfix", "critical", "kanban", "timestamp", "data-integrity", "typescript"]
created_at: "2025-10-12T23:41:48.142Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

Fixed the indexedTaskToTask function to properly prioritize created_at over created field when converting IndexedTask to Task objects. This ensures created_at timestamps are preserved during all task operations.
