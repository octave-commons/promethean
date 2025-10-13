---
uuid: "c3cf5e6c-3151-4104-93b2-70e3cd24bb7f"
title: "Implement resource exhaustion protection in indexer-core"
slug: "Implement resource exhaustion protection in indexer-core"
status: "incoming"
priority: "P1"
labels: ["security", "performance", "resource-exhaustion", "indexer-core", "memory-management"]
created_at: "2025-10-13T05:50:55.140Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---
















The makeChunks function in indexer-core can generate unlimited chunks from large files, causing memory exhaustion and potential DoS attacks. No limits exist on chunk count or total memory usage.\n\n**Issues to address:**\n- Add maxChunks parameter to prevent unlimited chunk generation\n- Implement memory pressure monitoring\n- Add file size limits before processing\n- Create chunk size validation\n- Add graceful degradation for oversized files\n\n**Implementation approach:**\n- Modify makeChunks function with configurable limits\n- Add memory usage monitoring during processing\n- Implement early warning system for large files\n- Add configuration for max file size and chunk limits\n- Log warnings when limits are approached\n\n**Files affected:**\n- packages/indexer-core/src/indexer.ts (makeChunks function)\n- Add configuration constants\n\n**Priority:** HIGH - DoS prevention

## ⛓️ Blocked By

Nothing



## ⛓️ Blocks

Nothing















