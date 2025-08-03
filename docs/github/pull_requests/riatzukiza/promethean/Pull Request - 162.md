---
title: "refactor: extract kanban helpers to shared module"
status: "open"
created: "8/3/2025, 12:55:10 AM"
url: "https://github.com/riatzukiza/promethean/pull/162"
opened_by: "riatzukiza"
assignees: []
requested_reviewers: []
updateMode: "append"
allowDelete: true
---

# refactor: extract kanban helpers to shared module
## Summary
- factor common kanban parsing logic into shared/py/agile/kanban.py
- trim kanban scripts to use new shared helpers
- cover kanban helpers with unit tests

## Testing
- make install *(fails: venv warning)*
- make format *(fails: setup interrupted)*
- make lint *(fails: flake8 missing)*
- make build *(fails: npm http-proxy config)*
- make test *(fails: pipenv virtualenv error)*
- python -m pytest shared/py/tests/testagilekanban.py

- - -- - -
https://chatgpt.com/codex/tasks/taske688ef55d629483248b21bddd57f59d30


