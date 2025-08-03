# Environment Variables

This document catalogs the environment variables referenced across the Promethean Framework.
Most services rely on these variables for configuration. Defaults are taken from the source files where available.

| Variable | Default | Description |
|----------|---------|-------------|
| `AGENT_NAME` | `"duck"` | Name of the active agent. Used to namespace MongoDB collections and service logs. |
| `MIN_TEMP` | `0.7` | Minimum temperature for model sampling. |
| `MAX_TEMP` | `0.9` | Maximum temperature for model sampling. |
| `MONGODB_HOST_NAME` | `"localhost"` | MongoDB host for shared services. |
| `MONGODB_ADMIN_DATABASE_NAME` | `"database"` | MongoDB database name. |
| `MONGODB_ADMIN_USER_NAME` | `"root"` | MongoDB username. |
| `MONGODB_ADMIN_USER_PASSWORD` | `"example"` | MongoDB password. |
| `DISCORD_TOKEN` | – | Discord bot token. Required for Cephalon and related services. |
| `DISCORD_CLIENT_USER_ID` | – | Discord application ID. |
| `DISCORD_CLIENT_USER_NAME` | – | Name of the Discord client user. |
| `DEFAULT_CHANNEL` | – | Default Discord channel ID for bot output. |
| `DEFAULT_CHANNEL_NAME` | – | Default channel name used for display. |
| `AUTHOR_ID` | – | Discord user ID of the bot author. |
| `AUTHOR_NAME` | `"error"` | Name of the bot author used in logs. |
| `PROFILE_CHANNEL_ID` | – | Discord channel used as the agent profile. |
| `GITHUB_PROJECT_ID` | – | Project column ID for board syncing scripts. |
| `GITHUB_TOKEN` | – | Token for GitHub API access. |
| `GITHUB_REPO` | – | Repository name in `owner/repo` form for issue sync. |
| `KANBAN_PATH` | `docs/agile/boards/kanban.md` | Path to the local Kanban board. |
| `VISION_HOST` | `http://localhost:5003` | URL of the vision service. |
| `VISION_STUB` | – | If set, vision service returns stub images. |
| `PORT` | `5003` | Port used by the vision service when running directly. |
| `NODE_ENV` | – | Node environment mode (production/test). |
| `NO_SCREENSHOT` | – | Disables screenshot capture in tests. |
| `PYTHONPATH` | repo root | Python path used in PM2 scripts. |
| `PYTHONUNBUFFERED` | `1` | Forces unbuffered Python output. |
| `PYTHONUTF8` | `1` | Forces UTF‑8 mode for Python scripts. |
| `FLASK_APP` | `app.py` | Flask entry point for the TTS service. |
| `FLASK_ENV` | `production` | Flask environment. |
| `DISCORD_GUILD_ID` | – | Example variable in `.env.example` for guild targeting. |
| `AUTHOR_USER_NAME` | – | Example author name in `.env.example`. |
| `PROFILE_CHANNEL` | – | Example profile channel variable in `.env.example`. |

These variables appear in multiple locations:

- Python settings module: `shared/py/settings.py`【F:shared/py/settings.py†L3-L29】
- Vision service: `services/vision/index.js`【F:services/vision/index.js†L5-L32】
- Cephalon agent: `services/cephalon/src/agent.ts`【F:services/cephalon/src/agent.ts†L19-L30】
- GitHub utilities: `scripts/github_board_sync.py` and `scripts/kanban_to_issues.py`【F:scripts/github_board_sync.py†L7-L10】【F:scripts/kanban_to_issues.py†L5-L7】
- PM2 ecosystem configuration sets common Python and Node environment values【F:ecosystem.config.js†L15-L18】【F:ecosystem.config.js†L53-L70】
- Development scripts under `agents/duck/scripts/` export additional variables for local runs【F:agents/duck/scripts/discord_indexer_run.sh†L5-L8】

Refer to this list when configuring new deployments or running tests locally.
