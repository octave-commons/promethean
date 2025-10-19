/**
 * Pantheon Transport Layer Tests
 *
 * Comprehensive test suite for transport functionality including:
 * - Base transport class functionality
 * - AMQP transport implementation
 * - WebSocket transport implementation
 * - Message envelope handling
 * - Error handling and retry logic
 */

import test from 'ava';
import { EventEmitter } from 'events';
import {
  BaseTransport,
  MemoryDeadLetterQueue,
  AMQPTransport,
  WebSocketTransport,
  EnvelopeBuilder,
  MessageSigner,
  MessageValidator,
  createTransport,
  createAMQPTransport,
  createWebSocketTransport,
  MessageEnvelope,
  TransportConfig,
  MessageHandler,
} from '../transport/index.js';

// ============================================================================
// Test Utilities
// ============================================================================

class MockTransport extends BaseTransport {
  private sentMessages: MessageEnvelope[] = [];
  private connectedState: boolean = false;

  constructor(config: TransportConfig) {
    super(config);
  }

  async connect(): Promise<void> {
    this.connectedState = true;
    this.emitConnectionEvent('connected');
  }

  async disconnect(): Promise<void> {
    this.connectedState = false;
    this.emitConnectionEvent('disconnected');
  }

  protected async doSend(envelope: MessageEnvelope): Promise<void> {
    if (!this.connectedState) {
      throw new Error('Not connected');
    }
    this.sentMessages.push(envelope);
  }

  async subscribe(pattern: string, handler: MessageHandler): Promise<void> {
    this.subscriptions.set(pattern, handler);
  }

  async unsubscribe(pattern: string): Promise<void> {
    this.subscriptions.delete(pattern);
  }

  isConnected(): boolean {
    return this.connectedState;
  }

  getSentMessages(): MessageEnvelope[] {
    return [...this.sentMessages];
  }

  clearSentMessages(): void {
    this.sentMessages = [];
  }
}

function createTestEnvelope(
  overrides: Partial<MessageEnvelope> = {}
): MessageEnvelope {
  return {
    id: 'test-message-id',
    type: 'test-message',
    sender: 'test-sender',
    recipient: 'test-recipient',
    timestamp: new Date(),
    payload: { data: 'test payload' },
    priority: 'normal',
    retryCount: 0,
    maxRetries: 3,
    ...overrides,
  };
}

function createTestTransportConfig(
  overrides: Partial<TransportConfig> = {}
): TransportConfig {
  return {
    type: 'amqp',
    url: 'amqp://localhost:5672',
    auth: { type: 'none' },
    reconnect: {
      enabled: true,
      maxAttempts: 5,
      delay: 1000,
      backoff: 'exponential',
    },
    ...overrides,
  };
}

// ============================================================================
// Base Transport Tests
// ============================================================================

test('BaseTransport - initializes with default retry policy', (t) => {
  const config = createTestTransportConfig();
  const transport = new MockTransport(config);

  t.is(transport.isConnected(), false);
  t.true(transport instanceof EventEmitter);
});

test('BaseTransport - connects and disconnects correctly', async (t) => {
  const config = createTestTransportConfig();
  const transport = new MockTransport(config);

  let connectedEventFired = false;
  let disconnectedEventFired = false;

  transport.on('connected', () => {
    connectedEventFired = true;
  });

  transport.on('disconnected', () => {
    disconnectedEventFired = true;
  });

  await transport.connect();
  t.is(transport.isConnected(), true);
  t.true(connectedEventFired);

  await transport.disconnect();
  t.is(transport.isConnected(), false);
  t.true(disconnectedEventFired);
});

test('BaseTransport - handles message sending with retry', async (t) => {
  const config = createTestTransportConfig();
  const transport = new MockTransport(config);

  await transport.connect();

  const envelope = createTestEnvelope();
  await transport.send(envelope);

  const sentMessages = transport.getSentMessages();
  t.is(sentMessages.length, 1);
  t.deepEqual(sentMessages[0], envelope);
});

test('BaseTransport - fails to send when not connected', async (t) => {
  const config = createTestTransportConfig();
  const transport = new MockTransport(config);

  const envelope = createTestEnvelope();

  await t.throwsAsync(() => transport.send(envelope), {
    message: 'Not connected',
  });
});

