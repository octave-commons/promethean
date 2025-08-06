---
title: "feat(file-watcher): use LLM service instead of python"
status: "open"
created: "8/5/2025, 11:31:16 PM"
url: "https://github.com/riatzukiza/promethean/pull/273"
opened_by: "riatzukiza"
assignees: []
requested_reviewers: []
updateMode: "append"
allowDelete: true
---

# feat(file-watcher): use LLM service instead of python
## Summary
- refactor file watcher to call LLM service rather than Python scripts
- generate new task stubs through LLM HTTP endpoint

## Testing
- make setup-ts-service-file-watcher
- make test-ts-service-file-watcher
- make build *(fails: Cannot find type definition file for 'node')*
- npm run build
- npm run lint
- npm run format


- - -- - -
https://chatgpt.com/codex/tasks/taske6892cf0daa488324b05c1f2a1054944f


