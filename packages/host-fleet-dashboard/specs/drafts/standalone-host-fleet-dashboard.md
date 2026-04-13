# Standalone host fleet dashboard

## Status
Complete

## Goal
Create a standalone dashboard service that shows container inventory and routed subdomains across the ussy host fleet without tying the feature to any one service such as proxx.

## Why standalone
- The dashboard scope is host-level and service-agnostic.
- It must cover containers and routes for services beyond proxx.
- It should keep future or broken hosts visible as degraded/error cards instead of disappearing them.

## Initial hosts
- `ussy.promethean.rest`
- `ussy3.promethean.rest`
- future hosts via configuration, even if SSH/auth currently fails

## Constraints
- Do not put this inside a service-specific console.
- Browser should never need raw SSH access.
- Prefer local host introspection for the current host and remote HTTPS fan-out for other hosts.
- Missing access to one host must not break the whole page.
- Preserve current dirty changes in unrelated repos/submodules.

## Plan
1. Create a new standalone service under `services/host-fleet-dashboard`.
2. Add host target configuration via env JSON.
3. Implement backend collectors that can:
   - inspect the local Docker engine through the Docker socket
   - parse the first readable local Caddyfile from configured candidate paths
   - fetch remote host snapshots over HTTPS from other deployed collectors
4. Parse Caddy routes into host/subdomain → upstream summaries.
5. Serve a small authenticated dashboard UI with one card per host.
6. Add tests for target parsing and Caddy/docker parsing.
7. Deploy the service behind `/fleet/` on the existing ussy and ussy3 Caddy edges.

## Risks
- Local Docker socket access is powerful, so the service should stay behind auth.
- Remote hosts must also run the collector if they are to be aggregated over HTTPS.
- Route parsing must tolerate partial/messy Caddyfiles.
- Host-specific file locations vary, so route file paths must be configurable.

## Affected files
- `services/host-fleet-dashboard/**`
- `receipts.log`

## Definition of done
- A standalone service exists for fleet monitoring.
- The dashboard shows both ussy hosts in one view.
- Unreachable hosts render as error cards.
- Container inventory and routed subdomains both display.
- Tests pass.

## Implementation notes
- Created a new standalone service under `services/host-fleet-dashboard`.
- The backend uses local Docker socket inspection plus local Caddyfile parsing for the current host, and remote HTTPS fan-out (`/api/self`) for other hosts.
- The UI is a small static dashboard with browser-stored bearer token auth and one card per host.
- Hosts are configured through `HOST_FLEET_TARGETS_JSON`, so future blocked hosts can appear as error cards before access is fixed.
- Deployed production and staging instances behind `https://ussy.promethean.rest/fleet/` and `https://ussy3.promethean.rest/fleet/`.

## Verification
- `cd services/host-fleet-dashboard && npm test`
- `cd services/host-fleet-dashboard && HOST_FLEET_DASHBOARD_ALLOW_UNAUTHENTICATED=true PORT=8891 timeout 8s node src/index.js` with `curl /api/health`
- `cd services/host-fleet-dashboard && HOST_FLEET_DASHBOARD_ALLOW_UNAUTHENTICATED=true PORT=8892 timeout 20s node src/index.js` with `GET /api/hosts`
- remote prod: `https://ussy.promethean.rest/fleet/`, `/fleet/api/self`, `/fleet/api/hosts`
- remote staging: `https://ussy3.promethean.rest/fleet/`, `/fleet/api/self`
