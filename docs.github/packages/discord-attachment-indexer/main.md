# main.py

**Path**: `services/py/discord_attachment_indexer/main.py`

**Description**: Discord client that scans channels for new messages, extracts attachment metadata, updates MongoDB records, and maintains per-channel cursors while reporting liveness via the canonical broker-tied heartbeat.

## Dependencies
- hy
- discord.py
- asyncio
- random
- shared.py.settings
- shared.py.mongodb
- shared.py.heartbeat_broker
- typing

## Dependents
- `services/py/discord_attachment_indexer/tests/test_discord_attachment_indexer.py`
