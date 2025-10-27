# API Reference - OpenCode Client

## Overview

This document provides comprehensive API documentation for the OpenCode client CLI and programmatic interfaces available in the `@promethean-os/opencode-client` package.

## CLI Commands

### Global Options

```bash
opencode-client [global-options] <command> [command-options]
```

**Global Options:**

- `-v, --verbose`: Enable verbose output
- `--no-color`: Disable colored output
- `--help`: Display help information
- `--version`: Display version information

### Sessions Commands

Manage OpenCode sessions for conversation tracking and context management.

#### `sessions list` (alias: `sess list`)

List all available sessions with optional filtering.

```bash
opencode-client sessions list [options]
```

**Options:**

- `--limit <number>`: Limit number of results (default: 20)
- `--offset <number>`: Offset for pagination (default: 0)

**Example:**

```bash
opencode-client sessions list --limit 10 --offset 20
```

#### `sessions get <sessionId>`

Retrieve detailed information about a specific session.

```bash
opencode-client sessions get <sessionId> [options]
```

**Arguments:**

- `sessionId`: Unique identifier of the session

**Example:**

```bash
opencode-client sessions get sess_1234567890
```

#### `sessions create`

Create a new OpenCode session.

```bash
opencode-client sessions create [options]
```

**Options:**

- `--title <string>`: Session title
- `--message <string>`: Initial message for the session

**Example:**

```bash
opencode-client sessions create --title "Code Review Session" --message "Review this TypeScript code"
```

#### `sessions spawn`

Quickly create a session with an initial message (convenience command).

```bash
opencode-client sessions spawn <message> [options]
```

**Arguments:**

- `message`: Initial message for the session

**Options:**

- `--title <string>`: Session title (optional)

**Example:**

```bash
opencode-client sessions spawn "Help me debug this TypeScript error" --title "Debug Session"
```

#### `sessions close <sessionId>`

Close an active session.

```bash
opencode-client sessions close <sessionId>
```

**Arguments:**

- `sessionId`: Unique identifier of the session to close

**Example:**

```bash
opencode-client sessions close sess_1234567890
```

#### `sessions search`

Search for sessions based on content and metadata.

```bash
opencode-client sessions search <query> [options]
```

**Arguments:**

- `query`: Search query string

**Options:**

- `--k <number>`: Number of results to return (default: 20)

**Example:**

```bash
opencode-client sessions search "TypeScript compilation" --k 5
```

#### `sessions diagnose`

Diagnose session-related issues and provide system health information.

```bash
opencode-client sessions diagnose [sessionId]
```

**Arguments:**

- `sessionId`: Optional session ID to diagnose (if omitted, diagnoses overall system)

**Example:**

```bash
opencode-client sessions diagnose sess_1234567890
```

### Events Commands

View and subscribe to OpenCode events for real-time monitoring.

#### `events list` (alias: `ev list`)

List recent events from the event store.

```bash
opencode-client events list [options]
```

**Options:**

- `--query <string>`: Filter events by query
- `--eventType <string>`: Filter by event type
- `--sessionId <string>`: Filter by session ID
- `--k <number>`: Number of events to return (default: 50)

**Example:**

```bash
opencode-client events list --eventType "message_sent" --k 10
```

#### `events subscribe`

Subscribe to real-time events from the OpenCode system.

```bash
opencode-client events subscribe [options]
```

**Options:**

- `--eventType <string>`: Filter by specific event type
- `--sessionId <string>`: Filter by session ID
- `--query <string>`: Filter by query pattern

**Example:**

```bash
opencode-client events subscribe --eventType "message_sent" --sessionId sess_1234567890
```

### Messages Commands

Manage and analyze messages within sessions.

#### `messages list` (alias: `msg list`)

List messages for a specific session.

```bash
opencode-client messages list <sessionId> [options]
```

**Arguments:**

- `sessionId`: Unique identifier of the session

**Options:**

