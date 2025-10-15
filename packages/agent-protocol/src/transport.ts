import { Transport, TransportConfig, MessageEnvelope, MessageHandler, RetryPolicy, DeadLetterQueue } from './types';
import { EventEmitter } from 'events';

export abstract class BaseTransport extends EventEmitter implements Transport {
  protected config: TransportConfig;
  protected connected: boolean = false;
  protected subscriptions: Map<string, MessageHandler> = new Map();
  protected retryPolicy: RetryPolicy;
  protected deadLetterQueue?: DeadLetterQueue;

  constructor(config: TransportConfig) {
    super();
    this.config = config;
    this.retryPolicy = {
      maxRetries: 3,
      initialDelay: 1000,
      maxDelay: 30000,
      backoff: 'exponential',
      retryableErrors: ['ECONNRESET', 'ENOTFOUND', 'ECONNREFUSED', 'ETIMEDOUT']
    };
  }

  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract send(envelope: MessageEnvelope): Promise<void>;
  abstract subscribe(pattern: string, handler: MessageHandler): Promise<void>;
  abstract unsubscribe(pattern: string): Promise<void>;

  isConnected(): boolean {
    return this.connected;
  }

  protected async sendWithRetry(envelope: MessageEnvelope): Promise<void> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= this.retryPolicy.maxRetries; attempt++) {
      try {
        await this.doSend(envelope);
        return;
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === this.retryPolicy.maxRetries) {
          break;
        }

        if (!this.isRetryableError(lastError)) {
          break;
        }

        const delay = this.calculateRetryDelay(attempt);
        await this.sleep(delay);
      }
    }

    // All retries failed, add to dead letter queue if available
    if (this.deadLetterQueue && lastError) {
      await this.deadLetterQueue.addMessage(envelope, lastError);
    }

    throw lastError || new Error('Failed to send message after all retries');
  }

  protected abstract doSend(envelope: MessageEnvelope): Promise<void>;

  protected isRetryableError(error: Error): boolean {
    return this.retryPolicy.retryableErrors.some(retryableError => 
      error.message.includes(retryableError) || error.name.includes(retryableError)
    );
  }

  protected calculateRetryDelay(attempt: number): number {
    let delay: number;
    
    if (this.retryPolicy.backoff === 'exponential') {
      delay = this.retryPolicy.initialDelay * Math.pow(2, attempt);
    } else {
      delay = this.retryPolicy.initialDelay * (attempt + 1);
    }

    return Math.min(delay, this.retryPolicy.maxDelay);
  }

  protected sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  protected handleMessage(envelope: MessageEnvelope): void {
    const handler = this.findHandler(envelope);
    if (handler) {
      this.executeHandler(handler, envelope).catch(error => {
        this.emit('handlerError', { envelope, error });
      });
    } else {
      this.emit('noHandler', { envelope });
    }
  }

  protected findHandler(envelope: MessageEnvelope): MessageHandler | null {
    // Try exact match first
    const exactHandler = this.subscriptions.get(envelope.type);
    if (exactHandler) {
      return exactHandler;
    }

    // Try pattern matching
    for (const [pattern, handler] of this.subscriptions) {
      if (this.matchesPattern(envelope.type, pattern)) {
        return handler;
      }
    }

    return null;
  }

  protected matchesPattern(messageType: string, pattern: string): boolean {
    // Simple glob-like pattern matching
    const regexPattern = pattern
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(messageType);
  }

  protected async executeHandler(handler: MessageHandler, envelope: MessageEnvelope): Promise<void> {
    try {
      const result = await handler(envelope);
      
      // If handler returns a message, send it as a reply
      if (result && envelope.replyTo) {
        await this.send(result);
      }
    } catch (error) {
      this.emit('handlerError', { envelope, error });
      throw error;
    }
  }

  setRetryPolicy(policy: Partial<RetryPolicy>): void {
    this.retryPolicy = { ...this.retryPolicy, ...policy };
  }

  setDeadLetterQueue(dlq: DeadLetterQueue): void {
    this.deadLetterQueue = dlq;
  }

  protected emitConnectionEvent(event: 'connected' | 'disconnected' | 'error', data?: any): void {
    this.connected = event === 'connected';
    this.emit(event, data);
  }
}

export class MemoryDeadLetterQueue implements DeadLetterQueue {
  private messages: Array<{ envelope: MessageEnvelope; error: Error; timestamp: Date }> = [];

  async addMessage(envelope: MessageEnvelope, error: Error): Promise<void> {
    this.messages.push({
      envelope,
      error,
      timestamp: new Date()
    });
  }

  async getMessages(limit: number = 100): Promise<MessageEnvelope[]> {
    return this.messages.slice(-limit).map(item => item.envelope);
  }

  async requeue(messageId: string): Promise<void> {
    const index = this.messages.findIndex(item => item.envelope.id === messageId);
    if (index !== -1) {
      const { envelope } = this.messages.splice(index, 1)[0];
      // In a real implementation, you would requeue the message
      // For now, we just remove it from the DLQ
      console.log(`Requeuing message ${messageId}`);
    }
  }

  async deleteMessage(messageId: string): Promise<void> {
    const index = this.messages.findIndex(item => item.envelope.id === messageId);
    if (index !== -1) {
      this.messages.splice(index, 1);
    }
  }

  async clear(): Promise<void> {
    this.messages = [];
  }

  getSize(): number {
    return this.messages.length;
  }
}