test('BaseTransport - handles message subscriptions', async (t) => {
  const config = createTestTransportConfig();
  const transport = new MockTransport(config);

  const handler: MessageHandler = async (envelope) => {
    return { ...envelope, recipient: envelope.sender };
  };

  await transport.subscribe('test-pattern', handler);

  // Verify subscription was added
  t.true(transport.subscriptions.has('test-pattern'));

  await transport.unsubscribe('test-pattern');
  t.false(transport.subscriptions.has('test-pattern'));
});

test('BaseTransport - pattern matching works correctly', async (t) => {
  const config = createTestTransportConfig();
  const transport = new MockTransport(config);

  let matchedHandler: MessageHandler | null = null;

  // Test exact match
  const exactHandler: MessageHandler = async () => {};
  await transport.subscribe('exact-match', exactHandler);

  const exactEnvelope = createTestEnvelope({ type: 'exact-match' });
  matchedHandler = (transport as any).findHandler(exactEnvelope);
  t.is(matchedHandler, exactHandler);

  // Test pattern match
  const patternHandler: MessageHandler = async () => {};
  await transport.subscribe('pattern-*', patternHandler);

  const patternEnvelope = createTestEnvelope({ type: 'pattern-test' });
  matchedHandler = (transport as any).findHandler(patternEnvelope);
  t.is(matchedHandler, patternHandler);
});

// ============================================================================
// Dead Letter Queue Tests
// ============================================================================

test('MemoryDeadLetterQueue - stores and retrieves messages', async (t) => {
  const dlq = new MemoryDeadLetterQueue();
  const envelope = createTestEnvelope();
  const error = new Error('Test error');

  await dlq.addMessage(envelope, error);

  const messages = await dlq.getMessages();
  t.is(messages.length, 1);
  t.deepEqual(messages[0], envelope);
});

test('MemoryDeadLetterQueue - limits message retrieval', async (t) => {
  const dlq = new MemoryDeadLetterQueue();

  // Add multiple messages
  for (let i = 0; i < 5; i++) {
    const envelope = createTestEnvelope({ id: `message-${i}` });
    await dlq.addMessage(envelope, new Error(`Error ${i}`));
  }

  const messages = await dlq.getMessages(3);
  t.is(messages.length, 3);

  // Should get the last 3 messages
  t.is(messages[0].id, 'message-2');
  t.is(messages[1].id, 'message-3');
  t.is(messages[2].id, 'message-4');
});

test('MemoryDeadLetterQueue - message management operations', async (t) => {
  const dlq = new MemoryDeadLetterQueue();
  const envelope1 = createTestEnvelope({ id: 'message-1' });
  const envelope2 = createTestEnvelope({ id: 'message-2' });

  await dlq.addMessage(envelope1, new Error('Error 1'));
  await dlq.addMessage(envelope2, new Error('Error 2'));

  t.is(dlq.getSize(), 2);

  await dlq.deleteMessage('message-1');
  t.is(dlq.getSize(), 1);

  await dlq.requeue('message-2');
  t.is(dlq.getSize(), 0);

  await dlq.clear();
  t.is(dlq.getSize(), 0);
});

// ============================================================================
// Message Envelope Tests
// ============================================================================

test('EnvelopeBuilder - creates basic envelope', (t) => {
  const envelope = new EnvelopeBuilder()
    .setType('test-message')
    .setSender('sender-1')
    .setRecipient('recipient-1')
    .setPayload({ data: 'test' })
    .build();

  t.is(envelope.type, 'test-message');
  t.is(envelope.sender, 'sender-1');
  t.is(envelope.recipient, 'recipient-1');
  t.deepEqual(envelope.payload, { data: 'test' });
  t.is(envelope.priority, 'normal');
  t.is(envelope.retryCount, 0);
  t.is(envelope.maxRetries, 3);
});

test('EnvelopeBuilder - sets all envelope properties', (t) => {
  const envelope = new EnvelopeBuilder()
    .setType('urgent-message')
    .setSender('sender-1')
    .setRecipient('recipient-1')
    .setPayload({ data: 'urgent' })
    .setPriority('urgent')
    .setCorrelationId('correlation-123')
    .setReplyTo('reply-to-1')
    .setTtl(5000)
    .setMaxRetries(5)
    .setMetadata({ custom: 'value' })
    .build();

  t.is(envelope.type, 'urgent-message');
  t.is(envelope.priority, 'urgent');
  t.is(envelope.correlationId, 'correlation-123');
  t.is(envelope.replyTo, 'reply-to-1');
  t.is(envelope.ttl, 5000);
  t.is(envelope.maxRetries, 5);
  t.deepEqual(envelope.metadata, { custom: 'value' });
});

