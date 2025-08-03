---
title: "Standardize dependency setup docs"
status: "open"
created: "7/31/2025, 5:34:22 PM"
url: "https://github.com/riatzukiza/promethean/pull/137"
opened_by: "riatzukiza"
assignees: []
requested_reviewers: []
updateMode: "append"
allowDelete: true
---

# Standardize dependency setup docs
## Summary
- docs: reference make setup as the single install command
- update lint workflow to use make setup

## Testing
- make setup *(fails: interrupted)*
- make test *(fails: ModuleNotFoundError: No module named 'numpy')*
- make build *(fails: rimraf not found)*
- make lint *(fails: flake8 not installed)*
- make format

- - -- - -
https://chatgpt.com/codex/tasks/taske688bec1d09ec83249d9448c95c5588f7


