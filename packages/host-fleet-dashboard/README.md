# @workspace/host-fleet-dashboard

Standalone fleet dashboard for the Promethean ussy hosts.

## What it shows
- local host container inventory from the Docker socket
- routed subdomains parsed from configured Caddyfiles
- remote host cards fetched over HTTPS from that host's own `/api/self`
- degraded/error cards when a host is unreachable or not yet deployed

## Why this exists
This dashboard is intentionally **not** embedded inside a service-specific console such as proxx. It is host-level infrastructure.

## Runtime model
Each host can run its own local collector instance.

- `mode: "local"` targets inspect the local Docker engine and local route files.
- `mode: "remote-http"` targets fetch another host's already-deployed dashboard self snapshot.

That means the production host can aggregate staging without needing SSH from one server into the other.

## Local run
```bash
cd /home/err/devel/services/host-fleet-dashboard
cp .env.example .env   # optional
HOST_FLEET_DASHBOARD_ALLOW_UNAUTHENTICATED=true \
PORT=8791 \
node src/index.js
```

Open:
- http://127.0.0.1:8791/

## Docker compose run
```bash
cd /home/err/devel/services/host-fleet-dashboard
cp .env.example .env
docker compose up --build -d
curl http://127.0.0.1:8791/api/health
```

## TLS / standalone portal
A dedicated TLS frontend can serve this dashboard directly on `portal.promethean.rest`:

```bash
cd /home/err/devel/services/host-fleet-dashboard
cp .env.example .env
# ensure portal.promethean.rest resolves to the host first
docker network create ai-infra || true
docker compose -f compose.yaml -f docker-compose.ssl.yml up --build -d
```

This expects:
- `portal.promethean.rest` DNS pointing directly at the host
- ports `80` and `443` available on the host
- the dashboard service reachable as `host-fleet-dashboard:8791` on `ai-infra`

The compose stack mounts:
- `/var/run/docker.sock` for local container inventory
- `../` as `/workspace/services` so local route files like `/workspace/services/proxx/Caddyfile` can be parsed

## Environment
- `HOST_FLEET_DASHBOARD_HOST` — default `0.0.0.0`
- `HOST_FLEET_DASHBOARD_PORT` / `PORT` / `WEB_PORT` — default `8791`
- `HOST_FLEET_DASHBOARD_AUTH_TOKEN` — bearer token required for `/api/*`
- `HOST_FLEET_DASHBOARD_ALLOW_UNAUTHENTICATED` — set `true` only for local debugging
- `HOST_FLEET_REQUEST_TIMEOUT_MS` — default `10000`
- `HOST_FLEET_DOCKER_SOCKET_PATH` — default `/var/run/docker.sock`
- `HOST_FLEET_SELF_TARGET_ID` — which configured target is the local host on this deployment
- `HOST_FLEET_TARGETS_JSON` — JSON array of host targets

## Example target configuration
### On `ussy.promethean.rest`
```bash
HOST_FLEET_SELF_TARGET_ID=ussy
HOST_FLEET_TARGETS_JSON='[
  {
    "id": "ussy",
    "label": "ussy.promethean.rest",
    "mode": "local",
    "publicBaseUrl": "https://ussy.promethean.rest/fleet",
    "routeFiles": ["/workspace/services/proxx/Caddyfile"],
    "notes": "primary"
  },
  {
    "id": "ussy3",
    "label": "ussy3.promethean.rest",
    "mode": "remote-http",
    "publicBaseUrl": "https://ussy3.promethean.rest/fleet",
    "notes": "staging"
  }
]'
```

### On `ussy3.promethean.rest`
```bash
HOST_FLEET_SELF_TARGET_ID=ussy3
HOST_FLEET_TARGETS_JSON='[
  {
    "id": "ussy3",
    "label": "ussy3.promethean.rest",
    "mode": "local",
    "publicBaseUrl": "https://ussy3.promethean.rest/fleet",
    "routeFiles": ["/workspace/services/proxx-staging/Caddyfile"],
    "notes": "staging"
  }
]'
```

## Notes
- Keep future or blocked hosts in `HOST_FLEET_TARGETS_JSON`; they will render as error cards until the remote collector is reachable.
- The UI uses browser-local token storage and calls relative `./api/*` paths so it can be mounted behind a stripped path prefix such as `/fleet/`.
- This service is intentionally dependency-light: Node built-ins only.
