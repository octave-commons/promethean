---
title: "refactor cephalon agent utilities into shared modules"
status: "open"
created: "8/3/2025, 1:14:59 AM"
url: "https://github.com/riatzukiza/promethean/pull/165"
opened_by: "riatzukiza"
assignees: []
updateMode: "none"
allowDelete: true
---

# refactor cephalon agent utilities into shared modules
## Summary
- refactor Cephalon agent by moving screen capture and text utilities into shared modules
- add shared type definitions and update tsconfig for nested sources
- add unit tests for new text utilities

## Testing
- make install *(fails: onnxruntime-node download ENETUNREACH)*
- make format
- make lint *(fails: flake8: No such file or directory)*
- make build *(fails: build-ts Error 1)*
- make test


- - -- - -
https://chatgpt.com/codex/tasks/taske688ef6761cdc8324a81fcc74702db250


