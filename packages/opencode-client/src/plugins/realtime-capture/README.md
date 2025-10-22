# Real-time Capture Plugin

Provides real-time monitoring and capture of OpenCode events, messages, and sessions.

## Features

- **Real-time Event Capture**: Captures all OpenCode events as they happen
- **Session Monitoring**: Track session updates and changes
- **Message Tracking**: Monitor message creation and updates
- **Filtering Options**: Filter events by type, session ID, etc.
- **Memory Management**: Automatically limits captured events to prevent memory issues

## Tools

### `start-realtime-capture`

Starts real-time capture of OpenCode events.

```bash
start-realtime-capture
```

### `stop-realtime-capture`

Stops real-time capture and provides a summary.

```bash
stop-realtime-capture
```

### `get-captured-events`

Retrieves recently captured events with filtering options.

```bash
get-captured-events --limit=50 --eventType="message.updated" --format="table"
```

### `get-capture-status`

Gets the current status of real-time capture.

```bash
get-capture-status
```

### `clear-captured-events`

Clears all captured events from memory.

```bash
clear-captured-events
```

### `get-active-sessions-realtime`

Gets current active sessions with real-time status.

```bash
get-active-sessions-realtime --includeMessages=true
```

## Usage Example

1. Start capturing events:

   ```bash
   start-realtime-capture
   ```

2. Do some work in OpenCode sessions

3. Check what was captured:

   ```bash
   get-captured-events --limit=10 --format="table"
   ```

4. Stop capturing and get summary:
   ```bash
   stop-realtime-capture
   ```

## Event Types

The plugin captures all OpenCode event types including:

- `message.updated` - Message updates
- `message.removed` - Message deletions
- `message.part.updated` - Message part updates
- `session.updated` - Session updates
- `session.idle` - Session idle events
- `session.compacted` - Session compaction
- `permission.updated` - Permission changes
- `file.edited` - File edits
- `server.connected` - Server connections
- And more...

## Memory Management

The plugin automatically limits the number of captured events to prevent memory issues:

- Maximum events stored: 1000
- Events are automatically trimmed to keep only the most recent
- Use `clear-captured-events` to manually clear memory

## Integration with Indexer

This plugin uses the same event handling logic as the indexer, ensuring consistency and reliability across the system.
