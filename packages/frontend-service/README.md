# Frontend Service

Serves compiled frontend assets from Promethean packages under a single Fastify instance.

## Usage

```bash
pnpm --filter @promethean/frontend-service start
```

This will start a server on port `4500`. Each package that contains a `dist/frontend` or `static` directory is mounted under a path matching the package name.

Example: `http://localhost:4500/piper/` serves the Piper frontend.

Health and diagnostics endpoints are available at `/health` and `/diagnostics`.
