import os

import chromadb

from shared.py.mongodb import discord_message_collection
from shared.py.embedding_client import EmbeddingServiceClient
from shared.py.discord_attachment_embedder import (
    process_message as _process_message,
)

COLLECTION_NAME = os.environ.get("CHROMA_COLLECTION", "discord_attachments")


def process_message(message: dict, collection, embedding_function) -> None:
    """Thin wrapper around shared.process_message."""
    _process_message(message, collection, embedding_function)


def main() -> None:
    client = chromadb.Client()
    embedding_function = EmbeddingServiceClient()
    collection = client.get_or_create_collection(COLLECTION_NAME)

    query = {"attachments": {"$exists": True, "$ne": []}, "embedded": {"$ne": True}}
    for message in discord_message_collection.find(query):
        process_message(message, collection, embedding_function)


if __name__ == "__main__":
    main()
