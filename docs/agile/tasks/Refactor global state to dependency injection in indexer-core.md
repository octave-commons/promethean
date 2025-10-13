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
---













The indexer-core uses global mutable state (CHROMA, EMBEDDING_FACTORY, etc.) which makes testing difficult, causes race conditions, and violates functional programming principles.\n\n**Global state issues:**\n- Global variables make unit testing impossible\n- Race conditions in concurrent scenarios\n- Difficult to mock dependencies for testing\n- Violates functional programming preferences\n- Makes code harder to reason about\n\n**Refactoring approach:**\n- Create IndexerContext class to manage state\n- Implement dependency injection pattern\n- Pass context to functions instead of using globals\n- Add factory functions for creating configured instances\n- Maintain backward compatibility during transition\n\n**Benefits:**\n- Improved testability with mockable dependencies\n- Better thread safety and concurrency handling\n- Cleaner separation of concerns\n- Easier configuration management\n- Alignment with functional programming goals\n\n**Files affected:**\n- packages/indexer-core/src/indexer.ts (major refactoring)\n- Add context and factory modules\n\n**Priority:** MEDIUM - Architecture improvement

## ⛓️ Blocked By

Nothing



## ⛓️ Blocks

Nothing












