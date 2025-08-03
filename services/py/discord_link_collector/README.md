# Discord Link Collector

A service that scans Discord messages indexed by `discord_indexer` for image attachments and stores any links contained in the messages into a separate MongoDB collection.

## Usage

Run the service to process existing indexed messages:

```bash
python main.py
```

The script will iterate through indexed messages, look for image attachments, extract URLs from the message content, and save them in the `discord_links` collection.
