import os
from typing import List

import chromadb

from shared.py.mongodb import discord_message_collection
from shared.py.embedding_client import EmbeddingServiceClient

COLLECTION_NAME = os.environ.get("CHROMA_COLLECTION", "discord_attachments")


def process_message(message: dict, collection) -> None:
    docs: List[str] = []
    metadatas: List[dict] = []
    ids: List[str] = []

    content = message.get("content")
    if content:
        docs.append(content)
        metadatas.append({"type": "text", "message_id": message["id"]})
        ids.append(f"msg-{message['id']}")

    for attachment in message.get("attachments", []):
        attachment_type = attachment.get("content_type", "")
        if attachment_type and attachment_type.startswith("image/"):
            docs.append(f"img:{attachment['url']}")
            metadatas.append(
                {
                    "type": "image",
                    "message_id": message["id"],
                    "attachment_id": attachment["id"],
                    "filename": attachment.get("filename"),
                }
            )
            ids.append(f"att-{attachment['id']}")

    if ids:
        collection.add(
            documents=docs,
            metadatas=metadatas,
            ids=ids,
        )
        discord_message_collection.update_one(
            {"id": message["id"]}, {"$set": {"embedded": True}}
        )


def main() -> None:
    client = chromadb.Client()
    embedding_function = EmbeddingServiceClient()
    collection = client.get_or_create_collection(
        COLLECTION_NAME, embedding_function=embedding_function
    )

    query = {"attachments": {"$exists": True, "$ne": []}, "embedded": {"$ne": True}}
    for message in discord_message_collection.find(query):
        process_message(message, collection)


if __name__ == "__main__":
    main()
