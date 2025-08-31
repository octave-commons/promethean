# shared/py/broker_client.py

import asyncio
import json
import logging
import uuid

from websockets.asyncio.client import connect
from websockets.exceptions import ConnectionClosedError


logger = logging.getLogger(__name__)


class BrokerClient:
    def __init__(self, url="ws://localhost:7000", client_id=None):
        self.url = url
        self.client_id = client_id or str(uuid.uuid4())
        self.ws = None
        self.event_handlers = {}
        self.task_handler = None

    async def connect(self):
        # Allow large broker messages (audio, embeddings, etc.)
        # websockets defaults to ~1MiB max; disable the limit here.
        self.ws = await connect(self.url, max_size=None)
        asyncio.create_task(self._listen())

    async def _listen(self):
        """Listen for broker messages and dispatch them to registered handlers."""
        try:
            async for msg in self.ws:
                try:
                    data = json.loads(msg)
                except json.JSONDecodeError:
                    logger.exception("Failed to decode broker message: %s", msg)
                    continue

                if data.get("action") == "task-assigned" and self.task_handler:
                    try:
                        await self.task_handler(data["task"])
                    except Exception:
                        logger.exception("Error in task handler")
                elif "event" in data:
                    event = data["event"]
                    handler = self.event_handlers.get(event.get("type"))
                    if handler:
                        try:
                            await handler(event)
                        except Exception:
                            logger.exception(
                                "Error in event handler for %s", event.get("type")
                            )
                else:
                    logger.warning("Unhandled broker message: %s", data)
        except ConnectionClosedError as e:
            logger.warning("[broker_client] connection closed: %s", e)
        except Exception:
            logger.exception("[broker_client] listener crashed")

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
