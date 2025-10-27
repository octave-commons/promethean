# Pantheon Protocol

## Overview

`@promethean-os/pantheon-protocol` provides a comprehensive message protocol with envelope messaging and multiple transport implementations for the Pantheon ecosystem. It enables secure, reliable communication between agents, services, and external systems.

## Key Features

- **Envelope Messaging**: Structured message envelopes with metadata and routing
- **Multiple Transports**: Support for AMQP, WebSocket, and in-memory transports
- **Message Security**: Built-in message signing and validation
- **Dead Letter Queue**: Automatic handling of failed messages
- **Type Safety**: Full TypeScript support with Zod validation
- **Extensible Design**: Easy to add custom transports

## Installation

```bash
pnpm add @promethean-os/pantheon-protocol
```

## Core Concepts

### Message Envelope

The envelope provides a standardized wrapper for all messages in the system:

```typescript
import { Envelope, EnvelopeBuilder } from '@promethean-os/pantheon-protocol';

// Create a message envelope
const envelope = new EnvelopeBuilder()
  .setId('msg-12345')
  .setFrom('agent-001')
  .setTo('agent-002')
  .setType('user-message')
  .setContent('Hello, how can I help you?')
  .setMetadata({
    priority: 'high',
    conversationId: 'conv-67890',
    timestamp: Date.now(),
  })
  .build();

console.log(envelope);
// Output:
// {
//   id: 'msg-12345',
//   from: 'agent-001',
//   to: 'agent-002',
//   type: 'user-message',
//   content: 'Hello, how can I help you?',
//   metadata: { priority: 'high', conversationId: 'conv-67890', timestamp: 1699123456789 },
//   signature: 'sha256-abc123...',
//   timestamp: 1699123456789
// }
```

### Transport Layer

Transports handle the actual delivery of messages between systems:

```typescript
import { AMQPTransport, WebSocketTransport, BaseTransport } from '@promethean-os/pantheon-protocol';

// AMQP Transport for distributed systems
const amqpTransport = new AMQPTransport({
  url: 'amqp://localhost:5672',
  exchange: 'pantheon',
  queue: 'agent-messages',
  options: {
    durable: true,
    autoDelete: false,
  },
});

// WebSocket Transport for real-time communication
const wsTransport = new WebSocketTransport({
  port: 8080,
  path: '/ws',
  options: {
    heartbeatInterval: 30000,
    maxConnections: 1000,
  },
});

// In-memory Transport for testing and local development
const memoryTransport = new BaseTransport({
  type: 'memory',
  options: {
    maxMessages: 1000,
    enablePersistence: false,
  },
});
```

## Advanced Usage

### Custom Transport Implementation

```typescript
import { BaseTransport, Envelope } from '@promethean-os/pantheon-protocol';

class HTTPTransport extends BaseTransport {
  private server: any;
  private clients = new Map<string, any>();

  constructor(config: HTTPTransportConfig) {
    super({ type: 'http', ...config });
    this.setupServer(config);
  }

  async send(envelope: Envelope): Promise<void> {
    const targetClient = this.clients.get(envelope.to);

    if (!targetClient) {
      throw new Error(`Target ${envelope.to} not connected`);
    }

    try {
      await targetClient.send(JSON.stringify(envelope));
    } catch (error) {
      // Add to dead letter queue
      await this.deadLetterQueue?.add(envelope, error);
      throw error;
    }
  }

  async subscribe(
    recipientId: string,
    handler: (envelope: Envelope) => Promise<void>,
  ): Promise<() => void> {
    this.clients.set(recipientId, { handler });

    // Return unsubscribe function
    return () => {
      this.clients.delete(recipientId);
    };
  }

  private setupServer(config: HTTPTransportConfig) {
    // Setup HTTP server with WebSocket support
    this.server = new WebSocketServer({
      port: config.port,
      path: config.path,
    });

    this.server.on('connection', (ws, request) => {
      const clientId = this.extractClientId(request);

      ws.on('message', async (data) => {
        try {
          const envelope = JSON.parse(data.toString());
          await this.handleIncomingMessage(envelope);
        } catch (error) {
          console.error('Invalid message format:', error);
        }
      });

      ws.on('close', () => {
        this.clients.delete(clientId);
      });

      this.clients.set(clientId, ws);
    });
  }

  private extractClientId(request: any): string {
    // Extract client ID from request headers or query parameters
    return (
      request.headers['x-client-id'] || request.url?.split('client=')[1] || `client-${Date.now()}`
    );
  }

  private async handleIncomingMessage(envelope: Envelope) {
    // Validate message
    const isValid = await this.validateMessage(envelope);
    if (!isValid) {
      throw new Error('Invalid message signature');
    }

    // Route to handler
    const client = this.clients.get(envelope.to);
    if (client && client.handler) {
      await client.handler(envelope);
    }
  }

  private async validateMessage(envelope: Envelope): Promise<boolean> {
    // Implement message validation logic
    const validator = new MessageValidator();
    return await validator.validate(envelope);
  }
}

interface HTTPTransportConfig {
  port: number;
  path: string;
  enableAuth?: boolean;
  maxConnections?: number;
}
```

