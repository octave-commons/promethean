import * as amqp from 'amqplib';
import { BaseTransport } from './transport';
import { TransportConfig, MessageEnvelope, MessageHandler } from './types';

export class AMQPTransport extends BaseTransport {
  private connection?: amqp.ChannelModel;
  private channel?: amqp.Channel;
  private reconnectTimer?: NodeJS.Timeout;

  constructor(config: TransportConfig) {
    super(config);
  }

  async connect(): Promise<void> {
    try {
      this.connection = await amqp.connect(this.config.url, this.config.options);
      if (this.connection) {
        this.channel = await this.connection.createChannel();
      }

  async connect(): Promise<void> {
    try {
      this.connection = (await amqp.connect(
        this.config.url,
        this.config.options,
      )) as amqp.Connection;
      if (this.connection) {
        this.channel = await this.connection.createChannel();
      }

      // Setup error handlers
      if (this.connection) {
        this.connection.on('error', (error) => {
          this.emitConnectionEvent('error', error);
          this.handleReconnect();
        });

        this.connection.on('close', () => {
          this.emitConnectionEvent('disconnected');
          this.handleReconnect();
        });
      }

      if (this.channel) {
        this.channel.on('error', (error) => {
          this.emitConnectionEvent('error', error);
        });
      }

      // Setup queue if specified
      if (this.config.queue) {
        await this.setupQueue();
      }

      this.emitConnectionEvent('connected');
    } catch (error) {
      this.emitConnectionEvent('error', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }

    if (this.channel) {
      await this.channel.close();
      this.channel = undefined;
    }

    if (this.connection) {
      await this.connection.close();
      this.connection = undefined;
    }

    this.emitConnectionEvent('disconnected');
  }

  async send(envelope: MessageEnvelope): Promise<void> {
    await this.sendWithRetry(envelope);
  }

  protected async doSend(envelope: MessageEnvelope): Promise<void> {
    if (!this.channel) {
      throw new Error('Not connected to AMQP server');
    }

    const routingKey = this.getRoutingKey(envelope);
    const message = Buffer.from(JSON.stringify(envelope));

    const options: amqp.Options.Publish = {
      messageId: envelope.id,
      timestamp: Math.floor(envelope.timestamp.getTime() / 1000),
      headers: {
        type: envelope.type,
        sender: envelope.sender,
        recipient: envelope.recipient,
        correlationId: envelope.correlationId,
        replyTo: envelope.replyTo,
        priority: this.getPriorityValue(envelope.priority),
        ttl: envelope.ttl,
      },
      persistent: true,
      mandatory: true,
    };

    await this.channel.publish('', routingKey, message, options);
  }

  async subscribe(pattern: string, handler: MessageHandler): Promise<void> {
    if (!this.channel) {
      throw new Error('Not connected to AMQP server');
    }

    // Store handler
    this.subscriptions.set(pattern, handler);

    // Setup queue and binding
    const queueName = this.getQueueName(pattern);
    await this.channel.assertQueue(queueName, {
      durable: true,
      arguments: {
        'x-message-ttl': 60000, // 1 minute TTL
      },
    });

    // Bind to routing key pattern
    await this.channel.bindQueue(queueName, '', pattern);

    // Start consuming
    await this.channel.consume(queueName, async (msg) => {
      if (msg) {
        try {
          const envelope: MessageEnvelope = JSON.parse(msg.content.toString());
          this.handleMessage(envelope);
          this.channel?.ack(msg);
        } catch (error) {
          this.emit('handlerError', { error, message: msg });
          this.channel?.nack(msg, false, false); // Reject and don't requeue
        }
      }
    });
  }

  async unsubscribe(pattern: string): Promise<void> {
    this.subscriptions.delete(pattern);

    if (this.channel) {
      const queueName = this.getQueueName(pattern);
      await this.channel.deleteQueue(queueName);
    }
  }

  private async setupQueue(): Promise<void> {
    if (!this.channel || !this.config.queue) {
      return;
    }

    await this.channel.assertQueue(this.config.queue.name, {
      durable: this.config.queue.durable,
      exclusive: this.config.queue.exclusive,
      autoDelete: this.config.queue.autoDelete,
      arguments: this.config.queue.arguments,
    });
  }

  private getRoutingKey(envelope: MessageEnvelope): string {
    // Use recipient as routing key, or fallback to message type
    return envelope.recipient || envelope.type;
  }

  private getQueueName(pattern: string): string {
    return `agent-protocol-${pattern}`;
  }

  private getPriorityValue(priority: string): number {
    switch (priority) {
      case 'urgent':
        return 5;
      case 'high':
        return 4;
      case 'normal':
        return 3;
      case 'low':
        return 2;
      default:
        return 3;
    }
  }

  private async handleReconnect(): Promise<void> {
    if (!this.config.reconnect.enabled) {
      return;
    }

    if (this.reconnectTimer) {
      return; // Already reconnecting
    }

    let attempt = 0;
    const maxAttempts = this.config.reconnect.maxAttempts;
    const baseDelay = this.config.reconnect.delay;

    const tryReconnect = async () => {
      try {
        await this.connect();
        this.reconnectTimer = undefined;
      } catch (error) {
        attempt++;

        if (attempt >= maxAttempts) {
          this.emitConnectionEvent(
            'error',
            new Error(`Failed to reconnect after ${maxAttempts} attempts`),
          );
          this.reconnectTimer = undefined;
          return;
        }

        let delay = baseDelay;
        if (this.config.reconnect.backoff === 'exponential') {
          delay = baseDelay * Math.pow(2, attempt - 1);
        }

        this.reconnectTimer = setTimeout(tryReconnect, delay);
      }
    };

    // Start reconnection after a short delay
    this.reconnectTimer = setTimeout(tryReconnect, 1000);
  }
}
