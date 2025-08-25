# shared/py/heartbeat_client.py

**Path**: `shared/py/heartbeat_client.py`

Deprecated: use the canonical broker-tied heartbeat instead.

Use `shared.py.service_template` (preferred) or `shared.py.heartbeat_broker` to
publish heartbeats via the same broker connection used for tasks. This ensures
heartbeats stop when the broker is unavailable so the heartbeat service can
reap stale processes.

## Dependencies
- json
- os
- threading
- websockets

## Notes
- This module now emits a `DeprecationWarning` upon construction.
- Runs in a background thread when `start()` is called (legacy behavior).
