# @promethean-os/event

Event sourcing and handling utilities for the Promethean ecosystem.

## Installation

```bash
pnpm add @promethean-os/event
```

## Usage

```typescript
import { InMemoryEventBus, EventRecord } from '@promethean-os/event';

// Create an event bus
const eventBus = new InMemoryEventBus();

// Publish an event
const event = await eventBus.publish('user.created', {
  userId: '123',
  email: 'user@example.com',
});

// Subscribe to events
const unsubscribe = await eventBus.subscribe(
  'user.created',
  'user-service',
  async (event: EventRecord, ctx) => {
    console.log('User created:', event.payload);
  },
);
```

## Types

### Core Types

- `EventRecord<T>` - Represents an event with metadata
- `EventBus` - Interface for event bus implementations
- `DeliveryContext` - Context for event delivery
- `SubscribeOptions` - Options for subscribing to events
- `PublishOptions` - Options for publishing events

### Implementations

- `InMemoryEventBus` - In-memory event bus implementation
- `MongoEventStore` - MongoDB-based event store
- `MongoCursorStore` - MongoDB-based cursor store

## Features

- **Type-safe** event handling with TypeScript
- **In-memory** and **MongoDB** storage options
- **Event sourcing** support with cursor tracking
- **Flexible subscription** options with filtering
- **Acknowledgment** and retry mechanisms

## Configuration

Default configuration is available via `EVENT_BUS_CONFIG`:

```typescript
import { EVENT_BUS_CONFIG } from '@promethean-os/event';

console.log(EVENT_BUS_CONFIG.DEFAULT_BATCH_SIZE); // 100
console.log(EVENT_BUS_CONFIG.DEFAULT_ACK_TIMEOUT_MS); // 30000
```
