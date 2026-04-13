# ussy.promethean.rest SSL + pi connection

## Status
Complete (operational)

## Summary
Add a trusted HTTPS entrypoint for the remote proxy deployment on `ussy.promethean.rest`, route both the API and web console behind TLS, and repoint local pi's Open Hax custom providers to the remote HTTPS origin.

## Current state
- Remote proxy is already running via `~/devel/services/proxx/docker-compose.yml`.
- Public HTTP access currently works only on explicit ports (`:8789` API, `:5174` web).
- Local pi custom providers are hardcoded to `http://127.0.0.1:8789/v1` in `~/.pi/agent/extensions/custom-providers.ts`.
- Local pi does not yet follow the documented `OPEN_HAX_OPENAI_PROXY_URL` / `OPEN_HAX_OPENAI_PROXY_AUTH_TOKEN` env convention.

## Goals
- Terminate TLS on `https://ussy.promethean.rest`.
- Route `/v1`, `/api`, `/auth`, and `/health` to the API service.
- Route `/` and other frontend assets to the web service.
- Update local pi configuration so Open Hax providers use the remote HTTPS origin.
- Verify local pi can successfully talk to the remote proxy.

## Risks
- ACME issuance will fail if ports `80`/`443` are blocked or DNS points elsewhere.
- Vite preview returns `403` for unknown hosts unless `VITE_ALLOWED_HOSTS` is aligned.
- Leaving the old default token in place would expose the remote proxy to trivial reuse.

## Phases

### Phase 1: Runtime config
- Add a TLS reverse proxy service to `services/proxx/docker-compose.yml`.
- Add a Caddy config that path-routes API and web traffic.
- Ensure runtime env includes the public host for the web preview allow-list.
- Rotate the proxy auth token.

### Phase 2: Remote deploy
- Sync the runtime changes to `error@ussy.promethean.rest`.
- Start/recreate the remote stack and confirm Caddy obtains certificates.
- Verify HTTPS responses for both API and web routes.

### Phase 3: Local pi hookup
- Update `~/.pi/agent/extensions/custom-providers.ts` to use env-configurable Open Hax base URLs and token names.
- Persist the remote proxy URL + auth token in the local shell environment.
- Run a minimal `pi` request against the remote provider to confirm end-to-end connectivity.

## Affected files
- `services/proxx/docker-compose.yml`
- `services/proxx/Caddyfile`
- `services/proxx/README.md` (if needed)
- `~/.pi/agent/extensions/custom-providers.ts`
- `~/.bashrc`
- `orgs/open-hax/proxx/receipts.log`

## Outcome
- Added a Caddy TLS overlay at `services/proxx/docker-compose.ssl.yml` with `services/proxx/Caddyfile`.
- Let’s Encrypt issued a trusted certificate for `ussy.promethean.rest`.
- `http://ussy.promethean.rest` now redirects to HTTPS.
- `https://ussy.promethean.rest/` serves the web console.
- `https://ussy.promethean.rest/v1/*`, `/api*`, `/auth*`, and `/health` route to the API service.
- Rotated the proxy auth token and updated runtime env accordingly.
- Updated `~/.pi/agent/extensions/custom-providers.ts` so Open Hax providers follow `OPEN_HAX_OPENAI_PROXY_URL` and `OPEN_HAX_OPENAI_PROXY_AUTH_TOKEN`.
- Persisted those env vars in the local shell startup files so new `pi` invocations use the remote HTTPS proxy.
- Verified `pi --list-models open-hax` and a real `pi --model open-hax-completions/gpt-5.4 -p "Reply with exactly OK."` request worked over the remote HTTPS endpoint.

## Unexpected complications
- Login-shell env propagation initially failed because `~/.bash_profile` takes precedence over `~/.profile`; the proxy env block had to be added there as well.
- The Caddy overlay was kept separate from the base compose file to avoid forcing local non-SSL runs to bind ports `80` and `443`.

## Definition of done
- `https://ussy.promethean.rest` serves the web console.
- `https://ussy.promethean.rest/v1/*` reaches the API with a valid certificate.
- Local pi defaults can reach the remote proxy via HTTPS with the configured auth token.
- Connectivity is verified with at least one real `pi` request.