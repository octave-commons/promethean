# duck_embedder_run.sh

**Path**: `agents/duck/scripts/duck_embedder_run.sh`

**Purpose**: Launch the Discord embedder service for Duck. The script installs Node dependencies in `services/discord-embedder/` and executes the service via `ts-node`.

## Usage
```bash
./agents/duck/scripts/duck_embedder_run.sh
```
Execute from the repository root. `.env` and `.tokens` are sourced so the embedder can authenticate with Discord.

## Environment variables
- `DISCORD_TOKEN` – token used for Discord API calls
- Other values from `.env` such as `AGENT_NAME`
