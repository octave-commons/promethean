# shared/py/service_template.py

Path: `shared/py/service_template.py`

Async helpers to connect a Python service to the broker, subscribe to topics,
declare worker readiness for queues, and handle events/tasks.

## Heartbeats

When `enable_heartbeat=True` (default), the template publishes `heartbeat`
events via the same `BrokerClient` connection. If broker connectivity is lost,
heartbeat publishing fails, allowing the heartbeat service to reap the
process.

Environment variables:

- `HEARTBEAT_INTERVAL` – seconds between heartbeats (default `3`).


### `run_service`

Most services simply need to start and then wait forever. The `run_service`
helper wraps `start_service` and performs this perpetual wait for you:

```python
import asyncio
from shared.py.service_template import run_service

async def handle_task(task, client):
    await client.publish("example.done", {"ok": True}, correlationId=task["id"])

asyncio.run(
    run_service(
        id="example",
        queues=["example.queue"],
        topics=["example.topic"],
        handle_task=handle_task,
        enable_heartbeat=True,
    )
)
```