### Message Signing and Validation

```typescript
import { MessageSigner, MessageValidator } from '@promethean-os/pantheon-protocol';

// Message signing
class SecureMessageSigner implements MessageSigner {
  private privateKey: string;

  constructor(privateKey: string) {
    this.privateKey = privateKey;
  }

  async sign(message: any): Promise<string> {
    const crypto = await import('crypto');
    const messageString = JSON.stringify(message);

    const signature = crypto
      .createHmac('sha256', this.privateKey)
      .update(messageString)
      .digest('hex');

    return `sha256-${signature}`;
  }

  async verify(message: any, signature: string): Promise<boolean> {
    const expectedSignature = await this.sign(message);
    return signature === expectedSignature;
  }
}

// Message validation
class StrictMessageValidator implements MessageValidator {
  private schema: any;

  constructor() {
    // Define Zod schema for envelope validation
    this.schema = z.object({
      id: z.string().uuid(),
      from: z.string().min(1),
      to: z.string().min(1),
      type: z.string().min(1),
      content: z.any(),
      timestamp: z.number().positive(),
      signature: z.string().optional(),
      metadata: z.record(z.any()).optional(),
    });
  }

  async validate(envelope: any): Promise<boolean> {
    try {
      // Validate structure
      this.schema.parse(envelope);

      // Validate timestamp (not too old or in future)
      const now = Date.now();
      const maxAge = 300000; // 5 minutes
      const futureTolerance = 5000; // 5 seconds

      if (envelope.timestamp < now - maxAge) {
        console.warn('Message too old:', envelope.timestamp);
        return false;
      }

      if (envelope.timestamp > now + futureTolerance) {
        console.warn('Message from future:', envelope.timestamp);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Validation error:', error);
      return false;
    }
  }
}
```

### Dead Letter Queue Management

```typescript
import { MemoryDeadLetterQueue } from '@promethean-os/pantheon-protocol';

class EnhancedDeadLetterQueue extends MemoryDeadLetterQueue {
  private retryStrategies = new Map<string, RetryStrategy>();

  constructor() {
    super({ maxMessages: 1000, enablePersistence: true });
    this.setupDefaultStrategies();
  }

  async add(envelope: Envelope, error: Error): Promise<void> {
    const strategy = this.retryStrategies.get(envelope.type);

    if (strategy && strategy.shouldRetry(envelope, error)) {
      // Schedule retry
      await this.scheduleRetry(envelope, strategy);
    } else {
      // Add to dead letter queue
      await super.add(envelope, error);

      // Notify monitoring system
      await this.notifyFailure(envelope, error);
    }
  }

  private setupDefaultStrategies() {
    // Retry strategy for user messages
    this.retryStrategies.set('user-message', {
      maxRetries: 3,
      backoffMs: 1000,
      backoffMultiplier: 2,
      retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND'],
    });

    // Retry strategy for system messages
    this.retryStrategies.set('system-message', {
      maxRetries: 5,
      backoffMs: 500,
      backoffMultiplier: 1.5,
      retryableErrors: ['ECONNRESET', 'ETIMEDOUT'],
    });

    // No retry for critical errors
    this.retryStrategies.set('critical-error', {
      maxRetries: 0,
      backoffMs: 0,
      backoffMultiplier: 1,
      retryableErrors: [],
    });
  }

  private async scheduleRetry(envelope: Envelope, strategy: RetryStrategy) {
    const retryCount = (envelope.metadata?.retryCount || 0) + 1;
    const delay = strategy.backoffMs * Math.pow(strategy.backoffMultiplier, retryCount - 1);

    // Update envelope with retry information
    const retryEnvelope = {
      ...envelope,
      metadata: {
        ...envelope.metadata,
        retryCount,
        lastRetry: Date.now(),
        originalTimestamp: envelope.timestamp,
      },
    };

    // Schedule retry
    setTimeout(async () => {
      try {
        await this.transport.send(retryEnvelope);
      } catch (error) {
        await this.add(retryEnvelope, error as Error);
      }
    }, delay);
  }

  private async notifyFailure(envelope: Envelope, error: Error) {
    // Send alert to monitoring system
    const alert = {
      type: 'message-failure',
      envelopeId: envelope.id,
      from: envelope.from,
      to: envelope.to,
      error: error.message,
      timestamp: Date.now(),
    };

    // Send to monitoring service
    await this.sendAlert(alert);
  }
}

interface RetryStrategy {
  maxRetries: number;
  backoffMs: number;
  backoffMultiplier: number;
  retryableErrors: string[];
}
```

