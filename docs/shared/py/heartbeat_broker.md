# shared/py/heartbeat_broker.py

Path: `shared/py/heartbeat_broker.py`

Canonical broker-tied heartbeat helper for Python services that do not use the
`shared.py.service_template`.

## Usage

```python
import asyncio
from shared.py.heartbeat_broker import start_broker_heartbeat

async def main():
    client, task = await start_broker_heartbeat("my-service", interval=3.0)
    try:
        # do work with `client` (BrokerClient), publish/subscribe, etc.
        await asyncio.sleep(10)
    finally:
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass

asyncio.run(main())
```

## Rationale

- Publishes `heartbeat` via the same broker connection used for tasks/events.
- Ensures heartbeats stop when broker connectivity is lost, allowing the
  heartbeat service to reap stale processes.

## Env Vars

- `HEARTBEAT_INTERVAL` seconds between heartbeats (default `3`).

