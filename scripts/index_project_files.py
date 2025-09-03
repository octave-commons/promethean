# SPDX-License-Identifier: GPL-3.0-only
"""Index all project files into a ChromaDB collection.

This script walks the repository tree, reading each file and storing its
contents in a ChromaDB collection. The file path is used as the document
ID and stored in the metadata for easy retrieval.

Usage:

```bash
python scripts/index_project_files.py
```
"""

from __future__ import annotations

import os
from typing import Iterable, List

import chromadb
from chromadb.config import Settings


SKIP_DIRS = {".git", "node_modules", "__pycache__", ".chromadb"}


def iter_project_files(root_dir: str) -> Iterable[str]:
    """Yield file paths under ``root_dir`` excluding ``SKIP_DIRS``."""

    for base, dirs, files in os.walk(root_dir):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for name in files:
            yield os.path.join(base, name)


def index_project_files(
    root_dir: str = ".",
    collection_name: str = "project_files",
    persist_directory: str = ".chromadb",
) -> int:
    """Index files beneath ``root_dir`` into a ChromaDB collection.

    Returns the number of files indexed.
    """

    client = chromadb.Client(
        Settings(chroma_db_impl="duckdb+parquet", persist_directory=persist_directory)
    )
    collection = client.get_or_create_collection(collection_name)

    documents: List[str] = []
    ids: List[str] = []
    metadatas: List[dict] = []

    for path in iter_project_files(root_dir):
        try:
            with open(path, "r", encoding="utf-8", errors="ignore") as fh:
                text = fh.read()
        except Exception as exc:  # pragma: no cover - log and skip
            print(f"Skipping {path}: {exc}")
            continue

        documents.append(text)
        ids.append(path)
        metadatas.append({"path": path})

    if documents:
        collection.upsert(ids=ids, documents=documents, metadatas=metadatas)

    return len(documents)


def main() -> None:
    count = index_project_files()
    print(f"Indexed {count} files into ChromaDB collection 'project_files'.")


if __name__ == "__main__":  # pragma: no cover - CLI entry
    main()

