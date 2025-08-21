# shared/py/service_template.py

Path: `shared/py/service_template.py`

Async helper to connect a Python service to the broker, subscribe to topics,
declare worker readiness for queues, and handle events/tasks.

## Heartbeats

When `enable_heartbeat=True` (default), the template publishes `heartbeat`
events via the same `BrokerClient` connection. If broker connectivity is lost,
heartbeat publishing fails, allowing the heartbeat service to reap the
process.

Environment variables:

- `HEARTBEAT_INTERVAL` – seconds between heartbeats (default `3`).

## Example

```python
import asyncio
from shared.py.service_template import start_service

async def handle_task(task, client):
  await client.publish("example.done", {"ok": True}, correlationId=task["id"])

async def main():
  await start_service(
    id="example",
    queues=["example.queue"],
    topics=["example.topic"],
    handle_task=handle_task,
    enable_heartbeat=True,
  )
  await asyncio.Event().wait()

asyncio.run(main())
```

