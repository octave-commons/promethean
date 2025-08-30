# Discord Attachment Indexer Service

Scans Discord messages for file attachments and stores their metadata in MongoDB.
Implemented in Python.

## Setup

```bash
pipenv install
```

## Usage

Run the crawler:

```bash
pipenv run python main.py
```

This service uses the canonical broker-tied heartbeat (`shared.py.heartbeat_broker`)
so that loss of broker connectivity stops heartbeats and allows the heartbeat
service to reap stale processes.

#hashtags: #discord #service #attachments #promethean
