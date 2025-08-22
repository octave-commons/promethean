# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
### Example
- Placeholder example entry to demonstrate format. Replace/remove in future releases.

and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Introduced `CHANGELOG.md` to track project changes.
- Auto-generated OpenAPI spec for SmartGPT Bridge via Fastify swagger.
- TTL log retention for SmartGPT Bridge with MongoDB and Chroma cleanup.

### Changed
- Refactored `VoiceSession` to accept a stubbed `Transcriber` for testability.
- Updated `capture_channel.test.ts` and `voice_session.test.ts` to inject stubbed transcriber.
- Updated `messageThrottler.test.ts` to clean up broker, sockets, and audio players explicitly.
- Fixed compile issues in `voice-session.ts` (optional `voiceSynth`, `renderWaveForm` args, `Float32Array` → `Buffer`).

### Removed
- Skipped tests depending on removed/deprecated classes.
- Removed hand-written OpenAPI spec in SmartGPT Bridge.

## [0.0.1] - Initial
- Project scaffolding.