### Message Routing and Filtering

```typescript
class MessageRouter {
  private routes = new Map<string, RouteHandler[]>();
  private filters = new Map<string, MessageFilter[]>();

  addRoute(pattern: string, handler: RouteHandler) {
    if (!this.routes.has(pattern)) {
      this.routes.set(pattern, []);
    }
    this.routes.get(pattern)!.push(handler);
  }

  addFilter(type: string, filter: MessageFilter) {
    if (!this.filters.has(type)) {
      this.filters.set(type, []);
    }
    this.filters.get(type)!.push(filter);
  }

  async route(envelope: Envelope): Promise<void> {
    // Apply filters
    const filters = this.filters.get(envelope.type) || [];
    for (const filter of filters) {
      if (!(await filter(envelope))) {
        console.log(`Message ${envelope.id} filtered out by ${filter.name}`);
        return;
      }
    }

    // Find matching routes
    const matchingRoutes = Array.from(this.routes.entries())
      .filter(([pattern]) => this.matchesPattern(envelope, pattern))
      .flatMap(([, handlers]) => handlers);

    // Execute handlers
    for (const handler of matchingRoutes) {
      try {
        await handler(envelope);
      } catch (error) {
        console.error(`Route handler failed for message ${envelope.id}:`, error);
      }
    }
  }

  private matchesPattern(envelope: Envelope, pattern: string): boolean {
    // Simple pattern matching (can be extended with regex)
    if (pattern === '*') return true;
    if (pattern === envelope.type) return true;
    if (pattern.endsWith('*')) {
      const prefix = pattern.slice(0, -1);
      return envelope.type.startsWith(prefix);
    }
    return false;
  }
}

// Usage example
const router = new MessageRouter();

// Add routes
router.addRoute('user-message', async (envelope) => {
  console.log(`User message from ${envelope.from}: ${envelope.content}`);
});

router.addRoute('system-*', async (envelope) => {
  console.log(`System message: ${envelope.type}`);
});

// Add filters
router.addFilter('user-message', async (envelope) => {
  // Filter out messages from blocked users
  const blockedUsers = ['user-123', 'user-456'];
  return !blockedUsers.includes(envelope.from);
});

router.addFilter('*', async (envelope) => {
  // Rate limiting filter
  const key = `${envelope.from}-${envelope.to}`;
  const now = Date.now();
  const lastMessage = this.lastMessages.get(key);

  if (lastMessage && now - lastMessage < 1000) {
    return false; // Rate limited
  }

  this.lastMessages.set(key, now);
  return true;
});
```

## Integration Patterns

### Multi-Transport Setup

