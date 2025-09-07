# Development Environment

This guide covers two ways to run Promethean locally.

> Run the Docker setup when possible; fall back to the manual steps if Docker is unavailable.

## Docker workflow

```bash
if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is not installed; see the Non-Docker section below." >&2
fi
```

1. Copy `.env` to the project root and populate required variables:

   ```env
   MONGODB_HOST_NAME=localhost
   MONGODB_ADMIN_DATABASE_NAME=database
   MONGODB_ADMIN_USER_NAME=root
   MONGODB_ADMIN_USER_PASSWORD=example
   ```

2. Start backing services and all packages:

   ```bash
   docker compose up -d
   pnpm dev:all
   ```

## Non-Docker workflow

1. Install external dependencies manually:

   - MongoDB (>=6)
   - Redis (>=6)
   - Node 20.19.4 and pnpm 9

2. Ensure the services are running locally, e.g.:

   ```bash
   mongod --config /usr/local/etc/mongod.conf &
   redis-server &
   ```

3. Start the packages via pnpm:

   ```bash
   pnpm install
   pnpm -r run dev
   ```

See [environment-variables](environment-variables.md) for additional options.
