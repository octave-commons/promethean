import { MessageEnvelope } from '../types';

export class MessageValidator {
  static validateEnvelope(envelope: MessageEnvelope): {
    valid: boolean;
    errors: string[];
  } {
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

    if (
      envelope.ttl !== undefined &&
      (typeof envelope.ttl !== 'number' || envelope.ttl <= 0)
    ) {
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
      errors,
    };
  }

  static sanitizeEnvelope(envelope: MessageEnvelope): MessageEnvelope {
    return {
      ...envelope,
      metadata: envelope.metadata || {},
      payload: envelope.payload || {},
    };
  }
}
