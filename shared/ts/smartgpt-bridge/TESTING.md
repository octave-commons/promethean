Testing setup for Promethean SmartGPT Bridge (minimal, fast, CI-friendly)

Requirements
- Node.js 18+
- No external services (tests stub/bypass broker/Chroma)
 - Optional: set `PUBLIC_BASE_URL` to control the OpenAPI server URL (e.g., your Tailscale Funnel address)

Install & Run
- npm ci
- npm test

Notes
- Uses AVA for tests, Supertest for HTTP, Sinon for timers/mocks.
- Server exposes buildApp(ROOT_PATH) for integration tests (no listen).
- Agent supervisor exposes createSupervisor({ spawnImpl, killImpl }) for mocked system tests.
- Fixtures live under tests/fixtures/ and are kept < 2KB.
- Total runtime stays under ~10 seconds on a laptop.
 - OpenAPI servers entry is derived from `PUBLIC_BASE_URL` (fallback `http://localhost:${PORT||3210}`).

Scripts
- npm test — run all tests once
- npm run test:watch — watch mode
- npm run test:coverage — generate c8 coverage (text, lcov, html)

Coverage
- Uses c8 (v8 coverage). Reports to stdout and writes lcov and HTML to ./coverage.
- Example CI step:
  - pnpm test:coverage
  - store artifacts from coverage/ and lcov.info
