---
title: "feat(file-watcher): format changed files"
status: "open"
created: "8/3/2025, 1:00:09 AM"
url: "https://github.com/riatzukiza/promethean/pull/164"
opened_by: "riatzukiza"
assignees: []
updateMode: "none"
allowDelete: true
---

# feat(file-watcher): format changed files
## Summary
- watch repository files and auto-format Python with Black and JS/TS/MD with Prettier
- document new formatting behaviour and add tests for formatter selection

## Testing
- npm install (file-watcher)
- npm run build (file-watcher)
- npx eslint src tests --ext .ts *(fails: files ignored)*
- npx prettier --write . (file-watcher)
- npm test (file-watcher)
- make install *(fails: onnxruntime network error)*
- make build *(fails: missing TypeScript modules in cephalon)*
- make lint *(fails: flake8 not installed)*
- make format
- make test


- - -- - -
https://chatgpt.com/codex/tasks/taske688ef34c15448324b1f083187154114e


