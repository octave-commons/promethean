import asyncio

import asyncio
from shared.py import service_template


class DummyClient:
    def __init__(self, client_id=None):
        self.client_id = client_id
        self.task_handler = None
        self.dispatched = False

    async def connect(self):
        pass

    async def subscribe(self, topic, handler):
        await handler({"type": topic})

    def on_task(self, handler):
        self.task_handler = handler

    async def ready(self, queue):
        if not self.dispatched and self.task_handler:
            self.dispatched = True
            await self.task_handler({"id": "1", "queue": queue, "payload": {}})

    async def publish(self, *args, **kwargs):
        pass

    async def ack(self, *args, **kwargs):
        pass

    async def heartbeat(self, *args, **kwargs):
        pass


def test_handlers_receive_client(monkeypatch):
    dummy = DummyClient()
    monkeypatch.setattr(service_template, "BrokerClient", lambda client_id: dummy)
    events: list = []
    tasks: list = []

    async def handle_event(event, client):
        events.append((event, client))

    async def handle_task(task, client):
        tasks.append((task, client))

    client = asyncio.run(
        service_template.start_service(
            id="svc",
            queues=["q"],
            topics=["t"],
            handle_event=handle_event,
            handle_task=handle_task,
        )
    )
    assert events and events[0][1] is client
    assert tasks and tasks[0][1] is client
