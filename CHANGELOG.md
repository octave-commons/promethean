# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),

### Example

- Placeholder example entry to demonstrate format. Replace/remove in future releases.

## [Unreleased]

### Added

- Policy-based access control with user and role management for SmartGPT Bridge.
- Directory tree endpoint for SmartGPT Bridge file API.
- v1 router exposing consolidated SmartGPT Bridge endpoints.
- OpenAPI spec for `/v1` served at `/v1/openapi.json` with consolidated operations.
- `distclean` target to remove ignored files via `git clean -fdX`.
- MCP server and stdio wrapper exposing `search.query` over WebSocket and CLI.
- Smoke test script for MCP server and basic stdio wrapper test harness.
- Frontend visualization for the markdown link graph using ForceGraph.
- Simple web chat interface for the LLM service with HTTP and WebSocket endpoints.
- File explorer UI for SmartGPT Bridge dashboard using file endpoints.
- `sites/` directory consolidating all frontend code.
- Proxy route `/bridge` through the shared proxy service for SmartGPT Bridge.
- Tool calling support for Codex Context service.
- Template for building Discord bots in TypeScript based on the Cephalon service.
- `run_service` helper for Python services simplifying startup and wait loops.
- STT and embedding services updated to use `run_service`.

### Changed

- Organized SmartGPT Bridge routes into versioned directories.
- Moved SmartGPT dashboard and LLM chat frontends into `sites/`.
- Frontends now served from a central static file server instead of individual services.
- Frontends communicate with backend services via the central proxy.
- Codex Context retriever now targets SmartGPT Bridge `/v1` endpoints.
- Moved SmartGPT dashboard and LLM chat frontends into `sites/`.
- Frontends now served from a central static file server instead of individual services.
- SmartGPT Bridge now uses shared DualStore and ContextStore for persistence.
- Discord embedder migrated to shared DualStore and ContextStore for unified persistence.
- Kanban processor now persists via shared DualStore and ContextStore.
- Markdown Graph service now uses shared DualStore and ContextStore for persistence.
- MCP server now creates a dedicated bridge connection per session and exposes tool schemas via `inputSchema`.

- Proxy service now serves frontend files directly, removing the need for a separate static server.

### Fixed

- SmartGPT Bridge file actions now treat leading '/' as the repository root.
- Clean tasks now remove only git-ignored files and protect critical configs like `ecosystem.config.js`.
- Exec runner now honors `EXEC_SHELL`, validates `cwd` against the repo root, and reports accurate duration.
- OpenAPI docs obey `OPENAPI_PUBLIC`, staying private when auth is enabled unless explicitly exposed.
- Grep endpoint requires a regex pattern and returns validation errors for missing fields.
- SSE agent log streaming cleans up listeners on disconnect to avoid leaks.

### Removed

- Deprecated `scripts/serve-sites.js` static file server.

and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Introduced `CHANGELOG.md` to track project changes.
- Auto-generated OpenAPI spec for SmartGPT Bridge via Fastify swagger.
- TTL log retention for SmartGPT Bridge with MongoDB and Chroma cleanup.
- Generic `DualSink` persistence abstraction with registry and sink endpoints.

### Changed

- Refactored `VoiceSession` to accept a stubbed `Transcriber` for testability.
- Updated `capture_channel.test.ts` and `voice_session.test.ts` to inject stubbed transcriber.
- Updated `messageThrottler.test.ts` to clean up broker, sockets, and audio players explicitly.
- Fixed compile issues in `voice-session.ts` (optional `voiceSynth`, `renderWaveForm` args, `Float32Array` → `Buffer`).
- Chroma search route now records queries using the `DualSink`.
- Cephalon service now uses shared `DualStore` and `ContextStore` for persistence.

### Removed

- Skipped tests depending on removed/deprecated classes.
- Removed hand-written OpenAPI spec in SmartGPT Bridge.

## [0.0.1] - Initial

- Project scaffolding.
