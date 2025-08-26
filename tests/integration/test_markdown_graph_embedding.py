import os
import sys
import types

import httpx
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

sys.path.append(os.path.join(os.path.dirname(__file__), "..", ".."))


markdown_graph = pytest.importorskip(
    "services.py.markdown_graph.main", reason="markdown_graph service not available"
)
create_graph_app = markdown_graph.create_app


embed_app = FastAPI()
embed_calls: list[dict] = []


@embed_app.post("/embed")
def embed_endpoint(payload: dict):
    embed_calls.append(payload)
    items = payload.get("items", [])
    return {"embeddings": [[0.0] * 256 for _ in items]}


def test_markdown_graph_and_embedding(tmp_path, monkeypatch):
    embed_url = "http://embed.local/embed"
    monkeypatch.setenv("EMBED_URL", embed_url)

    with httpx.Client(
        transport=httpx.ASGITransport(app=embed_app),
        base_url="http://embed.local",
    ) as embed_client:

        def _post(url, *args, **kwargs):
            if url == embed_url:
                return types.SimpleNamespace(
                    status_code=200,
                    json=lambda: embed_client.post(
                        "/embed", json=kwargs.get("json")
                    ).json(),
                )
            return markdown_graph.requests.post(url, *args, **kwargs)

        monkeypatch.setattr(markdown_graph.requests, "post", _post)

        graph_app = create_graph_app(db_path=":memory:", repo_path=str(tmp_path))
        with TestClient(graph_app) as graph_client:
            content = "# Title\nThis is a test with a [link](other.md) #tag"

            resp = graph_client.post(
                "/update", json={"path": "test.md", "content": content}
            )
            assert resp.status_code == 200

            links_resp = graph_client.get("/links/test.md")
            assert links_resp.status_code == 200
            assert links_resp.json()["links"] == ["other.md"]

            tag_resp = graph_client.get("/hashtags/tag")
            assert tag_resp.status_code == 200
            assert "test.md" in tag_resp.json()["files"]

    assert embed_calls, "graph did not call embedding service"
