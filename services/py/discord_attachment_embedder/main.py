import os
from typing import List

import chromadb

from shared.py.mongodb import discord_message_collection
from shared.py.embedding_client import EmbeddingServiceClient

COLLECTION_NAME = os.environ.get("CHROMA_COLLECTION", "discord_attachments")


def process_message(
    message: dict, collection, embedding_function: EmbeddingServiceClient
) -> None:
    docs: List[str] = []
    metadatas: List[dict] = []
    ids: List[str] = []
    items: List[dict] = []

    content = message.get("content")
    if content:
        docs.append(content)
        metadatas.append({"type": "text", "message_id": message["id"]})
        ids.append(f"msg-{message['id']}")
        items.append({"type": "text", "data": content})

    for attachment in message.get("attachments", []):
        attachment_type = attachment.get("content_type", "")
        if attachment_type and attachment_type.startswith("image/"):
            docs.append(attachment["url"])
            metadatas.append(
                {
                    "type": "image",
                    "message_id": message["id"],
                    "attachment_id": attachment["id"],
                    "filename": attachment.get("filename"),
                }
            )
            ids.append(f"att-{attachment['id']}")
            items.append({"type": "image_url", "data": attachment["url"]})

    if ids:
        embeddings = embedding_function(items)
        collection.add(
            documents=docs,
            metadatas=metadatas,
            ids=ids,
            embeddings=embeddings,
        )

    # Mark the message as processed even if no embeddings were generated
    discord_message_collection.update_one(
        {"id": message["id"]}, {"$set": {"embedded": True}}
    )


def main() -> None:
    client = chromadb.Client()
    embedding_function = EmbeddingServiceClient()
    collection = client.get_or_create_collection(COLLECTION_NAME)

    query = {"attachments": {"$exists": True, "$ne": []}, "embedded": {"$ne": True}}
    for message in discord_message_collection.find(query):
        process_message(message, collection, embedding_function)


if __name__ == "__main__":
    main()
