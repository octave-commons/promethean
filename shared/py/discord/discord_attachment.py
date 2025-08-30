import discord

from shared.py.mongodb import discord_message_collection


def format_attachment(attachment: discord.Attachment) -> dict:
    return {
        "id": attachment.id,
        "filename": attachment.filename,
        "size": attachment.size,
        "url": attachment.url,
        "content_type": attachment.content_type,
    }


def index_attachments(message: discord.Message) -> None:
    attachments = [format_attachment(a) for a in message.attachments]
    if not attachments:
        return
    print(
        f"Indexing attachments for message {message.id}: "
        f"{[a['filename'] for a in attachments]}"
    )
    return discord_message_collection.update_one(
        {"id": message.id}, {"$set": {"attachments": attachments}}
    )
