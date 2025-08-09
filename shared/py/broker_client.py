# shared/py/broker_client.py

import asyncio
import websockets
import json
import uuid


class BrokerClient:
    def __init__(self, url="ws://localhost:7000", client_id=None):
        self.url = url
        self.client_id = client_id or str(uuid.uuid4())
        self.ws = None
        self.event_handlers = {}
        self.task_handler = None

    async def connect(self):
        self.ws = await websockets.connect(self.url)
        asyncio.create_task(self._listen())

    async def _listen(self):
        async for msg in self.ws:
            try:
                data = json.loads(msg)
                if data.get("action") == "task-assigned" and self.task_handler:
                    await self.task_handler(data["task"])
                elif "event" in data:
                    event = data["event"]
                    handler = self.event_handlers.get(event["type"])
                    if handler:
                        await handler(event)
            except Exception as e:
                print("[broker_client] error processing message:", e)

    async def subscribe(self, topic, handler):
        await self._send({"action": "subscribe", "topic": topic})
        self.event_handlers[topic] = handler

    async def unsubscribe(self, topic):
        await self._send({"action": "unsubscribe", "topic": topic})
        self.event_handlers.pop(topic, None)

    async def publish(self, type_, payload, **opts):
        message = {
            "type": type_,
            "payload": payload,
            "source": self.client_id,
            "timestamp": opts.get("timestamp") or self._now(),
        }
        if "correlationId" in opts:
            message["correlationId"] = opts["correlationId"]
        if "replyTo" in opts:
            message["replyTo"] = opts["replyTo"]
        await self._send({"action": "publish", "message": message})

    async def enqueue(self, queue, task):
        await self._send({"action": "enqueue", "queue": queue, "task": task})

    async def ready(self, queue):
        await self._send({"action": "ready", "queue": queue})

    async def ack(self, task_id):
        await self._send({"action": "ack", "taskId": task_id})

    async def heartbeat(self):
        await self._send({"action": "heartbeat"})

    def on_task(self, handler):
        self.task_handler = handler

    async def _send(self, obj):
        await self.ws.send(json.dumps(obj))

    def _now(self):
        from datetime import datetime

        return datetime.utcnow().isoformat() + "Z"


# Example usage:
# async def main():
#     client = BrokerClient()
#     await client.connect()
#     await client.subscribe("fs.change", lambda e: print("event:", e))
#     await client.enqueue("agent.think", {"input": "hello"})
#     client.on_task(lambda task: print("task:", task))
#     await client.ready("agent.think")

# asyncio.run(main())
