# Environment

Environment variables, external dependencies, and setup notes.

**What belongs here:** Required env vars, external API keys/services, dependency quirks, platform-specific notes.
**What does NOT belong here:** Service ports/commands (use `.factory/services.yaml`).

---

## Required Environment Variables

### threat-radar-mcp
- `PORT` — API server port (default: 10002, dev: 9001)
- `ADMIN_AUTH_KEY` — Admin auth key, min 12 chars
- `DATABASE_URL` — Postgres connection string (local: `postgres://openai_proxy:@localhost:5432/threat_radar`, cloud: Neon). Note: the Docker Postgres uses user `openai_proxy`, not `postgres`.
- `ALLOW_UNAUTH_LOCAL` — Allow unauthenticated local requests (dev only)
- `PUBLIC_BASE_URL` — Public URL for MCP endpoint discovery

### Federation (Enso Protocol)
- `FEDERATION_INSTANCE_NAME` — Display name for this instance in federation envelopes (default: `threat-radar-instance`)
- `FEDERATION_TIMEOUT_MS` — Timeout for federation peer requests in milliseconds (default: `5000`)
- `FEDERATION_STALE_MS` — Milliseconds after last contact before a peer is marked stale (default: `300000` / 5 min)
- `FEDERATION_MAX_RETRIES` — Max consecutive failures before peer is marked offline (default: `3`)

### Bluesky / AT Protocol
- No credentials required for public search
- For authenticated list access: `BSKY_IDENTIFIER` + `BSKY_PASSWORD` (optional)

### Reddit
- No API keys needed — uses public JSON API (`reddit.com/r/*/hot.json`)
- User agent: `threat-radar-mcp/0.1.0`

## TypeScript Quirks

### Express 5 ParamsDictionary (string | string[])
Express 5 types (`@types/express-serve-static-core@5.x`) define `ParamsDictionary` values as `string | string[]`. At runtime, route params are always strings, but TypeScript requires narrowing before passing to functions expecting `string`.

**Fix pattern:**
```typescript
const raw = req.params.radarId;
const val = Array.isArray(raw) ? raw[0] ?? '' : raw;
```

## External Dependencies

- **Postgres**: Existing Docker instance on port 5432 (shared with open-hax-openai-proxy)
- **Redis**: Existing Docker instance on port 6379 (in mcp-stack, for future queueing)
- **Node.js**: v22 (via Volta)
- **pnpm**: Workspace package manager

## Cloud Deployment (Render)
- **Neon Postgres**: Free tier, 0.5GB limit — store only config/state/snapshots
- **Upstash Redis + QStash**: Free tier — cache + queue + scheduled jobs
- **AT Protocol**: All public signal data published to Bluesky (infinite, free)
