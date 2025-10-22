---
uuid: "6f34ddef-fdc8-4fe9-ad60-89c10ca6bac7"
title: "Add job-level timeouts to all workflows"
slug: "Add job-level timeouts to all workflows"
status: "done"
priority: "P0"
labels: ["automation", "buildfix", "pipeline", "timeout"]
created_at: "2025-10-13T21:50:05.028Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
lastCommitSha: "b6711ea1ccd6a9a6fd5e073ab2571194007b975c"
commitHistory:
  -
    sha: "b6711ea1ccd6a9a6fd5e073ab2571194007b975c"
    timestamp: "2025-10-22 08:22:40 -0500\n\ndiff --git a/docs/agile/tasks/Add job-level timeouts to all workflows.md b/docs/agile/tasks/Add job-level timeouts to all workflows.md\nindex f25ab51a8..752f4a54c 100644\n--- a/docs/agile/tasks/Add job-level timeouts to all workflows.md\t\n+++ b/docs/agile/tasks/Add job-level timeouts to all workflows.md\t\n@@ -2,7 +2,7 @@\n uuid: \"6f34ddef-fdc8-4fe9-ad60-89c10ca6bac7\"\n title: \"Add job-level timeouts to all workflows\"\n slug: \"Add job-level timeouts to all workflows\"\n-status: \"testing\"\n+status: \"done\"\n priority: \"P0\"\n labels: [\"automation\", \"buildfix\", \"pipeline\", \"timeout\"]\n created_at: \"2025-10-13T21:50:05.028Z\""
    message: "Change task status: 6f34ddef-fdc8-4fe9-ad60-89c10ca6bac7 - Add job-level timeouts to all workflows - testing → done"
    author: "Error"
    type: "status_change"
---

Critical: All GitHub Actions workflows need job-level timeout-minutes to prevent hanging builds and resource waste. Current workflows only have service-level timeouts.

## ⛓️ Blocked By

Nothing



## ⛓️ Blocks

Nothing
