---
title: "refactor services to route via proxy"
status: "open"
created: "8/5/2025, 11:55:29 PM"
url: "https://github.com/riatzukiza/promethean/pull/279"
opened_by: "riatzukiza"
assignees: []
updateMode: "none"
allowDelete: true
---

# refactor services to route via proxy
## Summary
- update shared clients and services to call other modules through the proxy
- point scripts and file watcher to proxy-based service URLs
- adjust heartbeat client defaults for proxy routing

## Testing
- make format
- make lint
- make build
- make test-ts-service-cephalon
- make test-ts-service-file-watcher
- make test-ts-service-voice
- make test-js-service-heartbeat
- python -m pytest shared/py/tests/testheartbeatclient.py


- - -- - -
https://chatgpt.com/codex/tasks/taske6892d3c1f9888324a36626438f899e31


