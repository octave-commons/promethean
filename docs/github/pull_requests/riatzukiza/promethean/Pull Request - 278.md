---
title: "handle conditional GitHub Actions steps in simulate-ci"
status: "open"
created: "8/5/2025, 11:53:59 PM"
url: "https://github.com/riatzukiza/promethean/pull/278"
opened_by: "riatzukiza"
assignees: []
requested_reviewers: []
updateMode: "append"
allowDelete: true
---

# handle conditional GitHub Actions steps in simulate-ci
## Summary
- teach simulate-ci to respect if conditionals and matrix includes
- allow TypeScript typecheck per-service and skip install scripts

## Testing
- python scripts/simulateci.py --job "lint[servicecephalon]"
- make format *(fails: Formatter would have printed content)*
- make lint
- make test *(fails: Command 'echo 'Running tests in PWD...' && python -m pipenv run pytest tests/' returned non-zero exit status 2)*
- make build


- - -- - -
https://chatgpt.com/codex/tasks/taske6892d3d15f8883249b1b4c57e668bff8


