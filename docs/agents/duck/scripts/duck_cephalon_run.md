# duck_cephalon_run.sh

**Path**: `agents/duck/scripts/duck_cephalon_run.sh`

**Purpose**: Build and start the Cephalon service configured for the Duck agent.
It compiles the TypeScript source in `services/cephalon/` and runs the resulting Node application.

## Usage
```bash
./agents/duck/scripts/duck_cephalon_run.sh
```
Run from the repository root. The script expects `.env` and `.tokens` to provide authentication values.

## Environment variables
- `DISCORD_TOKEN` – Discord bot token used by Cephalon
- `DISCORD_CLIENT_USER_ID` – application ID for the bot
- Variables in `.env` such as `AGENT_NAME` and `VISION_HOST`
