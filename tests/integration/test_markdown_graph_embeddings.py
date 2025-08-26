import os
import sys
import importlib
import asyncio
import httpx
from fastapi.testclient import TestClient

graph_module = importlib.import_module("services.py.markdown_graph.graph")
sys.modules["graph"] = graph_module
from services.py.markdown_graph.main import create_app
from services.py.embedding_service.main import app as embed_app
from shared.py.embedding_client import EmbeddingServiceClient


def make_file(path: str, content: str) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)


def test_graph_calls_embedding(monkeypatch, tmp_path):
    repo = tmp_path
    readme = repo / "readme.md"
    make_file(readme, "hello")

    calls = {"count": 0, "json": None}

    transport = httpx.ASGITransport(app=embed_app)
    async_client = httpx.AsyncClient(transport=transport, base_url="http://embed.local")

    def _post(url, json, timeout):
        calls["count"] += 1
        calls["json"] = json
        assert url == "http://embed.local/embed"
        return asyncio.run(async_client.post(url, json=json))

    monkeypatch.setattr("shared.py.embedding_client.requests.post", _post)
    monkeypatch.setenv("EMBEDDING_SERVICE_URL", "http://embed.local/embed")

    from services.py.markdown_graph import graph

    original_update = graph.GraphDB.update_file

    def update_with_embed(self, path, content):
        original_update(self, path, content)
        EmbeddingServiceClient()([content])

    monkeypatch.setattr(graph.GraphDB, "update_file", update_with_embed)

    app = create_app(
        db_path=str(repo / "graph.db"),
        repo_path=str(repo),
    )

    try:
        with TestClient(app) as client:
            client.post(
                "/update",
                json={"path": str(readme.relative_to(repo)), "content": "hello"},
            )
    finally:
        asyncio.run(async_client.aclose())

    assert calls["count"] == 1
    assert calls["json"] == {"items": [{"type": "text", "data": "hello"}]}
