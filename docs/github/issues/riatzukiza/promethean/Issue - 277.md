---
title: "Add CI simulation skips and job selection"
status: "open"
created: "8/5/2025, 11:53:32 PM"
url: "https://github.com/riatzukiza/promethean/pull/277"
opened_by: "riatzukiza"
assignees: []
updateMode: "none"
allowDelete: true
---

# Add CI simulation skips and job selection
## Summary
- allow skipping pipenv and system package installs during CI simulation
- add Python service lint pattern and optional job selection for simulate-ci
- skip mypy type checks when simulating CI

## Testing
- make format *(fails: Command 'npx --yes biomejs/biome format .' returned non-zero exit status 1)*
- make lint
- make test *(fails: Command 'echo 'Running tests in PWD...' && python -m pipenv run pytest tests/' returned non-zero exit status 2)*
- make build
- SIMULATECI1 SIMULATECIJOB'lint[servicestt]' make simulate-ci


- - -- - -
https://chatgpt.com/codex/tasks/taske6892d3d15f8883249b1b4c57e668bff8


