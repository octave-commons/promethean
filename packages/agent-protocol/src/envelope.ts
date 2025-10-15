import { MessageEnvelope } from './types';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

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
      maxRetries: 3
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

  withPriority(priority: 'low' | 'normal' | 'high' | 'urgent'): EnvelopeBuilder {
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
      ...this.envelope
    } as MessageEnvelope;

    // Validate required fields
    if (!envelope.payload) {
      throw new Error('Message payload is required');
    }

    return envelope;
  }
}

export class MessageSigner {
  static signMessage(envelope: MessageEnvelope, secretKey: string): MessageEnvelope {
    const messageData = {
      id: envelope.id,
      type: envelope.type,
      sender: envelope.sender,
      recipient: envelope.recipient,
      timestamp: envelope.timestamp.toISOString(),
      payload: envelope.payload
    };

    const messageString = JSON.stringify(messageData);
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(messageString)
      .digest('hex');

    return {
      ...envelope,
      signature
    };
  }

  static verifySignature(envelope: MessageEnvelope, publicKey: string): boolean {
    if (!envelope.signature) {
      return false;
    }

    try {
      const messageData = {
        id: envelope.id,
        type: envelope.type,
        sender: envelope.sender,
        recipient: envelope.recipient,
        timestamp: envelope.timestamp.toISOString(),
        payload: envelope.payload
      };

      const messageString = JSON.stringify(messageData);
      const expectedSignature = crypto
        .createHmac('sha256', publicKey)
        .update(messageString)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(envelope.signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );
    } catch (error) {
      return false;
    }
  }

  static generateKeyPair(): { publicKey: string; privateKey: string } {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    return { publicKey, privateKey };
  }
}

export class MessageValidator {
  static validateEnvelope(envelope: MessageEnvelope): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!envelope.id || typeof envelope.id !== 'string') {
      errors.push('Message ID is required and must be a string');
    }

    if (!envelope.type || typeof envelope.type !== 'string') {
      errors.push('Message type is required and must be a string');
    }

    if (!envelope.sender || typeof envelope.sender !== 'string') {
      errors.push('Sender is required and must be a string');
    }

    if (!envelope.recipient || typeof envelope.recipient !== 'string') {
      errors.push('Recipient is required and must be a string');
    }

    if (!envelope.timestamp || !(envelope.timestamp instanceof Date)) {
      errors.push('Timestamp is required and must be a Date');
    }

    if (!envelope.payload || typeof envelope.payload !== 'object') {
      errors.push('Payload is required and must be an object');
    }

    if (envelope.ttl !== undefined && (typeof envelope.ttl !== 'number' || envelope.ttl <= 0)) {
      errors.push('TTL must be a positive number');
    }

    if (envelope.retryCount < 0) {
      errors.push('Retry count cannot be negative');
    }

    if (envelope.maxRetries < 0) {
      errors.push('Max retries cannot be negative');
    }

    // Check if message has expired
    if (envelope.ttl && envelope.timestamp) {
      const now = new Date();
      const expiryTime = new Date(envelope.timestamp.getTime() + envelope.ttl);
      if (now > expiryTime) {
        errors.push('Message has expired');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static sanitizeEnvelope(envelope: MessageEnvelope): MessageEnvelope {
    return {
      ...envelope,
      metadata: envelope.metadata || {},
      payload: envelope.payload || {}
    };
  }
}