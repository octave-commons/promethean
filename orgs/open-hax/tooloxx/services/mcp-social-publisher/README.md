# MCP Social Publisher

Render-hosted MCP server for publishing to pre-bound Bluesky and Discord targets.

## What it provides

- MCP OAuth 2.1 endpoints protected by GitHub login
- Admin UI gated by a pre-shared key at `/admin`
- GitHub allowlist managed from the admin UI
- Bound publishing targets for:
  - Bluesky (identifier + app password)
  - Discord (webhook URL)

## Runtime notes

- `PUBLIC_BASE_URL` defaults to `RENDER_EXTERNAL_URL` on Render.
- `ADMIN_AUTH_KEY` is required.
- `INITIAL_GITHUB_ALLOWED_USERS` can seed the allowlist on first boot.
- Runtime state is stored under `DATA_DIR`.

## MCP tools

- `publisher_list_targets`
- `publisher_publish_bluesky`
- `publisher_publish_discord`

## Local run

```bash
pnpm install
ADMIN_AUTH_KEY=change-me pnpm --filter @workspace/mcp-social-publisher dev
```
