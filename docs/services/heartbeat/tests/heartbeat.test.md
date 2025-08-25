# heartbeat.test.js

**Path**: `services/js/heartbeat/tests/heartbeat.test.js`

**Description**: Integration tests that ensure the heartbeat service kills stale processes, enforces instance limits, stores CPU, memory, and network metrics, respects per-instance session IDs, and cleans up heartbeats on shutdown.

## Dependencies
- ava
- mongodb-memory-server
- mongodb
- child_process
- path
- url
- ws

## Dependents
- None
