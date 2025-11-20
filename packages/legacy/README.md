# @promethean-os/legacy

Legacy utilities and compatibility layer for Promethean framework.

## Features

- **Queue Management**: Task queue system for background processing
- **Broker Client**: WebSocket client for message broker communication
- **Environment Configuration**: Centralized environment variable handling
- **Worker Management**: Worker registration and heartbeat monitoring
- **Task Dispatch**: Intelligent task routing and rate limiting

## Installation

```bash
pnpm add @promethean-os/legacy
```

## Usage

### Queue Manager

```typescript
import { queueManager } from '@promethean-os/legacy';

// Register worker
queueManager.ready(workerSocket, workerId, 'task-queue');

// Enqueue task
const task = queueManager.enqueue('task-queue', { data: 'value' });

// Acknowledge task
queueManager.acknowledge(workerId, task.id);

// Get state
const state = queueManager.getState();
```

### Broker Client

```typescript
import { BrokerClient } from '@promethean-os/legacy/brokerClient.js';

const client = new BrokerClient({
  url: 'ws://localhost:7000',
  id: 'my-client',
});

await client.connect();

// Subscribe to events
client.subscribe('events', (event) => {
  console.log('Received event:', event);
});

// Publish event
client.publish('events', { type: 'test', payload: 'data' });

// Disconnect
client.disconnect();
```

## Environment Variables

- `BROKER_HEARTBEAT_MS`: Heartbeat interval in milliseconds (default: 30000)
- `WORKER_SWEEP_INTERVAL_MS`: Worker cleanup interval (default: 30000)
- `WORKER_EXPIRE_MS`: Worker expiry time (default: 60000)

## License

GPL-3.0-only
