import { MessageEnvelope } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class EnvelopeBuilder {
  private envelope: Partial<MessageEnvelope> = {};

  constructor(type: string, sender: string, recipient: string) {
    this.envelope = {
      type,
      sender,
      recipient,
      timestamp: new Date(),
      priority: 'normal',
      retryCount: 0,
      maxRetries: 3,
    };
  }

  withPayload(payload: Record<string, any>): EnvelopeBuilder {
    this.envelope.payload = payload;
    return this;
  }

  withCorrelationId(correlationId: string): EnvelopeBuilder {
    this.envelope.correlationId = correlationId;
    return this;
  }

  withReplyTo(replyTo: string): EnvelopeBuilder {
    this.envelope.replyTo = replyTo;
    return this;
  }

  withPriority(
    priority: 'low' | 'normal' | 'high' | 'urgent'
  ): EnvelopeBuilder {
    this.envelope.priority = priority;
    return this;
  }

  withTTL(ttl: number): EnvelopeBuilder {
    this.envelope.ttl = ttl;
    return this;
  }

  withMaxRetries(maxRetries: number): EnvelopeBuilder {
    this.envelope.maxRetries = maxRetries;
    return this;
  }

  withMetadata(metadata: Record<string, any>): EnvelopeBuilder {
    this.envelope.metadata = metadata;
    return this;
  }

  build(): MessageEnvelope {
    const envelope: MessageEnvelope = {
      id: uuidv4(),
      ...this.envelope,
    } as MessageEnvelope;

    // Validate required fields
    if (!envelope.payload) {
      throw new Error('Message payload is required');
    }

    return envelope;
  }
}
