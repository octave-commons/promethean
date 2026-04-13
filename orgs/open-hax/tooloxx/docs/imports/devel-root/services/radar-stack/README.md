# radar-stack

Container-first deployment stack for the live Hormuz / threat-radar system on `ussy.promethean.rest`.

This is the **canonical** live deployment surface for `https://radar.promethean.rest`.

- edge routing is provided by `services/proxx/Caddyfile`
- canonical MCP source now lives under `orgs/open-hax/tooloxx/`
- `threat-radar-deploy/` remains a deployment-oriented bundle surface
- Render deployment is retired for Threat Radar

## Services

- `radar-mcp` — threat-radar control plane + API
- `radar-web` — public web wall for `radar.promethean.rest`
- `radar-db` — Postgres for threat-radar
- `openplanner` + `chroma` — OpenPlanner runtime
- `mcp-stack` + `redis` — Janus + MCP family services
- `hormuz-clock-mcp` — deployed Hormuz MCP reducer service
- `fork-tales-weaver` — Fork Tales crawler / web graph weaver
- `hormuz-agent` — recurring Hormuz refresh + packet submitter

The recurring Hormuz cycle now pulls from three planes before reclustering/reduction:

- Hormuz bundle packet export
- social collection (Bluesky + Reddit)
- Fork Tales weaver crawler status/domain/node collection

## Bring-up

```bash
cd /home/err/devel/services/radar-stack
cp .env.example .env
docker compose up -d --build
```

## One-shot cycle

```bash
docker compose run --rm -e HORMUZ_RUN_ONCE=1 hormuz-agent
```

## Health checks

```bash
docker compose ps
curl -fsS http://127.0.0.1:10002/health
curl -fsS http://127.0.0.1:7777/v1/health
curl -fsS http://127.0.0.1:8793/api/weaver/status
curl -fsS https://radar.promethean.rest
```
