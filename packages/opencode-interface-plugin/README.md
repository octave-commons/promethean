# @promethean-os/opencode-interface-plugin

OpenCode Interface Plugin - Provides OpenCode functionality as tools within the OpenCode ecosystem.

## Overview

This plugin extracts the OpenCode interface functionality from the opencode-client package into a standalone, focused plugin. It provides tools for:

- Session management (list, get, close, spawn, search)
- Event management (list)
- Message management (list, get, send)
- Context search and compilation

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

# Test
pnpm test

# Development mode
pnpm dev
```

## License

GPL-3.0-only
