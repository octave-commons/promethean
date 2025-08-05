---
title: "feat: compile file watcher ts on start"
status: "open"
created: "8/3/2025, 12:50:59 AM"
url: "https://github.com/riatzukiza/promethean/pull/159"
opened_by: "riatzukiza"
assignees: []
updateMode: "none"
allowDelete: true
---

# feat: compile file watcher ts on start
## Summary
- compile TypeScript before launching file watcher service
- document automatic TypeScript compilation in service README

## Testing
- npm run build
- npx ava tests/dummy.test.ts --node-arguments"--loader ts-node/esm"
- npx eslint src/index.ts (ignored: file matched ignore pattern)
- npx prettier --write package.json README.md

- - -- - -
https://chatgpt.com/codex/tasks/taske688ef37680b0832491c0189a1f23298a


