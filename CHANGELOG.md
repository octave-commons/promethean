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
- Frontend visualization for the markdown link graph using ForceGraph.
- Simple web chat interface for the LLM service with HTTP and WebSocket endpoints.
- File explorer UI for SmartGPT Bridge dashboard using file endpoints.

### Changed

- Organized SmartGPT Bridge routes into versioned directories.
- Markdown Graph service now uses shared DualStore and ContextStore for persistence.

### Fixed

- SmartGPT Bridge file actions now treat leading '/' as the repository root.
- Clean tasks now remove only git-ignored files and protect critical configs like `ecosystem.config.js`.
- Exec runner now honors `EXEC_SHELL`, validates `cwd` against the repo root, and reports accurate duration.
- OpenAPI docs obey `OPENAPI_PUBLIC`, staying private when auth is enabled unless explicitly exposed.
- Grep endpoint requires a regex pattern and returns validation errors for missing fields.
- SSE agent log streaming cleans up listeners on disconnect to avoid leaks.

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

### Removed

- Skipped tests depending on removed/deprecated classes.
- Removed hand-written OpenAPI spec in SmartGPT Bridge.

## [0.0.1] - Initial

- Project scaffolding.