- `--limit <number>`: Limit number of messages (default: 10)

**Example:**

```bash
opencode-client messages list sess_1234567890 --limit 20
```

#### `messages get <sessionId> <messageId>`

Retrieve a specific message from a session.

```bash
opencode-client messages get <sessionId> <messageId>
```

**Arguments:**

- `sessionId`: Unique identifier of the session
- `messageId`: Unique identifier of the message

**Example:**

```bash
opencode-client messages get sess_1234567890 msg_0987654321
```

#### `messages send <sessionId> <message>`

Send a message to a session.

```bash
opencode-client messages send <sessionId> <message>
```

**Arguments:**

- `sessionId`: Unique identifier of the session
- `message`: Message content to send

**Example:**

```bash
opencode-client messages send sess_1234567890 "Can you help me with this code?"
```

### Indexer Commands

Manage the OpenCode indexer service for active data capture.

#### `indexer start`

Start the indexer service to actively capture events and messages.

```bash
opencode-client indexer start [options]
```

**Options:**

- `--pm2`: Run as PM2 daemon instead of foreground process
- `--verbose`: Enable verbose logging
- `--baseUrl <url>`: OpenCode server base URL (default: 'http://localhost:4096')

**Example:**

```bash
opencode-client indexer start --pm2 --verbose
```

## Programmatic API

### Session Actions

#### `create(title?: string, message?: string): Promise<CreateSessionResult>`

Create a new session.

```typescript
import { create } from '@promethean-os/opencode-client';

const result = await create('My Session', 'Initial message');
// result: { sessionId: string, title: string, message: string }
```

#### `get(sessionId: string): Promise<GetSessionResult>`

Retrieve session details.

```typescript
import { get } from '@promethean-os/opencode-client';

const session = await get('sess_1234567890');
// session: { id, title, messages, metadata, ... }
```

#### `list(limit?: number, offset?: number): Promise<ListSessionsResult>`

List sessions with pagination.

```typescript
import { listSessions } from '@promethean-os/opencode-client';

const sessions = await listSessions(20, 0);
// sessions: { sessions: Session[], total: number, hasMore: boolean }
```

#### `close(sessionId: string): Promise<CloseSessionResult>`

Close a session.

```typescript
import { close } from '@promethean-os/opencode-client';

const result = await close('sess_1234567890');
// result: { sessionId: string, status: 'closed' }
```

#### `search(query: string, k?: number): Promise<SearchSessionsResult>`

Search sessions.

```typescript
import { search } from '@promethean-os/opencode-client';

const results = await search('TypeScript', 10);
// results: { sessions: Session[], query: string, total: number }
```

### Event Actions

#### `subscribe(options?: SubscribeOptions): Promise<SubscribeResult>`

Subscribe to real-time events.

```typescript
import { subscribe } from '@promethean-os/opencode-client';

const subscription = await subscribe({
  eventType: 'message_sent',
  sessionId: 'sess_1234567890',
});
// subscription: { subscriptionId, eventStream }
```

#### `listEvents(options?: ListEventsOptions): Promise<Event[]>`

List recent events.

```typescript
import { listEvents } from '@promethean-os/opencode-client';

const events = await listEvents({
  eventType: 'message_sent',
  k: 20,
});
// events: Event[]
```

### Message Actions

#### `listMessages(sessionId: string, limit?: number): Promise<Message[]>`

List messages in a session.

```typescript
import { listMessages } from '@promethean-os/opencode-client';

const messages = await listMessages('sess_1234567890', 10);
// messages: Message[]
```

#### `getMessage(sessionId: string, messageId: string): Promise<Message>`

Get a specific message.

```typescript
import { getMessage } from '@promethean-os/opencode-client';

const message = await getMessage('sess_1234567890', 'msg_0987654321');
// message: { id, content, timestamp, metadata, ... }
```

#### `sendMessage(sessionId: string, content: string): Promise<Message>`

Send a message to a session.