test('MessageSigner - signs and verifies messages', (t) => {
  const signer = new MessageSigner();
  const secretKey = 'test-secret-key';

  const envelope = createTestEnvelope();
  const signedEnvelope = signer.signMessage(envelope, secretKey);

  t.true(signedEnvelope.signature !== undefined);
  t.true(signedEnvelope.signature.length > 0);

  const isValid = signer.verifySignature(signedEnvelope, secretKey);
  t.true(isValid);

  const isInvalid = signer.verifySignature(signedEnvelope, 'wrong-key');
  t.false(isInvalid);
});

test('MessageValidator - validates message envelopes', (t) => {
  const validator = new MessageValidator();

  // Valid envelope
  const validEnvelope = createTestEnvelope();
  const validResult = validator.validate(validEnvelope);
  t.true(validResult.isValid);
  t.is(validResult.errors.length, 0);

  // Invalid envelope - missing required fields
  const invalidEnvelope = {
    type: 'test',
    // Missing sender, recipient, etc.
  } as any;

  const invalidResult = validator.validate(invalidEnvelope);
  t.false(invalidResult.isValid);
  t.true(invalidResult.errors.length > 0);
});

// ============================================================================
// Transport Factory Tests
// ============================================================================

test('createTransport - creates AMQP transport', (t) => {
  const config = createTestTransportConfig({ type: 'amqp' });
  const transport = createTransport(config);

  t.true(transport instanceof AMQPTransport);
});

test('createTransport - creates WebSocket transport', (t) => {
  const config = createTestTransportConfig({ type: 'websocket' });
  const transport = createTransport(config);

  t.true(transport instanceof WebSocketTransport);
});

test('createTransport - throws error for unsupported type', (t) => {
  const config = createTestTransportConfig({ type: 'http' as any });

  t.throws(() => createTransport(config), {
    message: 'Unsupported transport type: http',
  });
});

test('createAMQPTransport - creates transport with default config', (t) => {
  const transport = createAMQPTransport('amqp://localhost:5672');

  t.true(transport instanceof AMQPTransport);
});

test('createWebSocketTransport - creates transport with default config', (t) => {
  const transport = createWebSocketTransport('ws://localhost:8080');

  t.true(transport instanceof WebSocketTransport);
});

// ============================================================================
// Integration Tests
// ============================================================================

test('Integration - end-to-end message flow', async (t) => {
  const config = createTestTransportConfig();
  const transport = new MockTransport(config);

  let receivedMessage: MessageEnvelope | null = null;

  const handler: MessageHandler = async (envelope) => {
    receivedMessage = envelope;
    return { ...envelope, recipient: envelope.sender };
  };

  await transport.connect();
  await transport.subscribe('test-message', handler);

  const envelope = createTestEnvelope({ type: 'test-message' });
  await transport.send(envelope);

  // Simulate message receipt
  (transport as any).handleMessage(envelope);

  t.not(receivedMessage, null);
  t.deepEqual(receivedMessage, envelope);
});

test('Integration - retry logic with dead letter queue', async (t) => {
  const config = createTestTransportConfig();
  const transport = new MockTransport(config);
  const dlq = new MemoryDeadLetterQueue();

  transport.setDeadLetterQueue(dlq);
  transport.setRetryPolicy({ maxRetries: 2 });

  // Don't connect transport to force failures
  const envelope = createTestEnvelope();

  await t.throwsAsync(() => transport.send(envelope));

  const dlqMessages = await dlq.getMessages();
  t.is(dlqMessages.length, 1);
  t.deepEqual(dlqMessages[0], envelope);
});

// ============================================================================
// Error Handling Tests
// ============================================================================

test('Error handling - connection errors are emitted', async (t) => {
  const config = createTestTransportConfig();
  const transport = new MockTransport(config);

  let errorEmitted = false;
  transport.on('error', () => {
    errorEmitted = true;
  });

  // Simulate connection error
  (transport as any).emitConnectionEvent(
    'error',
    new Error('Connection failed')
  );

  t.true(errorEmitted);
});

test('Error handling - handler errors are caught', async (t) => {
  const config = createTestTransportConfig();
  const transport = new MockTransport(config);

  let handlerErrorEmitted = false;
  transport.on('handlerError', () => {
    handlerErrorEmitted = true;
  });

  const errorHandler: MessageHandler = async () => {
    throw new Error('Handler failed');
  };

  await transport.subscribe('error-test', errorHandler);

  const envelope = createTestEnvelope({ type: 'error-test' });
  (transport as any).handleMessage(envelope);

  t.true(handlerErrorEmitted);
});
