# Environment Variables

Promethean services rely on explicit environment configuration. This page centralizes the variables that should be defined for local development and deployment. Add service-specific sections as you discover new requirements.

## Baseline

- `NODE_ENV`: Set to `development`, `test`, or `production`.
- `LOG_LEVEL`: Default logging level (e.g., `info`).
- `PNPM_HOME`: Ensure pnpm is on PATH when using Corepack.

## Promethean Services

- `OPENCODE_SERVER_URL`: Base URL for opencode-compatible services.
- `OPENCODE_AUTH_TOKEN`: Auth token for secured opencode endpoints.
- `OLLAMA_URL`: URL for local Ollama service if used by LLM tooling.
- `PROMETHEAN_DATA_DIR`: Optional root for writable data (sessions, caches).

## Local Development Tips

- Keep secrets in `.env.local` or your shell profile; avoid committing them.
- When adding a new package variable, document it here and in the package README.
- Prefer explicit defaults in code or `.env.example` to reduce setup friction.
