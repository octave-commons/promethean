import asyncio
import logging
import os
from functools import lru_cache
from typing import List

from shared.py.service_template import start_service
from .drivers import get_driver


logger = logging.getLogger(__name__)


@lru_cache(maxsize=1)
def _load(driver_name: str, function_name: str):
    driver = get_driver(driver_name)
    return driver.load(function_name)


def _embed(items, driver_name: str, function_name: str) -> List[List[float]]:
    """Generate embeddings for ``items`` using ``driver_name`` and ``function_name``.

    Parameters
    ----------
    items : list
        A list of items (dicts or objects with ``data`` attributes) to embed.
    driver_name : str
        The driver backend to use.
    function_name : str
        The specific embedding function to invoke.

    Returns
    -------
    List[List[float]]
        A list of embedding vectors.
    """

    driver = get_driver(driver_name)
    model = _load(driver_name, function_name)
    return driver.embed(items, function_name, model)


async def handle_task(task, client):
    """Handle a single embedding task.

    Parameters
    ----------
    task : dict
        Task message containing a ``payload`` with ``items``, ``driver`` and
        ``function`` fields and optional ``replyTo``.
    client : Any
        Broker client used to publish results.
    """

    logger.info("embedding task received")
    payload = task.get("payload", {})

    driver_name = payload.get("driver") or os.environ.get("EMBEDDING_DRIVER")
    function_name = payload.get("function") or os.environ.get("EMBEDDING_FUNCTION")
    items = payload.get("items")

    reply_to = payload.get("replyTo") or task.get("replyTo")

    missing = []
    if items is None:
        missing.append("items")
    if not driver_name:
        missing.append("driver")
    if not function_name:
        missing.append("function")

    if missing:
        error_msg = f"missing required fields: {', '.join(missing)}"
        logger.error(error_msg)
        if reply_to:
            await client.publish(
                "embedding.failed",
                {"error": error_msg},
                replyTo=reply_to,
                correlationId=task.get("id"),
            )
        return

    try:
        embeddings = _embed(items, driver_name, function_name)
    except Exception as exc:  # pylint: disable=broad-except
        logger.exception("embedding failed: %s", exc)
        if reply_to:
            await client.publish(
                "embedding.failed",
                {"error": str(exc)},
                replyTo=reply_to,
                correlationId=task.get("id"),
            )
        return

    logger.info("driver=%s function=%s reply=%s", driver_name, function_name, reply_to)
    if reply_to:
        await client.publish(
            "embedding.result",
            {"embeddings": embeddings},
            replyTo=reply_to,
            correlationId=task.get("id"),
        )


async def main():
    await start_service(
        id="embedding",
        queues=["embedding.generate"],
        handle_task=handle_task,
    )
    await asyncio.Event().wait()


if __name__ == "__main__":
    asyncio.run(main())
