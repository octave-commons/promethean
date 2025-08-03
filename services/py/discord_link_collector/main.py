import re

from shared.py.mongodb import (
    discord_message_collection,
    discord_link_collection,
)

URL_REGEX = r"https?://\S+"
IMAGE_EXTENSIONS = (".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp")


def has_image_attachments(message: dict) -> bool:
    """Return True if the message has at least one image attachment."""
    for att in message.get("attachments", []):
        url = att.get("url", "").lower()
        if url.endswith(IMAGE_EXTENSIONS):
            return True
    return False


def extract_links(text: str) -> list[str]:
    """Extract all URLs from the provided text."""
    return re.findall(URL_REGEX, text or "")


def collect_links(
    message_collection=discord_message_collection,
    link_collection=discord_link_collection,
) -> None:
    """Scan messages for image attachments and store links in a new collection."""
    for message in message_collection.find(
        {"attachments": {"$exists": True, "$ne": []}}
    ):
        if not has_image_attachments(message):
            continue
        links = extract_links(message.get("content", ""))
        if not links:
            continue
        link_collection.update_one(
            {"message_id": message["id"]},
            {
                "$set": {
                    "message_id": message["id"],
                    "links": links,
                    "channel": message.get("channel"),
                    "author": message.get("author"),
                }
            },
            upsert=True,
        )


if __name__ == "__main__":
    collect_links()
