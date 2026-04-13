# ussy.promethean.rest deployment + migration

## Status
Complete (operational)

## Summary
Deploy the current `orgs/open-hax/proxx` build to `error@ussy.promethean.rest` using the workspace runtime home at `services/proxx`, and migrate the current local runtime state needed to preserve accounts, credentials, configs, env, and operator-facing data.

## Current state
Local source/runtime:
- Source repo: `orgs/open-hax/proxx` on `main` at `9f02aa1`.
- Runtime home: `services/proxx` with `.env`, `keys.json`, `models.json`, `data/`, and DB backups.
- Local compose stack is running and healthy on `8789/5174/5432`.
- Local DB is the runtime source of truth for credentials when `DATABASE_URL` is configured.
- Local `keys.json` is stale/incomplete relative to DB (`openai`: 43 file accounts vs 103 DB accounts; `ollama-cloud`: 31 file accounts vs 40 DB accounts).

Remote target:
- SSH reachable as `error@ussy.promethean.rest`.
- Docker + Compose are installed.
- `~/devel/orgs/open-hax/proxx` exists but is behind local `main`.
- `~/devel/services/proxx` exists with partial runtime material, but is missing at least `docker-compose.yml` and `models.json`.
- No proxy containers are currently running.
- Docker network `ai-infra` does not exist yet.

## Goals
- Run the current proxy code on the remote host.
- Preserve current credential/account state, including DB-only refreshed OAuth credentials.
- Preserve runtime config and operator data (`.env`, `models`, request/session files, prompt affinity).
- Verify remote health on API and web ports.

## Non-goals
- No reverse proxy / TLS / domain fronting work unless required by the compose stack.
- No schema or feature changes unless deployment reveals a blocking defect.

## Risks
- DB-only credential state will be lost if migration relies on `keys.json` alone.
- The local `events` table is very large; full DB migration increases transfer/restore time.
- Remote compose uses an external `ai-infra` network; deployment will fail unless created.
- Secrets must not be echoed into logs or receipts.

## Open questions
- Whether to migrate the large `events` analytics table or only operational state tables. Proposed default: migrate operational state first; skip `events` unless explicitly needed.
- Whether remote should retain `services/proxx` as the canonical runtime home. Proposed yes.

## Phases

### Phase 1: Preflight + inventory
- Confirm local and remote runtime inventory.
- Record local DB table counts and remote host prerequisites.
- Decide migration scope for DB tables.

### Phase 2: Sync source + runtime home
- Update `~/devel/orgs/open-hax/proxx` on remote to current `main`.
- Sync `services/proxx` runtime files to remote, excluding unnecessary local-only artifacts.
- Ensure `ai-infra` network exists.

### Phase 3: Migrate durable state
- Export local DB operational tables needed for credentials/config/auth/runtime continuity.
- Restore them into remote Postgres.
- Sync file-backed runtime state under `services/proxx/data/`.

### Phase 4: Start stack
- Launch remote compose from `~/devel/services/proxx`.
- Wait for health checks.

### Phase 5: Verify
- Confirm remote `/health` and web UI are reachable.
- Confirm provider/account counts match expected migrated state.
- Confirm model/config/session files are present.

## Affected paths
- `orgs/open-hax/proxx/specs/drafts/ussy-promethean-rest-deploy.md`
- `orgs/open-hax/proxx/receipts.log`
- runtime source: `services/proxx/**`
- remote runtime: `~/devel/services/proxx/**`
- remote source: `~/devel/orgs/open-hax/proxx/**`

## Outcome
- Remote source updated to `main@9f02aa1` and runtime home synced to `~/devel/services/proxx`.
- Remote Docker network `ai-infra` created.
- Remote Postgres started and restored with operational tables preserving DB-backed credential state.
- Remote API and web UI verified live on `http://ussy.promethean.rest:8789` and `http://ussy.promethean.rest:5174`.
- Remote health matches the expected migrated provider inventory: `openai=103`, `ollama-cloud=40`, `vivgrid=36`, `factory=1`, `gemini=1`, `requesty=1`.
- File-backed runtime state synced under `services/proxx/data/`.

## Unexpected complications
- The repo could not build from a clean checkout on the remote host because `.gitignore` used a broad `data/` rule that also ignored `src/lib/data/models-dev-pricing-data.ts` and `src/lib/data/models-dev-pricing.json`, which are required for the TypeScript build.
- Public access to the Vite preview on `:5174` returned `403` until `VITE_ALLOWED_HOSTS=ussy.promethean.rest` was set in the remote runtime `.env`.
- The local runtime had an effective `REQUESTY_API_TOKEN` in the running container that was not represented in the checked runtime `.env`, so it had to be carried into the remote `.env` explicitly.
- The large `events` analytics table was intentionally excluded from the remote DB restore; the remote app can recreate its schema on startup, but historical event analytics were not migrated.

## Definition of done
- Remote host runs the current proxy build successfully.
- Remote runtime contains migrated env/config/data material.
- Remote DB contains migrated credential/account state needed to preserve current accounts.
- Remote health verifies API + web availability.