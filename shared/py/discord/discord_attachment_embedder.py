"""Shared routines for embedding Discord message attachments.

This module exposes :func:`process_message` which extracts text and image
data from a Discord message, retrieves embeddings using a supplied embedding
function and stores the results in a ChromaDB collection.  It also marks the
message document as embedded via ``shared.py.mongodb.discord_message_collection``.
"""

from typing import List

from shared.py.mongodb import discord_message_collection


def process_message(message: dict, collection, embedding_function) -> None:
    """Embed a Discord message and store the results.

    Parameters
    ----------
    message:
        Message document sourced from MongoDB.
    collection:
        ChromaDB collection where the embeddings will be stored.
    embedding_function:
        Callable that accepts a list of items to embed and returns a list of
        embedding vectors.
    """

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


__all__ = ["process_message"]
