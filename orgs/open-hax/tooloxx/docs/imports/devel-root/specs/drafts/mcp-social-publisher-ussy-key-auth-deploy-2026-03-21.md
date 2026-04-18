# mcp-social-publisher ussy key-auth deploy draft

- status: active
- created: 2026-03-21
- owner: err
- priority: high

## Goal
Deploy the standalone `mcp-social-publisher-live` app to `error@ussy.promethean.rest` and protect MCP access with a static key instead of OAuth.

## Working assumptions
- Target app is the standalone repo at `mcp-social-publisher-live/`, not the workspace service at `services/mcp-social-publisher/`.
- Public exposure should avoid Render and run directly on `ussy.promethean.rest` infrastructure.
- A static bearer-style key is acceptable for `/mcp`.
- Admin UI may remain separately protected by `ADMIN_AUTH_KEY`.

## Open questions
- Whether the currently deployed Render config/targets need migration, or whether a fresh empty config is acceptable.

## Risks
- Exposing OAuth metadata while actually using static key auth, confusing clients.
- Choosing a new hostname that does not resolve in DNS.
- Breaking existing `services/proxx/Caddyfile` routing on `ussy.promethean.rest`.
- Leaking the static key through logs, shell history, or receipts.

## Evidence gathered
- `mcp-social-publisher-live/` is a standalone git repo with no workspace-only runtime deps.
- Remote host is reachable via `ssh error@ussy.promethean.rest`.
- Remote host has Node 18 and Docker Compose, but not `pnpm`.
- Existing reverse proxy config lives at `services/proxx/Caddyfile` on the remote host.
- Arbitrary new `*.ussy.promethean.rest` names tested locally do not currently resolve.
- `npx --yes pnpm@10` and `npx --yes pm2` work remotely without requiring root-level global installs.

## Decisions
- Use SSH/tunnel-first deployment instead of adding a new public DNS route right now.
- Bind the service to `127.0.0.1:10000` on the remote host.
- Protect `/mcp` with a static bearer-style key via `MCP_AUTH_MODE=key` and `MCP_AUTH_KEY`.
- Keep the admin UI separately protected by a generated `ADMIN_AUTH_KEY`.
- Use `npx pm2` on the remote host for process persistence.

## Affected files (likely)
- `mcp-social-publisher-live/src/main.ts`
- `mcp-social-publisher-live/.env.example`
- `mcp-social-publisher-live/README.md`
- `specs/drafts/mcp-social-publisher-ussy-key-auth-deploy-2026-03-21.md`

## Phases

### Phase 1 — Decide public route and auth mode
- Confirm route strategy from current DNS/Caddy constraints.
- Add static key auth mode to the standalone app.

### Phase 2 — Build and prepare runtime
- Build the standalone app locally.
- Sync the needed repo/runtime files to `error@ussy.promethean.rest`.
- Create remote env/runtime dirs with non-logged secrets.

### Phase 3 — Expose and verify
- Start the service on the remote host.
- Verify `/health` and key-protected `/mcp` behavior.

## Execution notes
- Added `HOST`, `MCP_AUTH_MODE`, and `MCP_AUTH_KEY` env support to `mcp-social-publisher-live`.
- In `key` mode, the service skips MCP OAuth metadata/routes and accepts either `Authorization: Bearer <MCP_AUTH_KEY>` or `x-api-key: <MCP_AUTH_KEY>` for `/mcp`.
- Synced the standalone repo to `~/apps/mcp-social-publisher-live` on `error@ussy.promethean.rest`.
- Wrote remote runtime files:
  - `~/apps/mcp-social-publisher-live/.env`
  - `~/apps/mcp-social-publisher-live/secrets/mcp-auth-key.txt`
  - `~/apps/mcp-social-publisher-live/secrets/admin-auth-key.txt`
- Started the service as `mcp-social-publisher-live` via `npx pm2`.

## Verification
- Local build: `cd mcp-social-publisher-live && npm run build`
- Remote health: `GET http://127.0.0.1:10000/health` -> `200`
- Remote auth gate:
  - unauthenticated `GET /mcp` -> `401`
  - authenticated `GET /mcp` with generated bearer key -> non-`401` (`400`, proving auth passed through to the MCP router)

## Definition of done
- The app is running on `error@ussy.promethean.rest`.
- `/mcp` rejects missing/incorrect key and accepts the configured key.
- Access is available through SSH tunneling to `127.0.0.1:10000`.
- No secrets are emitted into tracked files or receipts.
