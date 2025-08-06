# main.py

**Path**: `services/py/discord_attachment_embedder/main.py`

**Description**: Scans Discord messages for text and image attachments, generates embeddings via an embedding service, and stores results in ChromaDB while marking messages as processed in MongoDB.

## Dependencies
- os
- chromadb
- shared.py.mongodb
- shared.py.embedding_client

## Dependents
- `services/py/discord_attachment_embedder/tests/test_embedder.py`
