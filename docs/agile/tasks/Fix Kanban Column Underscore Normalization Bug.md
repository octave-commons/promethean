---
uuid: "02c78938-cf9c-45a0-b5ff-6e7a212fb043"
title: "Fix Kanban Column Underscore Normalization Bug"
slug: "Fix Kanban Column Underscore Normalization Bug"
status: "done"
priority: "P1"
labels: ["kanban", "column", "bug", "fix", "completed"]
created_at: "Sun Oct 12 2025 18:59:36 GMT-0500 (Central Daylight Time)"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

Fixed underscore normalization bug in kanban column names. The issue was that the board's columnKey() function and the transition rules' normalizeColumnName() method were producing different results for column names with spaces and hyphens. Both now consistently convert spaces and hyphens to underscores, ensuring consistent behavior across CLI commands and transition rules. Test case confirms all variations now match.
