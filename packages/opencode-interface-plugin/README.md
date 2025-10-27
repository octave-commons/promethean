# @promethean-os/opencode-interface-plugin

OpenCode Interface Plugin - Provides OpenCode functionality as tools within the OpenCode ecosystem.

## Overview

This is a **standalone, independent plugin** that extracts OpenCode interface functionality from the opencode-client package. It provides comprehensive tools for:

- Session management (list, get, close, spawn, search)
- Event management (list)
- Message management (list, get, send)
- Context search and compilation

## Migration Status

✅ **Migration Complete** - Successfully migrated from opencode-client to independent plugin
✅ **Test Suite** - All 25 tests passing with comprehensive validation
✅ **TypeScript Support** - Full type safety and validation utilities
✅ **Error Handling** - Robust error handling and input validation

## Installation

```bash
pnpm add @promethean-os/opencode-interface-plugin
```

## Usage

```typescript
import { OpencodeInterfacePlugin } from '@promethean-os/opencode-interface-plugin';

// Use with OpenCode plugin system
const plugin = await OpencodeInterfacePlugin(pluginContext);
```

## Tools

### Session Management

- `list-sessions` - List all active OpenCode sessions with pagination
- `get-session` - Get detailed information about a specific session
- `close-session` - Close an active session
- `spawn-session` - Spawn a new session with an initial message
- `search-sessions` - Search for sessions by title, content, or metadata

### Event Management

- `list-events` - List recent events from the event store

### Message Management

- `list-messages` - List messages for a specific session
- `get-message` - Get a specific message from a session
- `send-prompt` - Send a prompt/message to a session

### Context Search

- `compile-context` - Compile and search the complete context store
- `search-context` - Unified search across all OpenCode data

## Dependencies

- `@opencode-ai/plugin` - Core plugin framework
- `@opencode-ai/sdk` - OpenCode SDK for API calls
- `@promethean-os/logger` - Logging utilities
- `@promethean-os/persistence` - Data persistence layer

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Test (25 tests passing)
pnpm test

# Development mode
pnpm dev
```

## Test Coverage

The plugin includes comprehensive test coverage:

- **Validation Tests** (17 tests) - Input validation and error handling
- **Plugin Tests** (5 tests) - Tool structure and functionality
- **Mocked Tests** (3 tests) - Isolated unit testing without dependencies

All tests pass consistently without external dependencies or database connections.

## Key Features

- **Independent Operation** - No dependency on opencode-client
- **Type Safety** - Full TypeScript validation and error handling
- **Comprehensive Tools** - 11 tools for complete OpenCode functionality
- **Robust Testing** - 25 tests with 100% pass rate
- **Input Validation** - Built-in validation for all parameters

## License

GPL-3.0-only
