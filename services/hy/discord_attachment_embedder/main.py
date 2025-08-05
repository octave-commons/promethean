import os
from io import BytesIO
from typing import List

import chromadb
import requests
from PIL import Image
from sentence_transformers import SentenceTransformer

from shared.py.mongodb import discord_message_collection

MODEL_NAME = os.environ.get("CLIP_MODEL", "clip-ViT-B-32")
COLLECTION_NAME = os.environ.get("CHROMA_COLLECTION", "discord_attachments")


def get_embedding_model() -> SentenceTransformer:
    return SentenceTransformer(MODEL_NAME)


def fetch_image(url: str) -> Image.Image:
    response = requests.get(url)
    response.raise_for_status()
    return Image.open(BytesIO(response.content))


def process_message(message: dict, collection, model: SentenceTransformer) -> None:
    docs: List[str] = []
    embeddings: List[List[float]] = []
    metadatas: List[dict] = []
    ids: List[str] = []

    content = message.get("content")
    if content:
        emb = model.encode([content])[0].tolist()
        docs.append(content)
        embeddings.append(emb)
        metadatas.append({"type": "text", "message_id": message["id"]})
        ids.append(f"msg-{message['id']}")

    for attachment in message.get("attachments", []):
        if attachment.get("content_type", "").startswith("image/"):
            image = fetch_image(attachment["url"])
            emb = model.encode([image])[0].tolist()
            docs.append(attachment["url"])
            embeddings.append(emb)
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
            embeddings=embeddings,
            metadatas=metadatas,
            ids=ids,
        )
        discord_message_collection.update_one(
            {"id": message["id"]}, {"$set": {"embedded": True}}
        )


def main() -> None:
    client = chromadb.Client()
    collection = client.get_or_create_collection(COLLECTION_NAME)
    model = get_embedding_model()

    query = {"attachments": {"$exists": True, "$ne": []}, "embedded": {"$ne": True}}
    for message in discord_message_collection.find(query):
        process_message(message, collection, model)


if __name__ == "__main__":
    main()
