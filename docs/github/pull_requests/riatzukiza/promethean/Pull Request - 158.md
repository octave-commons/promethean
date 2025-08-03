---
title: "Add Ollama tag generator pre-commit hook"
status: "open"
created: "8/3/2025, 12:42:04 AM"
url: "https://github.com/riatzukiza/promethean/pull/158"
opened_by: "riatzukiza"
assignees: []
requested_reviewers: []
updateMode: "append"
allowDelete: true
---

# Add Ollama tag generator pre-commit hook
## Summary
- add scripts/addtagsollama.py to call Ollama on markdown files and append tags
- run tag appender through a new local pre-commit hook

## Testing
- make install *(fails: Interrupt)*
- make lint *(fails: flake8 errors)*
- make test *(fails: Interrupt)*
- make build *(fails: No rule to make target)*
- make format *(fails: 2 files failed to reformat)*
- pre-commit run --files readme.md


- - -- - -
https://chatgpt.com/codex/tasks/taske688ef061e788832484c6a3df290498af




---
### New status: "open"

# Add Ollama tag generator pre-commit hook
## Summary
- add scripts/addtagsollama.py to call Ollama on markdown files and append tags
- run tag appender through a new local pre-commit hook

## Testing
- make install *(fails: Interrupt)*
- make lint *(fails: flake8 errors)*
- make test *(fails: Interrupt)*
- make build *(fails: No rule to make target)*
- make format *(fails: 2 files failed to reformat)*
- pre-commit run --files readme.md


- - -- - -
https://chatgpt.com/codex/tasks/taske688ef061e788832484c6a3df290498af
