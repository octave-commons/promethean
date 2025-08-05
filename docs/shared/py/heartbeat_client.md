# shared/py/heartbeat_client.py

**Path**: `shared/py/heartbeat_client.py`

Lightweight client for sending periodic PID heartbeats to a monitoring service.

## Dependencies
- json
- urllib.request

## Notes
- Runs in a background thread when `start()` is called.
