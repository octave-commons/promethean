# shared/py/service_template.py

import asyncio
import os
from shared.py.broker_client import BrokerClient


async def start_service(
    id,
    queues=None,
    topics=None,
    handle_event=lambda event, client: None,
    handle_task=lambda task, client: None,
    enable_heartbeat: bool = True,
):
    queues = queues or []
    topics = topics or []

    client = BrokerClient(client_id=id)
    await client.connect()
    print(f"[{id}] connected to broker")

    # Start broker-tied heartbeat loop so if the broker connection drops,
    # heartbeats stop and the heartbeat service can reap this process.
    hb_task = None
    if enable_heartbeat:

        async def heartbeat_loop():
            name = os.environ.get("PM2_PROCESS_NAME", id)
            pid = os.getpid()
            interval = float(os.environ.get("HEARTBEAT_INTERVAL", "3"))
            while True:
                try:
                    await client.publish("heartbeat", {"pid": pid, "name": name})
                except Exception as e:
                    print(f"[{id}] heartbeat publish failed: {e}")
                await asyncio.sleep(interval)

        hb_task = asyncio.create_task(heartbeat_loop())

    # Subscribe to topics
    for topic in topics:

        async def event_handler(event, topic=topic):
            print(f"[{id}] received event: {event['type']}")
            try:
                await handle_event(event, client)
            except Exception as e:
                print(f"[{id}] error handling event {event['type']}: {e}")

        await client.subscribe(topic, event_handler)

    # Receive and handle tasks
    async def task_handler(task):
        print(f"[{id}] received task from {task['queue']}")
        await client.ack(task["id"])
        try:
            await handle_task(task, client)
        except Exception as e:
            print(f"[{id}] task failed: {e}")
        await asyncio.sleep(0.1)
        await client.ready(task["queue"])

    if queues:
        client.on_task(task_handler)
        for queue in queues:
            await client.ready(queue)

    return client


# Example usage:
# async def main():
#     await start_service(
#         id="stt",
#         queues=["transcribe.audio"],
#         topics=["voice.input"],
#         handle_event=lambda e: print("event:", e),
#         handle_task=lambda t: print("task:", t),
#     )
# asyncio.run(main())
