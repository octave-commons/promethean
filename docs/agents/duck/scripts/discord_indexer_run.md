# discord_indexer_run.sh

**Path**: `agents/duck/scripts/discord_indexer_run.sh`

**Purpose**: Start the Discord indexer service for Duck. It installs Python dependencies via `pipenv` and launches the indexer with the agent's environment loaded from `.env` and `.tokens`.

## Usage
```bash
./agents/duck/scripts/discord_indexer_run.sh
```
Run this from the repository root. The script ensures `services/discord-indexer` is installed and then executes `pipenv run python -m main`.

## Environment variables
- `DISCORD_TOKEN` – bot token used by the indexer
- `DISCORD_CLIENT_USER_ID` – application ID for the bot
- `AGENT_NAME` – used to set `DISCORD_CLIENT_USER_NAME`
- `PYTHONPATH` – set to the repo root for module resolution
- `PYTHONUNBUFFERED` – forces unbuffered output
- `PYTHONUTF8` – forces UTF-8 mode