```typescript
import { AMQPTransport, WebSocketTransport, BaseTransport } from '@promethean-os/pantheon-protocol';

class MultiTransportManager {
  private transports: Map<string, any> = new Map();
  private defaultTransport?: string;

  constructor() {
    this.setupTransports();
  }

  private setupTransports() {
    // AMQP for reliable, persistent messaging
    const amqpTransport = new AMQPTransport({
      url: process.env.AMQP_URL || 'amqp://localhost:5672',
      exchange: 'pantheon',
      queue: 'agent-messages',
      options: {
        durable: true,
        autoDelete: false,
        messageTtl: 3600000, // 1 hour
      },
    });

    // WebSocket for real-time communication
    const wsTransport = new WebSocketTransport({
      port: 8080,
      path: '/ws',
      options: {
        heartbeatInterval: 30000,
        maxConnections: 1000,
      },
    });

    // In-memory for local development and testing
    const memoryTransport = new BaseTransport({
      type: 'memory',
      options: {
        maxMessages: 1000,
        enablePersistence: false,
      },
    });

    this.transports.set('amqp', amqpTransport);
    this.transports.set('websocket', wsTransport);
    this.transports.set('memory', memoryTransport);

    // Set default based on environment
    this.defaultTransport = process.env.NODE_ENV === 'production' ? 'amqp' : 'memory';
  }

  async send(envelope: Envelope, transportType?: string): Promise<void> {
    const transportName = transportType || this.defaultTransport || 'memory';
    const transport = this.transports.get(transportName);

    if (!transport) {
      throw new Error(`Transport ${transportName} not found`);
    }

    // Add routing metadata
    const routedEnvelope = {
      ...envelope,
      metadata: {
        ...envelope.metadata,
        transport: transportName,
        routedAt: Date.now(),
      },
    };

    await transport.send(routedEnvelope);
  }

  async subscribe(
    recipientId: string,
    handler: (envelope: Envelope) => Promise<void>,
    transportType?: string,
  ): Promise<() => void> {
    const transportName = transportType || this.defaultTransport || 'memory';
    const transport = this.transports.get(transportName);

    if (!transport) {
      throw new Error(`Transport ${transportName} not found`);
    }

    return await transport.subscribe(recipientId, handler);
  }

  async broadcast(envelope: Envelope): Promise<void> {
    // Send to all transports for redundancy
    const promises = Array.from(this.transports.entries()).map(async ([name, transport]) => {
      try {
        const broadcastEnvelope = {
          ...envelope,
          metadata: {
            ...envelope.metadata,
            broadcast: true,
            transport: name,
          },
        };
        await transport.send(broadcastEnvelope);
      } catch (error) {
        console.error(`Broadcast failed on ${name}:`, error);
      }
    });

    await Promise.allSettled(promises);
  }
}
```

### Agent Communication

```typescript
class AgentCommunicator {
  private transportManager: MultiTransportManager;
  private agentId: string;
  private subscriptions = new Map<string, () => void>();

  constructor(agentId: string, transportManager: MultiTransportManager) {
    this.agentId = agentId;
    this.transportManager = transportManager;
  }

  async sendMessage(to: string, content: any, type: string = 'message'): Promise<void> {
    const envelope = new EnvelopeBuilder()
      .setId(this.generateMessageId())
      .setFrom(this.agentId)
      .setTo(to)
      .setType(type)
      .setContent(content)
      .setMetadata({
        timestamp: Date.now(),
        userAgent: 'pantheon-agent',
      })
      .build();

    await this.transportManager.send(envelope);
  }

  async broadcastMessage(content: any, type: string = 'broadcast'): Promise<void> {
    const envelope = new EnvelopeBuilder()
      .setId(this.generateMessageId())
      .setFrom(this.agentId)
      .setTo('*')
      .setType(type)
      .setContent(content)
      .setMetadata({
        timestamp: Date.now(),
        broadcast: true,
      })
      .build();

    await this.transportManager.broadcast(envelope);
  }

  async subscribeToMessages(
    from?: string,
    handler?: (envelope: Envelope) => Promise<void>,
  ): Promise<() => void> {
    const subscriptionKey = from || '*';

    const wrappedHandler = async (envelope: Envelope) => {
      // Filter messages
      if (from && envelope.from !== from) {
        return;
      }

      if (envelope.to !== this.agentId && envelope.to !== '*') {
        return;
      }

      if (handler) {
        await handler(envelope);
      } else {
        await this.handleIncomingMessage(envelope);
      }
    };

    const unsubscribe = await this.transportManager.subscribe(this.agentId, wrappedHandler);

    this.subscriptions.set(subscriptionKey, unsubscribe);
    return unsubscribe;
  }

  async handleIncomingMessage(envelope: Envelope): Promise<void> {
    console.log(`Received message from ${envelope.from}:`, envelope.content);

    // Handle different message types
    switch (envelope.type) {
      case 'ping':
        await this.sendPong(envelope.from);
        break;
      case 'request':
        await this.handleRequest(envelope);
        break;
      case 'notification':
        await this.handleNotification(envelope);
        break;
      default:
        console.log(`Unknown message type: ${envelope.type}`);
    }
  }

  private async sendPong(to: string): Promise<void> {
    await this.sendMessage(to, { pong: true }, 'pong');
  }

  private async handleRequest(envelope: Envelope): Promise<void> {
    // Handle request messages
    const response = await this.processRequest(envelope.content);
    await this.sendMessage(envelope.from, response, 'response');
  }

  private async handleNotification(envelope: Envelope): Promise<void> {
    // Handle notification messages
    console.log(`Notification from ${envelope.from}:`, envelope.content);
  }

  private async processRequest(request: any): Promise<any> {
    // Implement request processing logic
    return { status: 'processed', data: request };
  }

  private generateMessageId(): string {
    return `msg-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  async disconnect(): Promise<void> {
    // Unsubscribe from all messages
    for (const unsubscribe of this.subscriptions.values()) {
      unsubscribe();
    }
    this.subscriptions.clear();
  }
}
```

## Performance Optimization

### Connection Pooling

```typescript
class PooledAMQPTransport extends AMQPTransport {
  private connectionPool: any[] = [];
  private maxPoolSize = 10;
  private activeConnections = 0;

