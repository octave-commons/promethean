# index_project_files.py

Indexes every file in the repository into a [ChromaDB](https://www.trychroma.com/) collection.

This utility script is useful for creating an embedding-powered search index of the project files for later retrieval or semantic search.

Run it with:

```bash
python scripts/index_project_files.py
```

The collection will be persisted in a `.chromadb/` directory at the repository root.

