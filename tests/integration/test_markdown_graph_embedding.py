import os
import sys
from fastapi.testclient import TestClient
import types

sys.path.append(os.path.join(os.path.dirname(__file__), "..", ".."))
sys.path.append(
    os.path.join(
        os.path.dirname(__file__), "..", "..", "services", "py", "markdown_graph"
    )
)

sys.modules.setdefault("sentence_transformers", types.SimpleNamespace())
sys.modules["sentence_transformers"].SentenceTransformer = object
sys.modules.setdefault("requests", types.SimpleNamespace())

from main import create_app as create_graph_app
from services.py.embedding_service.main import app as embed_app


def test_markdown_graph_and_embedding(tmp_path):
    # Initialize markdown graph service
    graph_app = create_graph_app(db_path=":memory:", repo_path=str(tmp_path))
    graph_client = TestClient(graph_app)
    embed_client = TestClient(embed_app)

    content = "# Title\nThis is a test with a [link](other.md) #tag"

    resp = graph_client.post("/update", json={"path": "test.md", "content": content})
    assert resp.status_code == 200

    links_resp = graph_client.get("/links/test.md")
    assert links_resp.status_code == 200
    assert links_resp.json()["links"] == ["other.md"]

    tag_resp = graph_client.get("/hashtags/tag")
    assert tag_resp.status_code == 200
    assert "test.md" in tag_resp.json()["files"]

    embed_resp = embed_client.post(
        "/embed",
        json={"items": [{"type": "text", "data": content}]},
    )
    assert embed_resp.status_code == 200
    embeddings = embed_resp.json()["embeddings"]
    assert len(embeddings) == 1
    assert len(embeddings[0]) == 256