  constructor(config: any) {
    super(config);
  }

  async getConnection(): Promise<any> {
    if (this.connectionPool.length > 0) {
      return this.connectionPool.pop();
    }

    if (this.activeConnections < this.maxPoolSize) {
      this.activeConnections++;
      return await this.createConnection();
    }

    // Wait for available connection
    return await this.waitForConnection();
  }

  async releaseConnection(connection: any): Promise<void> {
    if (this.connectionPool.length < this.maxPoolSize && connection.isOpen()) {
      this.connectionPool.push(connection);
    } else {
      connection.close();
      this.activeConnections--;
    }
  }

  private async waitForConnection(): Promise<any> {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (this.connectionPool.length > 0 || this.activeConnections < this.maxPoolSize) {
          clearInterval(checkInterval);
          resolve(this.getConnection());
        }
      }, 100);
    });
  }

  async send(envelope: Envelope): Promise<void> {
    const connection = await this.getConnection();

    try {
      await connection.send(envelope);
    } finally {
      await this.releaseConnection(connection);
    }
  }
}
```

### Message Batching

```typescript
class BatchingTransport extends BaseTransport {
  private messageQueue: Envelope[] = [];
  private batchSize = 100;
  private batchTimeout = 1000; // 1 second
  private batchTimer?: any;

  constructor(config: any) {
    super(config);
    this.startBatchTimer();
  }

  async send(envelope: Envelope): Promise<void> {
    this.messageQueue.push(envelope);

    if (this.messageQueue.length >= this.batchSize) {
      await this.flushBatch();
    }
  }

  private startBatchTimer() {
    this.batchTimer = setInterval(() => {
      if (this.messageQueue.length > 0) {
        this.flushBatch();
      }
    }, this.batchTimeout);
  }

  private async flushBatch(): Promise<void> {
    if (this.messageQueue.length === 0) {
      return;
    }

    const batch = this.messageQueue.splice(0, this.batchSize);

    try {
      await this.sendBatch(batch);
    } catch (error) {
      // Re-queue failed messages
      this.messageQueue.unshift(...batch);
      throw error;
    }
  }

  private async sendBatch(batch: Envelope[]): Promise<void> {
    // Implement batch sending logic
    const batchEnvelope = {
      id: this.generateId(),
      type: 'batch',
      content: batch,
      timestamp: Date.now(),
    };

    await this.transport.send(batchEnvelope);
  }

