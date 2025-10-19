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
lastCommitSha: "deec21fe4553bb49020b6aa2bdfee1b89110f15d"
commitHistory: 
  - sha: "deec21fe4553bb49020b6aa2bdfee1b89110f15d"
    timestamp: "2025-10-19T16:27:40.278Z"
    action: "Bulk commit tracking initialization"
---

Fixed the indexedTaskToTask function to properly prioritize created_at over created field when converting IndexedTask to Task objects. This ensures created_at timestamps are preserved during all task operations.
