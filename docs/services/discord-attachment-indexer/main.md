# main.py

**Path**: `services/py/discord_attachment_indexer/main.py`

**Description**: Discord client that scans channels for new messages, extracts attachment metadata, updates MongoDB records, and maintains per-channel cursors while reporting liveness via `HeartbeatClient`.

## Dependencies
- hy
- discord.py
- asyncio
- random
- shared.py.settings
- shared.py.mongodb
- shared.py.heartbeat_client
- typing

## Dependents
- `services/py/discord_attachment_indexer/tests/test_discord_attachment_indexer.py`
