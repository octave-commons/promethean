# shared/py/service_template.py

import asyncio
from shared.py.broker_client import BrokerClient


async def start_service(
    id,
    queues=None,
    topics=None,
    handle_event=lambda event: None,
    handle_task=lambda task: None,
):
    queues = queues or []
    topics = topics or []

    client = BrokerClient(client_id=id)
    await client.connect()
    print(f"[{id}] connected to broker")

    # Subscribe to topics
    for topic in topics:

        async def event_handler(event, topic=topic):
            print(f"[{id}] received event: {event['type']}")
            try:
                await handle_event(event)
            except Exception as e:
                print(f"[{id}] error handling event {event['type']}: {e}")

        await client.subscribe(topic, event_handler)

    # Pull and handle tasks
    async def task_handler(task):
        print(f"[{id}] received task from {task['queue']}")
        try:
            await handle_task(task)
            await client.ack(task["id"])
        except Exception as e:
            print(f"[{id}] task failed: {e}")
            await client.fail(task["id"], str(e))
        await asyncio.sleep(0.1)
        await client.pull(task["queue"])

    if queues:
        client.on_task(task_handler)
        for queue in queues:
            await client.pull(queue)

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
