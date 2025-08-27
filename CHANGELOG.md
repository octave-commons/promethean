# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),

### Example

- Placeholder example entry to demonstrate format. Replace/remove in future releases.

## [Unreleased]

### Added

- Command definitions extracted into reusable modules and JSON descriptors for Makefile generation.

- Extracted actionable tasks from unique notes into tasks/unique-notes.md
- Policy-based access control with user and role management for SmartGPT Bridge.
- Directory tree endpoint for SmartGPT Bridge file API.
- v1 router exposing consolidated SmartGPT Bridge endpoints.
- OpenAPI spec for `/v1` served at `/v1/openapi.json` with consolidated operations.
- `distclean` target to remove ignored files via `git clean -fdX`.
- Tests for router and WebSocket server behaviors in `mcp-server`.
- `snapshot` target to tag the current commit with a timestamped snapshot.
- Shared Biome configuration template (`templates/ts/biome.base.json`) for TypeScript services.
- Shared dependency specifications for Discord indexer services.
- Centralized Biome configuration at `templates/ts/biome.base.json` referenced by Discord bot template and Markdown Graph service.

### Changed

- VoiceSynth implementation moved to shared module and imported by Cephalon service.
- Refined Kanban breakdown tasks with clear goals, requirements, and subtasks.
- MCP server and stdio wrapper exposing `search.query` over WebSocket and CLI.
- Packaging for `shared` modules to enable standard imports.
- Central `tests/conftest.py` to configure the test environment.
- Smoke test script for MCP server and basic stdio wrapper test harness.
- Frontend visualization for the markdown link graph using ForceGraph.
- Simple web chat interface for the LLM service with HTTP and WebSocket endpoints.
- Basic tool call support in the LLM chat frontend via SmartGPT Bridge.
- Tests for tool call parsing and invocation in the LLM chat frontend.
- File explorer UI for SmartGPT Bridge dashboard using file endpoints.
- TypeScript utilities for repository file exploration with fuzzy search.
- `sites/` directory consolidating all frontend code.
- Proxy route `/bridge` through the shared proxy service for SmartGPT Bridge.
- Tool calling support for Codex Context service.
- Image attachments captured, stored, and retrieved for multimodal prompting with cleanup.
- Markdown Graph service and Discord bot template now extend the shared Biome configuration.
- OAuth Authorization Code flow with PKCE for the auth-service, enabling OpenAI Custom GPT logins.
- Template for building Discord bots in TypeScript based on the Cephalon service.
- Tests validating bridge event mappings for identifiers and protocols.
- Tests covering MongoDB connection string construction and collection setup.
- Audio utility helpers for base64 PCM and WAV conversions.
- `run_service` helper for Python services simplifying startup and wait loops.
- STT and embedding services updated to use `run_service`.
- Unit tests for ForwardTacotronIE and WaveRNNIE helper functions.
- Test for GUI parameter defaults in `init_parameters_interactive`.
- BrokerClient automatic reconnection with exponential backoff, queued message resend, and `disconnect` method.
- Configurable heartbeat interval and automatic timer management in `BrokerClient`.
- ECS voice system splitting legacy session logic into components and event-driven systems.
- Initial migration contract validators and documentation outlining data migration conventions.
- URL canonicalization and hashing utilities for the web crawler.
- Basic webcrawler package scaffolding with link extraction.
- CLI to scaffold Python or TypeScript service templates.
- Tests for grammar correction in the shared speech spell checker.
- Unit tests for Discord utility functions covering channel history and cursor management.
- Tests for `shared.py.settings` confirming environment defaults and overrides.
- Expanded `MIGRATION_PLAN.md` with scope, phased timeline, requirements, and owner assignments.
- Provider-agnostic LLM driver interface with Ollama and HuggingFace implementations.
- TypeScript LLM service now uses pluggable drivers for Ollama and HuggingFace.
- Documented broker reconnection problem, goals, and acceptance criteria.
- Periodic worker sweep in `queueManager` with configurable heartbeat and expiry thresholds.
- Logging for task timeouts with configurable queueManager requeue tests.
- Initial scaffolding for broker↔bridge parity tests, including normalizers, runner, and unit tests.
- Automatic Twitch stream title pipeline using Ollama with Discord transcript context and pluggable storage.
- Basic class support in Lisp compiler with `defclass`, `new`, `get`, and `call` forms.
- Realtime Promethean Health Dashboard for monitoring heartbeat metrics.
- Configurable timeout for remote embedding requests.
- `defun` special form in Lisp compiler enabling named functions and recursion.

