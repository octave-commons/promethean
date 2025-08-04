# Discord Attachment Embedder Service

Generates a ChromaDB collection of embeddings for Discord message text and image attachments.
Uses a CLIP-based model so that related images and descriptions map to similar vectors.

## Setup

```bash
pipenv install
```

## Usage

Process indexed messages and build the collection:

```bash
pipenv run python main.py
```

#hashtags: #discord #chromadb #embeddings #service
