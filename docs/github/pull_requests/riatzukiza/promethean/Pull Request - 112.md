---
title: "Improve setup flow with quick requirements"
status: "open"
created: "7/31/2025, 1:21:25 PM"
url: "https://github.com/riatzukiza/promethean/pull/112"
opened_by: "riatzukiza"
assignees: []
requested_reviewers: []
updateMode: "append"
allowDelete: true
---

# Improve setup flow with quick requirements
## Summary
- fix typos in global Makefile targets
- correct TypeScript lint/format loops
- add generate-requirements and quick setup path for Python services
- document quick setup in README

## Testing
- make install *(passes)*
- make test *(passes)*
- make build *(fails: npm missing build script)*
- make lint *(fails: flake8 errors)*
- make format *(fails: black could not parse some files)*

- - -- - -
https://chatgpt.com/codex/tasks/taske688ba47688d883248c0925502271b644


