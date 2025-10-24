Agent: code-writer
Role: Implement GitWorkflow, ScarFileManager, CommitMessageGenerator
Prompt:
- Implement TypeScript classes as specified in task 5791f7ad
- Use existing packages/kanban/src/lib/git-sync.ts for git primitives
- Write unit tests and ensure >90% coverage
- Follow repo patterns for errors, logging, and testing
- Create small, focused commits and update task status as work progresses

Files to create:
- packages/kanban/src/lib/heal/git-workflow.ts
- packages/kanban/src/lib/heal/scar-file-manager.ts
- packages/kanban/src/lib/heal/utils/git-utils.ts
- packages/kanban/src/lib/heal/utils/commit-message-generator.ts

Run locally:
- pnpm --filter @promethean/kanban test

Notes:
- Request clarification if ScarContext types are missing
