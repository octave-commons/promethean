# Cephalon Package Overview

## Purpose
Cephalon is the production Discord agent runner for Promethean. It brokers voice capture, evaluation guardrails, and ENSO tool traffic for personas such as "duck". The package is described as "A proof-of-concept basic bot using @discordjs/voice" and includes audio processing, Discord integration, and various AI/LLM capabilities.

## Tech Stack
- **TypeScript** with ESM modules
- **Discord.js** v14 for Discord integration
- **@discordjs/voice** for voice capabilities
- **Node.js** with audio processing (ffmpeg, wav-decoder)
- **MongoDB** via @promethean/persistence for data storage
- **WebSocket** connections for broker communication
- **ENSO protocol** for agent communication
- **ECS (Entity Component System)** architecture for agent orchestration

## Key Features
- Discord voice and text channel integration
- Audio capture and processing (desktop audio, voice recording)
- Speech-to-text transcription
- LLM integration with prompt injection protection
- ENSO chat agent with guardrail evaluation
- Desktop capture and screenshot capabilities
- Security-enhanced LLM service

## Architecture
- **Dual execution modes**: ECS (default) and Classic
- **Event-driven** architecture with broker communication
- **Modular design** with separate concerns for audio, transcription, LLM, and security
- **Plugin-style** command and action system

## Entry Points
- Main entry: `src/index.ts` - Bot initialization and startup
- Development: `pnpm start:dev` - Direct TypeScript execution
- Production: `pnpm build && pnpm start` - Compiled JavaScript execution

## Key Directories
- `src/desktop/` - Desktop audio capture and screen processing
- `src/enso/` - ENSO protocol integration and chat agent
- `src/security/` - Enhanced LLM service with security features
- `src/agent/` - Agent implementation and speech coordination
- `src/audioProcessing/` - Audio analysis and visualization
- `src/actions/` - Discord command implementations
- `src/tests/` - Comprehensive test suite including security tests