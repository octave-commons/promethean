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
lastCommitSha: "deec21fe4553bb49020b6aa2bdfee1b89110f15d"
commitHistory: 
  - sha: "deec21fe4553bb49020b6aa2bdfee1b89110f15d"
    timestamp: "2025-10-19T16:27:40.276Z"
    action: "Bulk commit tracking initialization"
---

Critical: All GitHub Actions workflows need job-level timeout-minutes to prevent hanging builds and resource waste. Current workflows only have service-level timeouts.

## ⛓️ Blocked By

Nothing



## ⛓️ Blocks

Nothing
