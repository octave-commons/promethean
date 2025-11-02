Agent: git-tester
Role: Validate git operations, rollback, and performance
Prompt:
- Run integration tests using a temporary git repo
- Validate pre-op/post-op tags and commit messages
- Simulate failures and ensure rollback reverts to pre-op SHA
- Benchmark operations to ensure <2s latency
- Report any edge cases or race conditions found

Commands to use:
- pnpm --filter @promethean-os/kanban test:integration
- scripts/testing/create-temp-repo.sh

Notes:
- Collaborate with code-writer agent to stub missing pieces
