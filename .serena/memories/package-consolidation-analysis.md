# Promethean Package Consolidation Analysis

## Target Packages Overview

### 1. @promethean/opencode-client
- **Purpose**: TypeScript CLI client for agent management and API interactions
- **Core Features**: Unified agent management, CLI interface, Ollama integration, session management, process monitoring
- **Architecture**: TypeScript with modular API layers (UnifiedAgentManager, AgentTaskManager, SessionUtils, etc.)
- **Dependencies**: @promethean/persistence, @promethean/ollama-queue, @opencode-ai/sdk
- **Build System**: TypeScript with AVA testing

### 2. opencode-cljs-electron
- **Purpose**: Electron-based ClojureScript editor application with Spacemacs-like interface
- **Core Features**: Evil mode editing, Spacemacs keybindings, Opencode SDK integration, plugin system
- **Architecture**: ClojureScript with Shadow-CLJS, multi-target builds (renderer, main, preload, server)
- **Dependencies**: @opencode-ai/sdk, React, Electron
- **Build System**: Shadow-CLJS with Electron packaging

### 3. @promethean/dualstore-http
- **Purpose**: HTTP service for dual-store functionality with REST API and SSE streaming
- **Core Features**: REST API for collections, real-time streaming, authentication, OpenAPI docs
- **Architecture**: TypeScript with Fastify, dual-store integration
- **Dependencies**: @promethean/persistence, Fastify ecosystem
- **Build System**: TypeScript with AVA testing

## Key Integration Points

### Shared Dependencies
- All three packages integrate with @promethean/persistence for data storage
- opencode-client and dualstore-http both use TypeScript and similar testing setups
- opencode-client and opencode-cljs-electron both integrate with @opencode-ai/sdk

### Complementary Capabilities
- opencode-client provides CLI and programmatic API access
- dualstore-http provides HTTP API and real-time streaming
- opencode-cljs-electron provides desktop editor interface

### Overlapping Features
- Session management across opencode-client and dualstore-http
- Opencode SDK integration in opencode-client and opencode-cljs-electron
- Agent task management in opencode-client and dualstore-http

## Technical Challenges
1. **Language Barrier**: TypeScript vs ClojureScript integration
2. **Build System Differences**: TypeScript/tsc vs Shadow-CLJS
3. **Deployment Targets**: CLI/HTTP service vs Desktop application
4. **Dependency Management**: npm vs Clojure deps.edn

## Consolidation Opportunities
1. **Unified API Layer**: Common interfaces for session and task management
2. **Shared Configuration**: Centralized Opencode integration
3. **Cross-platform Communication**: HTTP bridge between components
4. **Unified Testing Strategy**: Consistent testing patterns across languages