Testing setup for Promethean SmartGPT Bridge (minimal, fast, CI-friendly)

Requirements
- Node.js 18+
- No external services (tests stub/bypass broker/Chroma)
 - Optional: set `PUBLIC_BASE_URL` to control the OpenAPI server URL (e.g., your Tailscale Funnel address)

Install & Run
- npm ci
- pnpm -w -r --filter @promethean/smartgpt-bridge... run --if-present build
- pnpm --filter @promethean/smartgpt-bridge test

Notes
- Uses AVA for tests, Supertest/fastify.inject for HTTP, Sinon for timers only.
- Native ESM only; tests run against compiled `dist`. Relative imports in TS end with `.js`.
- Server factory: `createServer(root, deps)` enables dependency injection in tests.
  - Pass `{ registerSinks: async () => {} }` to avoid external Chroma during tests.
  - For semantic search/indexer tests, use `setChromaClient()` and `setEmbeddingFactory()` from `dist/indexer.js`.
- Fixtures live under `tests/fixtures/`.
- OpenAPI base URL derives from `PUBLIC_BASE_URL` (fallback `http://localhost:${PORT||3210}`).

Scripts
- pnpm --filter @promethean/smartgpt-bridge test — build then run tests once
- pnpm --filter @promethean/smartgpt-bridge test:watch — watch mode (if present)
- pnpm --filter @promethean/smartgpt-bridge test:coverage — c8 coverage (if present)

Coverage
- Uses c8 (v8 coverage). Reports to stdout and writes lcov and HTML to ./coverage.
- Example CI step:
  - pnpm test:coverage
  - store artifacts from coverage/ and lcov.info
