---
title: "feat: debounce file watcher self updates"
status: "open"
created: "8/3/2025, 2:21:39 AM"
url: "https://github.com/riatzukiza/promethean/pull/179"
opened_by: "riatzukiza"
assignees: []
requested_reviewers: []
updateMode: "append"
allowDelete: true
---

# feat: debounce file watcher self updates
## Summary
- debounce board and task watchers to ignore self-triggered changes
- build TS tests and run them through ava
- add regression tests for board/task change handling

## Testing
- make install *(fails: ENETUNREACH downloading onnxruntime-node)*
- make test
- make build *(fails: build-ts)*
- make lint *(fails: flake8 not found)*
- make format
- npm test (services/ts/file-watcher)


- - -- - -
https://chatgpt.com/codex/tasks/taske688f0741afa4832493faed19514f4cdc


