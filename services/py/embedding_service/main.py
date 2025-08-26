import asyncio
import os
from functools import lru_cache
from typing import List

from shared.py.service_template import run_service
from drivers import get_driver


@lru_cache(maxsize=1)
def _load(driver_name: str, function_name: str):
    driver = get_driver(driver_name)
    return driver.load(function_name)


def _embed(items, driver_name: str, function_name: str) -> List[List[float]]:
    driver = get_driver(driver_name)
    model = _load(driver_name, function_name)
    return driver.embed(items, function_name, model)


async def handle_task(task, client):
    print("embedding task recieved:")
    payload = task.get("payload", {})
    driver_name = payload.get("driver") or os.environ.get("EMBEDDING_DRIVER", "naive")

    function_name = payload.get("function") or os.environ.get(
        "EMBEDDING_FUNCTION", "simple"
    )
    items = payload.get("items", [])
    embeddings = _embed(items, driver_name, function_name)
    reply_to = payload.get("replyTo") or task.get("replyTo")
    print(driver_name, function_name, reply_to)
    if reply_to:
        await client.publish(
            "embedding.result",
            {"embeddings": embeddings},
            replyTo=reply_to,
            correlationId=task.get("id"),
        )


if __name__ == "__main__":
    asyncio.run(
        run_service(
            id="embedding",
            queues=["embedding.generate"],
            handle_task=handle_task,
        )
    )
