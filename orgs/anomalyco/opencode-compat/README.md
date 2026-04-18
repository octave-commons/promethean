# opencode-compat

Minimal OpenCode-compatible cloud harness scaffold.

This service exposes a small but useful subset of the OpenCode HTTP contract while avoiding the local SQLite and filesystem assumptions used by upstream OpenCode. It is intended to become the shared hosted API surface for remote MCP-backed agents.

## What is scaffolded

- OpenCode-shaped routes for health, config, agents, MCP status, sessions, messages, async prompts, permissions, questions, and SSE events.
- A memory store for local development and tests.
- A Neon-compatible Postgres store that activates automatically when `DATABASE_URL` is set.
- A stub prompt runner that creates user and assistant messages and emits OpenCode-style events without pretending to be a full local shell/worktree runtime.

## What is not implemented yet

- Real model inference.
- Real MCP execution loop.
- PTY, worktree, file, shell, formatter, and LSP endpoints.
- Durable event replay.
- OAuth token exchange for remote MCP servers.

## Environment

- `HOST`, `PORT` - bind address.
- `PUBLIC_BASE_URL` - base URL used in share/auth placeholders.
- `OPENCODE_COMPAT_API_KEY` - optional bearer token for all routes except `/health` and `/global/health`.
- `DATABASE_URL` - optional Neon/Postgres connection string.
- `DEFAULT_DIRECTORY` - logical workspace key when no directory is provided.
- `DEFAULT_PROVIDER`, `DEFAULT_MODEL`, `DEFAULT_AGENT` - defaults used by the stub runner.

## Storage mode

- Without `DATABASE_URL`, the service runs entirely in memory.
- With `DATABASE_URL`, sessions, messages, status, config, MCP registrations, permissions, and questions persist in Postgres.

## Next implementation steps

1. Replace the stub prompt runner with a real remote-MCP execution loop.
2. Encrypt MCP OAuth and provider credentials before persisting them.
3. Add provider auth routes and a real queue worker for `prompt_async`.
4. Expand compatibility coverage only for routes real clients need.
