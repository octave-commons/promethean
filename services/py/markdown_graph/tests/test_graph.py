import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))
import os
from fastapi.testclient import TestClient
from main import create_app


def make_file(path: str, content: str) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)


def test_cold_start_and_update(tmp_path):
    repo = tmp_path
    readme = repo / "readme.md"
    doc1 = repo / "docs" / "one.md"
    doc2 = repo / "docs" / "two.md"
    make_file(readme, f"[One](docs/one.md) #root")
    make_file(doc1, f"[Two](two.md) #tag1")
    make_file(doc2, "#tag2")

    app = create_app(
        db_path=str(repo / "graph.db"), repo_path=str(repo), cold_start=True
    )
    client = TestClient(app)

    assert client.get(f"/links/{readme.relative_to(repo)}").json()["links"] == [
        str(doc1.relative_to(repo))
    ]
    assert client.get("/hashtags/tag1").json()["files"] == [str(doc1.relative_to(repo))]

    client.post(
        "/update",
        json={
            "path": str(doc2.relative_to(repo)),
            "content": "[One](../docs/one.md) #tag2",
        },
    )
    assert client.get(f"/links/{doc2.relative_to(repo)}").json()["links"] == [
        str(doc1.relative_to(repo))
    ]
