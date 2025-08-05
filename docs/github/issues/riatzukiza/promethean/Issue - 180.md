---
title: "refactor: centralize AGENTNAME env"
status: "open"
created: "8/3/2025, 2:38:08 AM"
url: "https://github.com/riatzukiza/promethean/pull/180"
opened_by: "riatzukiza"
assignees: []
updateMode: "none"
allowDelete: true
---

# refactor: centralize AGENTNAME env
## Summary
- add shared module to load environment vars and expose AGENTNAME
- use shared AGENTNAME across Cephalon and Discord embedder services
- simplify Discord indexer by reusing shared settings

## Testing
- make install *(fails: response status 404 building discordjs/opus)*
- make test
- make build *(fails: TS2307 Cannot find module 'childprocess')*
- make lint *(fails: services/py/tts/app.py:49:1: E303 too many blank lines)*
- make format

- - -- - -
https://chatgpt.com/codex/tasks/taske688efe1249408324bbf0ef4714fbbda8


