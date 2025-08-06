import os
from functools import lru_cache
from typing import List

from fastapi import FastAPI, WebSocket
from pydantic import BaseModel

from .drivers import get_driver
from shared.py.utils import websocket_endpoint

app = FastAPI()


class EmbedItem(BaseModel):
    type: str
    data: str


class EmbedRequest(BaseModel):
    items: List[EmbedItem]
    driver: str | None = None
    function: str | None = None


class EmbedResponse(BaseModel):
    embeddings: List[List[float]]


@lru_cache(maxsize=1)
def _load(driver_name: str, function_name: str):
    driver = get_driver(driver_name)
    return driver.load(function_name)


@app.post("/embed", response_model=EmbedResponse)
def embed(request: EmbedRequest) -> EmbedResponse:
    driver_name = request.driver or os.environ.get("EMBEDDING_DRIVER", "naive")
    function_name = request.function or os.environ.get("EMBEDDING_FUNCTION", "simple")
    driver = get_driver(driver_name)
    model = _load(driver_name, function_name)
    embeddings = driver.embed(request.items, function_name, model)
    return EmbedResponse(embeddings=embeddings)


@app.websocket("/ws/embed")
@websocket_endpoint
async def embed_ws(ws: WebSocket) -> None:
    """WebSocket endpoint for generating embeddings.

    Expects a JSON payload matching :class:`EmbedRequest` and returns the
    embeddings as JSON, mirroring the REST ``/embed`` endpoint.
    """
    data = await ws.receive_json()
    request = EmbedRequest(**data)
    driver_name = request.driver or os.environ.get("EMBEDDING_DRIVER", "naive")
    function_name = request.function or os.environ.get("EMBEDDING_FUNCTION", "simple")
    driver = get_driver(driver_name)
    model = _load(driver_name, function_name)
    embeddings = driver.embed(request.items, function_name, model)
    await ws.send_json({"embeddings": embeddings})
