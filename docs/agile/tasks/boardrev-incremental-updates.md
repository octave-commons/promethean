---
uuid: "a9b95383-ad82-4dd4-8086-b48caf1a0328"
title: "Add incremental updates to boardrev indexing"
slug: "boardrev-incremental-updates"
status: "todo"
priority: "P1"
labels: ["enhancement", "boardrev", "performance"]
created_at: "2025-10-08T22:06:55.880Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

# Add incremental updates to boardrev indexing

## Description
Current implementation requires full re-index on every run, which is inefficient for large repositories. Need incremental update capability.

## Proposed Solution
- Track file modification times and content hashes
- Detect new, modified, and deleted files
- Update only changed files in vector index
- Implement garbage collection for deleted files
- Add cache invalidation strategy

## Benefits
- Much faster subsequent runs
- Better resource utilization
- Enables real-time monitoring
- Reduces computational costs
- Better user experience for frequent runs

## Acceptance Criteria
- [ ] File change detection implemented
- [ ] Incremental indexing logic added
- [ ] Deleted file handling
- [ ] Cache invalidation strategy
- [ ] Performance tests show 10x+ improvement for unchanged repos
- [ ] Backward compatibility with full re-index mode

## Technical Details
- **Files to modify**: `src/03-index-repo.ts`, `src/utils.ts`
- **New functions**: `detectChangedFiles()`, `incrementalIndex()`, `cleanupDeletedFiles()`
- **Cache strategy**: Store file metadata alongside embeddings
- **CLI options**: Add `--incremental` flag with fallback to full

## Notes
Should handle edge cases like file moves, permission changes, and corrupted cache entries gracefully.
