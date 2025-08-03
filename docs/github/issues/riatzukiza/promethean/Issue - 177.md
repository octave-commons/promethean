---
title: "Fix duplicate permissions key in board sync workflow"
status: "open"
created: "8/3/2025, 1:48:58 AM"
url: "https://github.com/riatzukiza/promethean/pull/177"
opened_by: "riatzukiza"
assignees: []
updateMode: "none"
allowDelete: true
---

# Fix duplicate permissions key in board sync workflow
## Summary
- remove duplicate permissions mapping in .github/workflows/syncboard.yml

## Testing
- make lint *(fails: services/py/tts/app.py:49:1: E303 too many blank lines)*
- make test *(fails: ModuleNotFoundError: No module named 'scipy')*
- make build *(fails: Cannot find module 'childprocess' or its corresponding type declarations)*
- make format
- make install *(fails: npm ERR! command sh -c node ./script/install)*

- - -- - -
https://chatgpt.com/codex/tasks/taske688f012d6e008324b5ac46b21e313064