```typescript
import { sendMessage } from '@promethean-os/opencode-client';

const message = await sendMessage('sess_1234567890', 'Hello, world!');
// message: { id, content, timestamp, ... }
```

## Type Definitions

### Session Types

```typescript
interface Session {
  id: string;
  title?: string;
  createdAt: number;
  updatedAt: number;
  activityStatus: 'active' | 'idle' | 'closed';
  metadata?: Record<string, any>;
}

interface CreateSessionResult {
  sessionId: string;
  title?: string;
  message?: string;
}

interface GetSessionResult extends Session {
  messages: Message[];
  events: Event[];
}

interface ListSessionsResult {
  sessions: Session[];
  total: number;
  hasMore: boolean;
  limit: number;
  offset: number;
}

interface SearchSessionsResult {
  sessions: Session[];
  query: string;
  total: number;
  k: number;
}

interface CloseSessionResult {
  sessionId: string;
  status: 'closed';
  closedAt: number;
}
```

### Event Types

```typescript
interface Event {
  id: string;
  type: string;
  sessionId?: string;
  timestamp: number;
  data: Record<string, any>;
  metadata?: Record<string, any>;
}

interface SubscribeOptions {
  eventType?: string;
  sessionId?: string;
  query?: string;
}

interface SubscribeResult {
  subscriptionId: string;
  eventStream: AsyncIterable<Event>;
}

interface ListEventsOptions {
  query?: string;
  eventType?: string;
  sessionId?: string;
  k?: number;
}
```

### Message Types

```typescript
interface Message {
  id: string;
  sessionId: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: number;
  metadata?: Record<string, any>;
}
```

## Plugins

### OpencodeInterfacePlugin

Main plugin for OpenCode interface integration.

```typescript
import { OpencodeInterfacePlugin } from '@promethean-os/opencode-client';

const plugin = new OpencodeInterfacePlugin({
  baseUrl: 'http://localhost:4096',
  apiKey: 'your-api-key',
});
```

### RealtimeCapturePlugin

Plugin for real-time event and message capture.

```typescript
import { RealtimeCapturePlugin } from '@promethean-os/opencode-client';

const plugin = new RealtimeCapturePlugin({
  bufferSize: 1000,
  flushInterval: 5000,
});
```

### EventHooksPlugin

Plugin for event-driven hooks and callbacks.

```typescript
import { EventHooksPlugin } from '@promethean-os/opencode-client';

const plugin = new EventHooksPlugin({
  onMessage: (message) => console.log('New message:', message),
  onSessionCreated: (session) => console.log('Session created:', session),
});
```

## Error Handling

All API functions throw structured errors:

```typescript
interface OpenCodeError extends Error {
  code: string;
  statusCode?: number;
  details?: Record<string, any>;
}
```

Common error codes:

- `SESSION_NOT_FOUND`: Session does not exist
- `MESSAGE_NOT_FOUND`: Message does not exist
- `INVALID_SESSION_ID`: Malformed session ID
- `PERMISSION_DENIED`: Insufficient permissions
- `NETWORK_ERROR`: Connection issues
- `VALIDATION_ERROR`: Invalid input parameters

## Configuration

### Environment Variables

- `OPENCODE_BASE_URL`: OpenCode server URL (default: 'http://localhost:4096')
- `OPENCODE_API_KEY`: API authentication key
- `OPENCODE_TIMEOUT`: Request timeout in milliseconds (default: 30000)
- `OPENCODE_DEBUG`: Enable debug logging (true/false)

### Configuration Object

```typescript
interface OpenCodeConfig {
  baseUrl?: string;
  apiKey?: string;
  timeout?: number;
  debug?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
}
```

Example:

```typescript
import { configure } from '@promethean-os/opencode-client';

configure({
  baseUrl: 'https://api.opencode.com',
  apiKey: 'your-api-key',
  timeout: 60000,
  debug: true,
  retryAttempts: 3,
  retryDelay: 1000,
});
```
