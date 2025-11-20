# @promethean-os/broker

WebSocket message broker for event-driven communication.

## Features

- **Pub/Sub Messaging**: Topic-based publish/subscribe pattern
- **Real-time Communication**: WebSocket-based real-time messaging
- **Client Management**: Automatic client connection/disconnection handling
- **Message Routing**: Efficient message routing to subscribers
- **Type Safety**: Full TypeScript support
- **Error Handling**: Robust error handling and logging

## Installation

```bash
pnpm add @promethean-os/broker
```

## Usage

```typescript
import { start, stop } from '@promethean-os/broker';
import WebSocket from 'ws';

// Start broker server
const server = await start(7000);

// Stop broker server
await stop(server);
```

## Client Usage

Clients can connect to the broker and use three main actions:

### Subscribe to Topics

```json
{
  "action": "subscribe",
  "topic": "events"
}
```

### Unsubscribe from Topics

```json
{
  "action": "unsubscribe",
  "topic": "events"
}
```

### Publish Messages

```json
{
  "action": "publish",
  "message": {
    "type": "events",
    "payload": { "data": "value" },
    "timestamp": "2025-01-01T00:00:00Z"
  }
}
```

## Message Format

All messages are normalized to the following format:

```typescript
interface Event {
  type: string; // Event type/topic
  source?: string; // Source identifier
  payload?: unknown; // Event payload
  timestamp?: string; // ISO timestamp
  correlationId?: string; // For request/response correlation
  replyTo?: string; // For response routing
}
```

## Environment Variables

- `PORT`: Broker port (default: 7000)
- `NODE_ENV`: Set to 'test' to disable auto-start

## API

### start(port?)

Starts the WebSocket broker server.

**Parameters:**

- `port`: Port number (default: 7000)

**Returns:** Promise<WebSocketServer>

### stop(server)

Stops the WebSocket broker server.

**Parameters:**

- `server`: WebSocketServer instance to stop

## License

GPL-3.0-only
