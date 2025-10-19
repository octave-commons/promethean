---
uuid: "052d991b-3f5d-482d-8a44-8176f4091e5a"
title: "Refactor global state to dependency injection in indexer-core"
slug: "Refactor global state to dependency injection in indexer-core"
status: "incoming"
priority: "P2"
labels: ["architecture", "dependency-injection", "testing", "indexer-core", "refactoring"]
created_at: "2025-10-13T05:52:12.657Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
lastCommitSha: "e5a9a5786597a6cc31b4f6a9b3f15f11f89a3944"
commitHistory:
  -
    sha: "e5a9a5786597a6cc31b4f6a9b3f15f11f89a3944"
    timestamp: "2025-10-19 17:07:36 -0500\n\ndiff --git a/docs/agile/tasks/Refactor Large Files in agents-workflow Package.md b/docs/agile/tasks/Refactor Large Files in agents-workflow Package.md\nindex 500dcbad3..661733060 100644\n--- a/docs/agile/tasks/Refactor Large Files in agents-workflow Package.md\t\n+++ b/docs/agile/tasks/Refactor Large Files in agents-workflow Package.md\t\n@@ -10,11 +10,11 @@ estimates:\n   complexity: \"\"\n   scale: \"\"\n   time_to_completion: \"\"\n-lastCommitSha: \"63cefd8085df82c82f4c0931a0113b524b3f6738\"\n+lastCommitSha: \"ff7eaa387665480047c8e2d3e8206196a6815489\"\n commitHistory:\n   -\n-    sha: \"63cefd8085df82c82f4c0931a0113b524b3f6738\"\n-    timestamp: \"2025-10-19T22:05:08.079Z\"\n+    sha: \"ff7eaa387665480047c8e2d3e8206196a6815489\"\n+    timestamp: \"2025-10-19T22:07:36.208Z\"\n     message: \"Update task: 8ea3254c-3f78-4f09-9af6-b4ceba4c51f1 - Update task: Refactor Large Files in agents-workflow Package\"\n     author: \"Error <foamy125@gmail.com>\"\n     type: \"update\""
    message: "Update task: 8ea3254c-3f78-4f09-9af6-b4ceba4c51f1 - Update task: Refactor Large Files in agents-workflow Package"
    author: "Error"
    type: "update"
---

The indexer-core uses global mutable state (CHROMA, EMBEDDING_FACTORY, etc.) which makes testing difficult, causes race conditions, and violates functional programming principles.\n\n**Global state issues:**\n- Global variables make unit testing impossible\n- Race conditions in concurrent scenarios\n- Difficult to mock dependencies for testing\n- Violates functional programming preferences\n- Makes code harder to reason about\n\n**Refactoring approach:**\n- Create IndexerContext class to manage state\n- Implement dependency injection pattern\n- Pass context to functions instead of using globals\n- Add factory functions for creating configured instances\n- Maintain backward compatibility during transition\n\n**Benefits:**\n- Improved testability with mockable dependencies\n- Better thread safety and concurrency handling\n- Cleaner separation of concerns\n- Easier configuration management\n- Alignment with functional programming goals\n\n**Files affected:**\n- packages/indexer-core/src/indexer.ts (major refactoring)\n- Add context and factory modules\n\n**Priority:** MEDIUM - Architecture improvement

## ⛓️ Blocked By

Nothing



## ⛓️ Blocks

Nothing
