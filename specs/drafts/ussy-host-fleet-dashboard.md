# ussy host fleet dashboard

## Status
Complete

## Goal
Add a single proxx-hosted dashboard view that shows container inventory and routed subdomains across the ussy fleet, starting with `ussy.promethean.rest` and `ussy3.promethean.rest`, while tolerating future hosts that are unreachable or not yet fully accessible.

## Background
- Proxx already has a built-in React/Vite console and authenticated UI API surface.
- `services/proxx/Caddyfile` is currently the production source of truth for `ussy.promethean.rest` public subdomain routing.
- `ussy3.promethean.rest` is the current staging proxy host.
- The user's wording about a future third host is ambiguous, so the dashboard should be target-config driven rather than hard-coded to only two hosts.

## Constraints
- Avoid SSH from the browser.
- Prefer reusing proxx rather than creating a brand-new dashboard app.
- Do not make the whole page fail if one host is unreachable or misconfigured.
- Preserve unrelated runtime secrets; host-specific auth tokens should be env-configured.

## Plan
1. Add a host-dashboard backend module that can:
   - inspect local Docker containers through the Docker socket
   - parse local runtime Caddy routes from a mounted runtime root
   - aggregate remote host snapshots over HTTPS
2. Add authenticated UI routes for `self` and aggregated host overview.
3. Add a dedicated web console Hosts page.
4. Make local runtime context (`docker.sock`, runtime repo dir) an explicit opt-in compose overlay.
5. Document the required env shape for multi-host operation.

## Risks
- Docker socket exposure is powerful; `docker.sock:ro` is not a real security boundary, so keep the mounts opt-in and restrict the page to admin-level auth.
- Remote hosts may use different proxy auth tokens; config must allow per-host token env names.
- Not every runtime will have a live `Caddyfile`; the dashboard must degrade gracefully.

## Affected files
- `src/lib/host-dashboard.ts`
- `src/lib/ui-routes.ts`
- `src/tests/host-dashboard.test.ts`
- `web/src/lib/api.ts`
- `web/src/pages/HostsPage.tsx`
- `web/src/App.tsx`
- `web/src/styles.css`
- `docker-compose.yml`
- `.env.example`
- `README.md`
- `services/proxx/docker-compose.yml`
- `services/proxx/.env.example`
- `services/proxx/README.md`

## Definition of done
- The proxx console has a Hosts page.
- The Hosts page shows both local and remote host cards in one view.
- Unreachable hosts render as error cards instead of breaking the dashboard.
- Container inventory and routed subdomains are both visible when the runtime provides them.
- Tests and builds pass.

## Implementation notes
- Added `src/lib/host-dashboard.ts` for target loading, Docker socket inspection, Caddyfile parsing, and remote host snapshot fetches.
- Added authenticated `/api/ui/hosts/self` and `/api/ui/hosts/overview` routes in `ui-routes.ts`.
- Added `web/src/pages/HostsPage.tsx` plus API/types/nav/styles for the new console page.
- Updated the source/runtime compose setup so Docker/runtime inspection can be enabled explicitly when needed instead of being on by default.
- Kept the host list config-driven via `HOST_DASHBOARD_TARGETS_JSON` so future blocked hosts can be present as error cards before access is fixed.

## Verification
- `cd proxx && pnpm test`
- `cd proxx && pnpm web:build`
