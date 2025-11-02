# Todos for Implement Git Workflow Core Implementation (5791f7ad-8954-4204-932d-1f1383e90732)

1. Implement GitWorkflow (Core) — 4h
   - Implement class in packages/kanban/src/lib/heal/git-workflow.ts
   - Integrate with packages/kanban/src/lib/git-sync.ts
   - Implement preOperation/postOperation, commitTasksDirectory, commitKanbanBoard, commitDependencies
   - Ensure tags and rollback support

2. ScarFileManager — 2h
   - Implement packages/kanban/src/lib/heal/scar-file-manager.ts
   - Support JSONL read/write, validate, get history
   - Ensure ensureFile() creates file atomically

3. CommitMessageGenerator — 1.5h
   - Implement packages/kanban/src/lib/heal/utils/commit-message-generator.ts
   - Provide generateFromContext, generateFromTaskDiff, generateScarNarrative, validateMessage

4. Unit Tests & Mocks — 2h
   - Create tests under packages/kanban/src/tests/heal/
   - Mock git operations, test rollback, validation, commit messages

5. Integration Tests & Perf Benchmarks — 2h
   - Integration tests using temporary git repo
   - Measure operation latency (<2s) and validate tags/commits

Dependencies: Task 1.1.1, Task 1.1.2

Notes:
- Follow project coding style and use existing git-sync utilities where possible.
- Add tests to ensure >90% coverage for new modules.
