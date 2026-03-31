# Knowledge Graph UI: details view loads selected doc

- Prompt: fix `App` so details view renders selected documentation file instead of falling back to repository README in tests.
- Code refs: `services/knowledge-graph/packages/knowledge-graph-ui/src/App.tsx`:476-505 (search inputs marked as searchboxes), 821-837 (file viewer content now reactive), 972-983 (textarea uses reactive content); `services/knowledge-graph/packages/knowledge-graph-ui/vitest.setup.ts`:3-20 (jest-compatible fake timer shim for waitFor).
- Existing issues/PRs: none noted during this fix.
- Definition of done: `src/__tests__/app.test.tsx` passes and full `pnpm --filter @promethean-os/knowledge-graph-ui test` succeeds.
- Requirements: details panel must display selected node content (doc path) with file viewer reacting to async loads; testing-library `waitFor` must recognize fake timers under Vitest; avoid accessibility regressions in search inputs.
