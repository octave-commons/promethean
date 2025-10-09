---
uuid: "1a41a8d1-0585-47be-a582-6fa36746c64b"
title: "upgrade board-review indexing for large files"
slug: "upgrade-boardrev-indexing-for-large-files"
status: "incoming"
priority: "P2"
labels: ["files", "board", "review", "indexing"]
created_at: "2025-10-07T20:25:05.643Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

## 🛠️ Description

Improve the `@promethean/boardrev` pipeline so board-review runs can embed complete source files instead of truncating at the first 400 lines.

## 📦 Requirements
- Persist full file coverage by chunking repository documents into ~400 line windows with overlap so long files are not dropped from context.
- Investigate using hierarchical embeddings e.g., AST-guided for TypeScript/JavaScript to improve relevance scoring for multi-section files.
- Update repository indexing configuration and cache schema (if needed) to support storing chunk metadata and provenance.
- Extend task-to-context matching so multiple chunks from the same file can be returned when relevant.
- Provide migration guidance for any Level cache data that must be invalidated or rebuilt.

## ✅ Acceptance Criteria
- Indexing step emits multiple excerpts per large file, each covering the full source with consistent chunk sizes and overlap.
- Matching logic can return more than one chunk for a task, and downstream prompts include chunk boundaries and file references.
- Documentation updated to describe the new chunking and embedding workflow, including commands to rebuild caches.
- Tests or simulations demonstrate improved recall on tasks referencing code beyond the first 400 lines.

## Tasks
- [ ] Audit current indexing limits and confirm configuration points for chunk size and overlap.
- [ ] Implement chunk generation and hierarchical embedding strategy.
- [ ] Update matching pipeline and cache schema to accept multiple chunks per file.
- [ ] Document new behavior and add regression coverage for large-file tasks.
- [ ] Plan and execute cache rebuild instructions for deployment.

## Story Points
- Estimate: 5
- Assumptions: AST tooling is available for packages indexed by board-review or can be added without major dependency risk.

#incoming #board-review #codex-task