  private generateId(): string {
    return `batch-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
}
```

## Testing

### Unit Testing

```typescript
import test from 'ava';
import { BaseTransport, EnvelopeBuilder } from '@promethean-os/pantheon-protocol';

test('transport send and receive', async (t) => {
  const transport = new BaseTransport({ type: 'memory' });

  const envelope = new EnvelopeBuilder()
    .setId('test-123')
    .setFrom('sender')
    .setTo('receiver')
    .setType('test')
    .setContent('Hello World')
    .build();

  let receivedEnvelope: Envelope | null = null;

  const unsubscribe = await transport.subscribe('receiver', async (env) => {
    receivedEnvelope = env;
  });

  await transport.send(envelope);

  // Wait for async processing
  await new Promise((resolve) => setTimeout(resolve, 100));

  t.truthy(receivedEnvelope);
  t.is(receivedEnvelope?.id, envelope.id);
  t.is(receivedEnvelope?.content, envelope.content);

  unsubscribe();
});
```

### Integration Testing

```typescript
test('AMQP transport integration', async (t) => {
  if (!process.env.AMQP_URL) {
    t.pass('Skipping AMQP integration test - no URL configured');
    return;
  }

  const transport = new AMQPTransport({
    url: process.env.AMQP_URL,
    exchange: 'test-exchange',
    queue: 'test-queue',
  });

  const envelope = new EnvelopeBuilder()
    .setId('integration-test')
    .setFrom('test-sender')
    .setTo('test-receiver')
    .setType('test')
    .setContent('Integration test message')
    .build();

  let receivedEnvelope: Envelope | null = null;

  const unsubscribe = await transport.subscribe('test-receiver', async (env) => {
    receivedEnvelope = env;
  });

  await transport.send(envelope);

  // Wait for message delivery
  await new Promise((resolve) => setTimeout(resolve, 2000));

  t.truthy(receivedEnvelope);
  t.is(receivedEnvelope?.id, envelope.id);

  unsubscribe();
  await transport.disconnect();
});
```

## Security Considerations

### Message Encryption

```typescript
import { createCipher, createDecipher } from 'crypto';

class EncryptedTransport extends BaseTransport {
  private encryptionKey: string;
  private baseTransport: any;

  constructor(config: any, encryptionKey: string) {
    super(config);
    this.encryptionKey = encryptionKey;
    this.baseTransport = new BaseTransport(config);
  }

  async send(envelope: Envelope): Promise<void> {
    const encryptedEnvelope = await this.encryptEnvelope(envelope);
    await this.baseTransport.send(encryptedEnvelope);
  }

  async subscribe(
    recipientId: string,
    handler: (envelope: Envelope) => Promise<void>,
  ): Promise<() => void> {
    return await this.baseTransport.subscribe(recipientId, async (encryptedEnvelope) => {
      const decryptedEnvelope = await this.decryptEnvelope(encryptedEnvelope);
      await handler(decryptedEnvelope);
    });
  }

  private async encryptEnvelope(envelope: Envelope): Promise<Envelope> {
    const cipher = createCipher('aes-256-cbc', this.encryptionKey);
    const iv = cipher.randomBytes(16);

    let encrypted = cipher.update(JSON.stringify(envelope), 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return {
      ...envelope,
      content: {
        encrypted: true,
        data: encrypted,
        iv: iv.toString('hex'),
      },
      metadata: {
        ...envelope.metadata,
        encrypted: true,
      },
    };
  }

  private async decryptEnvelope(encryptedEnvelope: Envelope): Promise<Envelope> {
    if (!encryptedEnvelope.content?.encrypted) {
      return encryptedEnvelope;
    }

    const decipher = createDecipher('aes-256-cbc', this.encryptionKey);
    const iv = Buffer.from(encryptedEnvelope.content.iv, 'hex');

    let decrypted = decipher.update(encryptedEnvelope.content.data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  }
}
```

## Related Documentation

- [pantheon-core](pantheon-core.md): Core framework concepts
- [pantheon-orchestrator](pantheon-orchestrator.md): Agent coordination
- [pantheon-state](pantheon-state.md): State management
- [Integration Guide](integration-guide.md): Integration patterns

## File Locations

- **Protocol Types**: `/packages/pantheon-protocol/src/types.ts`
- **Envelope**: `/packages/pantheon-protocol/src/envelope.ts`
- **Base Transport**: `/packages/pantheon-protocol/src/transport.ts`
- **AMQP Transport**: `/packages/pantheon-protocol/src/amqp-transport.ts`
- **WebSocket Transport**: `/packages/pantheon-protocol/src/websocket-transport.ts`
- **Tests**: `/packages/pantheon-protocol/src/tests/`

---

Pantheon Protocol provides a robust, secure, and flexible messaging foundation for the Pantheon ecosystem, enabling reliable communication between agents and services across multiple transport mechanisms.
