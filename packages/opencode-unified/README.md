# @promethean/opencode-unified

Unified OpenCode client combining TypeScript server, ClojureScript editor, and Electron integration.

## Overview

This package consolidates three separate packages into a unified solution:

- `@promethean/opencode-client` - TypeScript client library
- `@promethean/dualstore-http` - HTTP server and API routes
- `opencode-cljs-electron` - ClojureScript editor with Electron integration

## Features

- **TypeScript Server**: Fastify-based HTTP server with OpenCode APIs
- **ClojureScript Editor**: Spacemacs-like editor interface
- **Electron Integration**: Cross-platform desktop application
- **Unified Build System**: Integrated TypeScript and ClojureScript compilation
- **Comprehensive Testing**: Unit, integration, and E2E test support

## Quick Start

```bash
# Install dependencies
pnpm install

# Development mode
pnpm dev

# Build for production
pnpm build

# Start the server
pnpm start

# Run Electron app
pnpm start:electron
```

## Development

### TypeScript Development

```bash
# Watch TypeScript compilation
pnpm dev:typescript

# Type checking
pnpm typecheck
```

### ClojureScript Development

```bash
# Watch ClojureScript compilation
pnpm dev:clojurescript

# Type checking
pnpm typecheck:clojurescript
```

### Testing

```bash
# Run all tests
pnpm test

# Unit tests only
pnpm test:unit

# Integration tests
pnpm test:integration

# E2E tests
pnpm test:e2e

# Coverage report
pnpm test:coverage
```

## Project Structure

```
src/
├── typescript/          # TypeScript source files
│   ├── server/         # HTTP server (from dualstore-http)
│   ├── client/         # Client library (from opencode-client)
│   ├── shared/         # Shared TypeScript code
│   └── electron/       # Electron main process
├── clojurescript/       # ClojureScript source files
│   ├── editor/         # Editor components (from opencode-cljs-electron)
│   ├── shared/         # Shared ClojureScript code
│   └── electron/       # Electron renderer process
└── schemas/            # Shared schemas and types
```

## Configuration

The package supports configuration through environment variables and config files:

- `NODE_ENV` - Environment (development/production/test)
- `PORT` - Server port (default: 3000)
- `HOST` - Server host (default: 0.0.0.0)

## License

GPL-3.0-only
