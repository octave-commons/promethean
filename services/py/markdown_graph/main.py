from fastapi import FastAPI
from pydantic import BaseModel
import argparse
import uvicorn
from graph import GraphDB


class UpdateRequest(BaseModel):
    path: str
    content: str


def create_app(db_path: str, repo_path: str, cold_start: bool = False) -> FastAPI:
    app = FastAPI()
    db = GraphDB(db_path=db_path, repo_path=repo_path)
    if cold_start:
        db.cold_start()
    app.state.db = db

    @app.post("/update")
    def update_file(req: UpdateRequest) -> dict:
        app.state.db.update_file(req.path, req.content)
        return {"status": "ok"}

    @app.get("/links/{path:path}")
    def get_links(path: str) -> dict:
        return {"links": app.state.db.get_links(path)}

    @app.get("/hashtags/{tag}")
    def get_hashtags(tag: str) -> dict:
        return {"files": app.state.db.get_files_with_tag(tag)}

    return app


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--db", default="graph.db")
    parser.add_argument("--repo", default=".")
    parser.add_argument("--cold-start", action="store_true")
    parser.add_argument("--host", default="0.0.0.0")
    parser.add_argument("--port", type=int, default=8000)
    args = parser.parse_args()

    app = create_app(args.db, args.repo, cold_start=args.cold_start)
    uvicorn.run(app, host=args.host, port=args.port)


if __name__ == "__main__":
    main()
