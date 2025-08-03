---
title: "Organize scripts by extension"
status: "open"
created: "8/2/2025, 11:45:15 PM"
url: "https://github.com/riatzukiza/promethean/pull/155"
opened_by: "riatzukiza"
assignees: []
requested_reviewers: []
updateMode: "append"
allowDelete: true
---

# Organize scripts by extension
## Summary
- group top-level scripts into extension-specific folders
- update references in docs, Makefile, tests, and pre-commit config
- fix simulateci test import and remove stray pycache

## Testing
- make format
- make lint *(fails: flake8: No such file or directory)*
- make test *(fails: No module named pipenv)*
- make build *(fails: Cannot find module 'childprocess' or its type declarations)*
- pytest tests/scripts


- - -- - -
https://chatgpt.com/codex/tasks/taske688ea673101883249d177eb930a8a260


