# shared/py/heartbeat_client.py

**Path**: `shared/py/heartbeat_client.py`

Lightweight client for sending periodic PID heartbeats to the message broker.

## Dependencies
- json
- os
- threading
- websockets

## Notes
- Runs in a background thread when `start()` is called.
