# riatzukiza-portfolio (service)

A small Node service that:

- serves the **static** portfolio at `orgs/riatzukiza/riatzukiza.github.io/static`
- exposes a **Quartz Garden** generator endpoint to (re)build import graphs and update `static/garden/manifest.json`

## Run

```bash
cd services/riatzukiza-portfolio
pnpm dev
# -> http://127.0.0.1:8088
```

## Run (Docker Compose)

```bash
cd services/riatzukiza-portfolio
docker compose up -d --build

# logs
docker compose logs -f --tail=200
```

Then open:
- http://127.0.0.1:8088/
- http://127.0.0.1:8088/garden/

Environment:
- `HOST` (default `127.0.0.1`)
- `PORT` (default `8088`)
- `PORTFOLIO_STATIC_ROOT` (default `orgs/riatzukiza/riatzukiza.github.io/static`)

## Generate Quartz Garden graphs

CLI:

```bash
cd services/riatzukiza-portfolio
pnpm garden:generate

# single project
node src/garden/generate.mjs --project cephalon-ts
```

HTTP:

```bash
# all
curl -X POST 'http://127.0.0.1:8088/api/garden/generate'

# one
curl -X POST 'http://127.0.0.1:8088/api/garden/generate?project=proxx-web'
```

### Requirements

Graph rendering uses Graphviz `dot`.

On Debian/Ubuntu:

```bash
sudo apt-get install -y graphviz
```

## Config

Edit `garden.config.json` to add/remove projects.

It writes outputs into:
- `orgs/riatzukiza/riatzukiza.github.io/static/garden/graphs/<projectId>/...`
- `orgs/riatzukiza/riatzukiza.github.io/static/garden/manifest.json`
