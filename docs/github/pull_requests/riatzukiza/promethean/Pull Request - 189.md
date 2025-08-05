---
title: "Add heartbeat service"
status: "open"
created: "8/3/2025, 3:46:47 AM"
url: "https://github.com/riatzukiza/promethean/pull/189"
opened_by: "riatzukiza"
assignees: []
requested_reviewers: []
updateMode: "append"
allowDelete: true
---

# Add heartbeat service
## Summary
- replace Python heartbeat watchdog with Node.js service backed by MongoDB
- add shared Python and JavaScript clients for posting heartbeats
- test heartbeat monitor kills stale processes and clients post process IDs

## Testing
- make install *(fails: Interrupt)*
- make format
- make lint *(fails: flake8: No such file or directory)*
- make build *(fails: build-ts Error 1)*
- make test *(fails: ModuleNotFoundError: No module named 'inflect')*
- python -m pytest shared/py/tests/testheartbeatclient.py -q
- cd services/js/heartbeat && npm test


- - -- - -
https://chatgpt.com/codex/tasks/taske688efee51d70832487ac6d3b61731d80


## Comments

### github-advanced-security[bot] commented on line 29 of file `services/js/heartbeat/index.js` (8/3/2025, 3:54:29 AM):

## Missing rate limiting

This route handler performs [a database access](1), but is not rate-limited.

[Show more details](https://github.com/riatzukiza/promethean/security/code-scanning/286)

---




---
### New status: "open"

# Add heartbeat service
## Summary
- replace Python heartbeat watchdog with Node.js service backed by MongoDB
- add shared Python and JavaScript clients for posting heartbeats
- test heartbeat monitor kills stale processes and clients post process IDs

## Testing
- make install *(fails: Interrupt)*
- make format
- make lint *(fails: flake8: No such file or directory)*
- make build *(fails: build-ts Error 1)*
- make test *(fails: ModuleNotFoundError: No module named 'inflect')*
- python -m pytest shared/py/tests/testheartbeatclient.py -q
- cd services/js/heartbeat && npm test


- - -- - -
https://chatgpt.com/codex/tasks/taske688efee51d70832487ac6d3b61731d80

## Comments

### github-advanced-security[bot] commented on line 29 of file `services/js/heartbeat/index.js` (8/3/2025, 3:54:29 AM):

## Missing rate limiting

This route handler performs [a database access](1), but is not rate-limited.

[Show more details](https://github.com/riatzukiza/promethean/security/code-scanning/286)

---