- Pinned JavaScript dependencies, GitHub Actions, and documented version policy for reproducible builds.
- Pre-commit now runs `pnpm tsc --noEmit` and `pytest -q` instead of `make build`; use `pre-commit run --hook-stage manual full-build` or `make build` for full builds.
- Naive embedding driver now uses configurable `VECTOR_SIZE` constant.
- Enhanced URL canonicalization helpers to remove tracking parameters and expand scheme denylist.
- Organized SmartGPT Bridge routes into versioned directories.
- Embedding clients and related utilities now accept structured `{type, data}`
- Centralized TypeScript service configuration in `services/ts/config` and removed duplicate configs in Cephalon and Discord Embedder.
  items instead of using the `img:` prefix.
- Moved SmartGPT dashboard and LLM chat frontends into `sites/`.
- Frontends now served from a central static file server instead of individual services.
- Frontends communicate with backend services via the central proxy.
- Codex Context retriever now targets SmartGPT Bridge `/v1` endpoints.
- Moved SmartGPT dashboard and LLM chat frontends into `sites/`.
- Frontends now served from a central static file server instead of individual services.
- SmartGPT Bridge file routes now use shared file explorer utilities, and the dashboard consumes a shared file explorer component.
- SmartGPT Bridge now uses shared DualStore and ContextStore for persistence.
- Health service tests use shared BrokerClient instead of direct WebSocket connections.
- Discord embedder migrated to shared DualStore and ContextStore for unified persistence.
- STT and TTS services now use shared audio utilities for encoding and decoding.
- Kanban processor now persists via shared DualStore and ContextStore.
- Markdown Graph service now uses shared DualStore and ContextStore for persistence.
- Markdown Graph service uses DualStore insert API instead of direct Mongo writes.
- DualStoreManager introduces `insert` API (with `addEntry` alias); Cephalon uses DualStore and ContextStore directly.
- MCP server now creates a dedicated bridge connection per session and exposes tool schemas via `inputSchema`.
- Proxy service now serves frontend files directly, removing the need for a separate static server.
- Broker client now uses structured logging and narrower exception handling.
- EmbeddingServiceClient now retries failed requests with exponential backoff and returns structured errors when service calls fail.
- Waveform and spectrogram generation delegated to an external audio service injected via `CaptureDeps`.
- Remote embedding function now surfaces broker connection errors and rejects pending requests on failure.
- Discord attachment embedder services now share a common embedding routine.

### Fixed

- SmartGPT Bridge file actions now treat leading '/' as the repository root.
- Clean tasks now remove only git-ignored files and protect critical configs like `ecosystem.config.js`.
- Exec runner now honors `EXEC_SHELL`, validates `cwd` against the repo root, and reports accurate duration.
- OpenAPI docs obey `OPENAPI_PUBLIC`, staying private when auth is enabled unless explicitly exposed.
- Grep endpoint requires a regex pattern and returns validation errors for missing fields.
- SSE agent log streaming cleans up listeners on disconnect to avoid leaks.
- Python tests run without pipenv isolation.
- DualStore skips image embeddings when the configured function only supports text.
- Added missing `next_messages` helper for discord indexer tests.
- CPU requirements no longer include NVIDIA packages and target PyTorch CPU wheels.
- Cephalon embedding docs now point to the shared remote embedding helper.
- Lint and format scripts for `@shared/ts` now invoke the Biome CLI directly.
- Provider policy test now restricts access for non-whitelisted services.

### Removed

- Deprecated `scripts/serve-sites.js` static file server.
- Per-file `sys.path.append` hacks in tests in favor of centralized setup.
- Hy variant of the Discord attachment embedder service in favor of shared Python implementation.

and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Introduced `CHANGELOG.md` to track project changes.
- Auto-generated OpenAPI spec for SmartGPT Bridge via Fastify swagger.
- TTL log retention for SmartGPT Bridge with MongoDB and Chroma cleanup.
- Generic `DualSink` persistence abstraction with registry and sink endpoints.
- Store effect to invoke `ping` action without Discord.

### Changed

- Refactored `VoiceSession` to accept a stubbed `Transcriber` for testability.
- Updated `capture_channel.test.ts` and `voice_session.test.ts` to inject stubbed transcriber.
- Updated `messageThrottler.test.ts` to clean up broker, sockets, and audio players explicitly.
- Fixed compile issues in `voice-session.ts` (optional `voiceSynth`, `renderWaveForm` args, `Float32Array` → `Buffer`).
- Chroma search route now records queries using the `DualSink`.
- Cephalon service now uses shared `DualStore` and `ContextStore` for persistence.
- Cephalon bot business logic moved into scoped actions and effects.

### Removed

- Skipped tests depending on removed/deprecated classes.
- Removed hand-written OpenAPI spec in SmartGPT Bridge.

## [0.0.1] - Initial

- Project scaffolding.
