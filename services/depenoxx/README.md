# depenoxx local garden

Devops wrapper for running depenoxx locally as a containerized service.

## What is depenoxx?

depenoxx is a dependency graph generator and visualizer for monorepo workspaces.
The source code lives at `orgs/open-hax/depenoxx/`.

## Quick start

```bash
# Copy environment template
cp .env.example .env

# Start the service
docker compose up -d --build

# View logs
docker compose logs -f

# Stop
docker compose down
```

## Access

- **UI**: http://127.0.0.1:8798/
- **API health**: http://127.0.0.1:8798/api/health
- **Generate graphs**: `curl -X POST http://127.0.0.1:8798/api/generate`

## Configuration

| Env Var | Default | Description |
|---------|---------|-------------|
| `DEPENOXX_PORT` | 8798 | Port to expose |
| `DEPENOXX_PROJECT_NAME` | devel | Display name in UI |
| `DEPENOXX_WORKSPACE` | ../.. | Workspace root to scan |
| `DEPENOXX_UID` | 1000 | User ID for container |
| `DEPENOXX_GID` | 1000 | Group ID for container |

## Remote deployments

Remote deployments are handled by GitHub Actions workflows in
`orgs/open-hax/depenoxx/.github/workflows/`.

- **Testing**: `testing.depenoxx.promethean.rest` (PRs with `testing` label)
- **Staging**: `staging.depenoxx.promethean.rest` (staging branch)
- **Production**: `depenoxx.promethean.rest` (main branch)
