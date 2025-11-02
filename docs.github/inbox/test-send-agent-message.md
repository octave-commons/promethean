# send_agent_message Command Documentation

## Overview

The `send_agent_message` command has been successfully added to the `@.opencode/plugin/async-sub-agents.ts` file, enabling inter-agent communication.

## Usage

```typescript
await send_agent_message({
  sessionId: 'agent-session-id',
  message: 'Your message here',
  priority: 'medium', // optional: 'low', 'medium', 'high', 'urgent'
  messageType: 'instruction', // optional: 'instruction', 'query', 'update', 'coordination', 'status_request'
});
```

## Features

- **Target Validation**: Verifies the target session exists and is an agent
- **Message Formatting**: Structured messages with metadata and timestamps
- **Priority Levels**: Support for different message priorities
- **Message Types**: Categorized communication (instruction, query, update, etc.)
- **Activity Tracking**: Updates target agent status and logs communication
- **Persistent Storage**: Stores inter-agent communications in the session store

## Message Format

Messages are formatted with:

- Sender and recipient identification (truncated session IDs)
- Priority level and message type
- Timestamp
- Structured content
- Call to action for response

## Error Handling

- Validates target agent existence
- Handles communication failures gracefully
- Provides clear success/error feedback
- Logs all communications for debugging

## Integration

The command integrates with existing agent monitoring systems:

- Updates agent activity status
- Stores communication history
- Works with DualStore persistence
- Maintains agent task tracking

This enables powerful coordination between spawned agents for complex workflows.
