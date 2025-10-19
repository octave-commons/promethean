---
uuid: "02c78938-cf9c-45a0-b5ff-6e7a212fb043"
title: "Fix Kanban Column Underscore Normalization Bug"
slug: "Fix Kanban Column Underscore Normalization Bug"
status: "in_progress"
priority: "P1"
labels: ["kanban", "column", "bug", "fix", "completed"]
created_at: "Sun Oct 12 2025 18:59:36 GMT-0500 (Central Daylight Time)"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
lastCommitSha: "2069e4809cf9801fbae4d9a027cb5135b92aa2ee"
commitHistory:
  -
    sha: "2069e4809cf9801fbae4d9a027cb5135b92aa2ee"
    timestamp: "2025-10-19 17:08:18 -0500\n\ndiff --git a/docs/agile/tasks/Design Agent OS Core Message Protocol.md b/docs/agile/tasks/Design Agent OS Core Message Protocol.md\nindex f4745e76c..bb9a1b586 100644\n--- a/docs/agile/tasks/Design Agent OS Core Message Protocol.md\t\n+++ b/docs/agile/tasks/Design Agent OS Core Message Protocol.md\t\n@@ -10,11 +10,14 @@ estimates:\n   complexity: \"\"\n   scale: \"\"\n   time_to_completion: \"\"\n-lastCommitSha: \"deec21fe4553bb49020b6aa2bdfee1b89110f15d\"\n-commitHistory: \n-  - sha: \"deec21fe4553bb49020b6aa2bdfee1b89110f15d\"\n-    timestamp: \"2025-10-19T16:27:40.277Z\"\n-    action: \"Bulk commit tracking initialization\"\n+lastCommitSha: \"d3881238c86594da1ba474a4ff779c710f125962\"\n+commitHistory:\n+  -\n+    sha: \"d3881238c86594da1ba474a4ff779c710f125962\"\n+    timestamp: \"2025-10-19 17:08:18 -0500\\n\\ndiff --git a/docs/agile/tasks/Complete breakdown for P0 security tasks.md b/docs/agile/tasks/Complete breakdown for P0 security tasks.md\\nindex 1ca9c849e..1385f0525 100644\\n--- a/docs/agile/tasks/Complete breakdown for P0 security tasks.md\\t\\n+++ b/docs/agile/tasks/Complete breakdown for P0 security tasks.md\\t\\n@@ -10,11 +10,14 @@ estimates:\\n   complexity: \\\"\\\"\\n   scale: \\\"\\\"\\n   time_to_completion: \\\"\\\"\\n-lastCommitSha: \\\"deec21fe4553bb49020b6aa2bdfee1b89110f15d\\\"\\n-commitHistory: \\n-  - sha: \\\"deec21fe4553bb49020b6aa2bdfee1b89110f15d\\\"\\n-    timestamp: \\\"2025-10-19T16:27:40.276Z\\\"\\n-    action: \\\"Bulk commit tracking initialization\\\"\\n+lastCommitSha: \\\"c28222bd432bcfc5bc5aa2fa2bd81caf1aa99116\\\"\\n+commitHistory:\\n+  -\\n+    sha: \\\"c28222bd432bcfc5bc5aa2fa2bd81caf1aa99116\\\"\\n+    timestamp: \\\"2025-10-19T22:08:18.567Z\\\"\\n+    message: \\\"Update task: b6c5f483-0893-4144-a0cf-f97ffd2b6b74 - Update task: Complete breakdown for P0 security tasks\\\"\\n+    author: \\\"Error <foamy125@gmail.com>\\\"\\n+    type: \\\"update\\\"\\n ---\\n \\n ## ✅ P0 Security Task Breakdown - COMPLETED\"\n+    message: \"Update task: b6c5f483-0893-4144-a0cf-f97ffd2b6b74 - Update task: Complete breakdown for P0 security tasks\"\n+    author: \"Error\"\n+    type: \"update\"\n ---\n \n ## 📡 Critical: Agent OS Core Message Protocol"
    message: "Update task: 0c3189e4-4c58-4be4-b9b0-8e69474e0047 - Update task: Design Agent OS Core Message Protocol"
    author: "Error"
    type: "update"
---

Fixed underscore normalization bug in kanban column names. The issue was that the board's columnKey() function and the transition rules' normalizeColumnName() method were producing different results for column names with spaces and hyphens. Both now consistently convert spaces and hyphens to underscores, ensuring consistent behavior across CLI commands and transition rules. Test case confirms all variations now match.
