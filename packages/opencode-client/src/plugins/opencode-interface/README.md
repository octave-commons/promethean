# OpenCode Interface Plugin

This plugin provides OpenCode functionality as tools within the OpenCode ecosystem, exposing the same capabilities as the `opencode-client` CLI but as tools that can be used within OpenCode sessions.

## Features

### Session Management

- `list-sessions` - List all active sessions with pagination and filtering
- `get-session` - Get detailed information about a specific session
- `create-session` - Create a new session
- `close-session` - Close an active session
- `spawn-session` - Spawn a new session with an initial message
- `search-sessions` - Search sessions by title, content, or metadata

### Event Management

- `list-events` - List recent events from the event store
- `subscribe-events` - Subscribe to live events from OpenCode sessions

### Message Management

- `list-messages` - List messages for a specific session
- `get-message` - Get a specific message from a session
- `send-prompt` - Send a prompt/message to a session

### Indexer Management

- `start-indexer` - Start the OpenCode indexer service
- `stop-indexer` - Stop the OpenCode indexer service
- `indexer-status` - Get the status of the indexer service

## Usage

### Installation

The plugin is included in the `@promethean-os/opencode-client` package and can be imported as:

```typescript
import { OpencodeInterfacePlugin } from '@promethean-os/opencode-client/plugins';
import { OpencodeInterfacePlugin } from '@promethean-os/opencode-client/plugins/opencode-interface';
```

### Example Usage in OpenCode

Once loaded, the plugin provides tools that can be used within OpenCode sessions:

```
# List all sessions
list-sessions --limit 10 --format table

# Get a specific session
get-session --sessionId "session_123" --limit 50

# Create a new session
create-session --title "My Development Session"

# Spawn a session with a prompt
spawn-session --title "Code Review" --message "Please review this code for security issues"

# List messages from a session
list-messages --sessionId "session_123" --limit 20 --format json

# Send a prompt to a session
send-prompt --sessionId "session_123" --content "What are the main security concerns here?"

# List recent events
list-events --eventType "session.updated" --k 20

# Start the indexer
start-indexer --verbose true

# Check indexer status
indexer-status
```

## Tool Reference

### Session Tools

#### `list-sessions`

Lists all active OpenCode sessions with optional pagination and formatting.

**Arguments:**

- `limit` (number, default: 20) - Number of sessions to return
- `offset` (number, default: 0) - Number of sessions to skip
- `format` (table|json, default: table) - Output format

#### `get-session`

Retrieves detailed information about a specific session including messages.

**Arguments:**

- `sessionId` (string, required) - Session ID to retrieve
- `limit` (number, optional) - Number of messages to include
- `offset` (number, optional) - Number of messages to skip

#### `create-session`

Creates a new OpenCode session.

**Arguments:**

- `title` (string, optional) - Optional title for the session

#### `close-session`

Closes an active session.

**Arguments:**

- `sessionId` (string, required) - Session ID to close

#### `spawn-session`

Creates a new session with an initial message/prompt.

**Arguments:**

- `title` (string, optional) - Optional title for the session
- `message` (string, required) - Initial message/prompt for the session

#### `search-sessions`

Searches for sessions by title, content, or metadata.

**Arguments:**

- `query` (string, required) - Search query
- `k` (number, optional) - Maximum number of results
- `sessionId` (string, optional) - Filter by session ID

### Event Tools

#### `list-events`

Lists recent events from the event store with filtering options.

**Arguments:**

- `query` (string, optional) - Search query for events
- `k` (number, optional) - Maximum number of events to return
- `eventType` (string, optional) - Filter by event type
- `sessionId` (string, optional) - Filter by session ID

#### `subscribe-events`

Subscribes to live events from OpenCode sessions.

**Arguments:**

- `eventType` (string, optional) - Specific event type to subscribe to
- `sessionId` (string, optional) - Filter by session ID

### Message Tools

#### `list-messages`

Lists messages for a specific session with formatting options.

**Arguments:**

- `sessionId` (string, required) - Session ID
- `limit` (number, default: 10) - Number of messages to return
- `format` (table|json, default: table) - Output format

#### `get-message`

Retrieves a specific message from a session.

**Arguments:**

- `sessionId` (string, required) - Session ID
- `messageId` (string, required) - Message ID

#### `send-prompt`

Sends a prompt/message to a session.

**Arguments:**

- `sessionId` (string, required) - Session ID
- `content` (string, required) - Message content

### Indexer Tools

#### `start-indexer`

Starts the OpenCode indexer service.

**Arguments:**

- `verbose` (boolean, default: false) - Enable verbose logging
- `background` (boolean, default: false) - Run as background daemon

#### `stop-indexer`

Stops the OpenCode indexer service.

**Arguments:**

- `force` (boolean, default: false) - Force stop the indexer

#### `indexer-status`

Gets the status of the OpenCode indexer service.

**Arguments:** None

## Architecture

The plugin is built using the `@opencode-ai/plugin` framework and follows these principles:

1. **Tool-based design** - Each CLI command is exposed as a separate tool
2. **Type safety** - Full TypeScript support with proper argument validation
3. **Error handling** - Comprehensive error handling with descriptive messages
4. **Consistent interfaces** - All tools follow consistent argument and response patterns
5. **Hook support** - Includes before/after execution hooks for logging and monitoring

## Dependencies

The plugin depends on:

- `@opencode-ai/plugin` - Plugin framework
- `@opencode-ai/sdk` - OpenCode SDK for API calls
- `@promethean-os/persistence` - Data storage and retrieval
- Internal action modules from `@promethean-os/opencode-client`

## Development

The plugin source is located in `src/plugins/opencode-interface/` and consists of:

- `index.ts` - Main plugin implementation
- `README.md` - This documentation

The plugin automatically initializes the required stores and creates an OpenCode client for API operations.
